"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { useToast } from "@/components/Toast";

export default function MobileScanPage() {
  const [session, setSession] = useState<any>(null);
  const [scanResult, setScanResult] = useState<{ status: "idle" | "loading" | "success" | "error", message: string }>({ status: "idle", message: "" });
  const router = useRouter();
  const scannerRef = useRef<any>(null);
  const { showToast } = useToast();

  useEffect(() => {
    fetch("/api/auth/session")
      .then(res => res.json())
      .then(data => {
        if (!data.success || !data.session) router.push("/login");
        else setSession(data.session);
      });
  }, [router]);

  useEffect(() => {
    if (!session || scanResult.status === "loading" || scanResult.status === "success") return;

    // Dynamically import html5-qrcode to avoid SSR issues
    import("html5-qrcode").then(({ Html5QrcodeScanner }) => {
      if (!scannerRef.current) {
        const scanner = new Html5QrcodeScanner(
          "qr-reader",
          { fps: 10, qrbox: { width: 250, height: 250 }, aspectRatio: 1.0 },
          false
        );

        scanner.render(
          async (decodedText) => {
            scanner.pause(true);
            setScanResult({ status: "loading", message: "Memvalidasi kode..." });
            
            try {
              const payload = JSON.parse(decodedText);
              if (payload.type !== "ABSEN_JAGA") throw new Error("Format QR Tidak Valid");

              const res = await fetch("/api/absensi-jaga/scan", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
              });

              const data = await res.json();
              if (res.ok) {
                setScanResult({ status: "success", message: data.message });
                showToast(data.message, "success");
              } else {
                setScanResult({ status: "error", message: data.message });
                showToast(data.message, "error");
                setTimeout(() => {
                  setScanResult({ status: "idle", message: "" });
                  scanner.resume();
                }, 3000);
              }
            } catch (err) {
              setScanResult({ status: "error", message: "Gagal membaca QR Code. Pastikan ini adalah QR Absensi." });
              setTimeout(() => {
                setScanResult({ status: "idle", message: "" });
                scanner.resume();
              }, 3000);
            }
          },
          (error) => {
            // Ignore scan failures (happens every frame when no QR is found)
          }
        );
        scannerRef.current = scanner;
      }
    });

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(console.error);
        scannerRef.current = null;
      }
    };
  }, [session, scanResult.status, showToast]);

  if (!session) return <div className="p-8 text-center">Memuat Scanner...</div>;

  return (
    <div className="flex flex-col items-center min-h-[80vh] p-4 max-w-md mx-auto">
      <div className="w-full flex items-center mb-8 relative">
        <button onClick={() => router.push("/jadwal-jaga")} className="absolute left-0 p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-black text-slate-800 tracking-tight w-full text-center">Scan Kehadiran</h1>
      </div>

      <div className="w-full bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden relative">
        {scanResult.status === "idle" && (
          <div id="qr-reader" className="w-full bg-black min-h-[300px]"></div>
        )}
        
        {scanResult.status === "loading" && (
          <div className="min-h-[350px] flex flex-col items-center justify-center p-8 text-center bg-indigo-50">
            <Loader2 className="w-12 h-12 text-indigo-500 animate-spin mb-4" />
            <h3 className="font-bold text-slate-800">Sedang Memproses...</h3>
            <p className="text-sm text-slate-500 mt-1">Jangan tutup halaman ini.</p>
          </div>
        )}

        {scanResult.status === "success" && (
          <div className="min-h-[350px] flex flex-col items-center justify-center p-8 text-center bg-emerald-50">
            <CheckCircle className="w-16 h-16 text-emerald-500 mb-4" />
            <h3 className="text-xl font-black text-emerald-700 mb-2">Absen Berhasil!</h3>
            <p className="text-sm text-emerald-600/80 mb-6">{scanResult.message}</p>
            <button onClick={() => router.push("/jadwal-jaga")} className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/30 transition-all">Selesai</button>
          </div>
        )}

        {scanResult.status === "error" && (
          <div className="min-h-[350px] flex flex-col items-center justify-center p-8 text-center bg-rose-50">
            <XCircle className="w-16 h-16 text-rose-500 mb-4" />
            <h3 className="text-xl font-black text-rose-700 mb-2">Absen Gagal</h3>
            <p className="text-sm text-rose-600/80 mb-6">{scanResult.message}</p>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest animate-pulse">Kamera akan aktif kembali...</p>
          </div>
        )}
      </div>
      
      <div className="mt-8 text-center">
        <p className="text-xs text-slate-500 font-medium">Arahkan kamera ke QR Code yang ditampilkan di layar PC Admin.</p>
      </div>
    </div>
  );
}
