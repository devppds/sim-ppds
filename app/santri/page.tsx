"use client";

import { useEffect, useState, useMemo, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import { Users, Plus, Search, Download, Upload, RefreshCw } from "lucide-react";
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
    <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto relative">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <Users className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight">Data Santri</h1>
            <p className="text-sm text-slate-500 font-medium">Manajemen data santri aktif Pondok Pesantren Darussalam.</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <button 
            onClick={fetchAllSantri}
            className="p-2.5 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all"
            title="Refresh Data"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
          {canWrite && (
            <button 
              onClick={() => setIsImportModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-black text-indigo-600 hover:bg-indigo-50 transition-colors shadow-sm animate-all"
            >
              <Upload className="w-4 h-4" /> Import Excel
            </button>
          )}
          <button 
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-black text-emerald-600 hover:bg-indigo-50 transition-colors shadow-sm"
          >
            <Download className="w-4 h-4" /> Export Excel
          </button>
          {canWrite ? (
            <button 
              onClick={() => setIsAddModalOpen(true)}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl shadow-lg transition-all active:scale-95 shadow-emerald-500/20"
            >
              <Plus className="w-5 h-5" />
              <span>Tambah Santri</span>
            </button>
          ) : (
            <div className="px-4 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-slate-400 text-xs font-bold uppercase tracking-wider flex items-center gap-2">
              <span className="w-2 h-2 bg-slate-400 rounded-full animate-pulse" />
              Mode View-Only
            </div>
          )}
        </div>
      </div>

      {/* Filter Section */}
      <div className="flex flex-col sm:flex-row gap-4 bg-white p-4 rounded-2xl shadow-sm border border-slate-100 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Cari nama atau NISN..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-semibold" 
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto justify-end">
          <select 
            className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none focus:border-emerald-500 appearance-none pr-8 relative bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23007CB2%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E')] bg-[length:0.65rem_auto] bg-[right_0.75rem_center] bg-no-repeat"
            value={filters.kelas}
            onChange={(e) => setFilters({...filters, kelas: e.target.value})}
          >
            <option value="">Semua Kelas</option>
            {filterOptions.kelas.map(k => <option key={k} value={k}>{k}</option>)}
          </select>

          <select 
            className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none focus:border-emerald-500 appearance-none pr-8 relative bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23007CB2%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E')] bg-[length:0.65rem_auto] bg-[right_0.75rem_center] bg-no-repeat"
            value={filters.asrama}
            onChange={(e) => setFilters({...filters, asrama: e.target.value})}
          >
            <option value="">Semua Asrama</option>
            {filterOptions.asrama.map(a => <option key={a} value={a}>{a}</option>)}
          </select>

          <select 
            className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none focus:border-emerald-500 appearance-none pr-8 relative bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23007CB2%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E')] bg-[length:0.65rem_auto] bg-[right_0.75rem_center] bg-no-repeat"
            value={filters.asal}
            onChange={(e) => setFilters({...filters, asal: e.target.value})}
          >
            <option value="">Semua Asal</option>
            {filterOptions.asal.map(a => <option key={a} value={a}>{a}</option>)}
          </select>

          {(filters.kelas || filters.asrama || filters.asal) && (
            <button 
              onClick={() => setFilters({ kelas: "", asrama: "", asal: "" })}
              className="text-xs font-bold text-rose-600 hover:underline px-2"
            >
              Reset
            </button>
          )}
        </div>
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
    </div>
  );
}

export default function SantriPage() {
  return (
    <DashboardLayout>
      <Suspense fallback={
          <div className="min-h-screen bg-slate-50 flex items-center justify-center">
              <div className="w-10 h-10 border-4 border-emerald-600/20 border-t-emerald-600 rounded-full animate-spin"></div>
          </div>
      }>
        <SantriContent />
      </Suspense>
    </DashboardLayout>
  );
}
