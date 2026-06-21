"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { Users, UserCheck, Search, Filter, GraduationCap, Phone, MapPin, Calendar, ArrowRight, Upload, Download, Plus, RefreshCw, Eye } from "lucide-react";
import SantriDetailModal from "@/components/SantriDetailModal";
import PengurusDetailModal from "@/components/PengurusDetailModal";
import ManualAlumniModal from "@/components/ManualAlumniModal";
import ImportAlumniModal from "@/components/ImportAlumniModal";
import * as XLSX from "xlsx";
import { useToast } from "@/components/Toast";
import { API_BASE_URL } from "@/lib/config";

interface SantriAlumni {
  id: number;
  nisn: string;
  name: string;
  kelas: string;
  asal: string;
  photo_url?: string;
  status: string;
}

interface PengurusAlumni {
  id: number;
  nik: string;
  name: string;
  jabatan: string;
  jabatan_tambahan?: string;
  phone: string;
  status: string;
  photo_url?: string;
}

const colors = ["from-indigo-400 to-blue-500", "from-emerald-400 to-teal-500", "from-pink-400 to-rose-500", "from-amber-400 to-orange-500", "from-violet-400 to-purple-500"];

export default function AlumniPage() {
  const [activeType, setActiveType] = useState<"santri" | "pengurus">("santri");
  const [list, setList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [yearFilter, setYearFilter] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [selectedSantri, setSelectedSantri] = useState<any | null>(null);
  const [selectedPengurus, setSelectedPengurus] = useState<any | null>(null);
  const { showToast } = useToast();

  const fetchAlumni = useCallback(async () => {
    setLoading(true);
    try {
      const url = `${API_BASE_URL}/api/alumni?type=${activeType}${yearFilter ? `&year=${encodeURIComponent(yearFilter)}` : ""}`;
      const res = await fetch(url);
      const json = await res.json() as any;
      if (json.success) setList(json.data);
    } catch (e) {
      console.error(e);
    } finally {
      setTimeout(() => setLoading(false), 500);
    }
  }, [activeType, yearFilter]);

  useEffect(() => {
    fetchAlumni();
  }, [fetchAlumni]);

  const filteredData = useMemo(() => {
    return list.filter(item => 
      (item.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.nisn && item.nisn.includes(searchQuery)) ||
      (item.nik && item.nik.includes(searchQuery)) ||
      (item.asal && item.asal.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.city && item.city.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [list, searchQuery]);

  const availableYears = useMemo(() => {
    const field = activeType === 'santri' ? 'tahun_lulus' : 'tahun_purna';
    const years = list.map(item => item[field]).filter(Boolean);
    return Array.from(new Set(years)).sort().reverse();
  }, [list, activeType]);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 50;

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, activeType, yearFilter]);

  const visibleData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(start, start + itemsPerPage);
  }, [filteredData, currentPage]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const handleExport = () => {
    if (filteredData.length === 0) {
      showToast("Tidak ada data untuk dieksport", "warning");
      return;
    }

    try {
      const exportData = filteredData.map(item => {
        if (activeType === 'santri') {
          return {
            Nama: item.name,
            NISN: item.nisn,
            NIK: item.nik,
            "Tahun Lulus": item.tahun_lulus,
            Asal: item.asal,
            "Jalan/Dusun": item.street,
            Desa: item.village,
            Kecamatan: item.district,
            Kota: item.city,
            Provinsi: item.province
          };
        } else {
          return {
            Nama: item.name,
            NIK: item.nik,
            "Tahun Purna": item.tahun_purna,
            Jabatan: item.jabatan,
            "Jabatan Tambahan": item.jabatan_tambahan,
            Telepon: item.phone,
            "Jalan/Dusun": item.street,
            Desa: item.village,
            Kecamatan: item.district,
            Kota: item.city,
            Provinsi: item.province
          };
        }
      });

      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, `Alumni ${activeType}`);
      XLSX.writeFile(wb, `Data_Alumni_${activeType}_${new Date().getFullYear()}.xlsx`);
      showToast("Berhasil ekspor data!", "success");
    } catch (err) {
      showToast("Gagal ekspor data", "error");
    }
  };

  function getInitials(name: string) {
    if (!name) return "??";
    return name.split(" ").map(n => n[0]).join("").toUpperCase().substring(0, 2);
  }

  return (
    <>
      <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto relative">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-slate-100 text-slate-800 rounded-xl">
              <Users className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-800 tracking-tight">Data Alumni</h1>
              <p className="text-sm text-slate-500 font-medium">Arsip data santri dan pengurus yang telah menyelesaikan masa bakti.</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            <button 
              onClick={fetchAlumni}
              className="p-2.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-all"
              title="Refresh Data"
            >
              <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button onClick={() => setIsImportModalOpen(true)} className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-black text-indigo-600 hover:bg-indigo-50 transition-all shadow-sm">
              <Upload className="w-4 h-4" /> Import
            </button>
            <button onClick={handleExport} className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-black text-emerald-600 hover:bg-emerald-50 transition-all shadow-sm">
              <Download className="w-4 h-4" /> Export
            </button>
            <button onClick={() => setIsAddModalOpen(true)} className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-black hover:bg-black shadow-lg transition-all active:scale-95">
              <Plus className="w-4 h-4" /> Tambah Manual
            </button>
          </div>
        </div>

        {/* Tab switch & Filters bar */}
        <div className="flex flex-col sm:flex-row gap-4 bg-white p-4 rounded-2xl shadow-sm border border-slate-100 items-center justify-between">
          <div className="flex space-x-1 p-1 bg-slate-100 rounded-xl w-full sm:w-auto overflow-x-auto shrink-0">
            <button
              onClick={() => { setActiveType("santri"); setSearchQuery(""); }}
              className={`px-6 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                activeType === "santri" 
                  ? "bg-white text-indigo-600 shadow-sm" 
                  : "text-slate-500 hover:text-slate-700 hover:bg-slate-200"
              }`}
            >
              Alumni Santri
            </button>
            <button
              onClick={() => { setActiveType("pengurus"); setSearchQuery(""); }}
              className={`px-6 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                activeType === "pengurus" 
                  ? "bg-white text-emerald-600 shadow-sm" 
                  : "text-slate-500 hover:text-slate-700 hover:bg-slate-200"
              }`}
            >
              Alumni Pengurus
            </button>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto justify-end">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder={`Cari nama, ${activeType === 'santri' ? 'NISN' : 'NIK'}...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-500/20 focus:border-slate-500 transition-all font-semibold" 
              />
            </div>
            <select 
              className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none focus:border-slate-500 appearance-none pr-8 relative bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23007CB2%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E')] bg-size-[0.65rem_auto] bg-position-[right_0.75rem_center] bg-no-repeat w-full sm:w-48"
              value={yearFilter}
              onChange={(e) => setYearFilter(e.target.value)}
            >
              <option value="">Semua Angkatan</option>
              {availableYears.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
        </div>

        {/* Table Content */}
        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-slate-500 uppercase tracking-wider border-b border-slate-100 bg-slate-50/50">
                  <th className="text-left px-5 py-3 font-bold">Nama {activeType === 'santri' ? 'Santri' : 'Pengurus'}</th>
                  <th className="text-left px-5 py-3 font-bold hidden sm:table-cell font-mono">{activeType === 'santri' ? 'NISN' : 'NIK'}</th>
                  <th className="text-left px-5 py-3 font-bold">{activeType === 'santri' ? 'Angkatan/Lulus' : 'Tahun Purna'}</th>
                  <th className="text-left px-5 py-3 font-bold hidden md:table-cell">{activeType === 'santri' ? 'Daerah Asal' : 'Jabatan Terakhir'}</th>
                  <th className="text-left px-5 py-3 font-bold hidden lg:table-cell">Kontak / Lainnya</th>
                  <th className="text-center px-5 py-3 font-bold">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-24">
                      <div className="flex flex-col items-center justify-center gap-4">
                        <div className="relative">
                          <div className="w-12 h-12 rounded-full border-4 border-slate-100 border-t-slate-800 animate-spin"></div>
                        </div>
                        <p className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] animate-pulse">Menyiapkan Data...</p>
                      </div>
                    </td>
                  </tr>
                ) : visibleData.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-20 text-center">
                      <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-slate-100">
                        <Search className="w-6 h-6 text-slate-300" />
                      </div>
                      <p className="text-sm font-bold text-slate-400">Tidak ada alumni {activeType} ditemukan.</p>
                    </td>
                  </tr>
                ) : (
                  visibleData.map((item, i) => (
                    <tr 
                      key={item.id} 
                      onClick={() => activeType === 'santri' ? setSelectedSantri(item) : setSelectedPengurus(item)}
                      className="group hover:bg-slate-50/50 transition-all cursor-pointer select-none"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-xl bg-linear-to-br ${colors[i % colors.length]} flex items-center justify-center text-white text-[11px] font-bold shadow-sm transition-transform group-hover:scale-105 overflow-hidden shrink-0`}>
                            {item.photo_url ? (
                              <img src={item.photo_url} alt={item.name} className="w-full h-full object-cover" />
                            ) : getInitials(item.name)}
                          </div>
                          <div>
                            <span className="font-bold text-slate-700 tracking-tight block line-clamp-1">{item.name}</span>
                            <span className="text-[10px] text-slate-400 font-semibold">{activeType === 'santri' ? item.kelas : ''}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-slate-500 hidden sm:table-cell font-mono text-[11px]">{activeType === 'santri' ? (item.nisn || "-") : (item.nik || "-")}</td>
                      <td className="px-5 py-4">
                        <span className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-md text-[10px] font-black uppercase tracking-widest">
                          {activeType === 'santri' ? item.tahun_lulus : item.tahun_purna}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-slate-500 hidden md:table-cell font-bold text-xs">
                        {activeType === 'santri' ? (item.city || item.asal || "-") : item.jabatan}
                      </td>
                      <td className="px-5 py-4 text-slate-500 hidden lg:table-cell text-xs">
                        {activeType === 'santri' ? (
                           <div className="flex items-center gap-1.5">
                              <MapPin className="w-3.5 h-3.5 text-slate-400" />
                              <span className="truncate max-w-[150px]">{item.province || "-"}</span>
                           </div>
                        ) : (
                           <div className="flex items-center gap-1.5">
                              <Phone className="w-3.5 h-3.5 text-slate-400" />
                              <span>{item.phone || "-"}</span>
                           </div>
                        )}
                      </td>
                      <td className="px-5 py-4 text-center">
                        <button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all mx-auto">
                          <Eye className="w-4 h-4" />
                        </button>
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
                Menampilkan {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, filteredData.length)} dari {filteredData.length} Alumni
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

      {/* Detail Modals */}
      {selectedSantri && (
        <SantriDetailModal
          isOpen={!!selectedSantri}
          santri={selectedSantri}
          onClose={() => setSelectedSantri(null)}
          onUpdate={fetchAlumni}
        />
      )}

      {selectedPengurus && (
        <PengurusDetailModal
          isOpen={!!selectedPengurus}
          pengurus={selectedPengurus}
          onClose={() => setSelectedPengurus(null)}
          onUpdate={fetchAlumni}
        />
      )}

      <ManualAlumniModal 
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={fetchAlumni}
        type={activeType}
      />

      <ImportAlumniModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onSuccess={fetchAlumni}
        type={activeType}
      />
    </>
  );
}
