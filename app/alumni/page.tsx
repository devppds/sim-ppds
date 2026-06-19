"use client";

import { useEffect, useState, useMemo } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Users, UserCheck, Search, Filter, GraduationCap, Phone, MapPin, Calendar, ArrowRight, Upload, Download, Plus } from "lucide-react";
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

  async function fetchAlumni() {
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
  }

  useEffect(() => {
    fetchAlumni();
  }, [activeType, yearFilter]);

  const filteredData = useMemo(() => {
    return list.filter(item => 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.nisn && item.nisn.includes(searchQuery)) ||
      (item.nik && item.nik.includes(searchQuery))
    );
  }, [list, searchQuery]);

  // Derive unique years for filter
  const availableYears = useMemo(() => {
    const field = activeType === 'santri' ? 'tahun_lulus' : 'tahun_purna';
    const years = list.map(item => item[field]).filter(Boolean);
    return Array.from(new Set(years)).sort().reverse();
  }, [list, activeType]);

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

  return (
    <DashboardLayout>
      <div className="fade-up space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="flex-1">
            <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-slate-800 text-white flex items-center justify-center shadow-lg shadow-slate-800/20">
                <Users className="w-5 h-5" />
              </div>
              Data Alumni
            </h1>
            <p className="text-sm font-bold text-slate-400 mt-2 max-w-lg">
              Arsip data santri dan pengurus yang telah menyelesaikan masa bakti di Pondok Pesantren Darussalam.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
             <button onClick={() => setIsImportModalOpen(true)} className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-xs font-black text-indigo-600 hover:bg-slate-50 transition-all shadow-sm">
                <Upload className="w-4 h-4" /> Import
             </button>
             <button onClick={handleExport} className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-xs font-black text-emerald-600 hover:bg-slate-50 transition-all shadow-sm">
                <Download className="w-4 h-4" /> Export
             </button>
             <button onClick={() => setIsAddModalOpen(true)} className="flex items-center gap-2 px-6 py-2.5 bg-slate-900 text-white rounded-[22px] text-xs font-black hover:bg-black shadow-xl shadow-slate-900/10 transition-all active:scale-95">
                <Plus className="w-4 h-4" /> Tambah Manual
             </button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
            {/* Type Switcher */}
            <div className="p-1 bg-slate-200/50 backdrop-blur-md rounded-[20px] flex gap-1 w-full lg:w-auto">
                <button
                onClick={() => setActiveType("santri")}
                className={`flex-1 lg:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-[16px] text-[11px] font-black transition-all ${
                    activeType === "santri" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"
                }`}
                >
                <GraduationCap className={`w-4 h-4 ${activeType === "santri" ? "text-indigo-500" : ""}`} />
                Alumni Santri
                </button>
                <button
                onClick={() => setActiveType("pengurus")}
                className={`flex-1 lg:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-[16px] text-[11px] font-black transition-all ${
                    activeType === "pengurus" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"
                }`}
                >
                <UserCheck className={`w-4 h-4 ${activeType === "pengurus" ? "text-emerald-500" : ""}`} />
                Alumni Pengurus
                </button>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:flex-1 lg:justify-end">
                <div className="relative flex-1 group w-full lg:max-w-md">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                    <input 
                    type="text" 
                    placeholder={`Cari nama, ${activeType === 'santri' ? 'NISN' : 'NIK'}...`}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-white border border-slate-100 rounded-2xl text-xs font-bold placeholder:text-slate-400 focus:border-indigo-500 transition-all outline-none shadow-sm" 
                    />
                </div>
                <div className="relative w-full sm:w-auto">
                    <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <select 
                        className="w-full sm:w-48 pl-11 pr-4 py-3 bg-white border border-slate-100 rounded-2xl text-xs font-bold appearance-none outline-none focus:border-indigo-500 shadow-sm"
                        value={yearFilter}
                        onChange={(e) => setYearFilter(e.target.value)}
                    >
                        <option value="">Tahun Ajaran</option>
                        {availableYears.map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                </div>
            </div>
        </div>

        {/* List Content */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {loading ? (
            Array(8).fill(0).map((_, i) => (
              <div key={i} className="h-64 bg-white rounded-[40px] border border-slate-50 animate-pulse" />
            ))
          ) : filteredData.length === 0 ? (
            <div className="col-span-full py-32 text-center">
              <div className="w-24 h-24 bg-slate-50 rounded-[32px] flex items-center justify-center mx-auto mb-6 border-2 border-dashed border-slate-200">
                <Search className="w-10 h-10 text-slate-300" />
              </div>
              <h3 className="text-xl font-black text-slate-400 uppercase tracking-widest leading-none">Tidak Ada Data</h3>
              <p className="text-sm font-bold text-slate-300 mt-2">Belum ada alumni {activeType} untuk filter ini.</p>
            </div>
          ) : (
            filteredData.map((item) => (
              <div 
                key={item.id} 
                onClick={() => activeType === 'santri' ? setSelectedSantri(item) : setSelectedPengurus(item)}
                className="group bg-white rounded-[40px] border border-slate-100 p-6 shadow-sm hover:border-indigo-200 hover:shadow-2xl hover:shadow-indigo-500/10 transition-all cursor-pointer relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-bl-[80px] -z-0 transition-transform group-hover:scale-110 opacity-30" />
                
                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-6">
                    <div className="w-16 h-16 rounded-3xl bg-white p-1.5 border border-slate-100 shadow-xl shadow-slate-200/50 transition-transform group-hover:scale-110">
                      {item.photo_url ? (
                        <img src={item.photo_url} alt={item.name} className="w-full h-full object-cover rounded-2xl" />
                      ) : (
                        <div className="w-full h-full rounded-2xl bg-slate-50 flex items-center justify-center text-slate-200">
                          {activeType === 'santri' ? <GraduationCap className="w-8 h-8" /> : <UserCheck className="w-8 h-8" />}
                        </div>
                      )}
                    </div>
                    <div className="px-3 py-1 bg-white border border-slate-100 rounded-full text-[9px] font-black text-slate-500 uppercase tracking-widest shadow-sm">
                       {activeType === 'santri' ? item.kelas : item.jabatan}
                    </div>
                  </div>

                  <h3 className="text-base font-black text-slate-800 tracking-tight leading-tight group-hover:text-indigo-600 transition-colors line-clamp-1">
                    {item.name}
                  </h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1.5 truncate">
                    {activeType === 'santri' ? 'NISN: ' + item.nisn : 'NIK: ' + item.nik}
                  </p>

                  <div className="space-y-3 mt-6">
                    <div className="flex items-center gap-3 text-[11px] font-bold text-slate-500 bg-slate-50/50 p-2 rounded-2xl border border-slate-50">
                      <div className="w-7 h-7 rounded-xl bg-white flex items-center justify-center text-slate-400 shadow-sm border border-slate-100 flex-shrink-0">
                        {activeType === 'santri' ? <MapPin className="w-3.5 h-3.5" /> : <Phone className="w-3.5 h-3.5" />}
                      </div>
                      <span className="truncate">{activeType === 'santri' ? (item.city || item.asal) : item.phone}</span>
                    </div>
                    <div className="flex items-center gap-3 text-[11px] font-bold text-indigo-600 bg-indigo-50/30 p-2 rounded-2xl border border-indigo-100/50">
                        <div className="w-7 h-7 rounded-xl bg-white flex items-center justify-center text-indigo-500 shadow-sm border border-indigo-100 flex-shrink-0">
                            <Calendar className="w-3.5 h-3.5" />
                        </div>
                        <span className="font-black uppercase tracking-widest">Tahun Ajar {item.tahun_lulus || item.tahun_purna || '-'}</span>
                    </div>
                  </div>

                  <div className="mt-6 pt-5 border-t border-slate-50 flex items-center justify-between text-indigo-500 group-hover:px-2 transition-all">
                    <span className="text-[10px] font-black uppercase tracking-[0.3em]">Lihat Detail</span>
                    <ArrowRight className="w-4 h-4 translate-x-0 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            ))
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
    </DashboardLayout>
  );
}
