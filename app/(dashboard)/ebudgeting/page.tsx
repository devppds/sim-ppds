"use client";

import { useState, useEffect } from "react";
import { Plus, Search, FileText, CheckCircle, XCircle, Clock, ChevronRight, Eye, Send, FileSignature, Sparkles, Trash2, Banknote } from "lucide-react";
import { useToast } from "@/components/Toast";
import { useRouter } from "next/navigation";

interface Budget {
  id: number;
  seksi_pengaju: string;
  judul: string;
  total_anggaran: number;
  status: "Draft" | "Diajukan" | "Disetujui Ketua" | "Ditolak";
  catatan: string;
  created_at: string;
}

interface BudgetItem {
  id: number;
  budget_id: number;
  nama_item: string;
  qty: number;
  satuan: string;
  harga_satuan: number;
  total_harga: number;
  keterangan: string;
}

export default function EBudgetingPage() {
  const [session, setSession] = useState<any>(null);
  const [budgetList, setBudgetList] = useState<Budget[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewDetailId, setViewDetailId] = useState<number | null>(null);
  
  // Form State
  const [judul, setJudul] = useState("");
  const [catatan, setCatatan] = useState("");
  const [items, setItems] = useState<Omit<BudgetItem, 'id' | 'budget_id'>[]>([
    { nama_item: "", qty: 1, satuan: "pcs", harga_satuan: 0, total_harga: 0, keterangan: "" }
  ]);

  const { showToast } = useToast();
  const router = useRouter();

  useEffect(() => {
    fetch("/api/auth/session")
      .then(res => res.json())
      .then((data: any) => {
        if (!data.success || !data.session) router.push("/login");
        else setSession(data.session);
      });
      
    const mockData: Budget[] = [
      { id: 1, seksi_pengaju: "Keamanan", judul: "RAB Operasional Keamanan Bulan Ini", total_anggaran: 1500000, status: "Diajukan", catatan: "-", created_at: new Date().toISOString() },
      { id: 2, seksi_pengaju: "Pendidikan", judul: "Pengadaan Alat Tulis Kelas", total_anggaran: 3200000, status: "Disetujui Ketua", catatan: "Sudah di acc", created_at: new Date().toISOString() },
      { id: 3, seksi_pengaju: "Media", judul: "Sewa Server Web & Domain", total_anggaran: 2000000, status: "Diajukan", catatan: "Segera", created_at: new Date().toISOString() },
      { id: 4, seksi_pengaju: "PLP", judul: "Perbaikan Pompa Air Asrama A", total_anggaran: 850000, status: "Diajukan", catatan: "Mendesak", created_at: new Date().toISOString() }
    ];
    setBudgetList(mockData);
  }, [router]);

  if (!session) return <div className="p-8 text-slate-500 animate-pulse text-center font-medium">Memuat E-Budgeting...</div>;

  const role = session.role;
  const isKetua = role.startsWith("Ketua") || role === "Mudir";
  const isSekretaris = role.startsWith("Sekretaris");
  const isDewanHarian = isKetua || isSekretaris;

  const getSubordinateSections = (r: string) => {
    if (r === 'Ketua Umum' || r === 'Sekretaris Umum') return ['Keuangan', 'Pembangunan', 'BUMP', 'Media'];
    if (r === 'Ketua 1' || r === 'Sekretaris 1') return ['Wajar', 'Humasy', 'Jam\'iyyah', 'Blok'];
    if (r === 'Ketua 2' || r === 'Sekretaris 2') return ['Keamanan', 'Kesehatan', 'PLP', 'Media'];
    if (r === 'Ketua 3' || r === 'Sekretaris 3') return ['Pendidikan', 'Takmir', 'KBR'];
    return [];
  };

  const subordinates = getSubordinateSections(role);
  
  const displayList = budgetList.filter(b => {
    if (isDewanHarian) return subordinates.includes(b.seksi_pengaju);
    return b.seksi_pengaju === role;
  }).filter(b => b.judul.toLowerCase().includes(searchQuery.toLowerCase()) || b.seksi_pengaju.toLowerCase().includes(searchQuery.toLowerCase()));

  const handleAddItem = () => {
    setItems([...items, { nama_item: "", qty: 1, satuan: "pcs", harga_satuan: 0, total_harga: 0, keterangan: "" }]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const handleItemChange = (index: number, field: keyof BudgetItem, value: string | number) => {
    const newItems = [...items];
    (newItems[index] as any)[field] = value;
    if (field === 'qty' || field === 'harga_satuan') {
      newItems[index].total_harga = newItems[index].qty * newItems[index].harga_satuan;
    }
    setItems(newItems);
  };

  const handleSubmitRab = (e: React.FormEvent) => {
    e.preventDefault();
    if (!judul) return showToast("Judul RAB wajib diisi", "warning");
    
    const total = items.reduce((acc, curr) => acc + curr.total_harga, 0);
    const newRab: Budget = {
      id: Date.now(),
      seksi_pengaju: role,
      judul,
      total_anggaran: total,
      status: "Diajukan",
      catatan,
      created_at: new Date().toISOString()
    };
    
    setBudgetList([newRab, ...budgetList]);
    setIsModalOpen(false);
    showToast("RAB berhasil diajukan ke Dewan Harian!", "success");
    setJudul("");
    setCatatan("");
    setItems([{ nama_item: "", qty: 1, satuan: "pcs", harga_satuan: 0, total_harga: 0, keterangan: "" }]);
  };

  const handleAction = (id: number, action: "Disetujui Ketua" | "Ditolak") => {
    setBudgetList(prev => prev.map(b => b.id === id ? { ...b, status: action } : b));
    showToast(`Pengajuan ${action}`, action === "Disetujui Ketua" ? "success" : "error");
    setViewDetailId(null);
  };

  const formatRp = (num: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(num);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1400px] mx-auto space-y-8 min-h-screen">
      {/* Header Premium */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 bg-linear-to-r from-slate-900 via-indigo-900 to-slate-900 p-8 rounded-4xl shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 text-indigo-200 text-xs font-black uppercase tracking-widest mb-4">
            <Sparkles className="w-3.5 h-3.5 text-indigo-300" /> E-Budgeting Pro
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight leading-tight">Pengajuan Anggaran</h1>
          <p className="text-indigo-200/80 mt-2 font-medium max-w-xl">
            {isDewanHarian ? `Panel Eksekutif & Approval untuk ${role}` : `Kelola dan pantau seluruh pengajuan anggaran Seksi ${role}`}
          </p>
        </div>
        {!isDewanHarian && (
          <button 
            onClick={() => setIsModalOpen(true)}
            className="group relative px-6 py-3.5 bg-white text-indigo-900 hover:bg-indigo-50 font-black rounded-2xl flex items-center gap-3 transition-all duration-300 shadow-[0_0_40px_rgba(255,255,255,0.2)] hover:shadow-[0_0_60px_rgba(255,255,255,0.4)] hover:-translate-y-1 z-10 overflow-hidden"
          >
            <div className="absolute inset-0 bg-linear-to-r from-indigo-100 to-white opacity-0 group-hover:opacity-100 transition-opacity" />
            <Plus className="w-5 h-5 relative z-10" /> 
            <span className="relative z-10">Ajukan RAB Baru</span>
          </button>
        )}
      </div>

      {/* Main Content */}
      <div className="bg-white/80 backdrop-blur-xl rounded-4xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-200/60 overflow-hidden">
        <div className="p-6 border-b border-slate-200/60 flex flex-col sm:flex-row justify-between items-center gap-4 bg-slate-50/50">
          <h2 className="font-black text-slate-800 text-xl flex items-center gap-2">
            <Banknote className="w-6 h-6 text-emerald-500" /> Daftar RAB
          </h2>
          <div className="relative w-full sm:w-80 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
            <input 
              type="text"
              placeholder="Cari judul atau seksi..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-medium text-slate-700 placeholder:text-slate-400 focus:outline-hidden focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all shadow-xs"
            />
          </div>
        </div>

        <div className="overflow-x-auto p-2">
          {displayList.length === 0 ? (
            <div className="p-16 text-center">
              <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <FileText className="w-10 h-10 text-slate-300" />
              </div>
              <h3 className="text-lg font-bold text-slate-700 mb-1">Belum Ada Pengajuan</h3>
              <p className="text-slate-500">Daftar pengajuan anggaran akan muncul di sini.</p>
            </div>
          ) : (
            <table className="w-full text-sm border-separate border-spacing-y-2 px-4">
              <thead>
                <tr className="text-xs text-slate-400 font-bold uppercase tracking-wider text-left">
                  <th className="px-6 py-3 font-semibold">Judul Pengajuan</th>
                  <th className="px-6 py-3 font-semibold">Seksi</th>
                  <th className="px-6 py-3 font-semibold">Total Anggaran</th>
                  <th className="px-6 py-3 font-semibold">Tanggal</th>
                  <th className="px-6 py-3 font-semibold">Status</th>
                  <th className="px-6 py-3 font-semibold text-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {displayList.map(b => (
                  <tr key={b.id} className="group bg-white hover:bg-indigo-50/50 transition-all duration-200 rounded-2xl shadow-xs border border-slate-100">
                    <td className="px-6 py-4 rounded-l-2xl">
                      <div className="font-bold text-slate-800 text-base">{b.judul}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="inline-flex items-center px-3 py-1 rounded-lg bg-slate-100 text-slate-600 font-semibold text-xs">
                        {b.seksi_pengaju}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-emerald-600 font-black text-base">{formatRp(b.total_anggaran)}</div>
                    </td>
                    <td className="px-6 py-4 text-slate-500 font-medium">
                      {new Date(b.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-6 py-4">
                      <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-black uppercase tracking-wider border ${
                        b.status === 'Disetujui Ketua' ? 'bg-emerald-50 text-emerald-600 border-emerald-200/50' :
                        b.status === 'Ditolak' ? 'bg-rose-50 text-rose-600 border-rose-200/50' :
                        'bg-amber-50 text-amber-600 border-amber-200/50'
                      }`}>
                        {b.status === 'Disetujui Ketua' && <CheckCircle className="w-3.5 h-3.5" />}
                        {b.status === 'Ditolak' && <XCircle className="w-3.5 h-3.5" />}
                        {b.status === 'Diajukan' && <Clock className="w-3.5 h-3.5" />}
                        {b.status}
                      </div>
                    </td>
                    <td className="px-6 py-4 rounded-r-2xl text-right">
                      <button onClick={() => setViewDetailId(b.id)} className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-slate-50 text-indigo-600 hover:bg-indigo-600 hover:text-white transition-colors">
                        <Eye className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Modern Form Modal */}
      {isModalOpen && !isDewanHarian && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setIsModalOpen(false)} />
          
          <div className="relative w-full max-w-4xl bg-white rounded-4xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
            {/* Modal Header */}
            <div className="px-8 py-6 bg-white border-b border-slate-100 flex justify-between items-center shrink-0">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600">
                  <FileSignature className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-black text-xl text-slate-800">Form Pengajuan RAB</h3>
                  <p className="text-sm text-slate-500 font-medium">Buat rincian anggaran baru untuk seksi Anda.</p>
                </div>
              </div>
              <button type="button" onClick={() => setIsModalOpen(false)} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            
            {/* Form Body */}
            <form id="rab-form" onSubmit={handleSubmitRab} className="flex-1 overflow-y-auto custom-scrollbar p-8 space-y-8 bg-slate-50/30">
              
              {/* General Info */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-xs space-y-5">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Judul Pengajuan <span className="text-rose-500">*</span></label>
                  <input 
                    type="text" 
                    value={judul}
                    onChange={(e) => setJudul(e.target.value)}
                    placeholder="Contoh: Pembelian Inventaris Kebersihan Bulanan"
                    className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 font-medium text-slate-800 transition-all"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Catatan Tambahan</label>
                  <textarea 
                    value={catatan}
                    onChange={(e) => setCatatan(e.target.value)}
                    placeholder="Berikan alasan atau urgensi pengajuan ini..."
                    className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 text-slate-700 h-24 resize-none transition-all"
                  />
                </div>
              </div>

              {/* Items Table */}
              <div className="bg-white rounded-2xl border border-slate-200/60 shadow-xs overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                  <label className="text-sm font-bold text-slate-800 flex items-center gap-2">
                    <Banknote className="w-4 h-4 text-emerald-500" /> Rincian Kebutuhan
                  </label>
                  <button type="button" onClick={handleAddItem} className="px-4 py-2 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 font-bold text-xs rounded-lg transition-colors flex items-center gap-2">
                    <Plus className="w-4 h-4" /> Tambah Baris
                  </button>
                </div>
                
                <div className="p-4 overflow-x-auto">
                  <table className="w-full text-sm min-w-[600px]">
                    <thead>
                      <tr className="text-xs text-slate-400 font-bold uppercase tracking-wider text-left border-b border-slate-100">
                        <th className="pb-3 px-2">Nama Barang / Deskripsi</th>
                        <th className="pb-3 px-2 w-24">Qty</th>
                        <th className="pb-3 px-2 w-40">Harga Satuan</th>
                        <th className="pb-3 px-2 w-48">Total</th>
                        <th className="pb-3 px-2 w-12"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {items.map((item, idx) => (
                        <tr key={idx} className="group">
                          <td className="py-3 px-2">
                            <input type="text" value={item.nama_item} onChange={(e) => handleItemChange(idx, 'nama_item', e.target.value)} className="w-full px-4 py-2.5 bg-slate-50 focus:bg-white border border-slate-200 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none text-sm transition-all" placeholder="Nama item" required />
                          </td>
                          <td className="py-3 px-2">
                            <input type="number" min="1" value={item.qty} onChange={(e) => handleItemChange(idx, 'qty', parseInt(e.target.value)||0)} className="w-full px-4 py-2.5 bg-slate-50 focus:bg-white border border-slate-200 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none text-sm transition-all" required />
                          </td>
                          <td className="py-3 px-2 relative">
                            <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">Rp</span>
                            <input type="number" min="0" value={item.harga_satuan} onChange={(e) => handleItemChange(idx, 'harga_satuan', parseInt(e.target.value)||0)} className="w-full pl-10 pr-4 py-2.5 bg-slate-50 focus:bg-white border border-slate-200 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none text-sm transition-all" required />
                          </td>
                          <td className="py-3 px-4 font-black text-emerald-600 bg-emerald-50/30 rounded-lg">
                            {formatRp(item.total_harga)}
                          </td>
                          <td className="py-3 px-2 text-right">
                            <button type="button" onClick={() => handleRemoveItem(idx)} className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors" title="Hapus Baris">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="bg-slate-800 p-6 flex items-center justify-between text-white rounded-b-2xl">
                  <div className="text-slate-400 text-sm font-medium">Total keseluruhan anggaran yang diajukan:</div>
                  <div className="text-3xl font-black text-emerald-400 tracking-tight">
                    {formatRp(items.reduce((acc, curr) => acc + curr.total_harga, 0))}
                  </div>
                </div>
              </div>
            </form>

            {/* Modal Footer */}
            <div className="px-8 py-5 bg-white border-t border-slate-100 flex justify-end gap-3 shrink-0">
              <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-3 text-slate-500 font-bold hover:bg-slate-100 rounded-xl text-sm transition-colors">Batal</button>
              <button type="submit" form="rab-form" className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-xl text-sm flex items-center gap-2 transition-all shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/40 hover:-translate-y-0.5">
                <Send className="w-4 h-4" /> Kirim Pengajuan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Detail View Modal (Simple Version for Walkthrough) */}
      {viewDetailId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setViewDetailId(null)} />
          <div className="relative w-full max-w-2xl bg-white rounded-4xl shadow-2xl overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
             {(() => {
               const b = budgetList.find(x => x.id === viewDetailId);
               if (!b) return null;
               return (
                 <>
                  <div className="px-8 py-6 bg-slate-900 text-white flex justify-between items-center">
                    <div>
                      <div className="text-xs font-black text-indigo-400 uppercase tracking-widest mb-1">RAB #{b.id}</div>
                      <h3 className="font-black text-xl">{b.judul}</h3>
                    </div>
                    <button onClick={() => setViewDetailId(null)} className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-rose-500 hover:text-white transition-colors">
                      <XCircle className="w-6 h-6" />
                    </button>
                  </div>
                  <div className="p-8 space-y-6 bg-slate-50/50">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs">
                        <div className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mb-1">Total Anggaran</div>
                        <div className="font-black text-emerald-500 text-2xl">{formatRp(b.total_anggaran)}</div>
                      </div>
                      <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs">
                        <div className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mb-1">Seksi Pengaju</div>
                        <div className="font-bold text-slate-800 text-lg">{b.seksi_pengaju}</div>
                      </div>
                    </div>
                  </div>
                  
                  {isDewanHarian && b.status === "Diajukan" && (
                    <div className="px-8 py-5 bg-white border-t border-slate-100 flex items-center justify-between">
                      <div className="text-xs text-slate-500 font-medium">
                        {isSekretaris ? "Hanya Ketua yang dapat menyetujui RAB." : "Verifikasi pengajuan ini:"}
                      </div>
                      {isKetua && (
                        <div className="flex gap-3">
                          <button onClick={() => handleAction(b.id, "Ditolak")} className="px-5 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold rounded-xl transition-colors">Tolak</button>
                          <button onClick={() => handleAction(b.id, "Disetujui Ketua")} className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-black rounded-xl shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-2">
                            <CheckCircle className="w-5 h-5" /> Setujui
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                 </>
               )
             })()}
          </div>
        </div>
      )}
    </div>
  );
}
