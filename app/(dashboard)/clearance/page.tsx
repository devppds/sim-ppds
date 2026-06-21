"use client";
import { API_BASE_URL } from "@/lib/config";

import { useState, useEffect } from "react";
import { 
  Users, 
  Search, 
  Plus, 
  X, 
  CheckCircle2, 
  AlertOctagon, 
  RefreshCw, 
  ShieldAlert, 
  Wallet, 
  UserCheck, 
  Loader2,
  Clock
} from "lucide-react";

interface ClearanceRequest {
  id: number;
  santri_id: number;
  santri_name: string;
  santri_nisn: string;
  santri_kelas: string;
  santri_asrama: string;
  santri_status: string;
  status_keuangan: 'Clean' | 'Blocked';
  status_keamanan: 'Clean' | 'Blocked';
  acc_mustahiq: 'Pending' | 'Approved' | 'Rejected';
  status_akhir: 'Diajukan' | 'Disetujui' | 'Ditolak';
  catatan_keuangan: string | null;
  catatan_keamanan: string | null;
  catatan_akhir: string | null;
  approved_at: string | null;
  created_at: string;
}

interface Santri {
  id: number;
  name: string;
  nisn: string;
  kelas: string;
  asrama: string;
  status: string;
}

interface SessionData {
  id: number;
  username: string;
  role: string;
  role_level: string;
  name: string;
}

