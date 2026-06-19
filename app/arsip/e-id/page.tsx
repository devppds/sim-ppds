"use client";

import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { IdCard, Archive, Printer, Search, Database, KeyRound } from "lucide-react";
import { useToast } from "@/components/Toast";

export default function SekretarisIIPage() {
  const [activeTab, setActiveTab] = useState<"stambuk" | "eid" | "archive">("eid");
  const { showToast } = useToast();

  const handlePrint = () => {
    showToast("Mengirim ke printer...", "info");
    setTimeout(() => {
      showToast("Kartu berhasil dicetak", "success");
    }, 2000);
  };

  return (
    <DashboardLayout>
      <div className="fade-up">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-800 flex items-center gap-2">
              <IdCard className="w-7 h-7 text-sky-600" /> Sekretaris II (Identitas & Arsip)
            </h1>
            <p className="text-sm text-slate-500 mt-1">Manajemen Auto-Stambuk, Pencetakan E-ID, dan E-Archive</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-4 mb-6 scrollbar-hide">
          <button 
            onClick={() => setActiveTab("eid")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${activeTab === "eid" ? "bg-sky-600 text-white shadow-lg shadow-sky-600/20" : "bg-white text-slate-500 hover:bg-slate-50 border border-slate-200"}`}
          >
            <Printer className="w-4 h-4" /> Cetak E-ID Card
          </button>
          <button 
            onClick={() => setActiveTab("stambuk")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${activeTab === "stambuk" ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/20" : "bg-white text-slate-500 hover:bg-slate-50 border border-slate-200"}`}
          >
            <Database className="w-4 h-4" /> Auto-Stambuk
          </button>
          <button 
            onClick={() => setActiveTab("archive")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${activeTab === "archive" ? "bg-violet-600 text-white shadow-lg shadow-violet-600/20" : "bg-white text-slate-500 hover:bg-slate-50 border border-slate-200"}`}
          >
            <Archive className="w-4 h-4" /> E-Archive Terpusat
          </button>
        </div>

        {/* Tab Contents */}
        {activeTab === "eid" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <h2 className="text-lg font-bold text-slate-800">Antrean Cetak Kartu Identitas</h2>
                </div>
                <table className="w-full text-sm">
                 <thead className="bg-slate-50 border-b border-slate-100">
                   <tr className="text-xs text-slate-500 font-bold uppercase tracking-wider text-left">
                     <th className="px-6 py-4">Nama Santri</th>
                     <th className="px-6 py-4">Jenis Kartu</th>
                     <th className="px-6 py-4">Status / Alasan</th>
                     <th className="px-6 py-4">Aksi</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-100">
                   {[
                     { name: "Ahmad Fauzi Rahman", type: "KTK", reason: "Baru", status: "Menunggu" },
                     { name: "Siti Aminah", type: "SIM (Surat Izin Merokok)", reason: "Perpanjangan", status: "Dicetak" },
                     { name: "Muhammad Rizki", type: "KSD", reason: "Hilang (ACC Keamanan)", status: "Menunggu" }
                   ].map((item, i) => (
                     <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                       <td className="px-6 py-4 font-bold text-slate-800">{item.name}</td>
                       <td className="px-6 py-4 text-sky-600 font-bold">{item.type}</td>
                       <td className="px-6 py-4">
                           <div className="text-xs text-slate-500 mb-1">{item.reason}</div>
                           <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-black uppercase ${item.status === 'Menunggu' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
                               {item.status}
                           </span>
                       </td>
                       <td className="px-6 py-4">
                         <button onClick={handlePrint} className="flex items-center gap-2 px-3 py-1.5 bg-sky-50 text-sky-600 hover:bg-sky-100 text-xs font-bold rounded-lg transition-colors">
                           <Printer className="w-3 h-3" /> Cetak
                         </button>
                       </td>
                     </tr>
                   ))}
                 </tbody>
               </table>
            </div>

            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 shadow-inner flex flex-col items-center">
                <h3 className="font-bold text-slate-700 mb-4 w-full text-left flex items-center gap-2">
                    <IdCard className="w-5 h-5 text-sky-600" /> Preview ID Card
                </h3>
                <div className="w-full aspect-[1.58/1] bg-linear-to-br from-emerald-600 to-teal-800 rounded-xl shadow-lg relative overflow-hidden mb-6 flex flex-col justify-between p-4">
                    <div className="absolute top-0 right-0 p-3 opacity-20"><KeyRound className="w-16 h-16 text-white" /></div>
                    <div className="text-white">
                        <div className="text-[10px] font-black uppercase tracking-widest opacity-80">Kartu Tanda Kenal (KTK)</div>
                        <div className="text-lg font-bold mt-1">Ahmad Fauzi Rahman</div>
                        <div className="text-xs opacity-90">NISN: 1122334455</div>
                    </div>
                    <div className="flex justify-between items-end">
                        <div className="w-12 h-12 bg-white/20 rounded-md backdrop-blur-sm"></div>
                        <div className="text-white text-[8px] opacity-70">PP Darussalam Lirboyo</div>
                    </div>
                </div>
            </div>
          </div>
        )}

        {activeTab === "stambuk" && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm p-6">
                <div className="flex flex-col md:flex-row gap-6 items-center justify-between mb-8 border-b border-slate-100 pb-6">
                    <div>
                        <h2 className="text-lg font-bold text-slate-800 mb-1">Penomoran Auto-Stambuk Santri Baru</h2>
                        <p className="text-sm text-slate-500">Generate buku induk otomatis berdasarkan tahun masuk dan urutan</p>
                    </div>
                    <button className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/30 transition-all flex items-center gap-2">
                        <Database className="w-4 h-4" /> Generate Stambuk Massal
                    </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                    <div className="p-4 border border-slate-100 rounded-xl bg-slate-50">
                        <div className="text-3xl font-black text-slate-800">1,250</div>
                        <div className="text-xs font-bold text-slate-400 uppercase mt-2">Santri Baru Belum Ber-Stambuk</div>
                    </div>
                    <div className="p-4 border border-slate-100 rounded-xl bg-slate-50">
                        <div className="text-3xl font-black text-emerald-600">2026</div>
                        <div className="text-xs font-bold text-slate-400 uppercase mt-2">Kode Tahun Ajaran</div>
                    </div>
                    <div className="p-4 border border-slate-100 rounded-xl bg-slate-50">
                        <div className="text-3xl font-black text-slate-800">26.01250</div>
                        <div className="text-xs font-bold text-slate-400 uppercase mt-2">Prediksi Stambuk Terakhir</div>
                    </div>
                </div>
             </div>
          </div>
        )}

        {activeTab === "archive" && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <h2 className="text-lg font-bold text-slate-800">E-Archive Pesantren</h2>
                    <div className="flex items-center bg-white border border-slate-200 rounded-xl px-3 py-2 gap-2 w-64 shadow-sm">
                        <Search className="w-4 h-4 text-slate-400" />
                        <input type="text" placeholder="Cari dokumen..." className="bg-transparent text-sm outline-none w-full" />
                    </div>
                </div>
                <div className="p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                    {['SK Kepengurusan', 'Dokumen Legalitas', 'Laporan Pertanggungjawaban', 'MoU Kemitraan'].map((folder) => (
                        <div key={folder} className="p-4 border border-slate-200 rounded-xl hover:border-violet-400 hover:bg-violet-50 cursor-pointer transition-colors group flex items-center gap-4">
                            <Archive className="w-8 h-8 text-violet-300 group-hover:text-violet-600 transition-colors" />
                            <div>
                                <div className="font-bold text-slate-700 group-hover:text-violet-700 text-sm">{folder}</div>
                                <div className="text-xs text-slate-400">12 Berkas</div>
                            </div>
                        </div>
                    ))}
                </div>
             </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
