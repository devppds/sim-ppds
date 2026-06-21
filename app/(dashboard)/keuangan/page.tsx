"use client";

import { useEffect, useState, useCallback } from "react";
import { 
  Receipt, 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  ArrowUpRight, 
  ArrowDownRight, 
  Trash2,
  History,
  PieChart,
  Plus,
  Download,
  CheckCircle,
  Users,
  Eye,
  Search
} from "lucide-react";
import AddTransactionModal from "@/components/AddTransactionModal";
import TransactionDetailModal from "@/components/TransactionDetailModal";
import ConfirmModal from "@/components/ConfirmModal";
import { API_BASE_URL } from "@/lib/config";
import { DataTable } from "@/components/DataTable";
import { useToast } from "@/components/Toast";

interface Transaction {
  id: number;
  type: "Pemasukan" | "Pengeluaran";
  category: string;
  amount: number;
  description: string;
  date: string;
  proof_url?: string;
  deleted_at?: string;
  santri_id?: number | null;
  santri_name?: string;
  santri_nisn?: string;
}

export default function KeuanganPage() {
  const [data, setData] = useState<Transaction[]>([]);
  const [summary, setSummary] = useState({ total_income: 0, total_expense: 0 });
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showTrashed, setShowTrashed] = useState(false);
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  const [activeTab, setActiveTab] = useState<"ledger" | "budgeting" | "neraca" | "monitoring">("ledger");
  const [searchQuery, setSearchQuery] = useState("");

  const [proposals, setProposals] = useState<any[]>([]);
  const [loadingProposals, setLoadingProposals] = useState(true);
  const [selectedSeksi, setSelectedSeksi] = useState<string | null>(null);
  const { showToast } = useToast();

  // Modern confirm modal state
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: "danger" | "warning" | "info";
    confirmLabel: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: "",
    message: "",
    type: "danger",
    confirmLabel: "Ya, Lanjutkan",
    onConfirm: () => {},
  });

  const openConfirm = (opts: { title: string; message: string; type?: "danger" | "warning" | "info"; confirmLabel?: string; onConfirm: () => void }) => {
    setConfirmModal({ isOpen: true, type: "danger", confirmLabel: "Ya, Lanjutkan", ...opts });
  };
  const closeConfirm = () => setConfirmModal(prev => ({ ...prev, isOpen: false }));

  const fetchFinance = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/api/keuangan?trashed=${showTrashed}`);
      const json = await res.json() as { success: boolean, data: Transaction[], summary: { total_income: number, total_expense: number } };
      if (json.success) {
        setData(json.data);
        setSummary(json.summary);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [showTrashed]);

  const fetchProposals = useCallback(async () => {
    try {
      setLoadingProposals(true);
      const res = await fetch(`${API_BASE_URL}/api/arsip`);
      const json = await res.json() as any;
      if (json.success && Array.isArray(json.data)) {
        const props = json.data.filter((d: any) => d.category === "Proposal" && d.flow_type === "Diajukan");
        setProposals(props);
      }
    } catch (err) {
      console.error("Gagal mengambil data proposal:", err);
    } finally {
      setLoadingProposals(false);
    }
  }, []);

  useEffect(() => {
    fetchFinance();
    fetchProposals();
  }, [fetchFinance, fetchProposals]);

  const doCairkan = async (proposal: any) => {
    try {
      const cleanAmount = parseInt(proposal.doc_number.replace(/[^0-9]/g, "")) || 0;
      const txRes = await fetch(`${API_BASE_URL}/api/keuangan`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "Pengeluaran",
          category: proposal.sender_receiver || "Umum",
          amount: cleanAmount,
          description: `Pencairan: ${proposal.name}`,
          date: new Date().toISOString().split('T')[0]
        })
      });
      const txJson = await txRes.json() as any;
      if (!txJson.success) {
        showToast(txJson.error || "Gagal mencatat pengeluaran", "error");
        return;
      }
      const arsipRes = await fetch(`${API_BASE_URL}/api/arsip/${proposal.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ flow_type: "Dicairkan" })
      });
      const arsipJson = await arsipRes.json() as any;
      if (arsipJson.success) {
        showToast("Dana berhasil dicairkan!", "success");
        fetchFinance();
        fetchProposals();
      } else {
        showToast(arsipJson.error || "Gagal memperbarui status proposal", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Kesalahan jaringan", "error");
    }
  };

  const handleCairkan = (proposal: any) => {
    openConfirm({
      title: "Cairkan Dana Anggaran?",
      message: `Pencairan sebesar ${proposal.doc_number} untuk "${proposal.name}" akan dicatat sebagai pengeluaran. Tindakan ini tidak dapat dibatalkan.`,
      type: "warning",
      confirmLabel: "Ya, Cairkan Dana",
      onConfirm: () => { closeConfirm(); doCairkan(proposal); }
    });
  };

  const doDelete = async (id: number, isPermanent: boolean) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/keuangan/${id}?permanent=${isPermanent}`, { method: "DELETE" });
      const json = await res.json() as { success: boolean, error?: string };
      if (json.success) {
        showToast(isPermanent ? "Transaksi dihapus permanen." : "Transaksi dipindah ke Recycle Bin.", "success");
        fetchFinance();
        setSelectedTx(null);
      } else {
        showToast(json.error || "Gagal menghapus transaksi.", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Kesalahan jaringan.", "error");
    }
  };

  const handleDelete = (id: number) => {
    const isPermanent = showTrashed;
    openConfirm({
      title: isPermanent ? "Hapus Permanen?" : "Pindah ke Recycle Bin?",
      message: isPermanent
        ? "Transaksi ini akan dihapus selamanya dan tidak bisa dipulihkan."
        : "Transaksi ini akan dipindahkan ke Recycle Bin dan bisa dipulihkan nanti.",
      type: isPermanent ? "danger" : "warning",
      confirmLabel: isPermanent ? "Ya, Hapus Permanen" : "Ya, Pindah ke Trash",
      onConfirm: () => { closeConfirm(); doDelete(id, isPermanent); }
    });
  };

  const handleRestore = async (id: number) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/keuangan/restore?id=${id}`, { method: "POST" });
      const json = await res.json() as { success: boolean, error?: string };
      if (json.success) {
        fetchFinance();
        setSelectedTx(null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const formatIDR = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  const filteredData = data.filter((t) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      (t.description?.toLowerCase() || "").includes(query) ||
      (t.category?.toLowerCase() || "").includes(query) ||
      (t.santri_name?.toLowerCase() || "").includes(query) ||
      (t.santri_nisn?.toLowerCase() || "").includes(query)
    );
  });

  return (
    <>
      <div className="fade-up fade-up-1 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-extrabold text-slate-800 flex items-center gap-2">
              <Wallet className="w-6 h-6 text-indigo-600" /> Bendahara Umum (Master Finance)
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Manajemen Ledger, E-Budgeting, dan Laporan Neraca Keuangan
            </p>
          </div>
          <div className="flex gap-2">
            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all">
              <Download className="w-3.5 h-3.5" /> Export PDF
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          <button 
            onClick={() => setActiveTab("ledger")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${activeTab === "ledger" ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20" : "bg-white text-slate-500 hover:bg-slate-50 border border-slate-200"}`}
          >
            <Receipt className="w-4 h-4" /> Ledger Utama
          </button>
          <button 
            onClick={() => setActiveTab("budgeting")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${activeTab === "budgeting" ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/20" : "bg-white text-slate-500 hover:bg-slate-50 border border-slate-200"}`}
          >
            <Wallet className="w-4 h-4" /> E-Budgeting (Pencairan)
          </button>
          <button 
            onClick={() => setActiveTab("neraca")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${activeTab === "neraca" ? "bg-amber-500 text-white shadow-lg shadow-amber-500/20" : "bg-white text-slate-500 hover:bg-slate-50 border border-slate-200"}`}
          >
            <PieChart className="w-4 h-4" /> Laporan Neraca
          </button>
          <button 
            onClick={() => setActiveTab("monitoring")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${activeTab === "monitoring" ? "bg-purple-600 text-white shadow-lg shadow-purple-600/20" : "bg-white text-slate-500 hover:bg-slate-50 border border-slate-200"}`}
          >
            <Users className="w-4 h-4" /> Monitoring Seksi
          </button>
        </div>

        {activeTab === "ledger" && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
             {/* Highlight Cards */}
            {!showTrashed && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:scale-110 transition-transform">
                    <TrendingUp className="w-12 h-12 text-emerald-600" />
                  </div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Pemasukan</p>
                  <h3 className="text-2xl font-black text-slate-800 mt-1">{loading ? "..." : formatIDR(summary.total_income)}</h3>
                  <div className="mt-3 flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 w-fit px-2 py-0.5 rounded-full">
                    <ArrowUpRight className="w-3 h-3" /> +8.2% bln ini
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:scale-110 transition-transform">
                    <TrendingDown className="w-12 h-12 text-rose-600" />
                  </div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Pengeluaran</p>
                  <h3 className="text-2xl font-black text-slate-800 mt-1">{loading ? "..." : formatIDR(summary.total_expense)}</h3>
                  <div className="mt-3 flex items-center gap-1 text-[11px] font-bold text-rose-600 bg-rose-50 w-fit px-2 py-0.5 rounded-full">
                    <ArrowDownRight className="w-3 h-3" /> -2.4% bln ini
                  </div>
                </div>

                <div className="bg-indigo-600 p-5 rounded-2xl shadow-xl shadow-indigo-600/20 text-white relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-3 opacity-20 group-hover:scale-110 transition-transform">
                    <Wallet className="w-12 h-12" />
                  </div>
                  <p className="text-[10px] font-bold text-indigo-100 uppercase tracking-widest opacity-80">Saldo Kas Sekarang</p>
                  <h3 className="text-2xl font-black mt-1">{loading ? "..." : formatIDR(summary.total_income - summary.total_expense)}</h3>
                  <div className="mt-3 text-[11px] font-medium text-indigo-100 opacity-70">Terakhir update: Hari ini</div>
                </div>
              </div>
            )}

            {/* Transaction Table */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/50">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 flex-1">
                  <h3 className="font-bold text-slate-800 text-sm tracking-tight whitespace-nowrap">
                    {showTrashed ? 'Recycle Bin Transaksi' : 'Buku Besar (Ledger)'}
                  </h3>
                  <div className="relative max-w-xs w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Cari deskripsi, kategori, atau nama santri..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-4 py-1.5 rounded-lg border border-slate-200 text-xs focus:outline-none focus:border-indigo-500 bg-white font-medium text-slate-600"
                    />
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                    {!showTrashed && (
                      <button 
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center gap-2 px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700 transition-all shadow-sm"
                      >
                        <Plus className="w-3 h-3" /> Catat Transaksi
                      </button>
                    )}
                    <button 
                      onClick={() => setShowTrashed(!showTrashed)}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                        showTrashed 
                        ? 'bg-slate-800 text-white border-slate-800' 
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {showTrashed ? <History className="w-3.5 h-3.5" /> : <Trash2 className="w-3.5 h-3.5" />}
                      {showTrashed ? 'Kembali' : 'Trash'}
                    </button>
                </div>
              </div>
              
              <div className="p-4">
                 <DataTable 
                   data={filteredData}
                   columns={[
                     {
                       header: "Tanggal",
                       render: (t: Transaction) => (
                         <div className="text-slate-500 font-bold whitespace-nowrap">
                           {new Date(t.date).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                         </div>
                       )
                     },
                     {
                       header: "Kategori",
                       render: (t: Transaction) => (
                         <span className={`px-2 py-1 rounded text-[10px] font-black uppercase ${
                           t.type === 'Pemasukan' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                         }`}>
                           {t.category}
                         </span>
                       )
                     },
                     {
                       header: "Keterangan",
                       render: (t: Transaction) => (
                         <div className="flex flex-col items-start gap-1">
                           <span className="text-sm font-bold text-slate-700 block">{t.description}</span>
                           {t.santri_name && (
                             <span className="inline-block mt-1 text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100 uppercase">
                               Santri: {t.santri_name} ({t.santri_nisn})
                             </span>
                           )}
                         </div>
                       )
                     },
                     {
                       header: "Bukti",
                       render: (t: Transaction) => (
                         <div className="flex justify-center">
                           {t.proof_url ? (
                              <div className="inline-flex items-center gap-1 text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded">
                                Ada Bukti
                              </div>
                           ) : (
                             <span className="text-[10px] font-bold text-slate-300">N/A</span>
                           )}
                         </div>
                       )
                     },
                     {
                       header: "Jumlah",
                       render: (t: Transaction) => (
                         <div className={`flex justify-end font-black tabular-nums ${
                           t.type === 'Pemasukan' ? 'text-emerald-600' : 'text-rose-600'
                         }`}>
                           {t.type === 'Pemasukan' ? '+' : '-'} {formatIDR(t.amount).replace("Rp", "").trim()}
                         </div>
                       )
                     }
                   ]}
                   sortOptions={[
                     { label: "Terbaru", value: "date-desc", sortFn: (a: Transaction, b: Transaction) => new Date(b.date).getTime() - new Date(a.date).getTime() },
                     { label: "Terlama", value: "date-asc", sortFn: (a: Transaction, b: Transaction) => new Date(a.date).getTime() - new Date(b.date).getTime() }
                   ]}
                   defaultSortValue="date-desc"
                   loading={loading}
                   emptyMessage={data.length === 0 ? (showTrashed ? 'Recycle Bin Kosong' : 'Belum ada transaksi') : 'Transaksi tidak ditemukan'}
                   onRowClick={(t) => setSelectedTx(t)}
                 />
              </div>

            </div>
          </div>
        )}

        {activeTab === "budgeting" && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <div>
                        <h2 className="text-lg font-bold text-slate-800">Sistem Pencairan Anggaran (E-Budgeting)</h2>
                        <p className="text-sm text-slate-500">Daftar proposal yang telah disetujui Ketua Umum dan siap dicairkan</p>
                    </div>
                </div>
                
                <div className="p-4">
                   <DataTable 
                     data={proposals}
                     columns={[
                       {
                         header: "Seksi Pengaju",
                         render: (item: any) => (
                           <div className="font-bold text-slate-800">{item.sender_receiver}</div>
                         )
                       },
                       {
                         header: "Keperluan / Judul",
                         render: (item: any) => (
                           <div className="text-slate-600">{item.name}</div>
                         )
                       },
                       {
                         header: "Anggaran",
                         render: (item: any) => (
                           <div className="font-mono font-bold text-slate-700">{item.doc_number}</div>
                         )
                       },
                       {
                         header: "Status Approval",
                         render: (item: any) => (
                           <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded text-[10px] font-black uppercase bg-emerald-50 text-emerald-600">
                             <CheckCircle className="w-3 h-3" /> Disetujui Ketua
                           </span>
                         )
                       },
                       {
                         header: "Aksi",
                         render: (item: any) => (
                           <div className="flex justify-end">
                             <button 
                               onClick={() => handleCairkan(item)}
                               className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-sm transition-all"
                             >
                                 Cairkan Dana
                             </button>
                           </div>
                         )
                       }
                     ]}
                     sortOptions={[
                       { label: "Seksi (A-Z)", value: "seksi-asc", sortFn: (a: any, b: any) => a.sender_receiver.localeCompare(b.sender_receiver) },
                       { label: "Judul (A-Z)", value: "judul-asc", sortFn: (a: any, b: any) => a.name.localeCompare(b.name) }
                     ]}
                     defaultSortValue="seksi-asc"
                     loading={loadingProposals}
                     emptyMessage="Tidak ada proposal yang diajukan atau siap dicairkan"
                   />
                </div>

             </div>
          </div>
        )}

        {activeTab === "neraca" && (() => {
          const incomingCategories: Record<string, number> = {};
          const outgoingCategories: Record<string, number> = {};
          
          data.forEach(t => {
            if (t.type === "Pemasukan") {
              incomingCategories[t.category] = (incomingCategories[t.category] || 0) + t.amount;
            } else {
              outgoingCategories[t.category] = (outgoingCategories[t.category] || 0) + t.amount;
            }
          });
          
          const incomingList = Object.entries(incomingCategories);
          const outgoingList = Object.entries(outgoingCategories);
          const surplus = summary.total_income - summary.total_expense;

          return (
             <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
               <div className="bg-white rounded-2xl border border-slate-100 p-8 shadow-sm text-center">
                   <h2 className="text-xl font-black text-slate-800 mb-2">Laporan Neraca Keuangan Otomatis</h2>
                   <p className="text-slate-500 mb-6">Rekapitulasi otomatis dari seluruh jurnal pemasukan dan pengeluaran pondok.</p>
                   
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto text-left">
                       <div className="border border-slate-200 rounded-xl p-6 bg-slate-50">
                           <h3 className="font-bold text-emerald-700 border-b border-slate-200 pb-3 mb-4 flex items-center gap-2">
                               <TrendingUp className="w-5 h-5" /> Aktiva (Pemasukan)
                           </h3>
                           <div className="space-y-3 text-sm">
                               {incomingList.length === 0 ? (
                                 <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Belum ada data pemasukan</p>
                               ) : (
                                 incomingList.map(([cat, val]) => (
                                   <div className="flex justify-between" key={cat}>
                                     <span>{cat}</span>
                                     <span className="font-mono font-bold">{formatIDR(val)}</span>
                                   </div>
                                 ))
                               )}
                               <div className="pt-3 border-t border-slate-200 flex justify-between font-black text-emerald-800">
                                   <span>Total Pemasukan</span><span className="font-mono">{formatIDR(summary.total_income)}</span>
                               </div>
                           </div>
                       </div>
                       <div className="border border-slate-200 rounded-xl p-6 bg-slate-50">
                           <h3 className="font-bold text-rose-700 border-b border-slate-200 pb-3 mb-4 flex items-center gap-2">
                               <TrendingDown className="w-5 h-5" /> Pasiva (Pengeluaran)
                           </h3>
                           <div className="space-y-3 text-sm">
                               {outgoingList.length === 0 ? (
                                 <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Belum ada data pengeluaran</p>
                               ) : (
                                 outgoingList.map(([cat, val]) => (
                                   <div className="flex justify-between" key={cat}>
                                     <span>{cat}</span>
                                     <span className="font-mono font-bold">{formatIDR(val)}</span>
                                   </div>
                                 ))
                               )}
                               <div className="pt-3 border-t border-slate-200 flex justify-between font-black text-rose-800">
                                   <span>Total Pengeluaran</span><span className="font-mono">{formatIDR(summary.total_expense)}</span>
                               </div>
                           </div>
                       </div>
                   </div>
                   
                   <div className={`mt-8 max-w-4xl mx-auto p-6 border rounded-xl flex justify-between items-center ${
                     surplus >= 0 ? "bg-indigo-50 border-indigo-100 text-indigo-800" : "bg-rose-50 border-rose-100 text-rose-800"
                   }`}>
                       <span className="font-bold text-lg">{surplus >= 0 ? "Saldo Kas Bersih (Surplus)" : "Defisit Kas Bersih"}</span>
                       <span className={`font-black text-2xl font-mono ${surplus >= 0 ? "text-indigo-700" : "text-rose-700"}`}>{formatIDR(surplus)}</span>
                   </div>
               </div>
             </div>
          );
        })()}

        {activeTab === "monitoring" && (() => {
          const SEKSI_LIST = [
            "Unit Usaha BUMP",
            "Pos Kesehatan (UKP)",
            "Takmir Masjid",
            "Kebersihan (KBR)",
            "Listrik & Air (PLP)",
            "Jam'iyyah & Event",
            "Pembangunan",
            "Media & Lab",
            "Seksi Keamanan"
          ];
          
          const uniqueCategoriesFromDb = Array.from(new Set(data.map(t => t.category)));
          const allSeksi = Array.from(new Set([...SEKSI_LIST, ...uniqueCategoriesFromDb])).filter(cat => cat && cat !== "SPP" && cat !== "Uang Saku" && cat !== "Tabungan");

          const aggregatedSeksi = allSeksi.map(seksiName => {
            const income = data.filter(t => t.category === seksiName && t.type === "Pemasukan").reduce((sum, t) => sum + t.amount, 0);
            const expense = data.filter(t => t.category === seksiName && t.type === "Pengeluaran").reduce((sum, t) => sum + t.amount, 0);
            
            const hasTransactions = income > 0 || expense > 0;
            const status = hasTransactions ? "Verified" : "Belum Kirim";
            const statusColor = hasTransactions ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-rose-50 text-rose-600 border-rose-100";
            
            return {
              name: seksiName,
              income,
              expense,
              status,
              statusColor,
              date: hasTransactions ? "Bulan ini" : "-"
            };
          });

          return (
             <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
               <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
                  <div className="p-8 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/20">
                      <div>
                          <h2 className="text-lg font-black text-slate-800 tracking-tight">Monitoring Laporan Bulanan Seksi</h2>
                          <p className="text-xs text-slate-400 mt-1 uppercase font-bold tracking-wider">Rekapitulasi Akumulasi Pendapatan dan Pengeluaran Tiap Divisi/Seksi</p>
                      </div>
                      <div className="text-[11px] font-black text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-xl uppercase tracking-widest">
                         Bulan Ini: Syawal 1447 H
                      </div>
                  </div>
                  
                  
                  <div className="p-4">
                     <DataTable 
                       data={aggregatedSeksi}
                       columns={[
                         {
                           header: "Nama Seksi / Divisi",
                           render: (item: any) => (
                             <div className="font-black text-slate-800">{item.name}</div>
                           )
                         },
                         {
                           header: "Pemasukan Seksi",
                           render: (item: any) => (
                             <div className="text-right text-emerald-600 tabular-nums">
                               {item.income > 0 ? formatIDR(item.income) : "Rp 0"}
                             </div>
                           )
                         },
                         {
                           header: "Pengeluaran Seksi",
                           render: (item: any) => (
                             <div className="text-right text-rose-600 tabular-nums">
                               {item.expense > 0 ? formatIDR(item.expense) : "Rp 0"}
                             </div>
                           )
                         },
                         {
                           header: "Saldo Terakumulasi",
                           render: (item: any) => {
                             const balance = item.income - item.expense;
                             return (
                               <div className={`text-right tabular-nums ${balance >= 0 ? "text-slate-800" : "text-rose-600"}`}>
                                 {formatIDR(balance)}
                               </div>
                             );
                           }
                         },
                         {
                           header: "Status Laporan",
                           render: (item: any) => (
                             <div className="flex justify-center">
                               <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider border ${item.statusColor}`}>
                                 {item.status}
                               </span>
                             </div>
                           )
                         },
                         {
                           header: "Aksi",
                           render: (item: any) => (
                             <div className="flex items-center justify-center gap-2">
                               <button 
                                 onClick={() => setSelectedSeksi(item.name)}
                                 className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-black uppercase rounded-lg shadow-sm flex items-center gap-1 transition-colors"
                               >
                                 <Eye className="w-3 h-3" /> Detail
                               </button>
                               {item.status === "Belum Kirim" && (
                                 <button 
                                   onClick={() => showToast(`Pengingat laporan bulanan dikirimkan ke PJ ${item.name}`, "info")}
                                   className="px-3 py-1 bg-amber-500 hover:bg-amber-600 text-white text-[10px] font-black uppercase rounded-lg shadow-sm transition-colors"
                                 >
                                   Kirim Pengingat
                                 </button>
                               )}
                             </div>
                           )
                         }
                       ]}
                       sortOptions={[
                         { label: "Nama Seksi (A-Z)", value: "name-asc", sortFn: (a: any, b: any) => a.name.localeCompare(b.name) },
                         { label: "Nama Seksi (Z-A)", value: "name-desc", sortFn: (a: any, b: any) => b.name.localeCompare(a.name) }
                       ]}
                       defaultSortValue="name-asc"
                     />
                  </div>

               </div>
             </div>
          );
        })()}

      </div>

      <AddTransactionModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={() => fetchFinance()} 
      />

      <TransactionDetailModal 
        isOpen={!!selectedTx}
        transaction={selectedTx}
        onClose={() => setSelectedTx(null)}
        onUpdate={() => fetchFinance()}
        onDelete={handleDelete}
        onRestore={handleRestore}
        isTrashed={showTrashed}
      />

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={closeConfirm}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        type={confirmModal.type}
        confirmLabel={confirmModal.confirmLabel}
      />

      {/* Read-only Seksi Activity Modal */}
      {selectedSeksi && (() => {
        const seksiTxList = data.filter(t => t.category === selectedSeksi);
        const totalIncome = seksiTxList.filter(t => t.type === "Pemasukan").reduce((sum, t) => sum + t.amount, 0);
        const totalExpense = seksiTxList.filter(t => t.type === "Pengeluaran").reduce((sum, t) => sum + t.amount, 0);
        const balance = totalIncome - totalExpense;

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <div className="bg-white rounded-3xl border border-slate-100 shadow-2xl w-full max-w-4xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              <div className="px-8 py-6 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="font-extrabold text-slate-800 text-lg">Aktifitas Keuangan: {selectedSeksi}</h3>
                  <p className="text-xs text-slate-400 uppercase tracking-widest font-black mt-1">Laporan Real-time & Read-only</p>
                </div>
                <button 
                  onClick={() => setSelectedSeksi(null)}
                  className="px-4 py-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all font-black text-xs uppercase"
                >
                  Tutup
                </button>
              </div>

              <div className="p-8 space-y-6">
                {/* Stats Summary */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-2xl">
                    <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Total Pemasukan</p>
                    <h4 className="text-xl font-black text-emerald-800 mt-1">{formatIDR(totalIncome)}</h4>
                  </div>
                  <div className="bg-rose-50 border border-rose-100 p-4 rounded-2xl">
                    <p className="text-[10px] font-bold text-rose-600 uppercase tracking-widest">Total Pengeluaran</p>
                    <h4 className="text-xl font-black text-rose-800 mt-1">{formatIDR(totalExpense)}</h4>
                  </div>
                  <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-2xl">
                    <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest">Saldo Keuangan</p>
                    <h4 className="text-xl font-black text-indigo-805 mt-1">{formatIDR(balance)}</h4>
                  </div>
                </div>

                {/* Transactions list */}
                
                  <div className="bg-white rounded-2xl border border-slate-150 overflow-hidden">
                     <DataTable 
                       data={seksiTxList}
                       columns={[
                         {
                           header: "Tanggal",
                           render: (t: Transaction) => (
                             <div className="text-slate-500 whitespace-nowrap">
                               {new Date(t.date).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                             </div>
                           )
                         },
                         {
                           header: "Tipe",
                           render: (t: Transaction) => (
                             <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${
                               t.type === 'Pemasukan' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                             }`}>
                               {t.type}
                             </span>
                           )
                         },
                         {
                           header: "Keterangan",
                           render: (t: Transaction) => (
                             <div className="text-slate-800 font-bold">{t.description}</div>
                           )
                         },
                         {
                           header: "Bukti",
                           render: (t: Transaction) => (
                             <div className="flex justify-center">
                               {t.proof_url ? (
                                 <a 
                                   href={t.proof_url} 
                                   target="_blank" 
                                   rel="noopener noreferrer" 
                                   className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-2 py-1 rounded hover:underline"
                                 >
                                   Lihat Bukti
                                 </a>
                               ) : (
                                 <span className="text-[10px] text-slate-300">N/A</span>
                               )}
                             </div>
                           )
                         },
                         {
                           header: "Jumlah",
                           render: (t: Transaction) => (
                             <div className={`flex justify-end font-black tabular-nums ${
                               t.type === 'Pemasukan' ? 'text-emerald-600' : 'text-rose-600'
                             }`}>
                               {t.type === 'Pemasukan' ? '+' : '-'} {formatIDR(t.amount).replace("Rp", "").trim()}
                             </div>
                           )
                         }
                       ]}
                       sortOptions={[
                         { label: "Terbaru", value: "date-desc", sortFn: (a: Transaction, b: Transaction) => new Date(b.date).getTime() - new Date(a.date).getTime() },
                         { label: "Terlama", value: "date-asc", sortFn: (a: Transaction, b: Transaction) => new Date(a.date).getTime() - new Date(b.date).getTime() }
                       ]}
                       defaultSortValue="date-desc"
                       emptyMessage="Belum ada aktifitas transaksi untuk seksi ini."
                     />
                  </div>
  
              </div>
            </div>
          </div>
        );
      })()}
    </>
  );
}

