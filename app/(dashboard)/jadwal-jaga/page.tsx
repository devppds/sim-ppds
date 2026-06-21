"use client";

import { useState, useEffect } from "react";
import { Plus, Search, QrCode, ScanLine, Clock, Calendar, ShieldAlert } from "lucide-react";
import { useRouter } from "next/navigation";

interface SessionData {
  id: number;
  username: string;
  role: string;
  role_level: string;
  name: string;
}

export default function JadwalJagaPage() {
  const [session, setSession] = useState<SessionData | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/auth/session")
      .then(res => res.json())
      .then(data => {
        if (!data.success || !data.session) router.push("/login");
        else setSession(data.session);
      });
  }, [router]);

  if (!session) return <div className="p-8">Memuat Data...</div>;

  const role = session.role;
  const username = session.username;
  // Is this user an Admin Seksi or Sekretariat?
  const isAdminOrSekretariat = role.includes("Admin") || role.includes("Sekretaris") || role.includes("Sekretariat") || username.includes("admin") || username.includes("sekretariat") || session.role_level === "SEKRETARIAT" || session.role_level === "ROOT";
  const isAnggota = role.includes("Anggota") || username.includes("anggota") || session.role_level === "STAFF";

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight">Jadwal Jaga & Absensi</h1>
          <p className="text-sm text-slate-500 mt-1">
            {isAdminOrSekretariat ? "Kelola jadwal jaga dan buka QR Absensi" : "Lihat jadwal Anda dan lakukan presensi"}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isAdminOrSekretariat && (
          <>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center text-center space-y-4 hover:shadow-lg transition-all cursor-pointer" onClick={() => router.push("/jadwal-jaga/admin-qr")}>
              <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center">
                <QrCode className="w-8 h-8" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-lg">Buka QR Absensi (PC)</h3>
                <p className="text-xs text-slate-500 mt-1">Tampilkan QR Code berputar di layar PC untuk di-scan oleh anggota.</p>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center text-center space-y-4 hover:shadow-lg transition-all cursor-pointer">
              <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center">
                <Calendar className="w-8 h-8" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-lg">Kelola Jadwal Shift</h3>
                <p className="text-xs text-slate-500 mt-1">Atur jadwal jaga harian untuk setiap anggota seksi Anda.</p>
              </div>
            </div>
          </>
        )}

        {isAnggota && (
          <>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center text-center space-y-4 hover:shadow-lg transition-all cursor-pointer" onClick={() => router.push("/jadwal-jaga/scan")}>
              <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center relative overflow-hidden">
                <ScanLine className="w-8 h-8 relative z-10 animate-pulse" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-lg">Scan Kehadiran (HP)</h3>
                <p className="text-xs text-slate-500 mt-1">Gunakan kamera belakang HP untuk absen melalui QR Code di PC Admin.</p>
              </div>
            </div>
          </>
        )}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden mt-8">
        <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
          <h2 className="font-bold text-slate-800 text-lg flex items-center gap-2"><Clock className="w-5 h-5 text-indigo-500"/> Jadwal Minggu Ini</h2>
        </div>
        <div className="p-6">
          <div className="text-center text-slate-400 py-8">
            <ShieldAlert className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p className="text-sm">Belum ada jadwal jaga yang dikonfigurasi.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
