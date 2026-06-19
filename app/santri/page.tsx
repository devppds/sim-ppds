"use client";

import { useEffect, useState, useMemo, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import { Users, Plus, Search, Filter, Download, Upload, FileSpreadsheet } from "lucide-react";
import AddSantriModal from "@/components/AddSantriModal";
import SantriDetailModal from "@/components/SantriDetailModal";
import ImportSantriModal from "@/components/ImportSantriModal";
import * as XLSX from "xlsx";
import { useToast } from "@/components/Toast";
import { API_BASE_URL } from "@/lib/config";

interface Santri {
  id: number;
  nisn: string;
  nik?: string;
  name: string;
  kelas: string;
  asrama: string;
  asal: string;
  madrasah: string;
  wali_name?: string;
  wali_wa?: string;
  photo_url?: string;
  status: string;
}

const colors = ["from-emerald-400 to-teal-500", "from-pink-400 to-rose-500", "from-amber-400 to-orange-500", "from-sky-400 to-blue-500", "from-violet-400 to-purple-500"];
const statusColors: Record<string, string> = {
  Aktif: "bg-emerald-50 text-emerald-700",
  Tunggakan: "bg-rose-50 text-rose-700",
  Baru: "bg-sky-50 text-sky-700",
};

function SantriContent() {
  const [santriList, setSantriList] = useState<Santri[]>([]);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [selectedSantri, setSelectedSantri] = useState<Santri | null>(null);
  const [showFilter, setShowFilter] = useState(false);

  useEffect(() => {
    const sessionCookie = document.cookie.split('; ').find(row => row.startsWith('sim_ppds_session='));
    if (sessionCookie) {
      try {
        const decoded = decodeURIComponent(sessionCookie.split('=')[1]);
        setSession(JSON.parse(decoded));
      } catch (e) { console.error(e); }
    }
  }, []);

  const canWrite = session?.role_level === 'ROOT' || session?.role_level === 'ADMIN';
  
  // Filter States
  const [filters, setFilters] = useState({
    kelas: "",
    asrama: "",
    asal: ""
  });

  const { showToast } = useToast();
  const router = useRouter();

  const searchParams = useSearchParams();
  const deepId = searchParams.get("id");

  async function fetchAllSantri() {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/santri`);
      const json = (await res.json()) as any;
      if (json.success) {
        setSantriList(json.data);
        if (deepId) {
            const found = json.data.find((s: Santri) => s.id.toString() === deepId);
            if (found) setSelectedSantri(found);
        }
        if (selectedSantri) {
          const updated = json.data.find((s: Santri) => s.id === selectedSantri.id);
          if (updated) setSelectedSantri(updated);
        }
      }
    } catch (error) {
      console.error("Gagal ambil semua data santri:", error);
    } finally {
      setTimeout(() => setLoading(false), 600);
    }
  }

  useEffect(() => {
    fetchAllSantri();
    const handleUpdate = () => fetchAllSantri();
    window.addEventListener('santri-updated', handleUpdate);
    return () => window.removeEventListener('santri-updated', handleUpdate);
  }, [deepId]);

  // Derived unique values for filters
  const filterOptions = useMemo(() => {
    return {
      kelas: Array.from(new Set(santriList.map(s => s.kelas).filter(Boolean))).sort(),
      asrama: Array.from(new Set(santriList.map(s => s.asrama).filter(Boolean))).sort(),
      asal: Array.from(new Set(santriList.map(s => s.asal).filter(Boolean))).sort(),
    };
  }, [santriList]);

  const filteredSantri = useMemo(() => {
    let result = [...santriList];

    // 1. Search Filter
    if (searchQuery) {
      result = result.filter(s => 
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        s.nisn?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // 2. Select Filters
    if (filters.kelas) result = result.filter(s => s.kelas === filters.kelas);
    if (filters.asrama) result = result.filter(s => s.asrama === filters.asrama);
    if (filters.asal) result = result.filter(s => s.asal === filters.asal);

    // 3. Sorting
    // If any filter is active, we can prioritize that, but user asked:
    // "jika filter tidak diaktifkan sesuai abjad nama"
    // "jika di aktifkan data santri muncul naik turunnya tersusun tergantung filternya"
    
    result.sort((a, b) => {
      if (filters.kelas) return a.kelas.localeCompare(b.kelas) || a.name.localeCompare(b.name);
      if (filters.asrama) return a.asrama.localeCompare(b.asrama) || a.name.localeCompare(b.name);
      if (filters.asal) return (a.asal || "").localeCompare(b.asal || "") || a.name.localeCompare(b.name);
      
      // Default: Alphabetical by Name
      return a.name.localeCompare(b.name);
    });

    return result;
  }, [santriList, searchQuery, filters]);

  function getInitials(name: string) {
    if (!name) return "??";
    return name.split(" ").map(n => n[0]).join("").toUpperCase().substring(0, 2);
  }

  function handleExport() {
    if (santriList.length === 0) {
      showToast("Tidak ada data untuk dieksport", "warning");
      return;
    }

    try {
      const exportData = filteredSantri.map(s => ({
        ID: s.id,
        NISN: s.nisn,
        NIK: s.nik,
        Nama: s.name,
        Madrasah: s.madrasah,
        Kelas: s.kelas,
        Asrama: s.asrama,
        Asal: s.asal,
        "Wali Santri": s.wali_name,
        "WA Wali": s.wali_wa,
        Status: s.status
      }));

      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Data Santri Aktif");
      XLSX.writeFile(wb, `Data_Santri_PPDS_${new Date().toLocaleDateString("id-ID")}.xlsx`);
      showToast("Berhasil mengeksport data ke Excel", "success");
    } catch (err) {
      showToast("Gagal mengeksport data", "error");
    }
  }

  return (
    <DashboardLayout>
      <div className="fade-up fade-up-1">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-xl font-extrabold text-[#1e293b] flex items-center gap-2">
              <Users className="w-6 h-6 text-emerald-600" /> Data Santri
            </h1>
            <p className="text-sm text-[#64748b] mt-1">{loading ? "Memuat..." : `${filteredSantri.length} santri ditemukan`}</p>
          </div>
          {canWrite ? (
            <button 
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-lg transition-all shadow-lg shadow-emerald-600/20 active:scale-95"
            >
              <Plus className="w-4 h-4" /> Tambah Santri
            </button>
          ) : (
            <div className="px-4 py-2 bg-slate-100 border border-slate-200 rounded-lg text-slate-400 text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
              <span className="w-2 h-2 bg-slate-400 rounded-full animate-pulse" />
              Mode View-Only
            </div>
          )}
        </div>

        {/* Filter Section */}
        <div className="flex flex-col sm:flex-row gap-3 mb-4 items-start sm:items-center">
          <div className="flex items-center bg-white border border-slate-200 rounded-xl px-3 py-2 gap-2 flex-1 max-w-sm focus-within:ring-2 focus-within:ring-emerald-500/20 transition-all">
            <Search className="w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Cari nama, NISN..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent text-sm outline-none w-full placeholder:text-slate-400" 
            />
          </div>

          <div className="relative">
            <button 
              onClick={() => setShowFilter(!showFilter)}
              className={`flex items-center gap-2 px-4 py-2 border rounded-xl text-sm font-black transition-all shadow-sm ${
                showFilter || Object.values(filters).some(v => v !== "") 
                ? "bg-emerald-50 border-emerald-200 text-emerald-600" 
                : "bg-white border-slate-200 text-[#64748b] hover:bg-slate-50"
              }`}
            >
              <Filter className="w-4 h-4" /> 
              Filter {(Object.values(filters).filter(v => v !== "").length > 0) && `(${Object.values(filters).filter(v => v !== "").length})`}
            </button>

            {showFilter && (
              <div className="absolute left-0 mt-2 w-64 bg-white border border-slate-100 rounded-2xl shadow-xl z-50 p-4 space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Filter Kelas</label>
                  <select 
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-100 text-xs font-bold text-slate-700 outline-none focus:border-emerald-500"
                    value={filters.kelas}
                    onChange={(e) => setFilters({...filters, kelas: e.target.value})}
                  >
                    <option value="">Semua Kelas</option>
                    {filterOptions.kelas.map(k => <option key={k} value={k}>{k}</option>)}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Filter Asrama</label>
                  <select 
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-100 text-xs font-bold text-slate-700 outline-none focus:border-emerald-500"
                    value={filters.asrama}
                    onChange={(e) => setFilters({...filters, asrama: e.target.value})}
                  >
                    <option value="">Semua Asrama</option>
                    {filterOptions.asrama.map(a => <option key={a} value={a}>{a}</option>)}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Filter Asal</label>
                  <select 
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-100 text-xs font-bold text-slate-700 outline-none focus:border-emerald-500"
                    value={filters.asal}
                    onChange={(e) => setFilters({...filters, asal: e.target.value})}
                  >
                    <option value="">Semua Asal</option>
                    {filterOptions.asal.map(a => <option key={a} value={a}>{a}</option>)}
                  </select>
                </div>

                <div className="pt-2 border-t border-slate-50 flex justify-between gap-2">
                  <button 
                    onClick={() => {
                        setFilters({ kelas: "", asrama: "", asal: "" });
                        setShowFilter(false);
                    }}
                    className="text-[10px] font-black text-slate-400 uppercase hover:text-rose-500 transition-colors"
                  >
                    Reset Filter
                  </button>
                  <button 
                    onClick={() => setShowFilter(false)}
                    className="px-3 py-1.5 bg-emerald-600 text-white text-[10px] font-black rounded-lg uppercase shadow-lg shadow-emerald-600/20"
                  >
                    Tutup
                  </button>
                </div>
              </div>
            )}
          </div>
          
          {canWrite && (
            <button 
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-black rounded-xl transition-all shadow-lg shadow-emerald-600/20 active:scale-95 sm:hidden"
            >
              <Plus className="w-4 h-4" />
            </button>
          )}
          
          {canWrite && (
            <button 
              onClick={() => setIsImportModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-black text-indigo-600 hover:bg-indigo-50 transition-colors shadow-sm"
            >
              <Upload className="w-4 h-4" /> Import Excel
            </button>
          )}

          <button 
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-black text-emerald-600 hover:bg-emerald-50 transition-colors shadow-sm"
          >
            <Download className="w-4 h-4" /> Export Excel
          </button>
        </div>

        {/* Table Section */}
        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-[#64748b] uppercase tracking-wider border-b border-slate-100">
                  <th className="text-left px-5 py-3 font-bold">Santri</th>
                  <th className="text-left px-5 py-3 font-bold hidden sm:table-cell font-mono">NISN</th>
                  <th className="text-left px-5 py-3 font-bold">Kelas</th>
                  <th className="text-left px-5 py-3 font-bold hidden md:table-cell">Asrama</th>
                  <th className="text-left px-5 py-3 font-bold hidden lg:table-cell">Asal</th>
                  <th className="text-left px-5 py-3 font-bold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-24">
                      <div className="flex flex-col items-center justify-center gap-4">
                        <div className="relative">
                          <div className="w-12 h-12 rounded-full border-4 border-slate-100 border-t-emerald-500 animate-spin"></div>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                          </div>
                        </div>
                        <p className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] animate-pulse">Menyiapkan Data...</p>
                      </div>
                    </td>
                  </tr>
                ) : filteredSantri.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-12 text-center text-slate-400 font-medium">
                      Data tidak ditemukan
                    </td>
                  </tr>
                ) : (
                  filteredSantri.map((s, i) => (
                    <tr 
                      key={s.id} 
                      onClick={() => setSelectedSantri(s)}
                      className="group hover:bg-emerald-50/30 transition-all cursor-pointer select-none"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${colors[i % colors.length]} flex items-center justify-center text-white text-[11px] font-bold shadow-sm transition-transform group-hover:scale-105 overflow-hidden`}>
                            {s.photo_url ? (
                                <img src={s.photo_url} alt={s.name} className="w-full h-full object-cover" />
                            ) : getInitials(s.name)}
                          </div>
                          <span className="font-bold text-slate-700 tracking-tight">{s.name}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-slate-500 hidden sm:table-cell font-mono text-[11px]">{s.nisn || "-"}</td>
                      <td className="px-5 py-4 font-bold text-slate-700">{s.kelas}</td>
                      <td className="px-5 py-4 text-slate-500 hidden md:table-cell">{s.asrama || "-"}</td>
                      <td className="px-5 py-4 text-slate-500 hidden lg:table-cell">{s.asal || "-"}</td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${statusColors[s.status] || "bg-slate-100 text-slate-600"}`}>{s.status}</span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modals */}
      <AddSantriModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        onSuccess={fetchAllSantri} 
      />

      <SantriDetailModal
        isOpen={!!selectedSantri}
        santri={selectedSantri}
        onClose={() => {
            setSelectedSantri(null);
            router.push('/santri'); // Clear ID from URL
        }}
        onUpdate={fetchAllSantri}
      />

      <ImportSantriModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onSuccess={fetchAllSantri}
      />
    </DashboardLayout>
  );
}

export default function SantriPage() {
  return (
    <Suspense fallback={
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
            <div className="w-10 h-10 border-4 border-emerald-600/20 border-t-emerald-600 rounded-full animate-spin"></div>
        </div>
    }>
      <SantriContent />
    </Suspense>
  );
}

