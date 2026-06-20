"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import StatCard from "@/components/StatCard";
import SPPChart from "@/components/SPPChart";
import ActivityFeed from "@/components/ActivityFeed";
import SantriTable from "@/components/SantriTable";
import { API_BASE_URL } from "@/lib/config";
import { useRouter } from "next/navigation";
import { Shield, BookOpen, Users, User, Zap, Video, MoonStar, Hammer, HeartPulse, Store, Wrench, Package, ArrowRight, Loader2, Phone } from "lucide-react";

// SVG paths for Lucide icons (inner paths only)
const ICONS = {
  users: `<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path>`,
  userCheck: `<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><polyline points="16 11 18 13 22 9"></polyline>`,
  wallet: `<path d="M20 12V8H6a2 2 0 0 1-2-2c0-1.1.9-2 2-2h12v4"></path><path d="M4 6v12c0 1.1.9 2 2 2h14v-4"></path><path d="M18 12a2 2 0 0 0-2 2c0 1.1.9 2 2 2h4v-4h-4z"></path>`,
  alertCircle: `<circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line>`,
};

export default function DashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<any>(null);
  const [seksiData, setSeksiData] = useState<any>(null);
  const [seksiLoading, setSeksiLoading] = useState(false);

  useEffect(() => {
    fetch("/api/auth/session")
      .then(res => res.json())
      .then((data: any) => {
        if (data.success && data.session) {
          setSession(data.session);
        }
      })
      .catch(e => console.error("Session fetch error", e));
  }, []);

  const isGeneralAdmin = !session || (
    session.role_level === 'ROOT' || 
    session.role_level === 'SEKRETARIAT' || 
    session.role_level === 'VIEW_ALL' ||
    (session.role || "").toLowerCase().includes("mudir") ||
    (session.role || "").toLowerCase().includes("sekretaris") ||
    (session.role || "").toLowerCase().includes("bendahara")
  );

  useEffect(() => {
    if (session) {
      const roleLower = (session.role || "").toLowerCase();
      const usernameLower = (session.username || "").toLowerCase();
      const isAnggota = roleLower.includes("anggota") || usernameLower.includes("anggota");
      if (isAnggota) {
        const getSeksiMainMenu = (role: string) => {
          const r = role.toUpperCase();
          if (r.includes("KEAMANAN")) return "/keamanan";
          if (r.includes("PENDIDIKAN")) return "/pendidikan";
          if (r.includes("WAJAR")) return "/wajar";
          if (r.includes("JAMIYYAH") || r.includes("JAMI'YYAH") || r.includes("JAM'IYYAH")) return "/jamiyyah";
          if (r.includes("PLP")) return "/plp";
          if (r.includes("KBR") || r.includes("KEBERSIHAN")) return "/kebersihan";
          if (r.includes("PEMBANGUNAN")) return "/pembangunan";
          if (r.includes("MEDIA")) return "/media";
          if (r.includes("TAKMIR")) return "/takmir";
          if (r.includes("FASILITAS")) return "/fasilitas";
          if (r.includes("LOGISTIK") || r.includes("HUMASY")) return "/logistik";
          if (r.includes("KESEHATAN") || r.includes("KLINIK")) return "/klinik";
          if (r.includes("BUMP")) return "/bump";
          if (r.includes("BENDAHARA") || r.includes("KEUANGAN")) return "/spp";
          return null;
        };
        const target = getSeksiMainMenu(session.role);
        if (target) router.push(target);
      }
    }
  }, [session, router]);

  useEffect(() => {
    if (isGeneralAdmin) {
      async function fetchAllData() {
        try {
          const res = await fetch(`${API_BASE_URL}/api/stats`);
          const json = (await res.json()) as any;
          if (json.success) {
            setData(json.data);
          }
        } catch (error) {
          console.error("Gagal ambil dashboard data:", error);
        } finally {
          setLoading(false);
        }
      }
      fetchAllData();
    }
  }, [isGeneralAdmin]);

  useEffect(() => {
    if (session && !isGeneralAdmin) {
      setSeksiLoading(true);
      fetch(`${API_BASE_URL}/api/stats/seksi?role=${encodeURIComponent(session.role)}`)
        .then(res => res.json())
        .then((json: any) => {
          if (json.success) {
            setSeksiData(json);
          }
        })
        .catch(e => console.error("Error fetching seksi stats:", e))
        .finally(() => setSeksiLoading(false));
    }
  }, [session, isGeneralAdmin]);

  const stats = data?.stats || {
    santri_aktif: 0,
    tenaga_pengurus: 0,
    spp_terkumpul: 0,
    tunggakan_spp: 0,
    spp_persentase: 0
  };

  function formatCurrency(val: number) {
    if (val >= 1000000) return `Rp ${(val / 1000000).toFixed(0)}jt`;
    return `Rp ${val.toLocaleString()}`;
  }

  // Section specific icons for the stats cards
  const getSeksiHeaderIcon = (role: string) => {
    const r = role.toUpperCase();
    if (r.includes("KEAMANAN")) return <Shield className="w-8 h-8 text-rose-600 animate-pulse" />;
    if (r.includes("PENDIDIKAN")) return <BookOpen className="w-8 h-8 text-indigo-600" />;
    if (r.includes("PLP")) return <Zap className="w-8 h-8 text-amber-500" />;
    if (r.includes("MEDIA")) return <Video className="w-8 h-8 text-pink-500" />;
    if (r.includes("TAKMIR")) return <MoonStar className="w-8 h-8 text-emerald-500" />;
    if (r.includes("PEMBANGUNAN")) return <Hammer className="w-8 h-8 text-amber-700" />;
    if (r.includes("KESEHATAN")) return <HeartPulse className="w-8 h-8 text-rose-500" />;
    if (r.includes("BUMP")) return <Store className="w-8 h-8 text-emerald-600" />;
    if (r.includes("FASILITAS")) return <Wrench className="w-8 h-8 text-slate-500" />;
    if (r.includes("LOGISTIK")) return <Package className="w-8 h-8 text-orange-500" />;
    return <Users className="w-8 h-8 text-indigo-600" />;
  };

  const getSeksiHeaderBg = (role: string) => {
    const r = role.toUpperCase();
    if (r.includes("KEAMANAN")) return "bg-rose-50 border-rose-100";
    if (r.includes("PENDIDIKAN")) return "bg-indigo-50 border-indigo-100";
    if (r.includes("PLP")) return "bg-amber-50 border-amber-100";
    if (r.includes("MEDIA")) return "bg-pink-50 border-pink-100";
    if (r.includes("TAKMIR")) return "bg-emerald-50 border-emerald-100";
    return "bg-slate-50 border-slate-100";
  };

  // Render the Section Specific Dashboard
  if (session && !isGeneralAdmin) {
    const roleLower = (session.role || "").toLowerCase();
    const isKeamanan = roleLower.includes("keamanan");
    const isPendidikan = roleLower.includes("pendidikan");
    const isKeuangan = roleLower.includes("bendahara") || roleLower.includes("keuangan") || roleLower.includes("spp");

    return (
      <DashboardLayout>
        <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto relative">
          
          {/* Section Header */}
          <div className={`flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl shadow-sm border ${getSeksiHeaderBg(session.role)}`}>
            <div className="flex items-center gap-4">
              <div className="p-3.5 bg-white rounded-2xl shadow-inner border border-slate-100">
                {getSeksiHeaderIcon(session.role)}
              </div>
              <div>
                <h1 className="text-2xl font-black text-slate-800 tracking-tight">Dasbor Kustom Seksi: {session.role}</h1>
                <p className="text-xs text-slate-400 font-bold tracking-widest uppercase mt-1">Alur Kerja, Anggota Seksi, & Laporan Real-time</p>
              </div>
            </div>
            
            <button 
              onClick={() => {
                setSeksiLoading(true);
                fetch(`${API_BASE_URL}/api/stats/seksi?role=${encodeURIComponent(session.role)}`)
                  .then(res => res.json())
                  .then((json: any) => { if (json.success) setSeksiData(json); })
                  .finally(() => setSeksiLoading(false));
              }}
              className="px-5 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-black tracking-widest uppercase hover:bg-slate-850 transition-all flex items-center gap-2 active:scale-95 shadow-lg shadow-slate-900/10"
            >
              {seksiLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              Refresh Laporan
            </button>
          </div>

          {/* Stats Cards */}
          {seksiData && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {isKeamanan && (
                <>
                  <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Izin Aktif (Keluar)</p>
                    <h3 className="text-3xl font-black text-slate-800 mt-2">{seksiData.stats.active_permits}</h3>
                  </div>
                  <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">SKKB Terbit</p>
                    <h3 className="text-3xl font-black text-slate-800 mt-2">{seksiData.stats.total_skkb}</h3>
                  </div>
                  <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Aset Terdaftar</p>
                    <h3 className="text-3xl font-black text-slate-800 mt-2">{seksiData.stats.total_assets}</h3>
                  </div>
                  <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Kasus Pelanggaran</p>
                    <h3 className="text-3xl font-black text-rose-600 mt-2">{seksiData.stats.total_violations}</h3>
                  </div>
                </>
              )}
              {isPendidikan && (
                <>
                  <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Jadwal Pengajian</p>
                    <h3 className="text-3xl font-black text-slate-800 mt-2">{seksiData.stats.total_classes}</h3>
                  </div>
                  <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Log BK</p>
                    <h3 className="text-3xl font-black text-slate-800 mt-2">{seksiData.stats.total_bk}</h3>
                  </div>
                  <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Izin Akademik</p>
                    <h3 className="text-3xl font-black text-slate-800 mt-2">{seksiData.stats.total_izin_sekolah}</h3>
                  </div>
                  <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Persetujuan Pending</p>
                    <h3 className={`text-3xl font-black mt-2 ${seksiData.stats.pending_izin_sekolah > 0 ? "text-amber-500 animate-pulse" : "text-slate-800"}`}>{seksiData.stats.pending_izin_sekolah}</h3>
                  </div>
                </>
              )}
              {isKeuangan && (
                <>
                  <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Pemasukan</p>
                    <h3 className="text-2xl font-black text-emerald-600 mt-2">{formatCurrency(seksiData.stats.total_income)}</h3>
                  </div>
                  <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Pengeluaran</p>
                    <h3 className="text-2xl font-black text-rose-600 mt-2">{formatCurrency(seksiData.stats.total_expense)}</h3>
                  </div>
                  <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Saldo Bersih</p>
                    <h3 className={`text-2xl font-black mt-2 ${seksiData.stats.balance >= 0 ? "text-indigo-650" : "text-rose-655"}`}>{formatCurrency(seksiData.stats.balance)}</h3>
                  </div>
                  <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">SPP Lunas</p>
                    <h3 className="text-3xl font-black text-slate-800 mt-2">{seksiData.stats.total_payments}</h3>
                  </div>
                </>
              )}
              {!isKeamanan && !isPendidikan && !isKeuangan && (
                <>
                  <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm col-span-2">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Jumlah Anggota Aktif</p>
                    <h3 className="text-3xl font-black text-slate-800 mt-2">{seksiData.members.length} Orang</h3>
                  </div>
                  <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm col-span-2">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Data Rekaman</p>
                    <h3 className="text-3xl font-black text-slate-800 mt-2">{seksiData.stats.custom_records} Data</h3>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Section Members & Activity Logs */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Members Section */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden lg:col-span-2">
              <div className="p-6 border-b border-slate-50 flex items-center justify-between bg-slate-50/20">
                <div>
                  <h3 className="font-extrabold text-slate-800 text-base">Anggota Seksi (Staf & Pembimbing)</h3>
                  <p className="text-[10px] text-slate-400 uppercase font-black tracking-wider mt-0.5">Daftar Anggota Pengurus di Bawah Koordinasi Anda</p>
                </div>
                {seksiData && (
                  <span className="px-3 py-1 bg-indigo-50 border border-indigo-100 text-indigo-600 text-[10px] font-black uppercase tracking-wider rounded-lg">
                    {seksiData.members.length} Anggota
                  </span>
                )}
              </div>
              
              <div className="overflow-x-auto">
                {seksiLoading ? (
                  <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                    <Loader2 className="w-8 h-8 animate-spin text-indigo-650 mb-3" />
                    <p className="text-xs font-bold uppercase tracking-wider">Memuat daftar anggota...</p>
                  </div>
                ) : !seksiData || seksiData.members.length === 0 ? (
                  <div className="text-center py-20 text-slate-400 text-xs font-bold italic">
                    Belum ada anggota terdaftar untuk seksi ini
                  </div>
                ) : (
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50 text-left">
                        <th className="px-6 py-3">Nama Anggota</th>
                        <th className="px-6 py-3">Jabatan Spesifik</th>
                        <th className="px-6 py-3">Kamar</th>
                        <th className="px-6 py-3 text-right">Kontak</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 text-slate-700 font-bold">
                      {seksiData.members.map((m: any) => (
                        <tr key={m.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-6 py-3.5">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-linear-to-br from-indigo-500 to-teal-500 flex items-center justify-center text-white font-black text-xs shrink-0 overflow-hidden">
                                {m.photo_url ? (
                                  <img src={m.photo_url} alt={m.name} className="w-full h-full object-cover" />
                                ) : (
                                  m.name.substring(0,2).toUpperCase()
                                )}
                              </div>
                              <span className="font-extrabold text-slate-800 uppercase text-xs">{m.name}</span>
                            </div>
                          </td>
                          <td className="px-6 py-3.5 text-xs text-slate-500 font-medium">{m.jabatan}</td>
                          <td className="px-6 py-3.5 text-xs text-slate-600">{m.kamar || "-"}</td>
                          <td className="px-6 py-3.5 text-right">
                            {m.phone ? (
                              <a 
                                href={`https://wa.me/${m.phone.replace(/[^0-9]/g, '')}`} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 border border-emerald-100 hover:bg-emerald-100 text-emerald-600 hover:text-emerald-700 transition-all rounded-lg text-[10px] font-black uppercase"
                              >
                                <Phone className="w-3 h-3" /> WhatsApp
                              </a>
                            ) : (
                              <span className="text-[10px] text-slate-350">Tidak ada nomor</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>

            {/* Section Activity Log */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-50 bg-slate-50/20">
                <h3 className="font-extrabold text-slate-800 text-base">Aktivitas Anggota Seksi</h3>
                <p className="text-[10px] text-slate-400 uppercase font-black tracking-wider mt-0.5">Laporan Masukan & Kasus Terbaru Anggota</p>
              </div>
              <div className="p-6">
                {seksiLoading ? (
                  <div className="space-y-4 py-8">
                    <div className="h-10 bg-slate-50 rounded-xl animate-pulse" />
                    <div className="h-10 bg-slate-50 rounded-xl animate-pulse" />
                  </div>
                ) : !seksiData || seksiData.activities.length === 0 ? (
                  <div className="text-center py-16 text-slate-400 text-xs font-bold italic">
                    Belum ada laporan aktivitas dari anggota seksi
                  </div>
                ) : (
                  <div className="space-y-4">
                    {seksiData.activities.map((a: any, idx: number) => (
                      <div key={idx} className="flex gap-3 text-xs leading-relaxed items-start border-l-2 border-slate-100 pl-4 relative">
                        <div className="absolute -left-[5px] top-1.5 w-2.5 h-2.5 rounded-full bg-indigo-500 border border-white" />
                        <div>
                          <p className="font-extrabold text-slate-700 uppercase tracking-wide text-[10px]">{a.type}</p>
                          <p className="text-slate-600 font-medium mt-0.5">{a.description}</p>
                          <span className="text-[9px] text-slate-450 mt-1 block font-bold">{new Date(a.time).toLocaleString('id-ID', { hour: '2-digit', minute:'2-digit', day:'numeric', month:'short' })}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>
      </DashboardLayout>
    );
  }

  // Render the Default General/Admin Dashboard
  return (
    <DashboardLayout>
      {/* Stats Grid */}
      <style dangerouslySetInnerHTML={{ __html: `
        .stat-card-custom {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .stat-card-custom:hover {
          transform: translateY(-4px);
        }
      `}} />
      <section
        className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6"
        aria-label="Statistik Utama"
      >
        <StatCard
          iconBg="bg-emerald-50"
          iconColor="text-emerald-600"
          iconSvgPath={ICONS.users}
          badge="+12%"
          badgeColor="text-emerald-600 bg-emerald-50"
          value={loading ? "..." : stats.santri_aktif.toString()}
          label="Total Santri Aktif"
          delay={1}
        />
        <StatCard
          iconBg="bg-blue-50"
          iconColor="text-blue-600"
          iconSvgPath={ICONS.userCheck}
          badge="+3"
          badgeColor="text-blue-600 bg-blue-50"
          value={loading ? "..." : stats.tenaga_pengurus.toString()}
          label="Tenaga Pengurus"
          delay={2}
        />
        <StatCard
          iconBg="bg-amber-50"
          iconColor="text-amber-600"
          iconSvgPath={ICONS.wallet}
          badge={`${stats.spp_persentase}%`}
          badgeColor="text-amber-600 bg-amber-50"
          value={loading ? "..." : formatCurrency(stats.spp_terkumpul)}
          label="SPP Terkumpul"
          delay={3}
        />
        <StatCard
          iconBg="bg-rose-50"
          iconColor="text-rose-600"
          iconSvgPath={ICONS.alertCircle}
          badge="Urgent"
          badgeColor="text-rose-600 bg-rose-50"
          value={loading ? "..." : stats.tunggakan_spp.toString()}
          label="Tunggakan SPP"
          delay={4}
        />
      </section>

      {/* Charts + Activity */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5 mb-6">
        <SPPChart data={data?.chart_data} />
        <ActivityFeed activities={data?.activities} />
      </section>

      {/* Santri Table */}
      <SantriTable data={data?.recent_santri} />
    </DashboardLayout>
  );
}
