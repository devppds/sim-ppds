"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import {
  LayoutDashboard,
  Users,
  UserCheck,
  Archive,
  Wallet,
  Receipt,
  Bed,
  Box,
  Settings,
  LogOut,
  ShieldAlert,
  Wrench,
  Package,
  HeartPulse,
  Store,
  ShieldCheck,
  Calendar,
  Music,
  Zap,
  Trash2,
  Hammer,
  Video,
  MoonStar,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { API_BASE_URL } from "@/lib/config";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

interface MenuStats {
  santri: number;
  pengurus: number;
  alumni_santri: number;
  alumni_pengurus: number;
}

interface SessionData {
  id: number;
  username: string;
  role: string;
  role_level: string;
  name: string;
  timestamp: number;
  avatar_url?: string;
}

interface NavItem {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  badge?: React.ReactNode;
  customBadge?: React.ReactNode;
  dot?: boolean;
  premium?: boolean;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

function Badge({ count, color, animate }: { count: number | null, color: string, animate?: boolean }) {
  if (count === null) return <span className="w-4 h-4 rounded-full bg-white/5 animate-pulse" />;
  
  return (
    <span
      key={count}
      className={`text-[9px] ${color} px-2 py-0.5 rounded-full font-black min-w-[20px] text-center ${animate ? 'animate-in zoom-in-75 duration-300' : ''}`}
    >
      {count}
    </span>
  );
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [stats, setStats] = useState<MenuStats | null>(null);
  const [session, setSession] = useState<SessionData | null>(null);

  useEffect(() => {
    fetch("/api/auth/session")
      .then(res => res.json() as Promise<{ success: boolean; session?: SessionData }>)
      .then((data) => {
        if (data.success && data.session) {
          setSession(data.session);
        }
      })
      .catch(e => console.error("Session fetch error", e));
  }, []);

  async function fetchStats() {
    try {
      const res = await fetch(`${API_BASE_URL}/api/stats/menu`);
      const json = (await res.json()) as { success: boolean; data: MenuStats };
      if (json.success) {
        setStats(json.data);
      }
    } catch (e) {
      console.error("Gagal ambil stats menu", e);
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchStats();
    }, 0);
    
    window.addEventListener('santri-updated', fetchStats);
    window.addEventListener('pengurus-updated', fetchStats);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('santri-updated', fetchStats);
      window.removeEventListener('pengurus-updated', fetchStats);
    };
  }, []);

  const handleLogout = () => {
    fetch("/api/auth/logout", { method: "POST" }).then(() => {
      router.push("/login");
    });
  };

  const canAccess = (module: 'SEKRETARIAT' | 'KEUANGAN' | 'PENGATURAN' | 'PUSAT_KONTROL' | 'OPERASIONAL') => {
    if (!session) return false;
    const level = session.role_level;
    const role = (session.role || "").toUpperCase();
    const name = (session.name || "").toUpperCase();
    
    // ROOT / MUDIR / DEVELOPER
    if (level === 'ROOT' || role === 'MUDIR' || role.includes('SUPER') || role === 'DEVELOPER') return true;

    if (module === 'SEKRETARIAT') {
      return level === 'SEKRETARIAT' || level === 'VIEW_ALL' || level === 'ROOT' || 
             role.includes('SEKRETARIS') || role.includes('SEKRETARIAT') || name.includes('SEKRETARIAT');
    }
    if (module === 'KEUANGAN') {
      return level === 'KEUANGAN' || level === 'RESTRICTED_SPP' || level === 'VIEW_ALL' || level === 'ROOT' || 
             role.includes('BENDAHARA') || role.includes('KEUANGAN') || name.includes('KEUANGAN');
    }
    if (module === 'PENGATURAN') {
      return true; 
    }
    if (module === 'PUSAT_KONTROL') {
      return level === 'ROOT' || level === 'SEKRETARIAT' || role.includes('SEKRETARIS') || role.includes('SEKRETARIAT') || role === 'DEVELOPER'; 
    }
    if (module === 'OPERASIONAL') {
      return level === 'STAFF' || level === 'SEKRETARIAT' || level === 'VIEW_ALL' || level === 'ROOT' || level === 'OPERASIONAL' ||
             role.includes('SEKRETARIS') || role.includes('SEKRETARIAT');
    }
    return false;
  };

  const isRestricted = session !== null && (session.role === "Seksi Keuangan" || session.role_level === "RESTRICTED_SPP");
  // We no longer hide the sidebar for Seksi Keuangan to ensure a consistent, professional layout for all users.
  // if (isRestricted) return null;

  const navGroups: NavGroup[] = [];

  // 1. Menu Utama (Semua Role Punya Dashboard)
  const menuUtamaItems: NavItem[] = [
    { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" }
  ];

  if (session) {
    menuUtamaItems.push({
      href: "/santri",
      icon: Users,
      label: "Data Santri",
      badge: <Badge count={stats?.santri ?? null} color="bg-emerald-500/20 text-emerald-400" animate />
    });
    menuUtamaItems.push({
      href: "/ebudgeting",
      icon: Receipt,
      label: "E-Budgeting",
      customBadge: <span className="text-[9px] bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full font-black">NEW</span>
    });
    if (!session.role.includes("Ketua") && session.role !== "Mudir") {
      menuUtamaItems.push({
        href: "/jadwal-jaga",
        icon: Calendar,
        label: "Jadwal & Jaga",
        dot: true
      });
    }
  }

  if (canAccess('SEKRETARIAT')) {
    menuUtamaItems.push(
      { 
        href: "/pengurus", 
        icon: UserCheck, 
        label: "Data Pengurus",
        badge: <Badge count={stats?.pengurus ?? null} color="bg-blue-500/20 text-blue-400" animate />
      },
      { 
        href: "/alumni", 
        icon: Archive, 
        label: "Data Alumni",
        customBadge: stats ? (
          <div className="flex gap-1">
            <Badge count={stats.alumni_santri} color="bg-amber-500/20 text-amber-400" animate />
            <div className="w-px h-3 bg-white/10 self-center" />
            <Badge count={stats.alumni_pengurus} color="bg-rose-500/20 text-rose-400" animate />
          </div>
        ) : <Badge count={null} color="" />
      }
    );
  }

  navGroups.push({
    label: "Menu Utama",
    items: menuUtamaItems,
  });

  // 2. Keuangan Section
  if (canAccess('KEUANGAN')) {
    navGroups.push({
      label: "Keuangan",
      items: [
        {
          href: "/spp",
          icon: Wallet,
          label: "Pembayaran SPP",
          dot: true,
        },
        { href: "/keuangan", icon: Receipt, label: "Laporan Keuangan" },
      ],
    });
  }

  // 3. Lainnya (Asrama & Arsip)
  if (canAccess('SEKRETARIAT')) {
    const lainnyaItems = [
      { href: "/asrama", icon: Bed, label: "Asrama" },
      { href: "/arsip", icon: Box, label: "Arsip" },
    ];
    navGroups.push({
      label: "Lainnya",
      items: lainnyaItems
    });
  }

  // 4. Operasional (Keamanan, Pendidikan, dll)
  if (canAccess('OPERASIONAL')) {
    const role = (session?.role || "").toUpperCase();
    const level = session?.role_level || "";
    const isSuper = level === 'ROOT' || level === 'VIEW_ALL' || role === 'MUDIR' || role.includes('SUPER') || role.includes('SEKRETARIS');

    const operasionalItems = [];
    if (isSuper || role === 'KEAMANAN') operasionalItems.push({ href: "/keamanan", icon: ShieldAlert, label: "Keamanan" });
    if (isSuper || role === 'PENDIDIKAN') operasionalItems.push({ href: "/pendidikan", icon: UserCheck, label: "Pendidikan" });
    if (isSuper || role === 'WAJAR') operasionalItems.push({ href: "/wajar", icon: LayoutDashboard, label: "Wajib Belajar" });
    if (isSuper || role === 'JAMIYYAH' || role.includes('JAMI')) operasionalItems.push({ href: "/jamiyyah", icon: Music, label: "Jam'iyyah" });
    if (isSuper || role === 'PLP') operasionalItems.push({ href: "/plp", icon: Zap, label: "Listrik & Air (PLP)" });
    if (isSuper || role === 'KBR' || role.includes('KEBERSIHAN')) operasionalItems.push({ href: "/kebersihan", icon: Trash2, label: "Kebersihan (KBR)" });
    if (isSuper || role === 'PEMBANGUNAN') operasionalItems.push({ href: "/pembangunan", icon: Hammer, label: "Pembangunan" });
    if (isSuper || role === 'MEDIA') operasionalItems.push({ href: "/media", icon: Video, label: "Media & Lab" });
    if (isSuper || role === 'TAKMIR') operasionalItems.push({ href: "/takmir", icon: MoonStar, label: "Takmir Masjid" });

    if (operasionalItems.length > 0) {
      navGroups.push({
        label: "Operasional",
        items: operasionalItems
      });
    }

    const layananItems = [];
    if (isSuper || role === 'FASILITAS') layananItems.push({ href: "/fasilitas", icon: Wrench, label: "Fasilitas & Sarpras" });
    if (isSuper || role === 'LOGISTIK' || role === 'HUMASY') layananItems.push({ href: "/logistik", icon: Package, label: "Logistik & Kebersihan" });
    if (isSuper || role === 'KESEHATAN' || role === 'KLINIK') layananItems.push({ href: "/klinik", icon: HeartPulse, label: "Pos Kesehatan (UKP)" });
    if (isSuper || role === 'BUMP') layananItems.push({ href: "/bump", icon: Store, label: "Unit Usaha BUMP" });

    if (layananItems.length > 0) {
      navGroups.push({
        label: "Layanan & Usaha",
        items: layananItems
      });
    }
  }

  // 5. Eksekutif & Integrasi
  if (session) {
    const level = session.role_level;
    const eksekutifItems = [];
    if (level === 'ROOT' || level === 'VIEW_ALL' || level === 'SEKRETARIAT' || level === 'KEUANGAN') {
      eksekutifItems.push({ href: "/eksekutif", icon: ShieldCheck, label: "Dasbor Eksekutif" });
    }
    if (level === 'ROOT' || level === 'VIEW_ALL' || level === 'SEKRETARIAT') {
      eksekutifItems.push({ href: "/clearance", icon: Calendar, label: "E-Clearance Boyong" });
    }
    if (eksekutifItems.length > 0) {
      navGroups.push({
        label: "Eksekutif & Integrasi",
        items: eksekutifItems
      });
    }
  }

  // 6. Konfigurasi
  const configItems: NavItem[] = [];
  if (canAccess('PENGATURAN')) {
    configItems.push({ href: "/pengaturan", icon: Settings, label: "Pengaturan" });
  }
  if (canAccess('PUSAT_KONTROL')) {
    configItems.push({
      href: "/pusat-kontrol",
      icon: ShieldAlert,
      label: "Pusat Kontrol",
      premium: true
    });
  }

  if (configItems.length > 0) {
    navGroups.push({
      label: "Konfigurasi",
      items: configItems
    });
  }
  if (session) {
    const roleLower = (session.role || "").toLowerCase();
    const usernameLower = (session.username || "").toLowerCase();
    const isAnggota = roleLower.includes("anggota") || usernameLower.includes("anggota");
    if (!isAnggota) {
      navGroups.push({
        label: "Dukungan Sistem",
        items: [
          { href: "/developer", icon: Wrench, label: "Developer", premium: true }
        ]
      });
    }
  }
  const getInitials = (name: string | undefined | null) => {
    if (!name) return "??";
    return name.split(' ').map(n => n?.[0] || '').join('').toUpperCase().substring(0, 2);
  };

  return (
    <>
      <div
        className={`fixed inset-0 bg-black/50 z-40 lg:hidden ${isOpen ? "" : "hidden"}`}
        onClick={onClose}
        aria-hidden="true"
      />

      <aside
        className={`
          fixed lg:static z-50 w-64 h-full shrink-0
          bg-sidebar text-white flex flex-col
          transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0
        `}
      >
        <div className="px-5 py-5 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg overflow-hidden flex items-center justify-center shrink-0 relative">
              <Image 
                src="/logopondok.png" 
                alt="Logo PPDS" 
                width={40}
                height={40}
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <div className="font-bold text-sm tracking-wide">SIM-PPDS</div>
              <div className="text-[10px] text-slate-400 tracking-wider uppercase">
                Manajemen Pesantren
              </div>
            </div>
          </div>
        </div>

        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto custom-scrollbar">
          {navGroups.map((group) => (
            <div key={group.label}>
              <div className="px-3 mb-2 mt-4 first:mt-0 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">
                {group.label}
              </div>
              {group.items.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => {
                      if (window.innerWidth < 1024) onClose();
                    }}
                    className={`
                      flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-bold
                      transition-all duration-200
                      ${
                        item.premium ? "bg-linear-to-r from-rose-500/10 to-transparent border-l-2 border-rose-500 text-rose-400" : ""
                      }
                      ${
                        isActive
                          ? "bg-white/5 border-r-[3px] border-emerald-400 text-white"
                          : "text-slate-300 hover:bg-white/5"
                      }
                    `}
                  >
                    <Icon
                      className={`w-[18px] h-[18px] shrink-0 
                        ${isActive ? "text-emerald-400" : ""}
                        ${item.premium && !isActive ? "text-rose-500" : ""}
                      `}
                    />
                    <span className="flex-1">{item.label}</span>
                    {"badge" in item && item.badge}
                    {"customBadge" in item && item.customBadge}
                    {"dot" in item && item.dot && (
                      <span className="w-2 h-2 bg-rose-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(244,63,94,0.5)]" />
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        <div className="px-4 py-4 border-t border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-linear-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-[11px] font-black shrink-0 border border-white/10 shadow-lg overflow-hidden">
              {session?.avatar_url ? (
                <img src={session.avatar_url} alt={session.name} className="w-full h-full object-cover" />
              ) : (
                session ? getInitials(session.name) : "..."
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-bold truncate text-white">{session?.name || "Loading..."}</div>
              <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{session?.role || "Pengurus"}</div>
            </div>
            <button
              onClick={handleLogout}
              className="text-slate-500 hover:text-rose-500 transition-colors bg-white/5 p-2 rounded-lg"
              aria-label="Keluar"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
