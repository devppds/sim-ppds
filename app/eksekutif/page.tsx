"use client";
import { API_BASE_URL } from "@/lib/config";

import { useState, useEffect, useCallback } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import StatCard from "@/components/StatCard";
import { 
  ShieldCheck, 
  Calendar, 
  Plus, 
  TrendingUp, 
  FileCheck, 
  Clock, 
  X, 
  MapPin, 
  Trash2, 
  Loader2, 
  Edit2
} from "lucide-react";

interface Approval {
  id: number;
  requester: string;
  title: string;
  description: string;
  amount: number | null;
  status: 'Pending' | 'Disetujui' | 'Ditolak';
  approver: 'Ketua Umum' | 'Ketua I' | 'Ketua II' | 'Ketua III';
  catatan?: string;
  created_at: string;
}

interface Agenda {
  id: number;
  title: string;
  description: string;
  date: string;
  time_start: string | null;
  time_end: string | null;
  location: string;
}

interface SessionData {
  id: number;
  username: string;
  role: string;
  role_level: string;
  name: string;
}

export default function EksekutifPage() {
  interface ChartDataPoint {
    label: string;
    income: number;
    expense: number;
  }

  const [session, setSession] = useState<SessionData | null>(null);
  const [approvals, setApprovals] = useState<Approval[]>([]);
  const [agendaList, setAgendaList] = useState<Agenda[]>([]);
  const [summaryData, setSummaryData] = useState<{ total_income: number; total_expense: number; balance: number; chart_data: ChartDataPoint[] } | null>(null);
  
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  
  // Modal states
  const [isAgendaModalOpen, setIsAgendaModalOpen] = useState(false);
  const [editingAgenda, setEditingAgenda] = useState<Agenda | null>(null);
  const [agendaForm, setAgendaForm] = useState({
    title: "",
    description: "",
    date: "",
    time_start: "",
    time_end: "",
    location: ""
  });

  const [reviewApproval, setReviewApproval] = useState<Approval | null>(null);
  const [reviewNote, setReviewNote] = useState("");

  // Stat card SVGs
  const ICONS = {
    check: `<polyline points="20 6 9 17 4 12"></polyline>`,
    calendar: `<rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line>`,
    trendingUp: `<polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline>`,
    clock: `<circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline>`,
  };

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    try {
      let approvalUrl = `${API_BASE_URL}/api/eksekutif/approvals`;
      const isPimpinan = ["Ketua Umum", "Ketua I", "Ketua II", "Ketua III"].includes(session?.role || "");
      if (isPimpinan) {
        approvalUrl += `?approver=${encodeURIComponent(session?.role || "")}`;
      }

      const [resAppr, resAgenda, resSum] = await Promise.all([
        fetch(approvalUrl),
        fetch(`${API_BASE_URL}/api/eksekutif/calendar`),
        fetch(`${API_BASE_URL}/api/eksekutif/summary`)
      ]);

      const jsonAppr = await resAppr.json() as { success: boolean; data: Approval[] };
      const jsonAgenda = await resAgenda.json() as { success: boolean; data: Agenda[] };
      const jsonSum = await resSum.json() as { success: boolean; data: { total_income: number; total_expense: number; balance: number; chart_data: ChartDataPoint[] } };

      if (jsonAppr.success) setApprovals(jsonAppr.data);
      if (jsonAgenda.success) setAgendaList(jsonAgenda.data);
      if (jsonSum.success) setSummaryData(jsonSum.data);
    } catch (e) {
      console.error("Failed to load Executive Dashboard data:", e);
    } finally {
      setLoading(false);
    }
  }, [session]);

  useEffect(() => {
    // 1. Fetch Session
    fetch("/api/auth/session")
      .then(res => res.json() as Promise<{ success: boolean; session?: SessionData }>)
      .then(data => {
        if (data.success && data.session) {
          setSession(data.session);
        }
      })
      .catch(e => console.error("Session error:", e));
  }, []);

  useEffect(() => {
    if (session) {
      fetchDashboardData();
    }
  }, [session, fetchDashboardData]);

  // fetchDashboardData is defined via useCallback above.

  const handleCreateOrUpdateAgenda = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingAgenda 
        ? `${API_BASE_URL}/api/eksekutif/calendar/${editingAgenda.id}`
        : `${API_BASE_URL}/api/eksekutif/calendar`;
      const method = editingAgenda ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(agendaForm)
      });
      const json = await res.json() as { success: boolean; error?: string };
      if (json.success) {
        setIsAgendaModalOpen(false);
        setEditingAgenda(null);
        setAgendaForm({ title: "", description: "", date: "", time_start: "", time_end: "", location: "" });
        fetchDashboardData();
      } else {
        alert(json.error || "Gagal menyimpan agenda");
      }
    } catch (err) {
      console.error("Agenda save error:", err);
    }
  };

  const handleDeleteAgenda = async (id: number) => {
    if (!confirm("Apakah Anda yakin ingin menghapus agenda ini?")) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/eksekutif/calendar/${id}`, {
        method: "DELETE"
      });
      const json = await res.json() as { success: boolean; error?: string };
      if (json.success) {
        fetchDashboardData();
      } else {
        alert(json.error || "Gagal menghapus agenda");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleProcessApproval = async (status: 'Disetujui' | 'Ditolak') => {
    if (!reviewApproval) return;
    setActionLoading(reviewApproval.id);
    try {
      const res = await fetch(`${API_BASE_URL}/api/eksekutif/approvals/${reviewApproval.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, catatan: reviewNote })
      });
      const json = await res.json() as { success: boolean; error?: string };
      if (json.success) {
        setReviewApproval(null);
        setReviewNote("");
        fetchDashboardData();
      } else {
        alert(json.error || "Gagal memproses persetujuan");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Disetujui':
        return <span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-black uppercase tracking-wider">Disetujui</span>;
      case 'Ditolak':
        return <span className="px-3 py-1 bg-rose-50 text-rose-600 rounded-full text-[10px] font-black uppercase tracking-wider">Ditolak</span>;
      default:
        return <span className="px-3 py-1 bg-amber-50 text-amber-600 rounded-full text-[10px] font-black uppercase tracking-wider animate-pulse">Menunggu</span>;
    }
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val);
  };

  const pendingApprovalsCount = approvals.filter(a => a.status === 'Pending').length;

  return (
    <DashboardLayout>
      <div className="fade-up">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8">
          <div>
            <h1 className="text-2xl font-black text-slate-800 flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-xl shadow-indigo-600/20">
                <ShieldCheck className="w-6 h-6" />
              </div>
              Pusat Kendali Eksekutif
            </h1>
            <p className="text-sm text-slate-500 font-bold mt-1 ml-[60px]">Dasbor & E-Approval Dewan Harian Pimpinan</p>
          </div>
          
          {["ROOT", "SEKRETARIAT"].includes(session?.role_level || "") && (
            <button 
              onClick={() => {
                setEditingAgenda(null);
                setAgendaForm({ title: "", description: "", date: "", time_start: "", time_end: "", location: "" });
                setIsAgendaModalOpen(true);
              }}
              className="flex items-center gap-2 px-5 py-3 bg-indigo-600 text-white rounded-2xl text-xs font-black shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 transition-all uppercase tracking-widest self-start sm:self-center"
            >
              <Plus className="w-4 h-4" /> Tambah Agenda
            </button>
          )}
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-10 h-10 animate-spin text-indigo-600 mb-4" />
            <p className="text-sm font-black text-slate-400 uppercase tracking-widest">Sinkronisasi Log Eksekutif...</p>
          </div>
        ) : (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <StatCard
                iconBg="bg-indigo-50"
                iconColor="text-indigo-600"
                iconSvgPath={ICONS.clock}
                badge={pendingApprovalsCount > 0 ? `${pendingApprovalsCount} Baru` : "Clear"}
                badgeColor={pendingApprovalsCount > 0 ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"}
                value={pendingApprovalsCount.toString()}
                label="Persetujuan Pending"
                delay={1}
              />
              <StatCard
                iconBg="bg-emerald-50"
                iconColor="text-emerald-600"
                iconSvgPath={ICONS.trendingUp}
                badge="Net Cash"
                badgeColor="bg-emerald-100 text-emerald-700"
                value={summaryData ? formatCurrency(summaryData.balance) : "..."}
                label="Saldo Kas Pondok"
                delay={2}
              />
              <StatCard
                iconBg="bg-rose-50"
                iconColor="text-rose-600"
                iconSvgPath={ICONS.trendingUp}
                badge="Pengeluaran"
                badgeColor="bg-rose-100 text-rose-700"
                value={summaryData ? formatCurrency(summaryData.total_expense) : "..."}
                label="Total Belanja Bulanan"
                delay={3}
              />
              <StatCard
                iconBg="bg-blue-50"
                iconColor="text-blue-600"
                iconSvgPath={ICONS.calendar}
                badge="Agenda"
                badgeColor="bg-blue-100 text-blue-700"
                value={agendaList.length.toString()}
                label="Kalender Kerja Terdaftar"
                delay={4}
              />
            </div>

            {/* Main Content Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* E-Approval Panel */}
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                  <div className="flex items-center gap-2 mb-6">
                    <FileCheck className="w-5 h-5 text-indigo-600" />
                    <h2 className="text-sm font-black text-slate-800 uppercase tracking-wider">Antrean Persetujuan Pimpinan</h2>
                  </div>

                  {approvals.length === 0 ? (
                    <div className="text-center py-12 text-slate-400 font-bold text-xs uppercase tracking-widest italic">
                      Tidak ada antrean persetujuan masuk
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {approvals.map((appr) => (
                        <div 
                          key={appr.id} 
                          className="p-5 rounded-2xl border border-slate-100 hover:border-indigo-100 transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-50/50"
                        >
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-[10px] font-black text-indigo-600 uppercase bg-indigo-50 px-2 py-0.5 rounded-md">
                                {appr.requester}
                              </span>
                              <span className="text-[10px] font-bold text-slate-400">
                                Ditujukan ke: {appr.approver}
                              </span>
                            </div>
                            <h3 className="text-sm font-black text-slate-800">{appr.title}</h3>
                            <p className="text-xs text-slate-400 mt-1">{appr.description}</p>
                            {appr.amount && (
                              <p className="text-xs font-black text-slate-700 mt-2">
                                Nominal: <span className="text-rose-600">{formatCurrency(appr.amount)}</span>
                              </p>
                            )}
                            {appr.catatan && (
                              <p className="text-[11px] text-slate-500 italic mt-2 bg-slate-100 p-2 rounded-lg border border-slate-200">
                                Catatan: {appr.catatan}
                              </p>
                            )}
                          </div>

                          <div className="flex items-center gap-3 shrink-0 self-end md:self-center">
                            {getStatusBadge(appr.status)}
                            {appr.status === 'Pending' && (
                              <button 
                                onClick={() => {
                                  setReviewApproval(appr);
                                  setReviewNote("");
                                }}
                                className="px-4 py-2 bg-indigo-600 text-white text-xs font-black rounded-xl shadow-md shadow-indigo-600/10 hover:bg-indigo-700 transition-all uppercase tracking-widest"
                              >
                                Tinjau
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Financial Flow Summary */}
                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                  <div className="flex items-center gap-2 mb-6">
                    <TrendingUp className="w-5 h-5 text-emerald-600" />
                    <h2 className="text-sm font-black text-slate-800 uppercase tracking-wider">Rekapitulasi Arus Kas Pondok</h2>
                  </div>

                  {summaryData && summaryData.chart_data.length > 0 ? (
                    <div className="space-y-6">
                      <div className="flex items-end gap-4 h-48 px-2 border-b border-slate-100 pb-4">
                        {summaryData.chart_data.map((m: ChartDataPoint) => {
                          const total = m.income + m.expense;
                          const incomePct = total > 0 ? (m.income / total) * 100 : 0;
                          const expensePct = total > 0 ? (m.expense / total) * 100 : 0;
                          
                          return (
                            <div key={m.label} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                              <div className="w-full flex gap-1 items-end h-32">
                                <div className="flex-1 bg-emerald-400 rounded-t-lg transition-all" style={{ height: `${incomePct}%` }} title={`Masuk: ${formatCurrency(m.income)}`} />
                                <div className="flex-1 bg-rose-400 rounded-t-lg transition-all" style={{ height: `${expensePct}%` }} title={`Keluar: ${formatCurrency(m.expense)}`} />
                              </div>
                              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">{m.label}</span>
                            </div>
                          );
                        })}
                      </div>
                      
                      <div className="flex justify-center gap-6 text-xs font-bold text-slate-500">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-emerald-400 rounded-full" /> Pemasukan (Syahriyah/Infaq)
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-rose-400 rounded-full" /> Pengeluaran (Belanja/Operasional)
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12 text-slate-400 font-bold text-xs uppercase tracking-widest italic">
                      Data cashflow tidak mencukupi
                    </div>
                  )}
                </div>
              </div>

              {/* Master Calendar Agenda Panel */}
              <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col h-fit">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-indigo-600" />
                    <h2 className="text-sm font-black text-slate-800 uppercase tracking-wider">Master Calendar</h2>
                  </div>
                </div>

                {agendaList.length === 0 ? (
                  <div className="text-center py-12 text-slate-400 font-bold text-xs uppercase tracking-widest italic">
                    Belum ada agenda kerja terjadwal
                  </div>
                ) : (
                  <div className="space-y-4">
                    {agendaList.map((agenda) => (
                      <div 
                        key={agenda.id} 
                        className="p-4 rounded-2xl border border-slate-50 hover:bg-slate-50 transition-all space-y-2 relative group"
                      >
                        <div className="flex items-start justify-between">
                          <span className="text-[9px] font-black text-indigo-600 uppercase bg-indigo-50 px-2.5 py-1 rounded-full">
                            {new Date(agenda.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </span>
                          
                          {["ROOT", "SEKRETARIAT"].includes(session?.role_level || "") && (
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                              <button 
                                onClick={() => {
                                  setEditingAgenda(agenda);
                                  setAgendaForm({
                                    title: agenda.title,
                                    description: agenda.description,
                                    date: agenda.date,
                                    time_start: agenda.time_start || "",
                                    time_end: agenda.time_end || "",
                                    location: agenda.location
                                  });
                                  setIsAgendaModalOpen(true);
                                }}
                                className="text-slate-400 hover:text-indigo-600 transition-colors p-1"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button 
                                onClick={() => handleDeleteAgenda(agenda.id)}
                                className="text-slate-400 hover:text-rose-600 transition-colors p-1"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}
                        </div>

                        <h3 className="text-xs font-black text-slate-800 leading-tight">{agenda.title}</h3>
                        <p className="text-[11px] text-slate-400 leading-relaxed">{agenda.description}</p>
                        
                        {(agenda.time_start || agenda.location) && (
                          <div className="flex flex-wrap gap-x-4 gap-y-1 text-[10px] text-slate-400 pt-1 border-t border-slate-50 mt-2 font-semibold">
                            {agenda.time_start && (
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3 text-slate-300" /> {agenda.time_start} {agenda.time_end ? `- ${agenda.time_end}` : ""}
                              </span>
                            )}
                            {agenda.location && (
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3 h-3 text-slate-300" /> {agenda.location}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Agenda Dialog */}
      {isAgendaModalOpen && (
        <div className="fixed inset-0 z-200 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300 text-text-main">
          <div className="bg-white w-full max-w-md rounded-[32px] shadow-2xl overflow-hidden scale-in-center flex flex-col">
            <div className="p-6 border-b border-slate-50 flex items-center justify-between shrink-0">
              <h3 className="text-lg font-black text-slate-800 uppercase tracking-wider">
                {editingAgenda ? "Edit Agenda Kegiatan" : "Tambah Agenda Kegiatan"}
              </h3>
              <button onClick={() => setIsAgendaModalOpen(false)} className="p-2 rounded-full hover:bg-slate-100 text-slate-400 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateOrUpdateAgenda} className="p-6 space-y-4 flex-1">
              <div>
                <label className="block text-[10px] font-black uppercase text-slate-400 mb-1 tracking-wider">Judul Agenda</label>
                <input 
                  type="text" 
                  required
                  value={agendaForm.title}
                  onChange={(e) => setAgendaForm({ ...agendaForm, title: e.target.value })}
                  placeholder="Contoh: Rapat Dewan Harian"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-100 focus:border-indigo-500 rounded-2xl text-xs font-bold outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase text-slate-400 mb-1 tracking-wider">Deskripsi Kegiatan</label>
                <textarea 
                  value={agendaForm.description}
                  onChange={(e) => setAgendaForm({ ...agendaForm, description: e.target.value })}
                  placeholder="Detail agenda kegiatan..."
                  rows={3}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-100 focus:border-indigo-500 rounded-2xl text-xs font-bold outline-none transition-all resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-400 mb-1 tracking-wider">Tanggal</label>
                  <input 
                    type="date" 
                    required
                    value={agendaForm.date}
                    onChange={(e) => setAgendaForm({ ...agendaForm, date: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 focus:border-indigo-500 rounded-2xl text-xs font-bold outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-400 mb-1 tracking-wider">Lokasi</label>
                  <input 
                    type="text" 
                    value={agendaForm.location}
                    onChange={(e) => setAgendaForm({ ...agendaForm, location: e.target.value })}
                    placeholder="Contoh: Kantor Utama"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 focus:border-indigo-500 rounded-2xl text-xs font-bold outline-none transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-400 mb-1 tracking-wider">Jam Mulai</label>
                  <input 
                    type="time" 
                    value={agendaForm.time_start}
                    onChange={(e) => setAgendaForm({ ...agendaForm, time_start: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 focus:border-indigo-500 rounded-2xl text-xs font-bold outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-400 mb-1 tracking-wider">Jam Selesai</label>
                  <input 
                    type="time" 
                    value={agendaForm.time_end}
                    onChange={(e) => setAgendaForm({ ...agendaForm, time_end: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 focus:border-indigo-500 rounded-2xl text-xs font-bold outline-none transition-all"
                  />
                </div>
              </div>

              <button 
                type="submit"
                className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-xs font-black transition-all active:scale-95 shadow-lg shadow-indigo-600/10 uppercase tracking-widest mt-6"
              >
                Simpan Agenda
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Approval Process Modal */}
      {reviewApproval && (
        <div className="fixed inset-0 z-200 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300 text-text-main">
          <div className="bg-white w-full max-w-md rounded-[32px] shadow-2xl overflow-hidden scale-in-center flex flex-col">
            <div className="p-6 border-b border-slate-50 flex items-center justify-between shrink-0">
              <h3 className="text-lg font-black text-slate-800 uppercase tracking-wider">Evaluasi Pengajuan</h3>
              <button onClick={() => setReviewApproval(null)} className="p-2 rounded-full hover:bg-slate-100 text-slate-400 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6 flex-1">
              <div className="p-4 bg-slate-50 rounded-2xl space-y-2 border border-slate-100">
                <p className="text-[10px] font-black text-indigo-600 uppercase leading-none">Detail Pengajuan</p>
                <h4 className="text-sm font-black text-slate-800 mt-1">{reviewApproval.title}</h4>
                <p className="text-xs text-slate-500 leading-relaxed">{reviewApproval.description}</p>
                {reviewApproval.amount && (
                  <p className="text-xs font-black text-slate-700 pt-2 border-t border-slate-100/50">
                    Nominal: <span className="text-rose-600 font-extrabold">{formatCurrency(reviewApproval.amount)}</span>
                  </p>
                )}
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase text-slate-400 mb-2 tracking-wider">Catatan / Evaluasi Pimpinan</label>
                <textarea 
                  value={reviewNote}
                  onChange={(e) => setReviewNote(e.target.value)}
                  placeholder="Tulis alasan persetujuan atau penolakan..."
                  rows={3}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-100 focus:border-indigo-500 rounded-2xl text-xs font-bold outline-none transition-all resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <button 
                  onClick={() => handleProcessApproval('Ditolak')}
                  disabled={actionLoading !== null}
                  className="w-full py-4 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-2xl text-xs font-black transition-all active:scale-95 border border-rose-100 uppercase tracking-widest disabled:opacity-50"
                >
                  Tolak
                </button>
                <button 
                  onClick={() => handleProcessApproval('Disetujui')}
                  disabled={actionLoading !== null}
                  className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs font-black transition-all active:scale-95 shadow-lg shadow-emerald-600/10 uppercase tracking-widest disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {actionLoading !== null ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Setujui"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
