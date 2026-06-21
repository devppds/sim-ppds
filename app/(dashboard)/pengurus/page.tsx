"use client";

import { useEffect, useState, Suspense, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { UserCheck, Plus, Search, Mail, Phone, Home, Star } from "lucide-react";
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
    try {
      const res = await fetch(`${API_BASE_URL}/api/pengurus`);
      const json = (await res.json()) as any;
      if (json.success) {
        setList(json.data);
        if (deepId) {
          const found = json.data.find((p: Pengurus) => p.id.toString() === deepId);
          if (found) setSelectedPengurus(found);
        }
        // Sync selected pengurus if modal is open
        if (selectedPengurus) {
            const updated = json.data.find((p: Pengurus) => p.id === selectedPengurus.id);
            if (updated) setSelectedPengurus(updated);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [deepId, selectedPengurus]);

  useEffect(() => {
    fetchPengurus();

    // Listen for global updates
    const handleUpdate = () => fetchPengurus();
    window.addEventListener('santri-updated', handleUpdate);
    return () => window.removeEventListener('santri-updated', handleUpdate);
  }, [fetchPengurus]);

  const filteredList = list.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.nik.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.jabatan.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <div className="fade-up fade-up-1 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-extrabold text-text-main flex items-center gap-2">
              <UserCheck className="w-6 h-6 text-indigo-600" /> Data Pengurus
            </h1>
            <p className="text-sm text-text-sub mt-1">
              Manajemen ustadz dan staf pengurus pesantren
            </p>
          </div>
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-all shadow-lg shadow-indigo-600/20 active:scale-95"
          >
            <Plus className="w-4 h-4" /> Tambah Pengurus
          </button>
        </div>

        {/* Search & Filter Section */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex items-center">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Cari berdasarkan nama, NIK, atau jabatan..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-semibold" 
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {loading ? (
            Array(3).fill(0).map((_, i) => (
              <div key={i} className="h-48 bg-white rounded-2xl border border-slate-100 animate-pulse"></div>
            ))
          ) : filteredList.length === 0 ? (
            <div className="col-span-full py-20 text-center text-slate-400 font-medium">Data pengurus tidak ditemukan</div>
          ) : (
            filteredList.map((p) => (
              <div key={p.id} className="bg-white rounded-[32px] border border-slate-100 shadow-sm p-6 hover:border-indigo-200 transition-all group relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-50/50 rounded-bl-[60px] -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>
                
                <div className="flex items-center gap-4 mb-5 relative">
                  <div className="w-16 h-16 rounded-2xl bg-indigo-50 overflow-hidden border-2 border-white shadow-md relative">
                    {p.photo_url ? (
                      <img src={p.photo_url} alt={p.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-indigo-300 font-bold text-2xl">
                        {p.name[0]}
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="font-black text-slate-800 tracking-tight line-clamp-1">{p.name}</h3>
                    <div className="flex flex-wrap gap-1 mt-1">
                        <span className="text-[9px] font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full uppercase tracking-wider">{p.jabatan}</span>
                        {p.kamar && (
                            <span className="text-[9px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full uppercase tracking-wider">{p.kamar}</span>
                        )}
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3 relative">
                  {p.jabatan_tambahan && (
                    <div className="flex items-center gap-3 text-xs text-slate-600 font-bold">
                        <Star className="w-4 h-4 text-amber-400 shrink-0" />
                        <span className="line-clamp-1">{p.jabatan_tambahan}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-3 text-xs text-slate-500">
                    <Phone className="w-4 h-4 text-slate-300 shrink-0" />
                    {p.phone || "No. WA belum ada"}
                  </div>
                </div>

                <div className="mt-6 pt-5 border-t border-slate-50 flex items-center justify-between relative">
                  <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.15em] ${
                    p.status === 'Aktif' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-400'
                  }`}>
                    {p.status}
                  </span>
                  <button 
                    onClick={() => setSelectedPengurus(p)}
                    className="flex items-center gap-1.5 text-xs font-black text-indigo-600 hover:text-indigo-700 transition-colors"
                  >
                    DETAIL <span className="text-lg leading-none">→</span>
                  </button>
                </div>
              </div>
            ))
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
