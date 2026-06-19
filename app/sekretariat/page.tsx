"use client";

import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { FolderKanban, Users, Mail, CheckCircle, Clock, FileText, Download, Plus, Send } from "lucide-react";
import { useToast } from "@/components/Toast";
import { API_BASE_URL } from "@/lib/config";

export default function SekretariatPage() {
  const [activeTab, setActiveTab] = useState<"master" | "esurat" | "absensi" | "pengumuman">("master");
  const { showToast } = useToast();

  const [announcementTitle, setAnnouncementTitle] = useState("");
  const [announcementMsg, setAnnouncementMsg] = useState("");
  const [announcementType, setAnnouncementType] = useState("info");
  const [sendingAnnouncement, setSendingAnnouncement] = useState(false);

  const handleSendAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!announcementTitle || !announcementMsg) return;
    setSendingAnnouncement(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/notifications`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: announcementTitle,
          message: announcementMsg,
          type: announcementType
        })
      });
      const json = await res.json() as any;
      if (json.success) {
        showToast("Pengumuman berhasil disebarkan ke seluruh pengguna!", "success");
        setAnnouncementTitle("");
        setAnnouncementMsg("");
      } else {
        showToast(json.error || "Gagal menyebarkan pengumuman", "error");
      }
    } catch (err) {
      showToast("Kesalahan jaringan", "error");
    } finally {
      setSendingAnnouncement(false);
    }
  };

  const handleSyncEmis = () => {
    showToast("Sinkronisasi EMIS sedang berjalan di latar belakang...", "info");
    setTimeout(() => {
      showToast("Sinkronisasi EMIS berhasil diselesaikan", "success");
    }, 2000);
  };

  return (
    <DashboardLayout>
      <div className="fade-up">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-800 flex items-center gap-2">
              <FolderKanban className="w-7 h-7 text-emerald-600" /> Sekretariat Umum
            </h1>
            <p className="text-sm text-slate-500 mt-1">Pusat Administrasi, Master Data, dan Persuratan</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-4 mb-6 scrollbar-hide">
          <button 
            onClick={() => setActiveTab("master")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${activeTab === "master" ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/20" : "bg-white text-slate-500 hover:bg-slate-50 border border-slate-200"}`}
          >
            <Users className="w-4 h-4" /> Master Data (EMIS)
          </button>
          <button 
            onClick={() => setActiveTab("esurat")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${activeTab === "esurat" ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20" : "bg-white text-slate-500 hover:bg-slate-50 border border-slate-200"}`}
          >
            <Mail className="w-4 h-4" /> E-Surat & Dokumen
          </button>
          <button 
            onClick={() => setActiveTab("absensi")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${activeTab === "absensi" ? "bg-amber-500 text-white shadow-lg shadow-amber-500/20" : "bg-white text-slate-500 hover:bg-slate-50 border border-slate-200"}`}
          >
            <CheckCircle className="w-4 h-4" /> Absensi Pengurus
          </button>
          <button 
            onClick={() => setActiveTab("pengumuman")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${activeTab === "pengumuman" ? "bg-rose-600 text-white shadow-lg shadow-rose-600/20" : "bg-white text-slate-500 hover:bg-slate-50 border border-slate-200"}`}
          >
            <Send className="w-4 h-4" /> Kirim Pengumuman
          </button>
        </div>

        {/* Tab Contents */}
        {activeTab === "master" && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center mb-4">
                  <Users className="w-6 h-6 text-emerald-600" />
                </div>
                <h3 className="text-sm font-bold text-slate-500 mb-1">Total Data Santri</h3>
                <div className="text-3xl font-black text-slate-800">4,210</div>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-4">
                  <FileText className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-sm font-bold text-slate-500 mb-1">Data Tersinkronisasi EMIS</h3>
                <div className="text-3xl font-black text-slate-800">4,150</div>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-center items-center text-center">
                <button onClick={handleSyncEmis} className="w-full py-4 bg-linear-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-bold shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/40 hover:scale-[1.02] transition-all flex items-center justify-center gap-2">
                  <Download className="w-5 h-5" /> Tarik Data EMIS
                </button>
                <p className="text-xs text-slate-400 mt-3">Sinkronisasi terakhir: Hari ini, 08:30 WIB</p>
              </div>
            </div>
            
            <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm p-6">
               <h2 className="font-bold text-slate-800 mb-4">Status Sinkronisasi Terbaru</h2>
               <div className="p-8 border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center text-slate-400">
                  <p>Sistem ini terintegrasi dengan modul Santri. Kunjungi halaman Data Santri untuk melihat detail.</p>
               </div>
            </div>
          </div>
        )}

        {activeTab === "esurat" && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-center mb-4">
               <h2 className="text-lg font-bold text-slate-800">Draft Surat Keluar</h2>
               <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-lg transition-all shadow-md">
                 <Plus className="w-4 h-4" /> Buat Draft Surat
               </button>
            </div>
            <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
               <table className="w-full text-sm">
                 <thead className="bg-slate-50 border-b border-slate-100">
                   <tr className="text-xs text-slate-500 font-bold uppercase tracking-wider text-left">
                     <th className="px-6 py-4">Nomor / Judul</th>
                     <th className="px-6 py-4">Tujuan</th>
                     <th className="px-6 py-4">Tanggal</th>
                     <th className="px-6 py-4">Status</th>
                     <th className="px-6 py-4">Aksi</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-100">
                   {[1, 2, 3].map((item) => (
                     <tr key={item} className="hover:bg-slate-50/50 transition-colors">
                       <td className="px-6 py-4">
                         <div className="font-bold text-slate-800">Surat Edaran Libur {item}</div>
                         <div className="text-xs text-slate-400 mt-1">PPDS/{item}/2026/06</div>
                       </td>
                       <td className="px-6 py-4 text-slate-600">Wali Santri Blok A</td>
                       <td className="px-6 py-4 text-slate-600">19 Juni 2026</td>
                       <td className="px-6 py-4">
                         {item === 1 ? (
                           <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-black bg-amber-50 text-amber-600 uppercase">
                             <Clock className="w-3 h-3" /> Menunggu TTD Ketua
                           </span>
                         ) : (
                           <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-black bg-emerald-50 text-emerald-600 uppercase">
                             <CheckCircle className="w-3 h-3" /> TTD Digital Selesai
                           </span>
                         )}
                       </td>
                       <td className="px-6 py-4">
                         <button className="text-indigo-600 text-xs font-bold hover:underline">Lihat Dokumen</button>
                       </td>
                     </tr>
                   ))}
                 </tbody>
               </table>
            </div>
          </div>
        )}

        {activeTab === "absensi" && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm flex flex-col md:flex-row gap-6 items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-slate-800 mb-1">Tracker Absensi Wajib Khidmah</h2>
                  <p className="text-sm text-slate-500">Pantau kehadiran pengurus dan dewan harian secara real-time</p>
                </div>
                <div className="flex gap-4">
                   <div className="text-center px-6 py-3 bg-slate-50 rounded-xl">
                      <div className="text-2xl font-black text-emerald-600">45</div>
                      <div className="text-xs text-slate-400 font-bold uppercase mt-1">Hadir</div>
                   </div>
                   <div className="text-center px-6 py-3 bg-slate-50 rounded-xl">
                      <div className="text-2xl font-black text-amber-600">2</div>
                      <div className="text-xs text-slate-400 font-bold uppercase mt-1">Izin</div>
                   </div>
                   <div className="text-center px-6 py-3 bg-slate-50 rounded-xl">
                      <div className="text-2xl font-black text-rose-600">3</div>
                      <div className="text-xs text-slate-400 font-bold uppercase mt-1">Alfa</div>
                   </div>
                </div>
             </div>
             
             <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm p-8 text-center text-slate-400">
                <Clock className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <h3 className="font-bold text-slate-600 mb-2">Data Absensi Hari Ini</h3>
                <p className="text-sm max-w-md mx-auto">Pengurus melakukan presensi menggunakan aplikasi mobile atau sistem finger print yang terhubung ke server pusat.</p>
             </div>
          </div>
        )}
         {activeTab === "pengumuman" && (
           <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm max-w-2xl">
               <h2 className="text-lg font-black text-slate-800 mb-2">Kirim Pengumuman Baru</h2>
               <p className="text-xs text-slate-400 mb-6">Pengumuman ini akan langsung dikirimkan ke lonceng notifikasi semua pengguna secara real-time.</p>
               
               <form onSubmit={handleSendAnnouncement} className="space-y-4">
                  <div>
                     <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Judul Pengumuman</label>
                     <input 
                       type="text"
                       required
                       value={announcementTitle}
                       onChange={(e) => setAnnouncementTitle(e.target.value)}
                       placeholder="Contoh: Libur Hari Raya Idul Adha 1447 H"
                       className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all font-bold text-slate-700"
                     />
                  </div>
                  <div>
                     <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Konten / Isi Pengumuman</label>
                     <textarea 
                       required
                       value={announcementMsg}
                       onChange={(e) => setAnnouncementMsg(e.target.value)}
                       placeholder="Tulis detail pengumuman di sini..."
                       className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all min-h-[140px] text-slate-600"
                     />
                  </div>
                  <div>
                     <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Kategori / Urgensi</label>
                     <select 
                       value={announcementType}
                       onChange={(e) => setAnnouncementType(e.target.value)}
                       className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all font-bold text-slate-700"
                     >
                        <option value="info">Informasi / Biasa</option>
                        <option value="success">Sukses / Berita Baik</option>
                        <option value="warning">Penting / Peringatan</option>
                        <option value="danger">Darurat / Sangat Penting</option>
                     </select>
                  </div>
                  
                  <div className="pt-2">
                     <button 
                       type="submit" 
                       disabled={sendingAnnouncement}
                       className="px-6 py-3.5 bg-rose-600 hover:bg-rose-700 text-white text-sm font-black rounded-xl shadow-lg shadow-rose-500/20 transition-all disabled:opacity-50 flex items-center gap-2 uppercase tracking-widest"
                     >
                       {sendingAnnouncement ? 'Mengirim...' : 'Kirim Pengumuman'}
                     </button>
                  </div>
               </form>
             </div>
           </div>
         )}
       </div>
    </DashboardLayout>
  );
}