export default function ClearancePage() {
  const [session, setSession] = useState<SessionData | null>(null);
  const [requests, setRequests] = useState<ClearanceRequest[]>([]);
  const [santriList, setSantriList] = useState<Santri[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalLoading, setModalLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [auditLoading, setAuditLoading] = useState<number | null>(null);

  // Modals
  const [isNewRequestOpen, setIsNewRequestOpen] = useState(false);
  const [searchSantri, setSearchSantri] = useState("");
  const [selectedSantriId, setSelectedSantriId] = useState<number | null>(null);

  const [selectedRequest, setSelectedRequest] = useState<ClearanceRequest | null>(null);
  const [overrideForm, setOverrideForm] = useState({
    status_keuangan: 'Clean',
    status_keamanan: 'Clean',
    acc_mustahiq: 'Pending',
    catatan_keuangan: "",
    catatan_keamanan: "",
    catatan_akhir: ""
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [resReq, resSantri] = await Promise.all([
        fetch(`${API_BASE_URL}/api/clearance`),
        fetch(`${API_BASE_URL}/api/santri?limit=100`)
      ]);

      const jsonReq = await resReq.json() as { success: boolean; data: ClearanceRequest[] };
      const jsonSantri = await resSantri.json() as { success: boolean; data: Santri[] };

      if (jsonReq.success) setRequests(jsonReq.data);
      if (jsonSantri.success) setSantriList(jsonSantri.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Fetch Session
    fetch("/api/auth/session")
      .then(res => res.json() as Promise<{ success: boolean; session?: SessionData }>)
      .then(data => {
        if (data.success && data.session) {
          setSession(data.session);
        }
      })
      .catch(e => console.error("Session error:", e));

    fetchData();
  }, []);

  const handleApplyClearance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSantriId) return;
    setModalLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/clearance`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ santri_id: selectedSantriId })
      });
      const json = await res.json() as { success: boolean; error?: string };
      if (json.success) {
        setIsNewRequestOpen(false);
        setSelectedSantriId(null);
        setSearchSantri("");
        fetchData();
      } else {
        alert(json.error || "Gagal membuat pengajuan");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setModalLoading(false);
    }
  };

  const handleRunAutoAudit = async (req: ClearanceRequest) => {
    setAuditLoading(req.id);
    try {
      const res = await fetch(`${API_BASE_URL}/api/clearance/check-status?santri_id=${req.santri_id}`);
      interface AutoAuditResponse {
        success: boolean;
        data: {
          status_keuangan: 'Clean' | 'Blocked';
          status_keamanan: 'Clean' | 'Blocked';
          catatan_keuangan?: string;
          catatan_keamanan?: string;
        };
        error?: string;
      }
      const json = await res.json() as AutoAuditResponse;
      if (json.success) {
        // Refresh request data
        fetchData();
        // If the current request is selected in modal, update it
        if (selectedRequest && selectedRequest.id === req.id) {
          const updated = {
            ...selectedRequest,
            status_keuangan: json.data.status_keuangan,
            status_keamanan: json.data.status_keamanan,
            catatan_keuangan: json.data.catatan_keuangan ?? null,
            catatan_keamanan: json.data.catatan_keamanan ?? null
          };
          setSelectedRequest(updated);
          setOverrideForm(prev => ({
            ...prev,
            status_keuangan: json.data.status_keuangan,
            status_keamanan: json.data.status_keamanan,
            catatan_keuangan: json.data.catatan_keuangan || "",
            catatan_keamanan: json.data.catatan_keamanan || ""
          }));
        }
      } else {
        alert(json.error || "Gagal melakukan audit otomatis");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setAuditLoading(null);
    }
  };

  const handleUpdateCheckpoints = async (statusAkhir?: 'Disetujui' | 'Ditolak') => {
    if (!selectedRequest) return;
    setActionLoading(selectedRequest.id);
    try {
      const payload = {
        ...overrideForm,
        ...(statusAkhir && { status_akhir: statusAkhir })
      };

      const res = await fetch(`${API_BASE_URL}/api/clearance/${selectedRequest.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const json = await res.json() as { success: boolean; error?: string };
      if (json.success) {
        setSelectedRequest(null);
        fetchData();
      } else {
        alert(json.error || "Gagal memperbarui checkpoint");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(null);
    }
  };

  const handleCancelRequest = async (id: number) => {
    if (!confirm("Apakah Anda yakin ingin membatalkan pengajuan boyong ini?")) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/clearance/${id}`, {
        method: "DELETE"
      });
      const json = await res.json() as { success: boolean; error?: string };
      if (json.success) {
        fetchData();
      } else {
        alert(json.error || "Gagal membatalkan pengajuan");
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Filter santri for the select modal
  const filteredSantri = santriList.filter(s => {
    const query = searchSantri.toLowerCase();
    const alreadyRequest = requests.some(r => r.santri_id === s.id);
    return !alreadyRequest && (s.name.toLowerCase().includes(query) || s.nisn.includes(query));
  });

  const getStatusIcon = (status: string) => {
    if (status === 'Clean' || status === 'Approved') {
      return <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />;
    }
    if (status === 'Blocked' || status === 'Rejected') {
      return <AlertOctagon className="w-5 h-5 text-rose-500 shrink-0" />;
    }
    return <Clock className="w-5 h-5 text-amber-500 shrink-0 animate-pulse" />;
  };

  return (
    <>
      <div className="fade-up">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8">
          <div>
            <h1 className="text-2xl font-black text-slate-800 flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-xl shadow-indigo-600/20">
                <UserCheck className="w-6 h-6" />
              </div>
              E-Clearance Boyong Santri
            </h1>
            <p className="text-sm text-slate-500 font-bold mt-1 ml-[60px]">Sistem Validasi Integrasi Checkout Pesantren</p>
          </div>

          <button 
            onClick={() => {
              setIsNewRequestOpen(true);
              setSelectedSantriId(null);
              setSearchSantri("");
            }}
            className="flex items-center gap-2 px-5 py-3 bg-indigo-600 text-white rounded-2xl text-xs font-black shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 transition-all uppercase tracking-widest self-start sm:self-center"
          >
            <Plus className="w-4 h-4" /> Ajukan Boyong
          </button>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-10 h-10 animate-spin text-indigo-600 mb-4" />
            <p className="text-sm font-black text-slate-400 uppercase tracking-widest">Sinkronisasi Data Clearance...</p>
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 overflow-hidden">
            <div className="flex items-center gap-2 mb-6">
              <Users className="w-5 h-5 text-indigo-600" />
              <h2 className="text-sm font-black text-slate-800 uppercase tracking-wider">Antrean Validasi Boyong</h2>
            </div>

            {requests.length === 0 ? (
              <div className="text-center py-16 text-slate-400 font-bold text-xs uppercase tracking-widest italic">
                Belum ada antrean pengajuan clearance
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-wider">
                      <th className="py-4 px-4">Santri / NISN</th>
                      <th className="py-4 px-4">Kelas & Asrama</th>
                      <th className="py-4 px-4 text-center">Keuangan</th>
                      <th className="py-4 px-4 text-center">Keamanan</th>
                      <th className="py-4 px-4 text-center">Mustahiq</th>
                      <th className="py-4 px-4 text-center">Status Akhir</th>
                      <th className="py-4 px-4 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {requests.map((req) => {
                      return (
                        <tr key={req.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                          <td className="py-4 px-4">
                            <div className="font-black text-sm text-slate-800">{req.santri_name}</div>
                            <div className="text-[10px] text-slate-400 font-semibold mt-0.5">NISN: {req.santri_nisn}</div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="text-xs font-black text-slate-600">{req.santri_kelas}</div>
                            <div className="text-[10px] text-slate-400 font-semibold mt-0.5">{req.santri_asrama}</div>
                          </td>
                          <td className="py-4 px-4 text-center">
                            <div className="flex justify-center" title={req.catatan_keuangan || ""}>
                              {getStatusIcon(req.status_keuangan)}
                            </div>
                          </td>
                          <td className="py-4 px-4 text-center">
                            <div className="flex justify-center" title={req.catatan_keamanan || ""}>
                              {getStatusIcon(req.status_keamanan)}
                            </div>
                          </td>
                          <td className="py-4 px-4 text-center">
                            <div className="flex justify-center">
                              {getStatusIcon(req.acc_mustahiq)}
                            </div>
                          </td>
                          <td className="py-4 px-4 text-center">
                            {req.status_akhir === 'Disetujui' ? (
                              <span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-black uppercase tracking-wider">Lolos</span>
                            ) : req.status_akhir === 'Ditolak' ? (
                              <span className="px-3 py-1 bg-rose-50 text-rose-600 rounded-full text-[10px] font-black uppercase tracking-wider">Ditolak</span>
                            ) : (
                              <span className="px-3 py-1 bg-amber-50 text-amber-600 rounded-full text-[10px] font-black uppercase tracking-wider animate-pulse">Proses</span>
                            )}
                          </td>
                          <td className="py-4 px-4 text-right">
                            <div className="flex justify-end items-center gap-2">
                              <button 
                                onClick={() => handleRunAutoAudit(req)}
                                disabled={auditLoading === req.id || req.status_akhir === 'Disetujui'}
                                className="p-2 bg-slate-50 hover:bg-indigo-50 hover:text-indigo-600 text-slate-400 rounded-xl transition-all border border-slate-100 disabled:opacity-50"
                                title="Jalankan Audit Otomatis"
                              >
                                {auditLoading === req.id ? (
                                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                ) : (
                                  <RefreshCw className="w-3.5 h-3.5" />
                                )}
                              </button>

                              <button 
                                onClick={() => {
                                  setSelectedRequest(req);
                                  setOverrideForm({
                                    status_keuangan: req.status_keuangan,
                                    status_keamanan: req.status_keamanan,
                                    acc_mustahiq: req.acc_mustahiq,
                                    catatan_keuangan: req.catatan_keuangan || "",
                                    catatan_keamanan: req.catatan_keamanan || "",
                                    catatan_akhir: req.catatan_akhir || ""
                                  });
                                }}
                                className="px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-xl text-[10px] font-black uppercase tracking-widest border border-indigo-100 hover:bg-indigo-100 transition-all"
                              >
                                Detail Checkpoint
                              </button>

                              {req.status_akhir !== 'Disetujui' && (
                                <button 
                                  onClick={() => handleCancelRequest(req.id)}
                                  className="p-2 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-xl transition-all"
                                  title="Batalkan Pengajuan"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* New Request Modal */}
      {isNewRequestOpen && (
        <div className="fixed inset-0 z-200 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300 text-text-main">
          <div className="bg-white w-full max-w-md rounded-[32px] shadow-2xl overflow-hidden scale-in-center flex flex-col max-h-[85vh]">
            <div className="p-6 border-b border-slate-50 flex items-center justify-between shrink-0">
              <h3 className="text-lg font-black text-slate-800 uppercase tracking-wider">Ajukan Boyong Santri</h3>
              <button onClick={() => setIsNewRequestOpen(false)} className="p-2 rounded-full hover:bg-slate-100 text-slate-400 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 flex-1 flex flex-col gap-4 overflow-hidden">
              <div className="relative shrink-0">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Cari nama santri atau NISN..." 
                  value={searchSantri}
                  onChange={(e) => setSearchSantri(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 outline-none transition-all"
                />
              </div>

              <div className="flex-1 overflow-y-auto space-y-2 border border-slate-100 p-2 rounded-2xl min-h-[200px]">
                {filteredSantri.length === 0 ? (
                  <div className="text-center py-12 text-xs text-slate-300 font-black uppercase tracking-widest italic">
                    Santri tidak ditemukan
                  </div>
                ) : (
                  filteredSantri.map((s) => (
                    <div 
                      key={s.id} 
                      onClick={() => setSelectedSantriId(s.id)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                        selectedSantriId === s.id 
                          ? "bg-indigo-50 border-indigo-200" 
                          : "border-transparent hover:bg-slate-50"
                      }`}
                    >
                      <div>
                        <p className="text-xs font-black text-slate-800">{s.name}</p>
                        <p className="text-[10px] text-slate-400 font-semibold mt-0.5">NISN: {s.nisn} | Kamar: {s.asrama}</p>
                      </div>
                      <span className="text-[9px] font-black text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md uppercase">{s.kelas}</span>
                    </div>
                  ))
                )}
              </div>

              <button 
                onClick={handleApplyClearance}
                disabled={!selectedSantriId || modalLoading}
                className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-xs font-black transition-all active:scale-95 shadow-lg shadow-indigo-600/10 uppercase tracking-widest mt-4 shrink-0 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {modalLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Kirim Pengajuan"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Details & Checkpoint Override Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 z-200 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300 text-text-main">
          <div className="bg-white w-full max-w-lg rounded-[32px] shadow-2xl overflow-hidden scale-in-center flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-slate-50 flex items-center justify-between shrink-0">
              <div>
                <h3 className="text-lg font-black text-slate-800 uppercase tracking-wider">Checkpoint Clearance</h3>
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-0.5">
                  Santri: {selectedRequest.santri_name}
                </p>
              </div>
              <button onClick={() => setSelectedRequest(null)} className="p-2 rounded-full hover:bg-slate-100 text-slate-400 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 flex-1 overflow-y-auto space-y-6">
              {/* Auto audit status banner */}
              <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                <div>
                  <h4 className="text-xs font-black text-slate-800">Verifikasi Terintegrasi (Real-time)</h4>
                  <p className="text-[9px] text-slate-400 uppercase tracking-widest mt-0.5">Sinkronkan status tagihan SPP & Pelanggaran</p>
                </div>
                <button 
                  onClick={() => handleRunAutoAudit(selectedRequest)}
                  disabled={auditLoading === selectedRequest.id}
                  className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 shadow-md shadow-indigo-600/10 transition-all"
                >
                  {auditLoading === selectedRequest.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Uji Validasi"}
                </button>
              </div>

              {/* Checkpoint Item 1: Keuangan */}
              <div className="p-5 rounded-2xl border border-slate-100 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center shrink-0">
                    <Wallet className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-xs font-black text-slate-800 leading-none">Checkpoint 1: Keuangan & SPP</h4>
                    <p className="text-[9px] text-slate-400 font-semibold mt-1">Harus lunas tagihan triwulan Syawal/Maulid/Rajab</p>
                  </div>
                  <div>
                    {getStatusIcon(overrideForm.status_keuangan)}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-50">
                  <div>
                    <label className="block text-[9px] font-black text-slate-400 uppercase tracking-wider mb-1.5">Override Status</label>
                    <select 
                      value={overrideForm.status_keuangan}
                      onChange={(e) => setOverrideForm({ ...overrideForm, status_keuangan: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold outline-none"
                    >
                      <option value="Clean">Lolos</option>
                      <option value="Blocked">Terhambat</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[9px] font-black text-slate-400 uppercase tracking-wider mb-1.5">Catatan Keuangan</label>
                    <input 
                      type="text"
                      value={overrideForm.catatan_keuangan}
                      onChange={(e) => setOverrideForm({ ...overrideForm, catatan_keuangan: e.target.value })}
                      placeholder="Contoh: Bebas tunggakan"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Checkpoint Item 2: Keamanan */}
              <div className="p-5 rounded-2xl border border-slate-100 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-rose-50 text-rose-600 rounded-lg flex items-center justify-center shrink-0">
                    <ShieldAlert className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-xs font-black text-slate-800 leading-none">Checkpoint 2: Keamanan & Inventaris</h4>
                    <p className="text-[9px] text-slate-400 font-semibold mt-1">Bebas pelanggaran aktif & semua aset pinjaman dikembalikan</p>
                  </div>
                  <div>
                    {getStatusIcon(overrideForm.status_keamanan)}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-50">
                  <div>
                    <label className="block text-[9px] font-black text-slate-400 uppercase tracking-wider mb-1.5">Override Status</label>
                    <select 
                      value={overrideForm.status_keamanan}
                      onChange={(e) => setOverrideForm({ ...overrideForm, status_keamanan: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold outline-none"
                    >
                      <option value="Clean">Lolos</option>
                      <option value="Blocked">Terhambat</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[9px] font-black text-slate-400 uppercase tracking-wider mb-1.5">Catatan Keamanan</label>
                    <input 
                      type="text"
                      value={overrideForm.catatan_keamanan}
                      onChange={(e) => setOverrideForm({ ...overrideForm, catatan_keamanan: e.target.value })}
                      placeholder="Contoh: Bersih pelanggaran"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Checkpoint Item 3: Mustahiq */}
              <div className="p-5 rounded-2xl border border-slate-100 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-amber-50 text-amber-600 rounded-lg flex items-center justify-center shrink-0">
                    <UserCheck className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-xs font-black text-slate-800 leading-none">Checkpoint 3: ACC Mustahiq / Wali Kelas</h4>
                    <p className="text-[9px] text-slate-400 font-semibold mt-1">Persetujuan tertulis dari pengawas blok asrama/mustahiq</p>
                  </div>
                  <div>
                    {getStatusIcon(overrideForm.acc_mustahiq)}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-50">
                  <div>
                    <label className="block text-[9px] font-black text-slate-400 uppercase tracking-wider mb-1.5">Status Persetujuan</label>
                    <select 
                      value={overrideForm.acc_mustahiq}
                      onChange={(e) => setOverrideForm({ ...overrideForm, acc_mustahiq: e.target.value as 'Pending' | 'Approved' | 'Rejected' })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold outline-none"
                    >
                      <option value="Pending">Ditangguhkan</option>
                      <option value="Approved">Disetujui</option>
                      <option value="Rejected">Ditolak</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[9px] font-black text-slate-400 uppercase tracking-wider mb-1.5">Catatan Akhir / Surat Boyong</label>
                    <input 
                      type="text"
                      value={overrideForm.catatan_akhir}
                      onChange={(e) => setOverrideForm({ ...overrideForm, catatan_akhir: e.target.value })}
                      placeholder="Alasan kepindahan/boyong..."
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-slate-50 bg-slate-50/50 flex flex-col md:flex-row justify-between items-center gap-4 shrink-0">
              <button 
                onClick={() => handleUpdateCheckpoints()}
                disabled={actionLoading !== null}
                className="w-full md:w-auto px-6 py-3 bg-white border border-slate-200 rounded-2xl text-xs font-black text-slate-600 hover:bg-slate-50 transition-all active:scale-95 uppercase tracking-widest disabled:opacity-50"
              >
                Simpan Draft Checkpoint
              </button>

              {["ROOT", "SEKRETARIAT"].includes(session?.role_level || "") && selectedRequest.status_akhir !== 'Disetujui' && (
                <button 
                  onClick={() => handleUpdateCheckpoints('Disetujui')}
                  disabled={
                    overrideForm.status_keuangan !== 'Clean' || 
                    overrideForm.status_keamanan !== 'Clean' || 
                    overrideForm.acc_mustahiq !== 'Approved' || 
                    actionLoading !== null
                  }
                  className="w-full md:w-auto px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs font-black transition-all active:scale-95 shadow-lg shadow-emerald-600/10 uppercase tracking-widest disabled:opacity-30 disabled:pointer-events-none flex items-center justify-center gap-2"
                >
                  {actionLoading !== null ? <Loader2 className="w-4 h-4 animate-spin" /> : "Setujui & Rilis Boyong"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

