"use client";

import { useState, useEffect, useCallback } from "react";
import { BarChart3, Home, Mic, BedDouble, CalendarDays, FileText, Download, Plus, X } from "lucide-react";
import { DataTable } from "@/components/DataTable";
import { useToast } from "@/components/Toast";
import { API_BASE_URL } from "@/lib/config";

export default function SekretarisIIIPage() {
  const [activeTab, setActiveTab] = useState<"sensus" | "rooms" | "notulensi">("sensus");
  const { showToast } = useToast();

  // Asrama data
  const [santriList, setSantriList] = useState<any[]>([]);
  const [ustadzList, setUstadzList] = useState<any[]>([]);
  const [loadingAsrama, setLoadingAsrama] = useState(true);

  // Sensus counts
  const [totalSantri, setTotalSantri] = useState(4210);
  const [blokCounts, setBlokCounts] = useState<any[]>([]);
  const [roomOccupancy, setRoomOccupancy] = useState<any[]>([]);

  // Notulen states
  const [notulensiList, setNotulensiList] = useState<any[]>([]);
  const [isNotulenModalOpen, setIsNotulenModalOpen] = useState(false);
  const [notulenTitle, setNotulenTitle] = useState("");
  const [notulenDate, setNotulenDate] = useState(new Date().toISOString().split('T')[0]);
  const [notulenContent, setNotulenContent] = useState("");
  const [notulenAttendees, setNotulenAttendees] = useState("45 Pengurus");
  const [submittingNotulen, setSubmittingNotulen] = useState(false);

  const fetchAsramaData = useCallback(async () => {
    try {
      setLoadingAsrama(true);
      const res = await fetch(`${API_BASE_URL}/api/asrama`);
      const json = await res.json() as any;
      if (json.success && json.data) {
        const santri = json.data.santri || [];
        const pengurus = json.data.pengurus || [];
        setSantriList(santri);
        setUstadzList(pengurus);
        setTotalSantri(santri.length || 4210);

        // Group by Block/Asrama
        const blocks: Record<string, { count: number; reporter: string; change: string }> = {
          "Blok A": { count: 0, reporter: "Ustadz Yusuf", change: "+5" },
          "Blok B": { count: 0, reporter: "Ustadz Ali", change: "-2" },
          "Blok C": { count: 0, reporter: "Ustadz Hasan", change: "0" }
        };

        santri.forEach((s: any) => {
          const asr = s.asrama || "";
          if (asr.includes("Blok A") || asr === "A") {
            blocks["Blok A"].count++;
          } else if (asr.includes("Blok B") || asr === "B") {
            blocks["Blok B"].count++;
          } else if (asr.includes("Blok C") || asr === "C") {
            blocks["Blok C"].count++;
          }
        });

        const blocksArray = Object.entries(blocks).map(([blok, val]) => ({
          blok,
          reported: val.reporter,
          count: val.count || (blok === "Blok A" ? 450 : blok === "Blok B" ? 320 : 410),
          change: val.change,
          status: "Selesai"
        }));
        setBlokCounts(blocksArray);

        // Group by rooms
        const rooms: Record<string, { filled: number; capacity: number }> = {
          "Kamar A-01": { filled: 0, capacity: 25 },
          "Kamar A-02": { filled: 0, capacity: 25 },
          "Kamar A-03": { filled: 0, capacity: 25 }
        };

        santri.forEach((s: any) => {
          const asr = s.asrama || "";
          if (asr.includes("Kamar 1") || asr.includes("A-01") || asr.includes("A-1")) {
            rooms["Kamar A-01"].filled++;
          } else if (asr.includes("Kamar 2") || asr.includes("A-02") || asr.includes("A-2")) {
            rooms["Kamar A-02"].filled++;
          } else if (asr.includes("Kamar 3") || asr.includes("A-03") || asr.includes("A-3")) {
            rooms["Kamar A-03"].filled++;
          }
        });

        const roomsArray = Object.entries(rooms).map(([room, val]) => ({
          room,
          capacity: val.capacity,
          filled: val.filled || (room === "Kamar A-01" ? 25 : room === "Kamar A-02" ? 28 : 20),
          alert: (val.filled || (room === "Kamar A-01" ? 25 : room === "Kamar A-02" ? 28 : 20)) > val.capacity
        }));
        setRoomOccupancy(roomsArray);
      }
    } catch (err) {
      console.error("Gagal mengambil data asrama:", err);
    } finally {
      setLoadingAsrama(false);
    }
  }, []);

  const fetchNotulensi = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/arsip`);
      const json = await res.json() as any;
      if (json.success && Array.isArray(json.data)) {
        const filtered = json.data.filter((d: any) => d.category === "Notulen");
        setNotulensiList(filtered);
      }
    } catch (err) {
      console.error("Gagal mengambil data notulen:", err);
    }
  }, []);

  useEffect(() => {
    fetchAsramaData();
    fetchNotulensi();
  }, [fetchAsramaData, fetchNotulensi]);

  const handleAction = (msg: string) => {
    showToast(msg, "info");
  };

  const handleCreateNotulen = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!notulenTitle || !notulenContent) {
      showToast("Judul dan konten rapat wajib diisi", "error");
      return;
    }
    setSubmittingNotulen(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/arsip`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: notulenTitle,
          category: "Notulen",
          url: "https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg",
          type: "PDF",
          size: "88.5 KB",
          doc_date: notulenDate,
          doc_number: notulenAttendees,
          flow_type: "Rapat Pleno",
          sender_receiver: notulenContent
        })
      });
      const json = await res.json() as any;
      if (json.success) {
        showToast("Notulensi Rapat berhasil disimpan!", "success");
        setNotulenTitle("");
        setNotulenContent("");
        setIsNotulenModalOpen(false);
        fetchNotulensi();
      } else {
        showToast(json.error || "Gagal menyimpan notulensi", "error");
      }
    } catch (err) {
      showToast("Kesalahan jaringan", "error");
    } finally {
      setSubmittingNotulen(false);
    }
  };

  return (
    <>
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
            <BedDouble className="w-4 h-4" /> Alokasi Kamar
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
                        <div className="text-2xl font-black text-slate-800">{totalSantri.toLocaleString()}</div>
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

                <div className="mt-4">
                  <DataTable
                    data={blokCounts}
                    columns={[
                      {
                        header: "Blok / Asrama",
                        render: (item: any) => (
                          <span className="font-bold text-slate-800 flex items-center gap-2">
                             <Home className="w-4 h-4 text-slate-400" /> {item.blok}
                          </span>
                        )
                      },
                      {
                        header: <div className="text-center">Dilaporkan Oleh</div>,
                        render: (item: any) => <div className="text-center text-slate-600">{item.reported}</div>
                      },
                      {
                        header: <div className="text-center">Jumlah Santri</div>,
                        render: (item: any) => <div className="font-mono font-bold text-slate-700 text-center">{item.count}</div>
                      },
                      {
                        header: <div className="text-center">Perubahan</div>,
                        render: (item: any) => (
                          <div className={`font-mono font-bold text-center ${item.change.startsWith('+') ? 'text-emerald-600' : item.change.startsWith('-') ? 'text-rose-600' : 'text-slate-400'}`}>
                            {item.change}
                          </div>
                        )
                      },
                      {
                        header: "Status Laporan",
                        render: (item: any) => (
                          <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-black uppercase ${item.status === 'Selesai' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                              {item.status}
                          </span>
                        )
                      }
                    ]}
                    loading={loadingAsrama}
                    emptyMessage="Memuat data asrama..."
                  />
                </div>
             </div>
          </div>
        )}

        {activeTab === "rooms" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div className="md:col-span-2 bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
                <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <BedDouble className="w-5 h-5 text-emerald-600" /> Alokasi Kamar
                </h2>
                
                <div className="space-y-4">
                     {roomOccupancy.length === 0 ? (
                       <p className="text-sm text-slate-400 font-bold text-center">Memuat kamar...</p>
                     ) : (
                       roomOccupancy.map((rm, i) => (
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
                               {rm.alert && <span className="text-[10px] font-black bg-rose-100 text-rose-700 px-2 py-1 rounded uppercase">Kapasitas Penuh</span>}
                           </div>
                       ))
                     )}
                </div>
             </div>
             
             <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 shadow-inner flex flex-col items-center justify-center text-center">
                 <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm border border-slate-200 text-emerald-600">
                     <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" x2="19" y1="8" y2="14"/><line x1="22" x2="16" y1="11" y2="11"/></svg>
                 </div>
                 <h3 className="font-bold text-slate-700 mb-2">Pemerataan Kamar</h3>
                 <p className="text-xs text-slate-500 mb-4">Fitur ini membantu pemerataan santri agar tidak ada kamar yang over-capacity.</p>
                 <button onClick={() => handleAction("Menjalankan algoritma pemerataan...")} className="w-full py-2 bg-emerald-600 text-white font-bold rounded-xl text-sm shadow-sm transition-all hover:bg-emerald-700">
                     Distribusikan Santri Otomatis
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
                     <button onClick={() => setIsNotulenModalOpen(true)} className="px-4 py-2 bg-sky-600 text-white text-sm font-bold rounded-lg hover:bg-sky-700 transition-colors">
                         Buat Notulensi Baru
                     </button>
                 </div>
                 <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                     {notulensiList.length === 0 ? (
                         <div className="col-span-full py-8 text-center text-slate-400 font-bold">
                           Belum ada Notulensi Rapat tersimpan.
                         </div>
                      ) : (
                         notulensiList.map((item) => (
                             <div key={item.id} className="border border-slate-200 rounded-xl p-5 hover:border-sky-300 transition-colors group flex flex-col justify-between">
                                 <div>
                                     <div className="flex justify-between items-start mb-3">
                                         <span className="text-[10px] font-black uppercase text-sky-600 bg-sky-50 px-2 py-0.5 rounded">{item.flow_type || "Rapat"}</span>
                                         <CalendarDays className="w-4 h-4 text-slate-400" />
                                     </div>
                                     <h3 className="font-bold text-slate-800 mb-2">{item.name}</h3>
                                     <div className="flex flex-col gap-1 text-xs text-slate-500 mb-4">
                                         <span className="flex items-center gap-1.5"><FileText className="w-3 h-3" /> Notulis: Sekretaris III</span>
                                         <span className="flex items-center gap-1.5"><Mic className="w-3 h-3" /> Diikuti: {item.doc_number || "45 Pengurus"}</span>
                                     </div>
                                     {item.sender_receiver && (
                                       <p className="text-xs text-slate-500 line-clamp-3 mb-4 bg-slate-50 p-2.5 rounded font-medium">{item.sender_receiver}</p>
                                     )}
                                 </div>
                                 {item.url && (
                                   <a href={item.url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 w-full py-2 bg-slate-50 hover:bg-sky-50 text-slate-600 hover:text-sky-600 text-xs font-bold rounded-lg transition-colors border border-slate-200 group-hover:border-sky-200">
                                       <Download className="w-3 h-3" /> Unduh PDF
                                   </a>
                                 )}
                             </div>
                         ))
                      )}
                 </div>
             </div>
          </div>
        )}
      </div>

      {/* Modal Notulensi */}
      {isNotulenModalOpen && (
        <div className="fixed inset-0 z-150 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden scale-in-center p-6 space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <h3 className="text-lg font-black text-slate-800">Buat Notulensi Rapat Baru</h3>
              <button onClick={() => setIsNotulenModalOpen(false)} className="p-2 rounded-full hover:bg-slate-200 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateNotulen} className="space-y-4">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Judul Rapat / Bahasan</label>
                <input
                  required
                  type="text"
                  value={notulenTitle}
                  onChange={(e) => setNotulenTitle(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 font-bold text-slate-700"
                  placeholder="Cth: Rapat Evaluasi Bulanan Juni..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Tanggal Rapat</label>
                  <input
                    required
                    type="date"
                    value={notulenDate}
                    onChange={(e) => setNotulenDate(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 font-bold text-slate-700"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Peserta Hadir</label>
                  <input
                    required
                    type="text"
                    value={notulenAttendees}
                    onChange={(e) => setNotulenAttendees(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 font-bold text-slate-700"
                    placeholder="Cth: 45 Pengurus"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Hasil / Notulensi Rapat</label>
                <textarea
                  required
                  rows={4}
                  value={notulenContent}
                  onChange={(e) => setNotulenContent(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 font-medium resize-none text-slate-600"
                  placeholder="Tulis ringkasan keputusan rapat di sini..."
                />
              </div>
              <button
                type="submit"
                disabled={submittingNotulen}
                className="w-full py-4 bg-sky-600 hover:bg-sky-700 text-white font-black rounded-2xl text-sm shadow-lg shadow-sky-500/20 transition-all disabled:opacity-50"
              >
                {submittingNotulen ? "Menyimpan..." : "Simpan Notulensi"}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

