"use client";

import { useEffect, useState, useMemo, Suspense, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Users, Plus, Search, Download, Upload, RefreshCw, ArrowLeft } from "lucide-react";
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
  const [sessionLoading, setSessionLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [selectedSantri, setSelectedSantri] = useState<Santri | null>(null);

  // States for seksi / restricted profile search & view
  const [selectedSantriId, setSelectedSantriId] = useState<number | null>(null);
  const [detailData, setDetailData] = useState<any>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [profileTab, setProfileTab] = useState<"pembayaran" | "izin" | "pelanggaran">("pembayaran");

  const [restrictedQuery, setRestrictedQuery] = useState("");
  const [restrictedResults, setRestrictedResults] = useState<Santri[]>([]);
  const [searchingRestricted, setSearchingRestricted] = useState(false);

  useEffect(() => {
    fetch("/api/auth/session")
      .then(res => res.json())
      .then((data: any) => {
        if (data.success && data.session) {
          setSession(data.session);
        }
      })
      .catch(e => console.error("Session fetch error", e))
      .finally(() => setSessionLoading(false));
  }, []);

  const hasFullAccess = useMemo(() => {
    if (sessionLoading || !session) return false;
    const level = session.role_level;
    const role = (session.role || "").toUpperCase();
    return level === 'SEKRETARIAT' || 
      level === 'VIEW_ALL' || 
      level === 'ROOT' || 
      role.includes("SEKRETARIS") || 
      role.includes("SEKRETARIAT") ||
      role === "DEVELOPER" ||
      role === "MUDIR" ||
      role.includes("SUPER");
  }, [session, sessionLoading]);

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

  const fetchDetail = useCallback(async (id: number) => {
    setLoadingDetail(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/santri/${id}/detail`);
      const json = await res.json() as any;
      if (json.success) {
        setDetailData(json.data);
      }
    } catch (err) {
      console.error("Gagal mengambil detail santri:", err);
    } finally {
      setLoadingDetail(false);
    }
  }, []);

  useEffect(() => {
    if (deepId) {
      const id = parseInt(deepId);
      if (!isNaN(id)) {
        setSelectedSantriId(id);
        fetchDetail(id);
      }
    } else {
      setSelectedSantriId(null);
      setDetailData(null);
    }
  }, [deepId, fetchDetail]);

  const fetchAllSantri = useCallback(async () => {
    if (sessionLoading || !hasFullAccess) return;
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
        setSelectedSantri(prev => {
          if (!prev) return null;
          const updated = json.data.find((s: Santri) => s.id === prev.id);
          return updated || prev;
        });
      }
    } catch (error) {
      console.error("Gagal ambil semua data santri:", error);
    } finally {
      setTimeout(() => setLoading(false), 600);
    }
  }, [sessionLoading, hasFullAccess, deepId]);

  useEffect(() => {
    if (!sessionLoading && hasFullAccess) {
      fetchAllSantri();
      const handleUpdate = () => fetchAllSantri();
      window.addEventListener('santri-updated', handleUpdate);
      return () => window.removeEventListener('santri-updated', handleUpdate);
    }
  }, [sessionLoading, hasFullAccess, deepId, fetchAllSantri]);

  // Search effect for restricted view
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (restrictedQuery.length >= 2) {
        setSearchingRestricted(true);
        try {
          const res = await fetch(`${API_BASE_URL}/api/santri?q=${encodeURIComponent(restrictedQuery)}`);
          const json = await res.json() as any;
          if (json.success) {
            setRestrictedResults(json.data);
          }
        } catch (e) {
          console.error(e);
        } finally {
          setSearchingRestricted(false);
        }
      } else {
        setRestrictedResults([]);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [restrictedQuery]);

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
        String(s.nisn || "").toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // 2. Select Filters
    if (filters.kelas) result = result.filter(s => s.kelas === filters.kelas);
    if (filters.asrama) result = result.filter(s => s.asrama === filters.asrama);
    if (filters.asal) result = result.filter(s => s.asal === filters.asal);

    // 3. Sorting
    result.sort((a, b) => {
      if (filters.kelas) return a.kelas.localeCompare(b.kelas) || a.name.localeCompare(b.name);
      if (filters.asrama) return (a.asrama || "").localeCompare(b.asrama || "") || a.name.localeCompare(b.name);
      if (filters.asal) return (a.asal || "").localeCompare(b.asal || "") || a.name.localeCompare(b.name);
      
      // Default: Alphabetical by Name
      return a.name.localeCompare(b.name);
    });

    return result;
  }, [santriList, searchQuery, filters]);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 50;
  
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filters]);

  const visibleSantri = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredSantri.slice(start, start + itemsPerPage);
  }, [filteredSantri, currentPage]);

  const totalPages = Math.ceil(filteredSantri.length / itemsPerPage);

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

  const formatIDR = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  if (sessionLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="w-12 h-12 rounded-full border-4 border-slate-100 border-t-indigo-650 animate-spin"></div>
        <p className="text-xs font-black text-slate-400 uppercase tracking-widest mt-4">Memuat Sesi...</p>
      </div>
    );
  }

  if (session && !hasFullAccess) {
    if (selectedSantriId) {
      if (loadingDetail || !detailData) {
        return (
          <div className="flex flex-col items-center justify-center min-h-[400px]">
            <div className="w-12 h-12 rounded-full border-4 border-slate-100 border-t-indigo-650 animate-spin"></div>
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest mt-4">Memuat Profil Santri...</p>
          </div>
        );
      }

      const s = detailData.santri;
      const payments = detailData.payments || [];
      const permissions = detailData.permissions || [];
      const violations = detailData.violations || [];

      return (
        <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between bg-white p-6 rounded-2xl border border-slate-100 shadow-xs">
            <div className="flex items-center gap-3">
              <button 
                onClick={() => {
                  setSelectedSantriId(null);
                  setDetailData(null);
                  router.push("/santri");
                }}
                className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-black uppercase rounded-xl transition-all flex items-center gap-2"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Kembali ke Pencarian
              </button>
            </div>
            <div className="text-right">
              <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                s.status === 'Aktif' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
              }`}>
                {s.status}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column: Data Diri */}
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-6">
              <div className="flex flex-col items-center text-center">
                <div className="w-32 h-32 rounded-3xl bg-slate-50 border border-slate-100 p-2 shadow-inner overflow-hidden relative">
                  {s.photo_url ? (
                    <img src={s.photo_url} alt={s.name} className="w-full h-full object-cover rounded-2xl" />
                  ) : (
                    <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-400">
                      <Users className="w-16 h-16" />
                    </div>
                  )}
                </div>
                <h3 className="text-xl font-black text-slate-800 mt-4 leading-tight">{s.name}</h3>
                <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest">NISN: {s.nisn || "-"}</p>
              </div>

              <div className="border-t border-slate-100 pt-6 space-y-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Madrasah & Kelas</label>
                  <p className="text-sm font-black text-slate-700 mt-0.5">{s.madrasah || "-"} • {s.kelas}</p>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Asrama / Kamar</label>
                  <p className="text-sm font-black text-slate-700 mt-0.5">{s.asrama || "-"}</p>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Daerah Asal</label>
                  <p className="text-sm font-black text-slate-700 mt-0.5">{s.asal || "-"}</p>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Nama Wali</label>
                  <p className="text-sm font-black text-slate-700 mt-0.5">{s.wali_name || "-"}</p>
                </div>
                {s.wali_wa && (
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Kontak Wali</label>
                    <a 
                      href={`https://wa.me/${s.wali_wa.replace(/\D/g, "")}`} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-sm font-black text-emerald-600 hover:underline block mt-0.5"
                    >
                      {s.wali_wa} (Hubungi via WA)
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Dynamic Tabs (Payments, Permissions, Violations) */}
            <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
              {/* Tab Navigation */}
              <div className="flex border-b border-slate-100 bg-slate-50/50 p-2 gap-1">
                <button
                  onClick={() => setProfileTab("pembayaran")}
                  className={`flex-1 py-3 text-xs font-black uppercase tracking-widest rounded-xl transition-all ${
                    profileTab === "pembayaran" ? "bg-white text-indigo-600 shadow-sm border border-slate-100" : "text-slate-400 hover:text-slate-600"
                  }`}
                >
                  Data Pembayaran
                </button>
                <button
                  onClick={() => setProfileTab("izin")}
                  className={`flex-1 py-3 text-xs font-black uppercase tracking-widest rounded-xl transition-all ${
                    profileTab === "izin" ? "bg-white text-indigo-600 shadow-sm border border-slate-100" : "text-slate-400 hover:text-slate-600"
                  }`}
                >
                  Rekap Izin
                </button>
                <button
                  onClick={() => setProfileTab("pelanggaran")}
                  className={`flex-1 py-3 text-xs font-black uppercase tracking-widest rounded-xl transition-all ${
                    profileTab === "pelanggaran" ? "bg-white text-indigo-600 shadow-sm border border-slate-100" : "text-slate-400 hover:text-slate-600"
                  }`}
                >
                  Rekap Pelanggaran
                </button>
              </div>

              {/* Tab Content */}
              <div className="p-6 flex-1 overflow-y-auto max-h-[500px]">
                {profileTab === "pembayaran" && (
                  <div className="space-y-4">
                    <h4 className="font-extrabold text-slate-800 text-sm uppercase tracking-wider mb-2">Riwayat Syahriyah SPP</h4>
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 font-bold text-left">
                            <th className="px-4 py-3">Periode</th>
                            <th className="px-4 py-3">Tahun Ajaran</th>
                            <th className="px-4 py-3 text-right">Jumlah</th>
                            <th className="px-4 py-3 text-center">Status</th>
                            <th className="px-4 py-3">Tanggal Bayar</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-bold text-slate-700">
                          {payments.length === 0 ? (
                            <tr>
                              <td colSpan={5} className="px-4 py-8 text-center text-slate-400 font-bold">
                                Belum ada riwayat pembayaran SPP.
                              </td>
                            </tr>
                          ) : (
                            payments.map((p: any) => (
                              <tr key={p.id} className="hover:bg-slate-50/50">
                                <td className="px-4 py-3 text-slate-800">{p.period}</td>
                                <td className="px-4 py-3 text-slate-500">{p.academic_year}</td>
                                <td className="px-4 py-3 text-right font-mono text-slate-800">{formatIDR(p.amount)}</td>
                                <td className="px-4 py-3 text-center">
                                  <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                                    p.status === 'Lunas' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                                  }`}>
                                    {p.status}
                                  </span>
                                </td>
                                <td className="px-4 py-3 text-slate-500">
                                  {p.paid_at ? new Date(p.paid_at).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }) : "-"}
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {profileTab === "izin" && (
                  <div className="space-y-4">
                    <h4 className="font-extrabold text-slate-800 text-sm uppercase tracking-wider mb-2">Riwayat Izin Pulang / Keluar</h4>
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 font-bold text-left">
                            <th className="px-4 py-3">Keperluan</th>
                            <th className="px-4 py-3">Tgl Mulai</th>
                            <th className="px-4 py-3">Tgl Kembali</th>
                            <th className="px-4 py-3 text-center">Status</th>
                            <th className="px-4 py-3">Disetujui Oleh</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-bold text-slate-700">
                          {permissions.length === 0 ? (
                            <tr>
                              <td colSpan={5} className="px-4 py-8 text-center text-slate-400 font-bold">
                                Belum ada riwayat perizinan.
                              </td>
                            </tr>
                          ) : (
                            permissions.map((p: any) => (
                              <tr key={p.id} className="hover:bg-slate-50/50">
                                <td className="px-4 py-3 text-slate-800">{p.keperluan}</td>
                                <td className="px-4 py-3 text-slate-500">{p.tgl_mulai}</td>
                                <td className="px-4 py-3 text-slate-500">{p.tgl_kembali}</td>
                                <td className="px-4 py-3 text-center">
                                  <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                                    p.status === 'Kembali' ? 'bg-emerald-50 text-emerald-600' :
                                    p.status === 'Keluar' ? 'bg-amber-50 text-amber-600 animate-pulse' : 'bg-rose-50 text-rose-600'
                                  }`}>
                                    {p.status}
                                  </span>
                                </td>
                                <td className="px-4 py-3 text-slate-500">{p.disetujui_oleh || "-"}</td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {profileTab === "pelanggaran" && (
                  <div className="space-y-4">
                    <h4 className="font-extrabold text-slate-800 text-sm uppercase tracking-wider mb-2">Riwayat Pelanggaran & Takzir</h4>
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 font-bold text-left">
                            <th className="px-4 py-3">Jenis</th>
                            <th className="px-4 py-3 w-1/3">Keterangan / Kronologi</th>
                            <th className="px-4 py-3 text-center">Poin</th>
                            <th className="px-4 py-3 text-center">Status</th>
                            <th className="px-4 py-3">Dilaporkan Oleh</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-bold text-slate-700">
                          {violations.length === 0 ? (
                            <tr>
                              <td colSpan={5} className="px-4 py-8 text-center text-slate-400 font-bold">
                                Bersih (Belum ada catatan pelanggaran).
                              </td>
                            </tr>
                          ) : (
                            violations.map((v: any) => (
                              <tr key={v.id} className="hover:bg-slate-50/50">
                                <td className="px-4 py-3 text-slate-800 font-extrabold">{v.jenis}</td>
                                <td className="px-4 py-3 text-slate-500">{v.deskripsi}</td>
                                <td className="px-4 py-3 text-center font-mono font-black text-rose-600">{v.point}</td>
                                <td className="px-4 py-3 text-center">
                                  <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                                    v.status === 'Selesai' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                                  }`}>
                                    {v.status}
                                  </span>
                                </td>
                                <td className="px-4 py-3 text-slate-500">{v.dilaporkan_oleh || "-"}</td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      );
    }

    // Search Page for Restricted Role
    return (
      <div className="p-4 md:p-8 space-y-6 max-w-4xl mx-auto animate-in fade-in duration-300">
        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm text-center space-y-4">
          <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto shadow-xs">
            <Search className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-800 tracking-tight">Pencarian Data Profil Santri</h2>
            <p className="text-xs text-slate-400 uppercase font-black tracking-widest mt-1">Keuangan, Akademik, Perizinan & Kedisiplinan</p>
          </div>

          <div className="relative max-w-xl mx-auto pt-4">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 mt-2" />
            <input 
              type="text" 
              placeholder="Cari berdasarkan Nama atau NISN santri..." 
              value={restrictedQuery}
              onChange={(e) => setRestrictedQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all font-bold text-slate-700"
            />
          </div>
        </div>

        {restrictedQuery.length > 0 && (
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden p-6 space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <h3 className="font-extrabold text-slate-800 text-xs uppercase tracking-widest">Hasil Pencarian ({restrictedResults.length})</h3>
            
            {searchingRestricted ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-8 h-8 border-4 border-slate-100 border-t-indigo-600 rounded-full animate-spin"></div>
              </div>
            ) : restrictedQuery.length < 2 ? (
              <p className="text-xs font-bold text-slate-400 text-center py-6">Ketik minimal 2 karakter untuk mulai mencari...</p>
            ) : restrictedResults.length === 0 ? (
              <p className="text-xs font-bold text-slate-400 text-center py-12">Santri tidak ditemukan.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {restrictedResults.map((s) => (
                  <div 
                    key={s.id} 
                    onClick={() => {
                      setSelectedSantriId(s.id);
                      fetchDetail(s.id);
                      router.push(`/santri?id=${s.id}`);
                    }}
                    className="flex items-center gap-4 p-4 border border-slate-100 rounded-2xl hover:bg-slate-50 transition-all cursor-pointer group"
                  >
                    <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 font-black flex items-center justify-center text-xs overflow-hidden shrink-0 border border-indigo-100/50">
                      {s.photo_url ? (
                        <img src={s.photo_url} alt={s.name} className="w-full h-full object-cover" />
                      ) : (
                        s.name.substring(0, 2).toUpperCase()
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-black text-slate-700 group-hover:text-indigo-600 transition-colors truncate">{s.name}</h4>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{s.madrasah} • Kelas {s.kelas}</p>
                      <p className="text-[9px] font-bold text-slate-400 tracking-wider">NISN: {s.nisn || "-"}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    );
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
            className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none focus:border-emerald-500 appearance-none pr-8 relative bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23007CB2%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E')] bg-size-[0.65rem_auto] bg-position-[right_0.75rem_center] bg-no-repeat"
            value={filters.kelas}
            onChange={(e) => setFilters({...filters, kelas: e.target.value})}
          >
            <option value="">Semua Kelas</option>
            {filterOptions.kelas.map(k => <option key={k} value={k}>{k}</option>)}
          </select>

          <select 
            className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none focus:border-emerald-500 appearance-none pr-8 relative bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23007CB2%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E')] bg-size-[0.65rem_auto] bg-position-[right_0.75rem_center] bg-no-repeat"
            value={filters.asrama}
            onChange={(e) => setFilters({...filters, asrama: e.target.value})}
          >
            <option value="">Semua Asrama</option>
            {filterOptions.asrama.map(a => <option key={a} value={a}>{a}</option>)}
          </select>

          <select 
            className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none focus:border-emerald-500 appearance-none pr-8 relative bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23007CB2%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E')] bg-size-[0.65rem_auto] bg-position-[right_0.75rem_center] bg-no-repeat"
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
              <tr className="text-xs text-text-sub uppercase tracking-wider border-b border-slate-100">
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
              ) : visibleSantri.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-slate-400 font-medium">
                    Data tidak ditemukan
                  </td>
                </tr>
              ) : (
                visibleSantri.map((s, i) => (
                  <tr 
                    key={s.id} 
                    onClick={() => setSelectedSantri(s)}
                    className="group hover:bg-emerald-50/30 transition-all cursor-pointer select-none"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-xl bg-linear-to-br ${colors[i % colors.length]} flex items-center justify-center text-white text-[11px] font-bold shadow-sm transition-transform group-hover:scale-105 overflow-hidden`}>
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
        
        {/* Pagination UI */}
        {totalPages > 1 && (
          <div className="px-5 py-4 border-t border-slate-100 flex items-center justify-between bg-slate-50">
            <p className="text-xs font-bold text-slate-500">
              Menampilkan {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, filteredSantri.length)} dari {filteredSantri.length} Santri
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
    <>
      <Suspense fallback={
          <div className="min-h-screen bg-slate-50 flex items-center justify-center">
              <div className="w-10 h-10 border-4 border-emerald-600/20 border-t-emerald-600 rounded-full animate-spin"></div>
          </div>
      }>
        <SantriContent />
      </Suspense>
    </>
  );
}

