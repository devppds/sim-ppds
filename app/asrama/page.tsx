"use client";
import { API_BASE_URL } from "@/lib/config";

import { useState, useEffect, useMemo } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { 
  Home, 
  Search, 
  Users, 
  ShieldCheck, 
  ChevronRight, 
  X, 
  Filter,
  Loader2,
  GraduationCap,
  User
} from "lucide-react";

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
  const [data, setData] = useState<{ santri: any[], pengurus: any[] }>({ santri: [], pengurus: [] });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterBlock, setFilterBlock] = useState("Semua");
  const [selectedRoom, setSelectedRoom] = useState<RoomStats | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
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
      <div className="fade-up">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8">
          <div>
            <h1 className="text-2xl font-black text-slate-800 flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-xl shadow-indigo-600/20">
                <Home className="w-6 h-6" />
              </div>
              Manajemen Asrama
            </h1>
            <p className="text-sm text-slate-500 font-bold mt-1 ml-[60px]">Kontrol Penghuni & Pengurus Kamar</p>
          </div>

          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Cari kamar atau nama..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-bold focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 outline-none transition-all w-full md:w-64"
              />
            </div>
            <div className="flex bg-white rounded-2xl border border-slate-200 p-1">
              {["Semua", "DS A", "DS B", "DS C"].map((block) => (
                <button
                  key={block}
                  onClick={() => setFilterBlock(block)}
                  className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${
                    filterBlock === block 
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20" 
                    : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {block}
                </button>
              ))}
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-10 h-10 animate-spin text-indigo-600 mb-4" />
            <p className="text-sm font-black text-slate-400 uppercase tracking-widest">Memuat Denah Asrama...</p>
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
        )}
      </div>

      {/* Detail Modal */}
      {selectedRoom && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300 text-[#1e293b]">
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
                               <p className="text-sm font-black text-slate-700 leading-none mb-1">{s.name}</p>
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
