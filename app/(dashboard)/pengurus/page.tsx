"use client";

import { useEffect, useState, Suspense, useCallback, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { UserCheck, Plus, Search, RefreshCw } from "lucide-react";
import PengurusDetailModal from "@/components/PengurusDetailModal";
import AddPengurusModal from "@/components/AddPengurusModal";
import { DataTable, Column, SortOption } from "@/components/DataTable";
import { API_BASE_URL } from "@/lib/config";

interface Pengurus {
  id: number;
  nik: string;
  name: string;
  jabatan_utama?: string;
  sub_jabatan?: string;
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

function getInitials(name: string) {
  if (!name) return "??";
  return name.split(" ").map(n => n[0]).join("").toUpperCase().substring(0, 2);
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
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/pengurus`);
      const json = (await res.json()) as any;
      if (json.success) {
        setList(json.data);
        if (deepId) {
          const found = json.data.find((p: Pengurus) => p.id.toString() === deepId);
          if (found) {
             setSelectedPengurus((prev) => prev ? prev : found);
          }
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
  }, [deepId]);

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

  const columns: Column<Pengurus>[] = [
    {
      header: "Pengurus",
      render: (p, i) => (
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-xl bg-linear-to-br ${colors[i % colors.length]} flex items-center justify-center text-white text-[11px] font-bold shadow-sm transition-transform group-hover:scale-105 overflow-hidden shrink-0`}>
            {p.photo_url ? (
                <img src={p.photo_url} alt={p.name} className="w-full h-full object-cover" />
            ) : getInitials(p.name)}
          </div>
          <span className="font-bold text-slate-700 tracking-tight">{p.name}</span>
        </div>
      )
    },
    {
      header: "NIK",
      hiddenClassName: "hidden sm:table-cell font-mono",
      render: (p) => <span className="text-[11px] text-slate-500">{p.nik || "-"}</span>
    },
    {
      header: "Jabatan",
      render: (p) => (
        <div className="font-bold text-indigo-600 text-xs">
          <span className="px-2 py-0.5 bg-indigo-50 rounded text-[10px] font-black uppercase tracking-wider">{p.jabatan}</span>
          {p.jabatan_tambahan && (
            <div className="mt-1 text-[9px] text-slate-400 font-bold uppercase">{p.jabatan_tambahan}</div>
          )}
        </div>
      )
    },
    {
      header: "Kamar",
      hiddenClassName: "hidden md:table-cell",
      render: (p) => <span className="text-xs font-bold text-slate-500">{p.kamar || "-"}</span>
    },
    {
      header: "No. Telepon",
      hiddenClassName: "hidden lg:table-cell",
      render: (p) => <span className="text-slate-500">{p.phone || "-"}</span>
    },
    {
      header: "Status",
      render: (p) => (
        <span className={`inline-flex px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${statusColors[p.status] || "bg-slate-100 text-slate-600"}`}>
          {p.status}
        </span>
      )
    }
  ];

  const sortOptions: SortOption<Pengurus>[] = [
    {
      label: "Hierarki Jabatan",
      value: "hierarchy",
      sortFn: (a, b) => {
        const getScore = (p: Pengurus) => {
          const j = (p.jabatan_utama || p.jabatan || "").toLowerCase();
          const s = (p.sub_jabatan || "").toLowerCase();
          let score = 99;
          if (j.includes("ketua")) score = 1;
          else if (j.includes("sekretaris")) score = 2;
          else if (j.includes("bendahara")) score = 3;
          else if (j.includes("seksi")) score = 4;
          else score = 5;
          
          let subScore = 99;
          if (s.includes("umum") || s.includes("pondok") || s.includes("kasie") || s.includes("kepala")) subScore = 1;
          else if (s.includes("wakil")) subScore = 2;
          else if (s.includes("i") && !s.includes("ii")) subScore = 3;
          else if (s.includes("ii") && !s.includes("iii")) subScore = 4;
          else if (s.includes("anggota")) subScore = 5;

          const seksiName = j.includes("seksi") ? j : "";
          return { score, subScore, seksiName };
        };
        
        const scoreA = getScore(a);
        const scoreB = getScore(b);
        
        if (scoreA.score !== scoreB.score) return scoreA.score - scoreB.score;
        if (scoreA.seksiName !== scoreB.seksiName) return scoreA.seksiName.localeCompare(scoreB.seksiName);
        if (scoreA.subScore !== scoreB.subScore) return scoreA.subScore - scoreB.subScore;
        return a.name.localeCompare(b.name);
      }
    },
    {
      label: "Abjad (A-Z)",
      value: "name-asc",
      sortFn: (a, b) => a.name.localeCompare(b.name)
    },
    {
      label: "Abjad (Z-A)",
      value: "name-desc",
      sortFn: (a, b) => b.name.localeCompare(a.name)
    }
  ];

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

        <DataTable 
          data={filteredList}
          columns={columns}
          sortOptions={sortOptions}
          defaultSortValue="hierarchy"
          loading={loading}
          emptyMessage="Data pengurus tidak ditemukan"
          onRowClick={(p) => setSelectedPengurus(p)}
        />
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
