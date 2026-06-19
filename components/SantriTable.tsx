"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface Santri {
  id: number;
  name: string;
  nisn: string;
  asal: string;
  kelas: string;
  asrama: string;
  photo_url?: string;
  status: string;
}

const statusColors: Record<string, string> = {
  Biasa: "bg-slate-100 text-slate-700",
  "Ndalem 50%": "bg-amber-50 text-amber-700",
  "Ndalem 100%": "bg-amber-100 text-amber-800",
  "PKJ 50%": "bg-blue-50 text-blue-700",
  "PKJ 100%": "bg-blue-100 text-blue-800",
  Nduduk: "bg-violet-50 text-violet-700",
  Dzuriyyah: "bg-emerald-50 text-emerald-700",
  Alumni: "bg-slate-50 text-slate-400 font-normal",
  Keluar: "bg-rose-50 text-rose-700",
};

const initialsColors = [
  "from-indigo-400 to-indigo-600",
  "from-emerald-400 to-emerald-600",
  "from-amber-400 to-amber-600",
  "from-rose-400 to-rose-600",
  "from-violet-400 to-violet-600",
];

export default function SantriTable({ data = [] }: { data?: any[] }) {
  const loading = false; // Set to false since parent handles it
  const santriData = data;

  function getInitials(name: string) {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  }

  return (
    <section className="fade-up fade-up-6 bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-6 sm:p-8 border-b border-slate-100 bg-slate-50/30 gap-3">
        <div>
          <h2 className="text-base font-black text-[#1e293b] tracking-tight">
            Santri Terbaru Terdaftar
          </h2>
          <p className="text-[10px] font-bold text-[#64748b] uppercase tracking-widest mt-1">
            {loading ? "Memuat data..." : "5 pendaftaran terakhir"}
          </p>
        </div>
        <Link 
          href="/santri"
          className="group flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-black text-indigo-600 hover:bg-indigo-50 hover:border-indigo-200 transition-all shadow-sm"
        >
          Lihat Semua
          <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm" aria-label="Daftar Santri Terbaru">
          <thead>
            <tr className="text-xs text-[#64748b] uppercase tracking-wider border-b border-slate-100">
              <th className="text-left px-5 py-3 font-semibold">Santri</th>
              <th className="text-left px-5 py-3 font-semibold hidden sm:table-cell">
                Asal
              </th>
              <th className="text-left px-5 py-3 font-semibold">Kelas</th>
              <th className="text-left px-5 py-3 font-semibold hidden md:table-cell">
                Asrama
              </th>
              <th className="text-left px-5 py-3 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array(3)
                .fill(0)
                .map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-5 py-3.5" colSpan={5}>
                      <div className="h-4 bg-slate-100 rounded w-full"></div>
                    </td>
                  </tr>
                ))
            ) : santriData.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-5 py-10 text-center text-slate-400">
                  Belum ada data santri
                </td>
              </tr>
            ) : (
              santriData.map((s, i) => (
                <tr
                  key={s.id}
                  className="border-b border-slate-50 hover:bg-slate-50 transition-colors duration-150"
                >
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-9 h-9 rounded-xl bg-gradient-to-br ${initialsColors[i % initialsColors.length]} flex items-center justify-center text-white text-[11px] font-bold flex-shrink-0 overflow-hidden shadow-sm`}
                      >
                        {s.photo_url ? (
                          <img src={s.photo_url} alt={s.name} className="w-full h-full object-cover" />
                        ) : (
                          getInitials(s.name)
                        )}
                      </div>
                      <span className="font-bold text-[#1e293b] truncate max-w-[120px] sm:max-w-none">
                        {s.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-[#64748b] hidden sm:table-cell">
                    {s.asal}
                  </td>
                  <td className="px-5 py-3.5 font-medium text-[#1e293b]">
                    {s.kelas}
                  </td>
                  <td className="px-5 py-3.5 text-[#64748b] hidden md:table-cell">
                    {s.asrama}
                  </td>
                  <td className="px-5 py-3.5">
                    <span
                      className={`inline-flex px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${statusColors[s.status] || "bg-slate-50 text-slate-600"}`}
                    >
                      {s.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
