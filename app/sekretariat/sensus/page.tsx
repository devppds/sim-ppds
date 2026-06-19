"use client";

import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { BarChart3, Home, Mic, BedDouble, CalendarDays, FileText, Download } from "lucide-react";
import { useToast } from "@/components/Toast";

export default function SekretarisIIIPage() {
  const [activeTab, setActiveTab] = useState<"sensus" | "rooms" | "notulensi">("sensus");
  const { showToast } = useToast();

  const handleAction = (msg: string) => {
    showToast(msg, "info");
  };

  return (
    <DashboardLayout>
      <div className="fade-up">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-800 flex items-center gap-2">
              <BarChart3 className="w-7 h-7 text-rose-600" /> Sekretaris III (Sensus & Agendaris)
            </h1>
            <p className="text-sm text-slate-500 mt-1">E-Sensus Bulanan, Room Allocation, dan Notulensi Rapat</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-4 mb-6 scrollbar-hide">
          <button 
            onClick={() => setActiveTab("sensus")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${activeTab === "sensus" ? "bg-rose-600 text-white shadow-lg shadow-rose-600/20" : "bg-white text-slate-500 hover:bg-slate-50 border border-slate-200"}`}
          >
            <BarChart3 className="w-4 h-4" /> E-Sensus Bulanan
          </button>
          <button 
            onClick={() => setActiveTab("rooms")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${activeTab === "rooms" ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/20" : "bg-white text-slate-500 hover:bg-slate-50 border border-slate-200"}`}
          >
            <BedDouble className="w-4 h-4" /> Room Allocation
          </button>
          <button 
            onClick={() => setActiveTab("notulensi")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${activeTab === "notulensi" ? "bg-sky-600 text-white shadow-lg shadow-sky-600/20" : "bg-white text-slate-500 hover:bg-slate-50 border border-slate-200"}`}
          >
            <Mic className="w-4 h-4" /> E-Notulensi Rapat
          </button>
        </div>

        {/* Tab Contents */}
        {activeTab === "sensus" && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-lg font-bold text-slate-800">Laporan Sensus Asrama (Bulan Ini)</h2>
                    <select className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold outline-none text-slate-600">
                        <option>Juni 2026</option>
                        <option>Mei 2026</option>
                    </select>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                        <div className="text-2xl font-black text-slate-800">4,210</div>
                        <div className="text-xs text-slate-500 font-bold uppercase mt-1">Total Santri</div>
                    </div>
                    <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                        <div className="text-2xl font-black text-emerald-700">+125</div>
                        <div className="text-xs text-emerald-600 font-bold uppercase mt-1">Santri Baru</div>
                    </div>
                    <div className="p-4 bg-rose-50 rounded-xl border border-rose-100">
                        <div className="text-2xl font-black text-rose-700">-15</div>
                        <div className="text-xs text-rose-600 font-bold uppercase mt-1">Boyong / Keluar</div>
                    </div>
                    <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-100">
                        <div className="text-2xl font-black text-indigo-700">100%</div>
                        <div className="text-xs text-indigo-600 font-bold uppercase mt-1">Sensus Masuk</div>
                    </div>
                </div>

                <table className="w-full text-sm mt-4">
                 <thead className="bg-slate-50 border-b border-slate-100">
                   <tr className="text-xs text-slate-500 font-bold uppercase tracking-wider text-left">
                     <th className="px-4 py-3">Blok / Asrama</th>
                     <th className="px-4 py-3 text-center">Dilaporkan Oleh</th>
                     <th className="px-4 py-3 text-center">Jumlah Santri</th>
                     <th className="px-4 py-3 text-center">Perubahan</th>
                     <th className="px-4 py-3">Status Laporan</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-100">
                   {[
                     { blok: "Blok A", reported: "Ustadz Yusuf", count: 450, change: "+5", status: "Selesai" },
                     { blok: "Blok B", reported: "Ustadz Ali", count: 320, change: "-2", status: "Selesai" },
                     { blok: "Blok C", reported: "Ustadz Hasan", count: 410, change: "0", status: "Menunggu Approval" }
                   ].map((item, i) => (
                     <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                       <td className="px-4 py-3 font-bold text-slate-800 flex items-center gap-2">
                           <Home className="w-4 h-4 text-slate-400" /> {item.blok}
                       </td>
                       <td className="px-4 py-3 text-slate-600 text-center">{item.reported}</td>
                       <td className="px-4 py-3 font-mono font-bold text-slate-700 text-center">{item.count}</td>
                       <td className={`px-4 py-3 font-mono font-bold text-center ${item.change.startsWith('+') ? 'text-emerald-600' : item.change.startsWith('-') ? 'text-rose-600' : 'text-slate-400'}`}>{item.change}</td>
                       <td className="px-4 py-3">
                           <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-black uppercase ${item.status === 'Selesai' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                               {item.status}
                           </span>
                       </td>
                     </tr>
                   ))}
                 </tbody>
               </table>
             </div>
          </div>
        )}

        {activeTab === "rooms" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div className="md:col-span-2 bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
                <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <BedDouble className="w-5 h-5 text-emerald-600" /> Room Allocation (Alokasi Kamar)
                </h2>
                
                <div className="space-y-4">
                    {[
                        { room: "Kamar A-01", capacity: 25, filled: 25, alert: false },
                        { room: "Kamar A-02", capacity: 25, filled: 28, alert: true },
                        { room: "Kamar A-03", capacity: 25, filled: 20, alert: false }
                    ].map((rm, i) => (
                        <div key={i} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 border border-slate-100 rounded-xl bg-slate-50/50 gap-4">
                            <div>
                                <div className="font-bold text-slate-800">{rm.room}</div>
                                <div className="text-xs text-slate-500 mt-1">Kapasitas Maksimal: {rm.capacity} Santri</div>
                            </div>
                            <div className="flex items-center gap-4 w-full sm:w-auto">
                                <div className="flex-1 sm:w-32 bg-slate-200 rounded-full h-2.5 overflow-hidden">
                                    <div className={`h-2.5 rounded-full ${rm.alert ? 'bg-rose-500' : 'bg-emerald-500'}`} style={{ width: `${Math.min((rm.filled/rm.capacity)*100, 100)}%` }}></div>
                                </div>
                                <div className={`text-sm font-bold font-mono ${rm.alert ? 'text-rose-600' : 'text-slate-700'}`}>
                                    {rm.filled}/{rm.capacity}
                                </div>
                            </div>
                            {rm.alert && <span className="text-[10px] font-black bg-rose-100 text-rose-700 px-2 py-1 rounded uppercase">Over Capacity</span>}
                        </div>
                    ))}
                </div>
             </div>
             
             <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 shadow-inner flex flex-col items-center justify-center text-center">
                 <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm border border-slate-200 text-emerald-600">
                     <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" x2="19" y1="8" y2="14"/><line x1="22" x2="16" y1="11" y2="11"/></svg>
                 </div>
                 <h3 className="font-bold text-slate-700 mb-2">Pemerataan Kamar</h3>
                 <p className="text-xs text-slate-500 mb-4">Fitur ini membantu pemerataan santri agar tidak ada kamar yang over-capacity.</p>
                 <button onClick={() => handleAction("Menjalankan algoritma pemerataan...")} className="w-full py-2 bg-emerald-600 text-white font-bold rounded-xl text-sm shadow-sm transition-all hover:bg-emerald-700">
                     Auto-Distribute Santri
                 </button>
             </div>
          </div>
        )}

        {activeTab === "notulensi" && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
                 <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                     <div>
                        <h2 className="text-lg font-bold text-slate-800">E-Notulensi Rapat Pengurus</h2>
                        <p className="text-sm text-slate-500">Pencatatan hasil rapat dan daftar hadir secara digital</p>
                     </div>
                     <button onClick={() => handleAction("Buka form notulensi baru")} className="px-4 py-2 bg-sky-600 text-white text-sm font-bold rounded-lg hover:bg-sky-700 transition-colors">
                         Buat Notulensi Baru
                     </button>
                 </div>
                 <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                     {[1, 2, 3].map((i) => (
                         <div key={i} className="border border-slate-200 rounded-xl p-5 hover:border-sky-300 transition-colors group">
                             <div className="flex justify-between items-start mb-3">
                                 <span className="text-[10px] font-black uppercase text-sky-600 bg-sky-50 px-2 py-0.5 rounded">Rapat Pleno</span>
                                 <CalendarDays className="w-4 h-4 text-slate-400" />
                             </div>
                             <h3 className="font-bold text-slate-800 mb-2">Rapat Evaluasi Bulan {['Juni', 'Mei', 'April'][i-1]}</h3>
                             <div className="flex flex-col gap-1 text-xs text-slate-500 mb-4">
                                 <span className="flex items-center gap-1.5"><FileText className="w-3 h-3" /> Notulis: Sekretaris III</span>
                                 <span className="flex items-center gap-1.5"><Mic className="w-3 h-3" /> Diikuti: 45 Pengurus</span>
                             </div>
                             <button className="flex items-center justify-center gap-2 w-full py-2 bg-slate-50 hover:bg-sky-50 text-slate-600 hover:text-sky-600 text-xs font-bold rounded-lg transition-colors border border-slate-200 group-hover:border-sky-200">
                                 <Download className="w-3 h-3" /> Download PDF
                             </button>
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
