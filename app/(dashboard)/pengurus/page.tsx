"use client";

import { useEffect, useState, Suspense, useCallback, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { UserCheck, Plus, Search, RefreshCw } from "lucide-react";
import PengurusDetailModal from "@/components/PengurusDetailModal";
import AddPengurusModal from "@/components/AddPengurusModal";
import { API_BASE_URL } from "@/lib/config";

interface Pengurus {
  id: number;
  nik: string;
  name: string;
  jabatan: string;
  jabatan_tambahan?: string;
  kamar?: string;
  phone: string;
  status: string;
  photo_url?: string;
  gender: string;
}

const colors = ["from-indigo-400 to-blue-500", "from-emerald-400 to-teal-500", "from-pink-400 to-rose-500", "from-amber-400 to-orange-500", "from-violet-400 to-purple-500"];
const statusColors: Record<string, string> = {
  Aktif: "bg-emerald-50 text-emerald-700",
  "Tidak Aktif": "bg-slate-50 text-slate-500",
};

function PengurusContent() {
  const [list, setList] = useState<Pengurus[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPengurus, setSelectedPengurus] = useState<Pengurus | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const router = useRouter(); 

  const searchParams = useSearchParams();
  const deepId = searchParams.get("id");

  const fetchPengurus = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/pengurus`);
      const json = (await res.json()) as any;
      if (json.success) {
        setList(json.data);
        if (deepId && !selectedPengurus) {
          const found = json.data.find((p: Pengurus) => p.id.toString() === deepId);
          if (found) setSelectedPengurus(found);
        }
        
        setSelectedPengurus((prev) => {
           if (!prev) return null;
           const updated = json.data.find((p: Pengurus) => p.id === prev.id);
           return updated || prev;
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [deepId, selectedPengurus]);

  useEffect(() => {
    fetchPengurus();
    const handleUpdate = () => fetchPengurus();
    window.addEventListener('santri-updated', handleUpdate);
    return () => window.removeEventListener('santri-updated', handleUpdate);
  }, [fetchPengurus]);

  const filteredList = useMemo(() => {
    return list.filter(p => 
      (p.name || "").toLowerCase().includes(searchQuery.toLowerCase()) || 
      (p.nik || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.jabatan || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.kamar || "").toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [list, searchQuery]);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 50;
  
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const visiblePengurus = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredList.slice(start, start + itemsPerPage);
  }, [filteredList, currentPage]);

  const totalPages = Math.ceil(filteredList.length / itemsPerPage);

  function getInitials(name: string) {
    if (!name) return "??";
    return name.split(" ").map(n => n[0]).join("").toUpperCase().substring(0, 2);
  }

  return (
    <>
      <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto relative">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
              <UserCheck className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-800 tracking-tight">Data Pengurus</h1>
              <p className="text-sm text-slate-500 font-medium">Manajemen ustadz dan staf pengurus pesantren.</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            <button 
              onClick={fetchPengurus}
              className="p-2.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
              title="Refresh Data"
            >
              <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button 
              onClick={() => setIsAddModalOpen(true)}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-lg transition-all active:scale-95 shadow-indigo-500/20"
            >
              <Plus className="w-5 h-5" />
              <span>Tambah Pengurus</span>
            </button>
          </div>
        </div>

        {/* Filter Section */}
        <div className="flex flex-col sm:flex-row gap-4 bg-white p-4 rounded-2xl shadow-sm border border-slate-100 items-center justify-between">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Cari nama, NIK, atau jabatan..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-semibold" 
            />
          </div>
        </div>

        {/* Table Section */}
        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-text-sub uppercase tracking-wider border-b border-slate-100 bg-slate-50/50">
                  <th className="text-left px-5 py-3 font-bold">Pengurus</th>
                  <th className="text-left px-5 py-3 font-bold hidden sm:table-cell font-mono">NIK</th>
                  <th className="text-left px-5 py-3 font-bold">Jabatan</th>
                  <th className="text-left px-5 py-3 font-bold hidden md:table-cell">Kamar</th>
                  <th className="text-left px-5 py-3 font-bold hidden lg:table-cell">No. Telepon</th>
                  <th className="text-left px-5 py-3 font-bold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-24">
                      <div className="flex flex-col items-center justify-center gap-4">
                        <div className="relative">
                          <div className="w-12 h-12 rounded-full border-4 border-slate-100 border-t-indigo-500 animate-spin"></div>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></div>
                          </div>
                        </div>
                        <p className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] animate-pulse">Menyiapkan Data...</p>
                      </div>
                    </td>
                  </tr>
                ) : visiblePengurus.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-12 text-center text-slate-400 font-medium">
                      Data pengurus tidak ditemukan
                    </td>
                  </tr>
                ) : (
                  visiblePengurus.map((p, i) => (
                    <tr 
                      key={p.id} 
                      onClick={() => setSelectedPengurus(p)}
                      className="group hover:bg-indigo-50/30 transition-all cursor-pointer select-none"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-xl bg-linear-to-br ${colors[i % colors.length]} flex items-center justify-center text-white text-[11px] font-bold shadow-sm transition-transform group-hover:scale-105 overflow-hidden`}>
                            {p.photo_url ? (
                                <img src={p.photo_url} alt={p.name} className="w-full h-full object-cover" />
                            ) : getInitials(p.name)}
                          </div>
                          <span className="font-bold text-slate-700 tracking-tight">{p.name}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-slate-500 hidden sm:table-cell font-mono text-[11px]">{p.nik || "-"}</td>
                      <td className="px-5 py-4 font-bold text-indigo-600 text-xs">
                         <span className="px-2 py-0.5 bg-indigo-50 rounded text-[10px] font-black uppercase tracking-wider">{p.jabatan}</span>
                         {p.jabatan_tambahan && (
                            <div className="mt-1 text-[9px] text-slate-400 font-bold uppercase">{p.jabatan_tambahan}</div>
                         )}
                      </td>
                      <td className="px-5 py-4 text-slate-500 hidden md:table-cell text-xs font-bold">{p.kamar || "-"}</td>
                      <td className="px-5 py-4 text-slate-500 hidden lg:table-cell">{p.phone || "-"}</td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${statusColors[p.status] || "bg-slate-100 text-slate-600"}`}>{p.status}</span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          
          {/* Pagination UI */}
          {totalPages > 1 && (
            <div className="px-5 py-4 border-t border-slate-100 flex items-center justify-between bg-slate-50">
              <p className="text-xs font-bold text-slate-500">
                Menampilkan {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, filteredList.length)} dari {filteredList.length} Pengurus
              </p>
              <div className="flex gap-1">
                <button 
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  className="px-3 py-1.5 text-xs font-bold bg-white border border-slate-200 rounded-lg text-slate-600 disabled:opacity-50 hover:bg-slate-100"
                >
                  Prev
                </button>
                <button 
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  className="px-3 py-1.5 text-xs font-bold bg-white border border-slate-200 rounded-lg text-slate-600 disabled:opacity-50 hover:bg-slate-100"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <PengurusDetailModal
        isOpen={!!selectedPengurus}
        pengurus={selectedPengurus}
        onClose={() => {
            setSelectedPengurus(null);
            router.push('/pengurus');
        }}
        onUpdate={fetchPengurus}
      />
      <AddPengurusModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={fetchPengurus}
      />
    </>
  );
}

export default function PengurusPage() {
  return (
    <Suspense fallback={
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
            <div className="w-10 h-10 border-4 border-indigo-600/20 border-t-indigo-600 rounded-full animate-spin"></div>
        </div>
    }>
      <PengurusContent />
    </Suspense>
  );
}
