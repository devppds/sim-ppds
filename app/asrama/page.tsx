"use client";

import { useState, useEffect, useMemo } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { 
  Home, 
  Search, 
  Users, 
  ShieldCheck, 
  ChevronRight, 
  X, 
  Loader2,
  GraduationCap,
  User,
  RefreshCw
} from "lucide-react";
import { API_BASE_URL } from "@/lib/config";

interface Resident {
  name: string;
  asrama?: string;
  kamar?: string;
  kelas?: string;
  jabatan?: string;
  photo_url?: string;
  type: 'santri' | 'pengurus';
}

interface RoomStats {
  name: string;
  santriCount: number;
  pengurus: Resident[];
  residents: Resident[];
}

const ROOM_LIST = [
  ...Array.from({ length: 15 }, (_, i) => `DS A ${(i + 1).toString().padStart(2, "0")}`),
  ...Array.from({ length: 12 }, (_, i) => `DS B ${(i + 1).toString().padStart(2, "0")}`),
  ...Array.from({ length: 15 }, (_, i) => `DS C ${(i + 1).toString().padStart(2, "0")}`),
];

export default function AsramaPage() {
  const [activeTab, setActiveTab] = useState<"denah" | "izin">("denah");
  const [data, setData] = useState<{ santri: any[], pengurus: any[] }>({ santri: [], pengurus: [] });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterBlock, setFilterBlock] = useState("Semua");
  const [selectedRoom, setSelectedRoom] = useState<RoomStats | null>(null);

  const [izinSekolahList, setIzinSekolahList] = useState<any[]>([]);
  const [izinPulangList, setIzinPulangList] = useState<any[]>([]);
  const [loadingIzin, setLoadingIzin] = useState(false);

  useEffect(() => {
    fetchData();
    fetchPerizinanData();
  }, []);

  async function fetchPerizinanData() {
    setLoadingIzin(true);
    try {
      const [sekolahRes, pulangRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/pendidikan/izin-sekolah`),
        fetch(`${API_BASE_URL}/api/keamanan/perizinan`)
      ]);
      const sekolahJson = await sekolahRes.json() as any;
      const pulangJson = await pulangRes.json() as any;

      if (sekolahJson.success) {
        setIzinSekolahList(sekolahJson.data);
      }
      if (pulangJson.success) {
        setIzinPulangList(pulangJson.data);
      }
    } catch (err) {
      console.error("Gagal mengambil data perizinan di Asrama:", err);
    } finally {
      setLoadingIzin(false);
    }
  }

  async function fetchData() {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/asrama`);
      const json = await res.json() as any;
      if (json.success) {
        setData(json.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const filteredIzinSekolah = useMemo(() => {
    return izinSekolahList.filter(i => 
      (i.santri_name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (i.keperluan || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (i.santri_asrama || "").toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [izinSekolahList, searchQuery]);

  const filteredIzinPulang = useMemo(() => {
    return izinPulangList.filter(p => 
      (p.santri_name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.keperluan || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.santri_asrama || "").toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [izinPulangList, searchQuery]);

  const roomStats = useMemo(() => {
    return ROOM_LIST.map(roomName => {
      const roomSantri = data.santri
        .filter(s => s.asrama === roomName)
        .map(s => ({ ...s, type: 'santri' } as Resident));
      
      const roomPengurus = data.pengurus
        .filter(p => p.kamar === roomName)
        .map(p => ({ ...p, type: 'pengurus' } as Resident));

      return {
        name: roomName,
        santriCount: roomSantri.length,
        pengurus: roomPengurus,
        residents: [...roomPengurus, ...roomSantri]
      };
    });
  }, [data]);

  const filteredRooms = roomStats.filter(room => {
    const matchesSearch = room.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         room.residents.some(r => r.name.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesBlock = filterBlock === "Semua" || room.name.startsWith(filterBlock);
    return matchesSearch && matchesBlock;
  });

  return (
    <DashboardLayout>
      <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto relative">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
              <Home className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-800 tracking-tight">Manajemen Asrama</h1>
              <p className="text-sm text-slate-500 font-medium">Kontrol Penghuni & Pengurus Kamar</p>
            </div>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button 
              onClick={() => { fetchData(); fetchPerizinanData(); }}
              className="p-2.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
              title="Refresh Data"
            >
              <RefreshCw className={`w-5 h-5 ${(loading || loadingIzin) ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 p-1 bg-slate-100 rounded-xl max-w-fit">
          <button
            onClick={() => setActiveTab("denah")}
            className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${
              activeTab === "denah" 
                ? "bg-white text-indigo-600 shadow-sm" 
                : "text-slate-500 hover:text-slate-700 hover:bg-slate-200"
            }`}
          >
            Denah Kamar Asrama
          </button>
          <button
            onClick={() => setActiveTab("izin")}
            className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${
              activeTab === "izin" 
                ? "bg-white text-indigo-600 shadow-sm" 
                : "text-slate-500 hover:text-slate-700 hover:bg-slate-200"
            }`}
          >
            Laporan Perizinan Santri
          </button>
        </div>

        {/* Search & Filter bar */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text"
              placeholder={activeTab === "denah" ? "Cari kamar atau nama..." : "Cari nama santri atau keperluan..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-semibold"
            />
          </div>
          
          {activeTab === "denah" && (
            <div className="flex space-x-1 p-1 bg-slate-100 rounded-xl w-full sm:w-auto overflow-x-auto">
              {["Semua", "DS A", "DS B", "DS C"].map((block) => (
                <button
                  key={block}
                  onClick={() => setFilterBlock(block)}
                  className={`px-5 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap ${
                    filterBlock === block 
                      ? "bg-white text-indigo-600 shadow-sm" 
                      : "text-slate-500 hover:text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  {block}
                </button>
              ))}
            </div>
          )}
        </div>

        {activeTab === "denah" && (
          loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400">
              <Loader2 className="w-10 h-10 animate-spin text-indigo-600 mb-4" />
              <p className="text-xs font-semibold uppercase tracking-wider">Memuat Denah Asrama...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredRooms.map((room) => (
                <div 
                  key={room.name}
                  onClick={() => setSelectedRoom(room)}
                  className="group bg-white p-5 rounded-[28px] border border-slate-100 shadow-sm hover:border-indigo-400 hover:shadow-xl hover:shadow-indigo-600/5 transition-all cursor-pointer active:scale-95"
                >
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Kamar</span>
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${room.pengurus.length > 0 ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-50 text-slate-300'}`}>
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-black text-slate-800 mb-1 group-hover:text-indigo-600 transition-colors uppercase">{room.name}</h3>
                  <p className="text-xs font-bold text-slate-400 mb-5">Pesantren Darussalam</p>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                         <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                            <Users className="w-4 h-4" />
                         </div>
                         <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase leading-none mb-0.5">Penghuni</p>
                            <p className="text-sm font-black text-slate-700">{room.santriCount} <span className="text-[10px] text-slate-400 uppercase">Santri</span></p>
                         </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-300 group-hover:translate-x-1 transition-transform" />
                    </div>

                    <div className="pt-3 border-t border-slate-50">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Penanggung Jawab</p>
                      {room.pengurus.length > 0 ? (
                         <div className="flex items-center gap-2">
                           <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center overflow-hidden">
                             {room.pengurus[0].photo_url ? (
                               <img src={room.pengurus[0].photo_url} alt={room.pengurus[0].name} className="w-full h-full object-cover" />
                             ) : (
                               <User className="w-3 h-3 text-indigo-600" />
                             )}
                           </div>
                           <span className="text-[11px] font-black text-slate-600 truncate">{room.pengurus[0].name}</span>
                         </div>
                      ) : (
                        <span className="text-[11px] font-bold text-slate-300 italic">Belum ada pengurus</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        )}

        {activeTab === "izin" && (
          <div className="space-y-8">
            {/* Izin Pulang / Keluar */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                <div>
                  <h2 className="font-extrabold text-slate-800 text-lg">Laporan Santri Pulang / Keluar (Keamanan)</h2>
                  <p className="text-xs text-slate-400 font-medium">Santri yang sedang berada di luar pondok atau izin pulang</p>
                </div>
                <span className="px-3 py-1 bg-rose-50 text-rose-600 rounded-full text-xs font-black uppercase tracking-wider">
                  {filteredIzinPulang.filter(p => p.status === 'Keluar' || p.status === 'Terlambat').length} Aktif
                </span>
              </div>
              <div className="overflow-x-auto">
                {loadingIzin ? (
                  <div className="flex flex-col items-center justify-center py-10 text-slate-400">
                    <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mb-2" />
                    <p className="text-xs font-bold uppercase tracking-wider">Memuat Laporan Keamanan...</p>
                  </div>
                ) : filteredIzinPulang.length === 0 ? (
                  <div className="text-center py-12 text-slate-400 text-sm font-semibold italic">
                    Tidak ada laporan izin keluar dari seksi keamanan.
                  </div>
                ) : (
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50 border-b border-slate-100">
                      <tr className="text-xs text-slate-500 font-bold uppercase text-left">
                        <th className="px-6 py-4">Nama / Kelas</th>
                        <th className="px-6 py-4">Kamar / Asrama</th>
                        <th className="px-6 py-4">Keperluan</th>
                        <th className="px-6 py-4">Tanggal Mulai</th>
                        <th className="px-6 py-4">Batas Kembali</th>
                        <th className="px-6 py-4">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredIzinPulang.map((p) => (
                        <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-6 py-4 font-bold text-slate-850">
                            <div>{p.santri_name}</div>
                            <div className="text-[10px] text-slate-400 font-normal mt-0.5">{p.santri_kelas}</div>
                          </td>
                          <td className="px-6 py-4 text-slate-600 font-semibold">{p.santri_asrama || "-"}</td>
                          <td className="px-6 py-4 text-slate-600">{p.keperluan}</td>
                          <td className="px-6 py-4 text-slate-500">{p.tgl_mulai}</td>
                          <td className="px-6 py-4 font-semibold text-rose-500">{p.tgl_kembali}</td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex px-2.5 py-1 rounded-md text-[10px] font-black uppercase ${
                              p.status === "Keluar" ? "bg-rose-50 text-rose-600" :
                              p.status === "Kembali" ? "bg-emerald-50 text-emerald-600" :
                              p.status === "Terlambat" ? "bg-amber-50 text-amber-600 animate-pulse" :
                              "bg-slate-100 text-slate-500"
                            }`}>
                              {p.status === "Keluar" ? "Sedang Pulang" : p.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>

            {/* Izin Sekolah */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                <div>
                  <h2 className="font-extrabold text-slate-800 text-lg">Laporan Izin Sekolah / Akademik (Pendidikan)</h2>
                  <p className="text-xs text-slate-400 font-medium">Santri yang mendapatkan dispensasi izin sekolah dari seksi pendidikan</p>
                </div>
                <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-xs font-black uppercase tracking-wider">
                  {filteredIzinSekolah.filter(i => i.status === 'Disetujui' || i.status === 'Diajukan').length} Terdaftar
                </span>
              </div>
              <div className="overflow-x-auto">
                {loadingIzin ? (
                  <div className="flex flex-col items-center justify-center py-10 text-slate-400">
                    <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mb-2" />
                    <p className="text-xs font-bold uppercase tracking-wider">Memuat Laporan Pendidikan...</p>
                  </div>
                ) : filteredIzinSekolah.length === 0 ? (
                  <div className="text-center py-12 text-slate-400 text-sm font-semibold italic">
                    Tidak ada laporan izin sekolah dari seksi pendidikan.
                  </div>
                ) : (
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50 border-b border-slate-100">
                      <tr className="text-xs text-slate-500 font-bold uppercase text-left">
                        <th className="px-6 py-4">Nama / Kelas</th>
                        <th className="px-6 py-4">Kamar / Asrama</th>
                        <th className="px-6 py-4">Sekolah & Keperluan</th>
                        <th className="px-6 py-4">Tanggal Mulai</th>
                        <th className="px-6 py-4">Batas Kembali</th>
                        <th className="px-6 py-4">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredIzinSekolah.map((i) => (
                        <tr key={i.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-6 py-4 font-bold text-slate-850">
                            <div>{i.santri_name}</div>
                            <div className="text-[10px] text-slate-400 font-normal mt-0.5">{i.santri_kelas}</div>
                          </td>
                          <td className="px-6 py-4 text-slate-600 font-semibold">{i.santri_asrama || "-"}</td>
                          <td className="px-6 py-4 text-slate-600">{i.keperluan}</td>
                          <td className="px-6 py-4 text-slate-500">{i.tgl_mulai}</td>
                          <td className="px-6 py-4 font-semibold text-indigo-500">{i.tgl_kembali}</td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex px-2.5 py-1 rounded-md text-[10px] font-black uppercase ${
                              i.status === "Disetujui" ? "bg-emerald-50 text-emerald-600" :
                              i.status === "Diajukan" ? "bg-amber-50 text-amber-600" :
                              "bg-slate-100 text-slate-500"
                            }`}>
                              {i.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedRoom && (
        <div className="fixed inset-0 z-200 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300 text-text-main">
          <div className="bg-white w-full max-w-lg rounded-[40px] shadow-2xl overflow-hidden scale-in-center flex flex-col max-h-[85vh]">
            <div className="p-8 border-b border-slate-50 flex items-center justify-between shrink-0">
               <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-xl shadow-indigo-600/20 uppercase font-black">
                     {selectedRoom.name.split(' ')[selectedRoom.name.split(' ').length - 1]}
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">Kamar {selectedRoom.name}</h3>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Detail Penghuni Kamar</p>
                  </div>
               </div>
               <button onClick={() => setSelectedRoom(null)} className="p-2 rounded-full hover:bg-slate-100 text-slate-400 transition-colors">
                 <X className="w-6 h-6" />
               </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-6">
               {/* Sections: Pengurus First */}
               <div>
                  <div className="flex items-center gap-2 mb-4 px-2">
                     <ShieldCheck className="w-4 h-4 text-indigo-600" />
                     <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Pengurus Kamar</span>
                  </div>
                  <div className="space-y-3">
                     {selectedRoom.pengurus.length > 0 ? (
                       selectedRoom.pengurus.map((p, i) => (
                         <div key={i} className="flex items-center gap-4 p-4 bg-indigo-50/50 rounded-3xl border border-indigo-100">
                            <div className="w-12 h-12 rounded-2xl bg-indigo-200 overflow-hidden shadow-sm shrink-0">
                               {p.photo_url ? (
                                 <img src={p.photo_url} alt={p.name} className="w-full h-full object-cover" />
                               ) : (
                                 <div className="w-full h-full flex items-center justify-center text-indigo-600 text-lg font-black">{p.name[0]}</div>
                               )}
                            </div>
                            <div>
                               <p className="text-sm font-black text-slate-800">{p.name}</p>
                               <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest mt-0.5">{p.jabatan}</p>
                            </div>
                         </div>
                       ))
                     ) : (
                       <div className="p-4 text-center border-2 border-dashed border-slate-100 rounded-3xl text-sm font-bold text-slate-300 italic">
                         Belum ada pengurus di kamar ini
                       </div>
                     )}
                  </div>
               </div>

               {/* Santri List */}
               <div>
                  <div className="flex items-center gap-2 mb-4 px-2">
                     <Users className="w-4 h-4 text-emerald-600" />
                     <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Daftar Santri ({selectedRoom.santriCount})</span>
                  </div>
                  <div className="space-y-2">
                     {selectedRoom.residents.filter(r => r.type === 'santri').length > 0 ? (
                       selectedRoom.residents.filter(r => r.type === 'santri').map((s, i) => (
                         <div key={i} className="flex items-center gap-4 p-4 hover:bg-slate-50 rounded-2xl transition-all border border-transparent hover:border-slate-100">
                            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
                               <GraduationCap className="w-5 h-5 text-slate-400" />
                            </div>
                            <div className="flex-1">
                               <div className="flex items-center gap-2 mb-1">
                                  <p className="text-sm font-black text-slate-700 leading-none">{s.name}</p>
                                  {s.jabatan && (
                                     <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded text-[9px] font-black uppercase tracking-wider">
                                        {s.jabatan}
                                     </span>
                                  )}
                               </div>
                               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{s.kelas}</p>
                            </div>
                         </div>
                       ))
                     ) : (
                        <div className="py-8 text-center text-xs font-bold text-slate-300 uppercase tracking-widest">
                           Kamar ini Kosong
                        </div>
                     )}
                  </div>
               </div>
            </div>

            <div className="p-8 border-t border-slate-50 bg-slate-50/50 shrink-0">
               <button 
                 onClick={() => setSelectedRoom(null)}
                 className="w-full py-4 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-2xl text-sm font-black transition-all active:scale-95 shadow-sm uppercase tracking-widest"
               >
                 Tutup Detail
               </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
