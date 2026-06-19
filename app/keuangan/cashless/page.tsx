"use client";

import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { CreditCard, Store, ShoppingBag, ArrowUpRight, Download, Search, CheckCircle, Clock } from "lucide-react";
import { useToast } from "@/components/Toast";

export default function CashlessPage() {
  const [activeTab, setActiveTab] = useState<"cashless" | "unit">("cashless");
  const { showToast } = useToast();

  const handleTopup = () => {
    showToast("Menginisiasi proses top-up saldo...", "info");
  };

  return (
    <DashboardLayout>
      <div className="fade-up">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-800 flex items-center gap-2">
              <CreditCard className="w-7 h-7 text-emerald-600" /> Bendahara I (Cashless & Unit Usaha)
            </h1>
            <p className="text-sm text-slate-500 mt-1">Pemantauan transaksi e-money santri dan setoran dari unit usaha pesantren.</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-4 mb-6 scrollbar-hide">
          <button 
            onClick={() => setActiveTab("cashless")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${activeTab === "cashless" ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/20" : "bg-white text-slate-500 hover:bg-slate-50 border border-slate-200"}`}
          >
            <CreditCard className="w-4 h-4" /> E-Money / Cashless Santri
          </button>
          <button 
            onClick={() => setActiveTab("unit")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${activeTab === "unit" ? "bg-amber-500 text-white shadow-lg shadow-amber-500/20" : "bg-white text-slate-500 hover:bg-slate-50 border border-slate-200"}`}
          >
            <Store className="w-4 h-4" /> Setoran Unit Usaha (BUMP)
          </button>
        </div>

        {/* Tab Contents */}
        {activeTab === "cashless" && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 <div className="bg-linear-to-br from-emerald-500 to-teal-600 p-6 rounded-2xl shadow-xl shadow-emerald-500/20 text-white relative overflow-hidden group">
                     <div className="absolute right-0 bottom-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                         <CreditCard className="w-24 h-24" />
                     </div>
                     <p className="text-[10px] font-black uppercase tracking-widest opacity-80">Total Saldo Mengendap</p>
                     <h3 className="text-3xl font-black mt-1">Rp 425.800.000</h3>
                     <div className="mt-4 flex gap-2">
                         <button onClick={handleTopup} className="px-3 py-1.5 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg text-xs font-bold transition-colors border border-white/20">
                             Top-up Manual
                         </button>
                     </div>
                 </div>
                 
                 <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-center">
                     <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Transaksi Hari Ini</p>
                     <h3 className="text-2xl font-black text-slate-800 mt-1">Rp 12.450.000</h3>
                     <div className="mt-3 flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 w-fit px-2 py-0.5 rounded-full">
                        <ArrowUpRight className="w-3 h-3" /> +15% dari kemarin
                     </div>
                 </div>
                 
                 <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-center">
                     <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Santri Aktif Cashless</p>
                     <h3 className="text-2xl font-black text-slate-800 mt-1">3,850 <span className="text-sm font-bold text-slate-400">/ 4,210</span></h3>
                     <div className="w-full bg-slate-100 h-1.5 rounded-full mt-4 overflow-hidden">
                        <div className="bg-emerald-500 h-full" style={{ width: '91%' }}></div>
                     </div>
                 </div>
             </div>

             <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
                 <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-center bg-slate-50/50 gap-4">
                     <h2 className="text-lg font-bold text-slate-800">Riwayat Transaksi Kartu Santri</h2>
                     <div className="flex items-center bg-white border border-slate-200 rounded-xl px-3 py-2 gap-2 w-full sm:w-64 shadow-sm">
                         <Search className="w-4 h-4 text-slate-400" />
                         <input type="text" placeholder="Cari NISN atau Nama..." className="bg-transparent text-sm outline-none w-full" />
                     </div>
                 </div>
                 <div className="overflow-x-auto">
                     <table className="w-full text-sm">
                         <thead className="bg-slate-50 border-b border-slate-100">
                             <tr className="text-xs text-slate-500 font-bold uppercase tracking-wider text-left">
                                 <th className="px-6 py-4">Waktu</th>
                                 <th className="px-6 py-4">Santri</th>
                                 <th className="px-6 py-4">Merchant / Lokasi</th>
                                 <th className="px-6 py-4">Jenis</th>
                                 <th className="px-6 py-4 text-right">Nominal</th>
                             </tr>
                         </thead>
                         <tbody className="divide-y divide-slate-100">
                             {[
                                 { time: "08:15 WIB", name: "Ahmad Fauzi", nisn: "112233", merchant: "Kantin Asrama A", type: "Pembayaran", amount: "-Rp 15.000", color: "text-rose-600" },
                                 { time: "08:10 WIB", name: "Siti Aminah", nisn: "445566", merchant: "Koperasi Pondok", type: "Pembayaran", amount: "-Rp 25.000", color: "text-rose-600" },
                                 { time: "07:30 WIB", name: "Budi Santoso", nisn: "778899", merchant: "Loket Pusat", type: "Top-Up", amount: "+Rp 100.000", color: "text-emerald-600" }
                             ].map((t, i) => (
                                 <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                                     <td className="px-6 py-4 text-slate-500 font-bold">{t.time}</td>
                                     <td className="px-6 py-4">
                                         <div className="font-bold text-slate-800">{t.name}</div>
                                         <div className="text-xs text-slate-400 font-mono">{t.nisn}</div>
                                     </td>
                                     <td className="px-6 py-4 text-slate-600 font-bold flex items-center gap-2">
                                         <Store className="w-4 h-4 text-slate-400" /> {t.merchant}
                                     </td>
                                     <td className="px-6 py-4">
                                         <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${t.type === 'Top-Up' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                                             {t.type}
                                         </span>
                                     </td>
                                     <td className={`px-6 py-4 text-right font-black font-mono ${t.color}`}>
                                         {t.amount}
                                     </td>
                                 </tr>
                             ))}
                         </tbody>
                     </table>
                 </div>
             </div>
          </div>
        )}

        {activeTab === "unit" && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
                 <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                     <div>
                         <h2 className="text-lg font-bold text-slate-800">Setoran Unit Usaha Pesantren (BUMP)</h2>
                         <p className="text-sm text-slate-500">Laporan pemasukan dari kantin, koperasi, dan loket-loket resmi.</p>
                     </div>
                     <button className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg text-sm font-bold shadow-sm hover:bg-amber-600 transition-colors">
                         <Download className="w-4 h-4" /> Rekap Setoran
                     </button>
                 </div>
                 <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 p-6 bg-slate-50 border-b border-slate-100">
                     {['Koperasi Pondok', 'Kantin Asrama A', 'Kantin Asrama B', 'Pusat Laundry'].map((unit, i) => (
                         <div key={i} className="p-4 bg-white border border-slate-200 rounded-xl shadow-sm">
                             <div className="flex justify-between items-start mb-2">
                                 <ShoppingBag className="w-5 h-5 text-amber-500" />
                                 <span className="text-[10px] font-black uppercase bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded">Aktif</span>
                             </div>
                             <h3 className="font-bold text-slate-700 text-sm">{unit}</h3>
                             <p className="text-xs text-slate-400 mt-1">Hari ini: <span className="font-bold text-slate-600 font-mono">Rp 3.500.000</span></p>
                         </div>
                     ))}
                 </div>
                 <table className="w-full text-sm">
                     <thead className="bg-white border-b border-slate-100">
                         <tr className="text-xs text-slate-500 font-bold uppercase tracking-wider text-left">
                             <th className="px-6 py-4">Tanggal</th>
                             <th className="px-6 py-4">Unit Usaha</th>
                             <th className="px-6 py-4">Penyetor</th>
                             <th className="px-6 py-4">Nominal</th>
                             <th className="px-6 py-4">Status</th>
                         </tr>
                     </thead>
                     <tbody className="divide-y divide-slate-50">
                         {[
                             { date: "19 Jun 2026", unit: "Koperasi Pondok", name: "Ust. Rahman", amount: "Rp 5.000.000", status: "Diterima" },
                             { date: "19 Jun 2026", unit: "Kantin Asrama A", name: "Ust. Fajar", amount: "Rp 3.500.000", status: "Diterima" },
                             { date: "18 Jun 2026", unit: "Pusat Laundry", name: "Ust. Sholeh", amount: "Rp 2.000.000", status: "Menunggu" }
                         ].map((s, i) => (
                             <tr key={i} className="hover:bg-slate-50 transition-colors">
                                 <td className="px-6 py-4 font-bold text-slate-500">{s.date}</td>
                                 <td className="px-6 py-4 font-bold text-slate-800">{s.unit}</td>
                                 <td className="px-6 py-4 text-slate-600">{s.name}</td>
                                 <td className="px-6 py-4 font-mono font-black text-emerald-600">{s.amount}</td>
                                 <td className="px-6 py-4">
                                     <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-[10px] font-black uppercase ${s.status === 'Diterima' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                                         {s.status === 'Diterima' ? <CheckCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                                         {s.status}
                                     </span>
                                 </td>
                             </tr>
                         ))}
                     </tbody>
                 </table>
             </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
