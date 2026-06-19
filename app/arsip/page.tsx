"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { 
  FileBox, 
  FileText, 
  File as FileIcon, 
  Download, 
  Trash2, 
  Search,
  Loader2,
  Plus,
  Printer,
  ArrowUpRight,
  ArrowDownLeft,
  Calendar,
  Hash,
  Eye,
  Filter,
  RefreshCw
} from "lucide-react";
import { useToast } from "@/components/Toast";
import AddArsipModal from "@/components/AddArsipModal";
import FilePreviewModal from "@/components/FilePreviewModal";
import { API_BASE_URL } from "@/lib/config";

interface ArchiveFile {
  id: number;
  name: string;
  url: string;
  type: string;
  size: string;
  created_at: string;
  category: string;
  doc_date: string;
  doc_number: string;
  flow_type: 'Masuk' | 'Keluar';
  sender_receiver: string;
}

export default function ArsipPage() {
  const [files, setFiles] = useState<ArchiveFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<string>("Semua");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [previewFile, setPreviewFile] = useState<ArchiveFile | null>(null);
  const { showToast } = useToast();

  async function fetchFiles() {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/arsip`);
      const json = await res.json() as any;
      if (json.success) setFiles(json.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Apakah Anda yakin ingin menghapus arsip ini?")) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/arsip/${id}`, {
        method: "DELETE"
      });
      const json = await res.json() as any;
      if (json.success) {
        showToast("Arsip berhasil dihapus", "success");
        fetchFiles();
      } else {
        showToast(json.error || "Gagal menghapus arsip", "error");
      }
    } catch (err) {
      showToast("Kesalahan koneksi", "error");
    }
  }

  useEffect(() => {
    fetchFiles();
  }, []);

  const handlePrint = (file: ArchiveFile) => {
    window.open(file.url, '_blank');
  };

  const filteredFiles = files.filter(f => {
    const matchesSearch = f.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         f.doc_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         f.sender_receiver?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterType === "Semua" || f.flow_type === filterType;
    return matchesSearch && matchesFilter;
  });

  return (
    <DashboardLayout>
      <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto relative">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
              <FileBox className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-800 tracking-tight">Arsip Dokumentasi</h1>
              <p className="text-sm text-slate-500 font-medium">Sistem Pengarsipan Surat & Proposal Pondok</p>
            </div>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button 
              onClick={fetchFiles}
              className="p-2.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
              title="Refresh Data"
            >
              <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-lg transition-all active:scale-95 shadow-indigo-500/20"
            >
              <Plus className="w-5 h-5" />
              <span>Tambah Arsip Baru</span>
            </button>
          </div>
        </div>

        {/* Filters & Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { label: "Total Arsip", count: files.length, icon: FileText, color: "text-indigo-600", bg: "bg-indigo-50" },
            { label: "Surat Masuk", count: files.filter(f => f.flow_type === 'Masuk').length, icon: ArrowDownLeft, color: "text-emerald-600", bg: "bg-emerald-50" },
            { label: "Surat Keluar", count: files.filter(f => f.flow_type === 'Keluar').length, icon: ArrowUpRight, color: "text-rose-600", bg: "bg-rose-50" }
          ].map((stat, i) => (
            <div key={i} className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm flex items-center gap-4">
              <div className={`w-14 h-14 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center`}>
                <stat.icon className="w-7 h-7" />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{stat.label}</p>
                <p className="text-2xl font-black text-slate-800">{stat.count}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
          {/* Table Header / Search */}
          <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4 bg-slate-50/50">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Cari judul, nomor surat, atau pengirim/penerima..." 
                className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="flex space-x-1 p-1 bg-slate-100 rounded-xl w-full sm:w-auto overflow-x-auto">
              {["Semua", "Masuk", "Keluar"].map((t) => (
                <button
                  key={t}
                  onClick={() => setFilterType(t)}
                  className={`px-5 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                    filterType === t 
                      ? "bg-white text-indigo-600 shadow-sm" 
                      : "text-slate-500 hover:text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Informasi Dokumen</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Aliran</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Asal / Tujuan</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Tgl Dokumen</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">File Info</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-24 text-center">
                      <div className="flex flex-col items-center">
                        <Loader2 className="w-10 h-10 animate-spin text-indigo-600 mb-4" />
                        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Sinkronisasi Arsip...</p>
                      </div>
                    </td>
                  </tr>
                ) : filteredFiles.length > 0 ? (
                  filteredFiles.map((file) => (
                    <tr key={file.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-6 py-5">
                        <div className="flex items-start gap-4">
                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 transition-all ${
                            file.category === 'Proposal' ? 'bg-amber-50 text-amber-600' : 
                            file.category === 'Surat' ? 'bg-indigo-50 text-indigo-600' : 
                            'bg-slate-100 text-slate-500'
                          }`}>
                            <FileText className="w-6 h-6" />
                          </div>
                          <div>
                            <p className="text-sm font-black text-slate-800 leading-snug group-hover:text-indigo-600 transition-colors">{file.name}</p>
                            <div className="flex items-center gap-2 mt-1">
                                <span className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider ${
                                  file.category === 'Proposal' ? 'bg-amber-100 text-amber-700' : 
                                  file.category === 'Surat' ? 'bg-indigo-100 text-indigo-700' : 
                                  'bg-slate-200 text-slate-600'
                                }`}>
                                  {file.category}
                                </span>
                                <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                                    <Hash className="w-3 h-3" /> {file.doc_number || '-'}
                                </span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                         <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl font-black text-[10px] uppercase tracking-wider ${
                           file.flow_type === 'Masuk' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                         }`}>
                           {file.flow_type === 'Masuk' ? <ArrowDownLeft className="w-3 h-3" /> : <ArrowUpRight className="w-3 h-3" />}
                           {file.flow_type}
                         </div>
                      </td>
                      <td className="px-6 py-5">
                         <p className="text-xs font-black text-slate-700">{file.sender_receiver || '-'}</p>
                         <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{file.flow_type === 'Masuk' ? 'Pengirim' : 'Penerima'}</p>
                      </td>
                      <td className="px-6 py-5">
                         <div className="flex items-center gap-2 text-slate-600">
                            <Calendar className="w-3.5 h-3.5 text-slate-300" />
                            <p className="text-xs font-bold">
                              {file.doc_date ? new Date(file.doc_date).toLocaleDateString("id-ID", { day: 'numeric', month: 'short', year: 'numeric' }) : '-'}
                            </p>
                         </div>
                      </td>
                      <td className="px-6 py-5">
                        <p className="text-[10px] font-black text-slate-500 uppercase">{file.type} • {file.size}</p>
                        <p className="text-[9px] font-bold text-slate-400 mt-1 italic">
                          ID: {file.url.split('/').pop()?.slice(0, 8)}...
                        </p>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center justify-center gap-2">
                          <button 
                            onClick={() => setPreviewFile(file)}
                            className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-100 text-slate-600 hover:bg-sky-100 hover:text-sky-600 transition-all active:scale-95"
                            title="Pratinjau"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handlePrint(file)}
                            className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-100 text-slate-600 hover:bg-emerald-100 hover:text-emerald-600 transition-all active:scale-95"
                            title="Print / Unduh"
                          >
                            <Printer className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDelete(file.id)}
                            className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-100 text-slate-600 hover:bg-rose-100 hover:text-rose-600 transition-all active:scale-95"
                            title="Hapus"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-24 text-center">
                      <div className="max-w-xs mx-auto">
                        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                          <FileIcon className="w-10 h-10 text-slate-200" />
                        </div>
                        <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-2">Arsip Tidak Ditemukan</h4>
                        <p className="text-xs text-slate-400 font-bold">Tidak ada file arsip yang sesuai dengan kriteria pencarian Anda.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <AddArsipModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={fetchFiles} 
      />

      <FilePreviewModal
        isOpen={!!previewFile}
        onClose={() => setPreviewFile(null)}
        file={previewFile}
      />
    </DashboardLayout>
  );
}
