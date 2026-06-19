"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
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
} from "lucide-react";
import { useRouter } from "next/navigation";

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
  role_level: string; // Add this
  name: string;
  timestamp: number;
}

function Badge({ count, color, animate }: { count: number | null, color: string, animate?: boolean }) {
  if (count === null) return <span className="w-4 h-4 rounded-full bg-white/5 animate-pulse" />;
  
  return (
    <span
      key={count} // Key change triggers re-render animation
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

  // Fetch Session on Mount
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

  if (session?.role === "Seksi Keuangan" || session?.role_level === "RESTRICTED_SPP") return null;

  async function fetchStats() {
    try {
      const res = await fetch("https://api-worker.ppdslirboyo.workers.dev/api/stats/menu");
      const json = (await res.json()) as any;
      if (json.success) {
        setStats(json.data);
      }
    } catch (e) {
      console.error("Gagal ambil stats menu", e);
    }
  }

  useEffect(() => {
    fetchStats();
    
    // Listen for custom update events
    window.addEventListener('santri-updated', fetchStats);
    window.addEventListener('pengurus-updated', fetchStats);
    return () => {
      window.removeEventListener('santri-updated', fetchStats);
      window.removeEventListener('pengurus-updated', fetchStats);
    };
  }, []);

  const handleLogout = () => {
    fetch("/api/auth/logout", { method: "POST" }).then(() => {
      router.push("/login");
    });
  };

  const canAccess = (module: 'SEKRETARIAT' | 'KEUANGAN' | 'PENGATURAN' | 'PUSAT_KONTROL') => {
    if (!session) return false;
    const level = session.role_level;
    if (level === 'ROOT') return true;

    if (module === 'SEKRETARIAT') {
      return level === 'SEKRETARIAT' || level === 'VIEW_ALL' || level === 'ROOT';
    }
    if (module === 'KEUANGAN') {
      return level === 'KEUANGAN' || level === 'RESTRICTED_SPP' || level === 'VIEW_ALL' || level === 'ROOT';
    }
    if (module === 'PENGATURAN') {
      return level === 'SEKRETARIAT'; // Khusus Sekretaris
    }
    if (module === 'PUSAT_KONTROL') {
      return level === 'ROOT'; // Khusus Super Admin
    }
    return false;
  };

  const navGroups = [];

  // 1. Menu Utama (Sekretariat)
  if (canAccess('SEKRETARIAT')) {
    navGroups.push({
      label: "Menu Utama",
      items: [
        { href: "/", icon: LayoutDashboard, label: "Dashboard" },
        {
          href: "/santri",
          icon: Users,
          label: "Data Santri",
          badge: <Badge count={stats?.santri ?? null} color="bg-emerald-500/20 text-emerald-400" animate />
        },
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
              <div className="w-[1px] h-3 bg-white/10 self-center" />
              <Badge count={stats.alumni_pengurus} color="bg-rose-500/20 text-rose-400" animate />
            </div>
          ) : <Badge count={null} color="" />
        },
      ],
    });
  }

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

  // 4. Konfigurasi
  const configItems = [];
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
          fixed lg:static z-50 w-64 h-full flex-shrink-0
          bg-sidebar text-white flex flex-col
          transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0
        `}
      >
        <div className="px-5 py-5 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg overflow-hidden flex items-center justify-center flex-shrink-0">
              <img 
                src="/logopondok.png" 
                alt="Logo PPDS" 
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

        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {navGroups.map((group) => (
            <div key={group.label}>
              <div className="px-3 mb-2 mt-4 first:mt-0 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">
                {group.label}
              </div>
              {group.items.map((item) => {
                const isActive = pathname === item.href;
                //@ts-ignore
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
                        //@ts-ignore
                        item.premium ? "bg-gradient-to-r from-rose-500/10 to-transparent border-l-2 border-rose-500 text-rose-400" : ""
                      }
                      ${
                        isActive
                          ? "bg-white/5 border-r-[3px] border-emerald-400 text-white"
                          : "text-slate-300 hover:bg-white/8"
                      }
                    `}
                  >
                    <Icon
                      className={`w-[18px] h-[18px] flex-shrink-0 
                        ${isActive ? "text-emerald-400" : ""}
                        ${//@ts-ignore
                         item.premium && !isActive ? "text-rose-500" : ""}
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
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-[11px] font-black flex-shrink-0 border border-white/10 shadow-lg">
              {session ? getInitials(session.name) : "..."}
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
