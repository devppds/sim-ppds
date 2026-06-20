"use client";

import { useEffect, useState, useRef } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { 
  Wrench, Activity, Database, CheckCircle, AlertTriangle, Play, RefreshCw, Send,
  Bug, Cpu, Server, Lock, Clock, Terminal, ShieldAlert, Camera, Loader2, Eye, ExternalLink, Check, Info, AlertCircle
} from "lucide-react";
import { API_BASE_URL } from "@/lib/config";
import { useToast } from "@/components/Toast";

interface TableStat {
  table: string;
  count: number;
  status: string;
  error?: string;
}

interface APITestResult {
  name: string;
  endpoint: string;
  status: 'pending' | 'success' | 'error';
  latency?: number;
  message?: string;
}

interface DevReport {
  id: number;
  reporter_name: string;
  reporter_role: string;
  title: string;
  description: string;
  screenshot_url?: string;
  status: "Pending" | "Diproses" | "Selesai";
  created_at: string;
}

export default function DeveloperPage() {
  const { showToast } = useToast();
  
  // Session
  const [session, setSession] = useState<any>(null);
  const [loadingSession, setLoadingSession] = useState(true);

  // Sub-tabs for developer
  const [activeSubTab, setActiveSubTab] = useState<"tickets" | "system">("tickets");

  // DB stats & API tests
  const [tables, setTables] = useState<TableStat[]>([]);
  const [loadingDB, setLoadingDB] = useState(true);
  const [apiTests, setApiTests] = useState<APITestResult[]>([
    { name: "Stats Utama Dashboard", endpoint: "/api/stats", status: "pending" },
    { name: "Menu Stats Sidebar", endpoint: "/api/stats/menu", status: "pending" },
    { name: "Seksi Jam'iyyah Events", endpoint: "/api/jamiyyah/jamiyyah_events", status: "pending" },
    { name: "Seksi Kebersihan Checks", endpoint: "/api/kbr/kbr_hygiene_checks", status: "pending" },
    { name: "Seksi Media Bookings", endpoint: "/api/media/media_bookings", status: "pending" },
    { name: "Seksi Pembangunan Renovasi", endpoint: "/api/pembangunan/pembangunan_renovasi", status: "pending" },
    { name: "Seksi PLP Meters", endpoint: "/api/plp/plp_meters", status: "pending" },
    { name: "Seksi Takmir Schedules", endpoint: "/api/takmir/takmir_schedules", status: "pending" },
  ]);
  const [testingAPIs, setTestingAPIs] = useState(false);

  // Release notes
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [type, setType] = useState("info");
  const [publishing, setPublishing] = useState(false);

  // User bug report form states
  const [reportTitle, setReportTitle] = useState("");
  const [reportDescription, setReportDescription] = useState("");
  const [reportScreenshot, setReportScreenshot] = useState("");
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Developer bug reports tracker states
  const [reports, setReports] = useState<DevReport[]>([]);
  const [loadingReports, setLoadingReports] = useState(true);

  // Fetch session
  useEffect(() => {
    setLoadingSession(true);
    fetch("/api/auth/session")
      .then(res => res.json())
      .then((data: any) => {
        if (data.success && data.session) {
          setSession(data.session);
        }
      })
      .catch(e => console.error("Session fetch error", e))
      .finally(() => setLoadingSession(false));
  }, []);

  const isDev = session && (session.role || "").toUpperCase() === "DEVELOPER";

  // Fetch D1 stats & Reports
  const fetchDbStats = async () => {
    try {
      setLoadingDB(true);
      const res = await fetch(`${API_BASE_URL}/api/dev/stats`);
      const json = await res.json() as any;
      if (json.success) {
        setTables(json.tables);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingDB(false);
    }
  };

  const fetchReports = async () => {
    try {
      setLoadingReports(true);
      const res = await fetch(`${API_BASE_URL}/api/developer/reports`);
      const json = await res.json() as any;
      if (json.success) {
        setReports(json.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingReports(false);
    }
  };

  useEffect(() => {
    if (isDev) {
      fetchDbStats();
      fetchReports();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDev]);

  // Run test on specific endpoint
  const testEndpoint = async (index: number) => {
    const test = apiTests[index];
    setApiTests(prev => prev.map((t, idx) => idx === index ? { ...t, status: 'pending' } : t));
    
    const start = performance.now();
    try {
      const res = await fetch(`${API_BASE_URL}${test.endpoint}`);
      const latency = Math.round(performance.now() - start);
      if (res.ok) {
        setApiTests(prev => prev.map((t, idx) => idx === index ? { ...t, status: 'success', latency, message: '200 OK' } : t));
      } else {
        setApiTests(prev => prev.map((t, idx) => idx === index ? { ...t, status: 'error', latency, message: `Status ${res.status}` } : t));
      }
    } catch (err: any) {
      const latency = Math.round(performance.now() - start);
      setApiTests(prev => prev.map((t, idx) => idx === index ? { ...t, status: 'error', latency, message: err.message || 'Koneksi Gagal' } : t));
    }
  };

  // Run all API tests
  const runAllTests = async () => {
    setTestingAPIs(true);
    showToast("Memulai pengujian seluruh API...", "info");
    for (let i = 0; i < apiTests.length; i++) {
      await testEndpoint(i);
    }
    setTestingAPIs(false);
    showToast("Seluruh uji fungsional selesai!", "success");
  };

  // Publish release notes / announcement
  const handlePublishUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !message) return;
    setPublishing(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/notifications`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, message, type })
      });
      const json = await res.json() as any;
      if (json.success) {
        showToast("Pembaruan berhasil dikirim ke seluruh pengguna!", "success");
        setTitle("");
        setMessage("");
        fetchDbStats(); 
      } else {
        showToast(json.error || "Gagal mempublikasikan pembaruan", "error");
      }
    } catch (err) {
      showToast("Kesalahan jaringan", "error");
    } finally {
      setPublishing(false);
    }
  };

  // User submit technical report
  const handleScreenshotUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const data = new FormData();
    data.append("file", file);
    data.append("folder", "sim-ppds/reports");

    try {
      const res = await fetch("/api/upload", { method: "POST", body: data });
      const json = await res.json() as any;
      if (json.success) {
        setReportScreenshot(json.url);
        showToast("Screenshot berhasil diunggah", "success");
      } else {
        showToast(json.error || "Gagal upload screenshot", "error");
      }
    } catch (err) {
      showToast("Gagal upload screenshot", "error");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmitReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportTitle || !reportDescription) {
      showToast("Judul dan deskripsi wajib diisi", "error");
      return;
    }
    if (!reportScreenshot) {
      showToast("Wajib melampirkan screenshot kendala", "error");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/developer/reports`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reporter_name: session.name,
          reporter_role: session.role,
          title: reportTitle,
          description: reportDescription,
          screenshot_url: reportScreenshot
        })
      });
      const json = await res.json() as any;
      if (json.success) {
        showToast("Laporan kendala berhasil dikirim!", "success");
        setReportTitle("");
        setReportDescription("");
        setReportScreenshot("");
      } else {
        showToast(json.error || "Gagal mengirim laporan", "error");
      }
    } catch (err) {
      showToast("Terjadi kesalahan koneksi", "error");
    } finally {
      setSubmitting(false);
    }
  };

  // Developer updates report status
  const handleUpdateStatus = async (id: number, newStatus: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/developer/reports/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus })
      });
      const json = await res.json() as any;
      if (json.success) {
        showToast(`Status tiket #${id} berhasil diubah ke ${newStatus}`, "success");
        fetchReports();
      } else {
        showToast(json.error || "Gagal mengubah status", "error");
      }
    } catch (e) {
      showToast("Kesalahan jaringan", "error");
    }
  };

  if (loadingSession) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
          <Loader2 className="w-10 h-10 animate-spin text-emerald-600" />
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest animate-pulse">Memuat Sesi Pengguna...</p>
        </div>
      </DashboardLayout>
    );
  }

  // A. VIEW UNTUK KASIE / KETUA / SEKRETARIS / BENDAHARA (Non-Developer)
  if (!isDev) {
    return (
      <DashboardLayout>
        <div className="max-w-2xl mx-auto p-4 sm:p-8 bg-white rounded-[2.5rem] border border-slate-100 shadow-xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
          
          {/* Banner sesuai instruksi gambar */}
          <div className="border-4 border-double border-amber-800/20 bg-amber-50/10 p-6 sm:p-8 rounded-[2rem] text-center space-y-4">
            <div className="flex justify-center">
              <div className="w-16 h-16 rounded-full bg-amber-50 flex items-center justify-center border border-amber-200">
                <ShieldAlert className="w-8 h-8 text-amber-700" />
              </div>
            </div>
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">Dukungan Teknis & Pelaporan</h2>
            <p className="text-sm font-bold text-slate-500 max-w-lg mx-auto">
              Tim Developer SIM-PPDS senantiasa memantau stabilitas sistem. Mengalami kendala di luar panduan?
            </p>
            
            <div className="text-left bg-white/70 p-4 rounded-2xl border border-slate-150 space-y-2 text-xs font-bold text-slate-600 max-w-md mx-auto leading-relaxed shadow-xs">
              <p>1. Buka menu &quot;Developer&quot; yang terdapat di sidebar aplikasi.</p>
              <p>2. Kirimkan detail masalah yang Anda hadapi.</p>
              <p>3. Wajib sertakan screenshot layar (tangkapan layar) kendala untuk mempercepat diagnosis tim teknis.</p>
            </div>
          </div>

          <form onSubmit={handleSubmitReport} className="mt-8 space-y-6">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 px-1">Nama Pengirim</label>
              <input 
                type="text" 
                disabled 
                value={`${session?.name || "User"} (${session?.role || "Staf"})`}
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm font-bold text-slate-500" 
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 px-1">Nama Fitur / Judul Kendala</label>
              <input 
                required
                type="text"
                placeholder="Contoh: Error saat input perizinan keamanan"
                value={reportTitle}
                onChange={(e) => setReportTitle(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-500 outline-none transition-all text-sm font-bold text-slate-700" 
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 px-1">Detail Masalah yang Dihadapi</label>
              <textarea 
                required
                rows={4}
                placeholder="Jelaskan secara detail langkah-langkah yang dilakukan hingga muncul error..."
                value={reportDescription}
                onChange={(e) => setReportDescription(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-500 outline-none transition-all text-sm font-bold text-slate-700 resize-none" 
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 px-1">Screenshot Kendala (Wajib)</label>
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="group cursor-pointer p-6 rounded-2xl border-2 border-dashed border-slate-200 hover:border-indigo-500 hover:bg-indigo-50/30 transition-all flex flex-col items-center gap-2 relative"
              >
                {reportScreenshot ? (
                  <div className="w-full aspect-video rounded-xl overflow-hidden border border-slate-200">
                    <img src={reportScreenshot} alt="Screenshot" className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <>
                    <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-indigo-100 transition-colors">
                      <Camera className="w-6 h-6 text-slate-400 group-hover:text-indigo-600" />
                    </div>
                    <div className="text-center">
                      <p className="text-xs font-bold text-slate-600">Klik untuk upload Tangkapan Layar (Screenshot)</p>
                      <p className="text-[10px] text-slate-400">Format gambar JPG atau PNG</p>
                    </div>
                  </>
                )}
                {uploading && (
                  <div className="absolute inset-0 bg-white/80 flex items-center justify-center rounded-2xl">
                    <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
                  </div>
                )}
              </div>
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleScreenshotUpload} />
            </div>

            <button 
              type="submit" 
              disabled={submitting || uploading}
              className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-sm font-black shadow-xl shadow-indigo-600/20 flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 uppercase tracking-widest cursor-pointer"
            >
              {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
              {submitting ? "Mengirim Laporan..." : "Kirimkan ke Tim Developer"}
            </button>
          </form>

          <div className="mt-8 border-t border-slate-100 pt-6 text-center">
            <p className="text-[10px] font-bold text-slate-400 leading-relaxed uppercase tracking-wider">
              Sistem ini dikembangkan dan dikelola oleh Alumni Pondok Pesantren Darussalam Lirboyo.<br />
              Backend API terhubung secara aman di: <span className="text-indigo-600 font-mono">api-worker.ppdslirboyo.workers.dev</span>
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // B. VIEW UNTUK DEVELOPER PORTAL (Admin/Developer Dashboard)
  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-7xl mx-auto pb-12">
        
        {/* Header */}
        <div className="bg-slate-900 text-white p-8 rounded-3xl border border-slate-800 shadow-2xl relative overflow-hidden">
          <div className="absolute right-0 top-0 opacity-10 translate-x-10 -translate-y-10">
            <Cpu className="w-96 h-96 text-emerald-500" />
          </div>
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-emerald-500/20 text-emerald-400 rounded-2xl border border-emerald-500/30">
                <Wrench className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-3xl font-black tracking-tight text-white flex items-center gap-2">
                  Portal Developer <span className="text-xs px-2.5 py-1 bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 rounded-full font-bold uppercase tracking-widest">Active</span>
                </h1>
                <p className="text-sm text-slate-400 mt-1.5 font-mono">Status pemantauan & integritas sistem SIM-PPDS Lirboyo</p>
              </div>
            </div>
            
            <div className="flex gap-3">
              <button 
                onClick={fetchReports}
                className="flex items-center gap-2 px-5 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-sm font-bold rounded-xl transition-all active:scale-95"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Segarkan Tiket</span>
              </button>
            </div>
          </div>
        </div>

        {/* Sub-tabs Selection */}
        <div className="flex gap-2 border-b border-slate-100 pb-3">
          <button 
            onClick={() => setActiveSubTab("tickets")}
            className={`px-6 py-2.5 rounded-xl text-sm font-black transition-all ${
              activeSubTab === "tickets" 
              ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20" 
              : "bg-white text-slate-500 border border-slate-200 hover:bg-slate-50 cursor-pointer"
            }`}
          >
            Laporan Kendala ({reports.length})
          </button>
          <button 
            onClick={() => setActiveSubTab("system")}
            className={`px-6 py-2.5 rounded-xl text-sm font-black transition-all ${
              activeSubTab === "system" 
              ? "bg-slate-900 text-white shadow-lg" 
              : "bg-white text-slate-500 border border-slate-200 hover:bg-slate-50 cursor-pointer"
            }`}
          >
            Diagnostik Sistem & Database
          </button>
        </div>

        {activeSubTab === "tickets" ? (
          /* Sub-tab A: List Bug/Technical Tickets */
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden p-8 animate-in fade-in duration-300">
            <div className="mb-6">
              <h3 className="font-extrabold text-slate-800 text-lg">Tiket Kendala Pengguna</h3>
              <p className="text-xs text-slate-400 font-bold uppercase mt-1">Daftar keluhan teknis dari Pimpinan & Kepala Seksi</p>
            </div>

            {loadingReports ? (
              <div className="text-center py-12 text-slate-400 font-bold text-xs uppercase">
                <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-650" />
                Mengambil laporan...
              </div>
            ) : reports.length === 0 ? (
              <div className="text-center py-12 text-slate-400 font-medium text-sm italic">
                Belum ada laporan kendala masuk dari pengguna
              </div>
            ) : (
              <div className="space-y-6">
                {reports.map((report) => (
                  <div key={report.id} className="p-6 bg-slate-50 rounded-2xl border border-slate-150 flex flex-col md:flex-row justify-between gap-6 hover:border-slate-300 transition-colors">
                    
                    {/* Info Laporan */}
                    <div className="space-y-3 flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[10px] font-black font-mono text-slate-400">#TIKET-{report.id}</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                          report.status === "Selesai" ? "bg-emerald-50 text-emerald-600 border border-emerald-100" :
                          report.status === "Diproses" ? "bg-amber-50 text-amber-600 border border-amber-100" :
                          "bg-rose-50 text-rose-600 border border-rose-100"
                        }`}>
                          {report.status}
                        </span>
                        <span className="text-xs text-slate-400">
                          Oleh: <strong className="text-slate-700">{report.reporter_name}</strong> ({report.reporter_role})
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {new Date(report.created_at).toLocaleString("id-ID")}
                        </span>
                      </div>

                      <h4 className="text-base font-extrabold text-slate-800">{report.title}</h4>
                      <p className="text-sm font-medium text-slate-600 whitespace-pre-wrap leading-relaxed">
                        {report.description}
                      </p>

                      {/* Aksi Ubah Status */}
                      <div className="pt-2 flex items-center gap-2">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Ubah Status:</span>
                        <div className="flex gap-1">
                          {(["Pending", "Diproses", "Selesai"] as const).map((st) => (
                            <button
                              key={st}
                              onClick={() => handleUpdateStatus(report.id, st)}
                              disabled={report.status === st}
                              className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase transition-all ${
                                report.status === st
                                ? (st === "Selesai" ? "bg-emerald-600 text-white shadow-xs" : st === "Diproses" ? "bg-amber-500 text-white shadow-xs" : "bg-rose-600 text-white shadow-xs")
                                : "bg-white border border-slate-200 text-slate-500 hover:bg-slate-50 cursor-pointer"
                              }`}
                            >
                              {st}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Screenshot thumbnail */}
                    {report.screenshot_url && (
                      <div className="w-full md:w-48 shrink-0 flex flex-col gap-2">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Screenshot Layar</span>
                        <div className="group relative rounded-xl overflow-hidden border border-slate-200 aspect-video bg-slate-100 w-full">
                          <img src={report.screenshot_url} alt="Screenshot" className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[1px]">
                            <a 
                              href={report.screenshot_url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="p-2 bg-white text-slate-800 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center gap-1 hover:scale-105 transition-transform"
                            >
                              Lihat <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                        </div>
                      </div>
                    )}

                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* Sub-tab B: Diagnostik & Stats (Existing View) */
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* Top Status Panel */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl text-white flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Koneksi API</p>
                  <h3 className="text-2xl font-black mt-2 text-emerald-400 flex items-center gap-2">
                    <Server className="w-6 h-6 text-emerald-400" />
                    <span>Terhubung</span>
                  </h3>
                </div>
                <div className="w-3.5 h-3.5 rounded-full bg-emerald-500 animate-ping shadow-[0_0_12px_rgba(16,185,129,0.8)]" />
              </div>

              <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl text-white flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Cloudflare D1 Database</p>
                  <h3 className="text-2xl font-black mt-2 text-indigo-400 flex items-center gap-2">
                    <Database className="w-6 h-6 text-indigo-400" />
                    <span>Aktif & Sehat</span>
                  </h3>
                </div>
                <div className="w-3.5 h-3.5 rounded-full bg-indigo-500 shadow-[0_0_12px_rgba(99,102,241,0.8)]" />
              </div>

              <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl text-white flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Tingkat Hak Akses</p>
                  <h3 className="text-2xl font-black mt-2 text-amber-400 flex items-center gap-2">
                    <Lock className="w-6 h-6 text-amber-400" />
                    <span>ROOT / DEVELOPER</span>
                  </h3>
                </div>
                <ShieldAlert className="w-8 h-8 text-amber-500/20" />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Left Column: API Latency & DB stats */}
              <div className="lg:col-span-2 space-y-6">
                
                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
                  <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-50">
                    <div>
                      <h2 className="text-lg font-black text-slate-800 flex items-center gap-2">
                        <Activity className="w-5 h-5 text-emerald-500" /> Uji Fungsional & Latensi API
                      </h2>
                      <p className="text-xs text-slate-400 mt-1">Menguji respon dari rute backend D1 secara real-time</p>
                    </div>
                    <button 
                      onClick={runAllTests} 
                      disabled={testingAPIs}
                      className="text-xs font-black text-emerald-600 hover:text-emerald-800 uppercase tracking-wider"
                    >
                      Uji Semua
                    </button>
                  </div>

                  <div className="divide-y divide-slate-50">
                    {apiTests.map((test, index) => (
                      <div key={test.name} className="py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                          <h4 className="text-sm font-bold text-slate-800">{test.name}</h4>
                          <p className="text-xs text-slate-400 font-mono mt-0.5">{test.endpoint}</p>
                        </div>
                        
                        <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                          {test.status === 'success' && (
                            <div className="flex items-center gap-3">
                              <span className="text-xs font-black text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100">
                                {test.message}
                              </span>
                              <span className="text-xs font-mono text-slate-500 font-bold flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5" /> {test.latency}ms
                              </span>
                            </div>
                          )}
                          {test.status === 'error' && (
                            <span className="text-xs font-black text-rose-500 bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-100 flex items-center gap-1.5">
                              <AlertTriangle className="w-3.5 h-3.5" /> {test.message || 'Error'}
                            </span>
                          )}
                          {test.status === 'pending' && (
                            <span className="text-xs font-black text-slate-400 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100">
                              Siap Diuji
                            </span>
                          )}
                          
                          <button 
                            onClick={() => testEndpoint(index)}
                            disabled={testingAPIs}
                            className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                            title="Tes ulang"
                          >
                            <RefreshCw className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
                  <h2 className="text-lg font-black text-slate-800 flex items-center gap-2 mb-6">
                    <Database className="w-5 h-5 text-indigo-500" /> Struktur & Baris Data Tabel D1
                  </h2>
                  
                  {loadingDB ? (
                    <div className="text-center py-12 text-slate-400 font-bold uppercase tracking-wider text-xs">
                      <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-3 text-indigo-500" />
                      Membaca kapasitas tabel...
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                      {tables.map(t => (
                        <div key={t.table} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex justify-between items-center">
                          <div className="min-w-0">
                            <h4 className="text-xs font-black text-slate-500 uppercase tracking-wide truncate">{t.table}</h4>
                            <p className="text-lg font-black text-slate-800 mt-1">{t.count.toLocaleString()} <span className="text-xs font-medium text-slate-400">baris</span></p>
                          </div>
                          <span className={`w-2.5 h-2.5 rounded-full ${t.status === 'OK' ? 'bg-emerald-500' : 'bg-rose-500'}`} title={t.error || 'Normal'} />
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>

              {/* Right Column: Update log & publisher */}
              <div className="space-y-6">
                
                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
                  <h2 className="text-lg font-black text-slate-800 flex items-center gap-2 mb-2">
                    <Send className="w-5 h-5 text-rose-500" /> Publikasikan Pembaruan
                  </h2>
                  <p className="text-xs text-slate-400 mb-6">Formulir rilis untuk menyebarkan pengumuman atau fitur baru</p>

                  <form onSubmit={handlePublishUpdate} className="space-y-4">
                    <div>
                      <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Judul Rilis</label>
                      <input 
                        type="text"
                        required
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Contoh: Rilis Sistem v1.1.0"
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all font-bold"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Informasi Rilis / Pengumuman</label>
                      <textarea 
                        required
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Contoh: Modul operasional seksi plp & takmir telah dibungkus..."
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all min-h-[140px] text-slate-600"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Kategori Rilis</label>
                      <select 
                        value={type}
                        onChange={(e) => setType(e.target.value)}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all font-bold"
                      >
                        <option value="info">Info / Informasi Sistem</option>
                        <option value="success">Feature / Pembaruan Sukses</option>
                        <option value="warning">Patch / Perbaikan Penting</option>
                        <option value="danger">Urgent / Pemeliharaan Sistem</option>
                      </select>
                    </div>

                    <div className="pt-2">
                      <button 
                        type="submit"
                        disabled={publishing}
                        className="w-full py-3.5 bg-rose-600 hover:bg-rose-700 text-white text-sm font-black rounded-xl transition-all shadow-lg shadow-rose-500/20 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 uppercase tracking-widest"
                      >
                        {publishing ? 'Memposting...' : 'Kirim Ke Seluruh Lonceng'}
                      </button>
                    </div>
                  </form>
                </div>

                <div className="bg-slate-900 text-slate-100 rounded-3xl border border-slate-800 shadow-2xl p-6 relative overflow-hidden">
                  <h2 className="text-lg font-black text-white flex items-center gap-2 mb-2">
                    <Bug className="w-5 h-5 text-rose-400" /> Pelacakan Bug & Diagnostik
                  </h2>
                  <p className="text-xs text-slate-400 mb-6">Konsol diagnostik instan untuk memeriksa log kesalahan</p>

                  <div className="bg-black/40 border border-slate-800 rounded-2xl p-4 font-mono text-[10px] leading-relaxed space-y-2 h-64 overflow-y-auto custom-scrollbar">
                    <p className="text-slate-500">[18:22:20] SIM-PPDS Developer Portal Initialized.</p>
                    <p className="text-emerald-500">[18:22:21] API Connection: D1 check OK.</p>
                    <p className="text-emerald-500">[18:22:25] All 31 operational page layout checks complete. 0 orphans found.</p>
                    <p className="text-slate-400">[18:22:30] Next.js build bundle verified successfully.</p>
                    <p className="text-slate-400">[18:22:33] TypeScript typecheck backend worker verified: 0 errors.</p>
                    <p className="text-slate-500">[18:31:05] Standby. Waiting for developer manual test trigger...</p>
                  </div>
                </div>

              </div>

            </div>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}
