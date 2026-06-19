"use client";

import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Megaphone, Award, Send, FileCode2, CheckCircle, Download, FileText, Image } from "lucide-react";
import { useToast } from "@/components/Toast";

export default function SekretariatPublikasiPage() {
  const [activeTab, setActiveTab] = useState<"certificate" | "proposal" | "broadcast">("certificate");
  const { showToast } = useToast();

  const handleGenerateCertificate = () => {
    showToast("Mempersiapkan template sertifikat...", "info");
    setTimeout(() => {
      showToast("Sertifikat berhasil di-generate. Siap diunduh.", "success");
    }, 2000);
  };

  return (
    <DashboardLayout>
      <div className="fade-up">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-800 flex items-center gap-2">
              <Megaphone className="w-7 h-7 text-indigo-600" /> Sekretaris I (Publikasi)
            </h1>
            <p className="text-sm text-slate-500 mt-1">Sertifikasi, E-Proposal, dan Manajemen Pengumuman (Broadcast)</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-4 mb-6 scrollbar-hide">
          <button 
            onClick={() => setActiveTab("certificate")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${activeTab === "certificate" ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20" : "bg-white text-slate-500 hover:bg-slate-50 border border-slate-200"}`}
          >
            <Award className="w-4 h-4" /> E-Sertifikat
          </button>
          <button 
            onClick={() => setActiveTab("proposal")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${activeTab === "proposal" ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/20" : "bg-white text-slate-500 hover:bg-slate-50 border border-slate-200"}`}
          >
            <FileCode2 className="w-4 h-4" /> E-Proposal
          </button>
          <button 
            onClick={() => setActiveTab("broadcast")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${activeTab === "broadcast" ? "bg-amber-500 text-white shadow-lg shadow-amber-500/20" : "bg-white text-slate-500 hover:bg-slate-50 border border-slate-200"}`}
          >
            <Send className="w-4 h-4" /> Sistem Broadcast
          </button>
        </div>

        {/* Tab Contents */}
        {activeTab === "certificate" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                <h2 className="text-lg font-bold text-slate-800 mb-4">Buat E-Sertifikat Pengurus</h2>
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Nama Santri / Pengurus</label>
                    <input type="text" className="mt-1 w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500" placeholder="Masukkan nama..." />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Keterangan / Jabatan</label>
                    <input type="text" className="mt-1 w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500" placeholder="Cth: Pengurus Asrama Al-Ghazali 2025/2026" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Pilih Template</label>
                    <select className="mt-1 w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500">
                        <option>Sertifikat Khidmah Pengurus (Emas)</option>
                        <option>Sertifikat Kehadiran Rapat / Seminar</option>
                        <option>Sertifikat Penghargaan Khusus</option>
                    </select>
                  </div>
                  <button onClick={handleGenerateCertificate} className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/30 transition-all">
                    Buat Sertifikat
                  </button>
                </div>
            </div>
            
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 shadow-inner flex flex-col items-center justify-center text-center">
                <div className="w-full max-w-sm aspect-[1.4/1] bg-white border border-slate-300 shadow-sm rounded-lg mb-4 flex items-center justify-center text-slate-400">
                    <Image className="w-10 h-10 mb-2" />
                    <p className="text-xs font-medium">Preview Sertifikat</p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 text-sm font-bold rounded-lg hover:bg-slate-50">
                    <Download className="w-4 h-4" /> Unduh PDF
                </button>
            </div>
          </div>
        )}

        {activeTab === "proposal" && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
               <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                 <div>
                    <h2 className="text-lg font-bold text-slate-800">Daftar Pengajuan Proposal</h2>
                    <p className="text-sm text-slate-500">Persetujuan terintegrasi dari Ketua Umum dan pencairan via Bendahara</p>
                 </div>
               </div>
               <table className="w-full text-sm">
                 <thead className="bg-slate-50 border-b border-slate-100">
                   <tr className="text-xs text-slate-500 font-bold uppercase tracking-wider text-left">
                     <th className="px-6 py-4">Judul Proposal</th>
                     <th className="px-6 py-4">Pengaju (Seksi)</th>
                     <th className="px-6 py-4">Anggaran</th>
                     <th className="px-6 py-4">Status</th>
                     <th className="px-6 py-4">Aksi</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-100">
                   {[
                     { title: "Kegiatan PHBI Maulid Nabi", by: "Seksi Jam'iyyah", budget: "Rp 15.000.000", status: "Diajukan", color: "text-amber-600", bg: "bg-amber-50" },
                     { title: "Perbaikan Instalasi Air Blok A", by: "Seksi PLP", budget: "Rp 3.500.000", status: "Disetujui Ketua", color: "text-emerald-600", bg: "bg-emerald-50" },
                   ].map((item, i) => (
                     <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                       <td className="px-6 py-4 font-bold text-slate-800 flex items-center gap-2">
                         <FileText className="w-4 h-4 text-slate-400" /> {item.title}
                       </td>
                       <td className="px-6 py-4 text-slate-600">{item.by}</td>
                       <td className="px-6 py-4 font-mono font-bold text-slate-700">{item.budget}</td>
                       <td className="px-6 py-4">
                           <span className={`inline-flex px-2.5 py-1 rounded-md text-[10px] font-black uppercase ${item.bg} ${item.color}`}>
                             {item.status}
                           </span>
                       </td>
                       <td className="px-6 py-4">
                         <button className="text-emerald-600 text-xs font-bold hover:underline">Detail / Proses</button>
                       </td>
                     </tr>
                   ))}
                 </tbody>
               </table>
            </div>
          </div>
        )}

        {activeTab === "broadcast" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
                <h2 className="text-lg font-bold text-slate-800 mb-1">Buat Pengumuman Baru</h2>
                <p className="text-sm text-slate-500 mb-6">Pesan akan disiarkan melalui notifikasi aplikasi dan/atau WhatsApp Gateway</p>
                
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Tujuan (Penerima)</label>
                    <select className="mt-1 w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-amber-500">
                        <option>Seluruh Wali Santri</option>
                        <option>Seluruh Pengurus Pondok</option>
                        <option>Wali Santri Tunggakan SPP</option>
                        <option>Santri Kelas Aliyyah</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Judul Pengumuman</label>
                    <input type="text" className="mt-1 w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-amber-500" placeholder="Penting: Libur Maulid Nabi..." />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Isi Pesan</label>
                    <textarea rows={4} className="mt-1 w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-amber-500 resize-none" placeholder="Assalamu'alaikum Wr. Wb. Diberitahukan kepada..."></textarea>
                  </div>
                  
                  <div className="flex gap-4 pt-2">
                      <button className="flex-1 py-3 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl shadow-lg shadow-amber-500/30 transition-all flex items-center justify-center gap-2">
                        <Send className="w-4 h-4" /> Kirim Sekarang
                      </button>
                  </div>
                </div>
             </div>
             
             <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex flex-col justify-center">
                <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-emerald-500" /> Riwayat Broadcast
                </h3>
                <div className="space-y-3">
                    <div className="p-4 border border-slate-100 rounded-xl bg-slate-50/50">
                        <div className="flex justify-between items-start mb-2">
                            <span className="text-xs font-bold px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-md">Berhasil (1,200)</span>
                            <span className="text-[10px] text-slate-400 font-bold">1 Hari yang lalu</span>
                        </div>
                        <p className="text-sm font-bold text-slate-700 mb-1">Tagihan Syahriah Periode Syawal</p>
                        <p className="text-xs text-slate-500 line-clamp-1">Tujuan: Wali Santri Tunggakan SPP</p>
                    </div>
                    <div className="p-4 border border-slate-100 rounded-xl bg-slate-50/50">
                        <div className="flex justify-between items-start mb-2">
                            <span className="text-xs font-bold px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-md">Berhasil (4,150)</span>
                            <span className="text-[10px] text-slate-400 font-bold">12 Juni 2026</span>
                        </div>
                        <p className="text-sm font-bold text-slate-700 mb-1">Pengumuman Awal Masuk Pondok</p>
                        <p className="text-xs text-slate-500 line-clamp-1">Tujuan: Seluruh Wali Santri</p>
                    </div>
                </div>
             </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
