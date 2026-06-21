"use client";

import { useState, useEffect, useRef } from "react";
import { QRCodeSVG } from "qrcode.react";
import { useRouter } from "next/navigation";
import { ShieldAlert, Monitor, ArrowLeft } from "lucide-react";

export default function AdminQRPage() {
  const [session, setSession] = useState<any>(null);
  const [token, setToken] = useState<string>("");
  const [timeLeft, setTimeLeft] = useState<number>(15);
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const router = useRouter();

  useEffect(() => {
    // Basic mobile check
    if (window.innerWidth < 1024) {
      setIsMobile(true);
    }
    
    fetch("/api/auth/session")
      .then(res => res.json())
      .then(data => {
        if (!data.success || !data.session) router.push("/login");
        else setSession(data.session);
      });
  }, [router]);

  useEffect(() => {
    if (!session || isMobile) return;

    let isActive = true;
    const generateToken = async () => {
      const seksi = session.role === "Sekretaris" ? "Sekretariat" : session.role;
      const secret = `ABSENSI-JAGA-SECRET-${seksi}`;
      const now = Date.now();
      const currentWindow = Math.floor(now / 15000);
      
      const encoder = new TextEncoder();
      const data = encoder.encode(secret + currentWindow);
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      
      if (isActive) {
        setToken(JSON.stringify({ type: "ABSEN_JAGA", token: hashHex, seksi }));
      }
    };

    const interval = setInterval(() => {
      const ms = Date.now() % 15000;
      const secondsLeft = 15 - Math.floor(ms / 1000);
      setTimeLeft(secondsLeft);
      generateToken();
    }, 1000);

    generateToken();

    return () => {
      isActive = false;
      clearInterval(interval);
    };
  }, [session, isMobile]);

  if (isMobile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] text-center p-6">
        <Monitor className="w-20 h-20 text-rose-500 mb-4" />
        <h1 className="text-2xl font-black text-slate-800 mb-2">Akses Ditolak</h1>
        <p className="text-slate-500 max-w-md">Halaman QR Code Absensi ini dirancang khusus untuk layar PC demi mencegah kecurangan (tidak dapat di-screenshot / dibawa-bawa di HP).</p>
        <button onClick={() => router.push("/jadwal-jaga")} className="mt-6 px-6 py-2 bg-slate-800 text-white rounded-lg font-bold">Kembali</button>
      </div>
    );
  }

  if (!session) return null;

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] bg-slate-50 relative p-4 rounded-3xl border border-slate-200 shadow-inner">
      <button onClick={() => router.push("/jadwal-jaga")} className="absolute top-6 left-6 flex items-center gap-2 text-slate-500 font-bold hover:text-slate-800">
        <ArrowLeft className="w-5 h-5" /> Kembali
      </button>

      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 bg-indigo-100 text-indigo-700 px-4 py-1.5 rounded-full text-sm font-black mb-4">
          <ShieldAlert className="w-4 h-4" /> Mode Keamanan Tinggi
        </div>
        <h1 className="text-4xl font-black text-slate-800 tracking-tight">QR Absensi Jaga</h1>
        <p className="text-slate-500 mt-2 font-medium">Seksi: {session.role === "Sekretaris" ? "Sekretariat" : session.role}</p>
      </div>

      <div className="bg-white p-8 rounded-3xl shadow-2xl border-4 border-indigo-50 relative">
        <div className="absolute top-0 left-0 w-full h-1 bg-slate-100 rounded-t-3xl overflow-hidden">
          <div className="h-full bg-indigo-500 transition-all duration-1000 ease-linear" style={{ width: `${(timeLeft / 15) * 100}%` }} />
        </div>
        {token ? (
          <QRCodeSVG value={token} size={300} level="H" includeMargin />
        ) : (
          <div className="w-[300px] h-[300px] flex items-center justify-center bg-slate-50 rounded-xl">Memuat QR...</div>
        )}
      </div>

      <div className="mt-8 text-center space-y-2">
        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Memperbarui dalam</p>
        <div className="text-4xl font-black text-indigo-600 animate-pulse">{timeLeft} <span className="text-lg">detik</span></div>
      </div>
    </div>
  );
}
