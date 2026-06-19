"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import { Bell, Menu, Plus, Search, User, Ghost, GraduationCap, X, LogOut, ShieldCheck } from "lucide-react";
import AddSantriModal from "./AddSantriModal";
import NotificationModal from "./NotificationModal";
import { useRouter } from "next/navigation";
import { API_BASE_URL } from "@/lib/config";

interface TopbarProps {
  onMenuToggle: () => void;
}

export default function Topbar({ onMenuToggle }: TopbarProps) {
  const router = useRouter();
  const [session, setSession] = useState<any>(null);

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

  const handleLogout = () => {
    fetch("/api/auth/logout", { method: "POST" }).then(() => {
      router.push("/login");
    });
  };
  
  // States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  
  const searchRef = useRef<HTMLDivElement>(null);

  // Dynamic Academic Year Logic
  const academicYear = useMemo(() => {
    try {
      const now = new Date();
      // Use islamic calendar to get Hijri month
      const hijriFormatter = new Intl.DateTimeFormat('id-ID-u-ca-islamic', { month: 'numeric' });
      const hijriMonth = parseInt(hijriFormatter.format(now));
      const year = now.getFullYear();
      
      // If Hijri month is Syawal (10) or later
      if (hijriMonth >= 10) {
        return `${year}/${year + 1}`;
      } else {
        return `${year - 1}/${year}`;
      }
    } catch (e) {
      return "2025/2026"; 
    }
  }, []);

  // Search Logic
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (searchQuery.length > 1) {
        setIsSearching(true);
        try {
          const res = await fetch(`${API_BASE_URL}/api/search?q=${encodeURIComponent(searchQuery)}`);
          const json = await res.json() as { success: boolean, results: any[] };
          if (json.success) setSearchResults(json.results);
        } catch (e) {
          console.error(e);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Click Outside to close search
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowResults(false);
      }
    };
    window.addEventListener("mousedown", handleClick);
    return () => window.removeEventListener("mousedown", handleClick);
  }, []);

  const [unreadCount, setUnreadCount] = useState(0);

  const fetchUnread = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/notifications`);
      const json = (await res.json()) as any;
      if (json.success) setUnreadCount(json.unreadCount);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchUnread();
    const interval = setInterval(fetchUnread, 30000); // Polling every 30s
    return () => clearInterval(interval);
  }, []);

  const handleResultClick = (item: any) => {
    setShowResults(false);
    setSearchQuery("");
    if (item.type === 'santri') {
      router.push(`/santri?id=${item.id}`); 
    } else {
      router.push(`/pengurus?id=${item.id}`);
    }
  };

  return (
    <header className="flex-shrink-0 bg-white border-b border-slate-200 px-4 sm:px-6 lg:px-8 py-3 relative z-[50]">
      <div className="flex items-center justify-between">
        {/* Left */}
        <div className="flex items-center gap-3">
          {session?.role !== "Seksi Keuangan" && (
            <button
              id="menuToggle"
              className="lg:hidden p-2 -ml-2 rounded-lg hover:bg-slate-100 transition-colors"
              onClick={onMenuToggle}
            >
              <Menu className="w-5 h-5 text-slate-600" />
            </button>
          )}
          <div className="hidden sm:block">
            <h1 className="text-base sm:text-lg font-black text-[#1e293b] tracking-tight">
              {session?.role === "Seksi Keuangan" ? "Sistem Pembayaran SPP" : `Selamat Datang, ${session?.name || "Ustadz"}`}
            </h1>
            <p className="text-[10px] font-bold text-[#64748b] flex items-center gap-1.5 uppercase tracking-wider">
              <span>Pondok Pesantren Darussalam</span>
              <span className="w-1 h-1 rounded-full bg-slate-300" />
              {session?.role === "Seksi Keuangan" ? (
                <span className="text-rose-600 font-black flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> Seksi Keuangan
                </span>
              ) : (
                <span className="text-indigo-600 font-black">Tahun Ajaran {academicYear}</span>
              )}
            </p>
          </div>
        </div>

        {/* Right */}
        <div className="flex items-center gap-2 sm:gap-4">
          {session?.role !== "Seksi Keuangan" && (
            <>
              {/* Universal Search */}
              <div className="hidden md:block relative" ref={searchRef}>
                <div className={`flex items-center bg-slate-100 rounded-2xl px-4 py-2.5 gap-3 w-72 transition-all duration-300 focus-within:bg-white focus-within:ring-4 focus-within:ring-indigo-100 border-2 ${showResults ? 'border-indigo-400 bg-white' : 'border-transparent'}`}>
                  <Search className={`w-4 h-4 transition-colors ${showResults ? 'text-indigo-500' : 'text-slate-400'}`} />
                  <input
                    type="text"
                    placeholder="Cari santri, ustadz..."
                    className="bg-transparent text-sm font-bold outline-none w-full placeholder:text-slate-400 text-slate-700"
                    value={searchQuery}
                    onFocus={() => setShowResults(true)}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  {isSearching && <div className="w-3 h-3 border-2 border-indigo-500 border-t-transparent animate-spin rounded-full" />}
                </div>

                {/* Results Dropdown */}
                {showResults && searchQuery.length > 0 && (
                  <div className="absolute top-full mt-3 left-0 right-0 bg-white rounded-[24px] shadow-2xl border border-slate-100 overflow-hidden animate-in slide-in-from-top-2 duration-200">
                    <div className="p-2">
                      {searchQuery.length > 1 ? (
                        searchResults.length > 0 ? (
                          <div className="space-y-1">
                            {searchResults.map((res) => (
                              <button
                                key={`${res.type}-${res.id}`}
                                onClick={() => handleResultClick(res)}
                                className="w-full flex items-center gap-3 p-3 rounded-2xl hover:bg-slate-50 transition-colors text-left group"
                              >
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center overflow-hidden ${res.type === 'santri' ? 'bg-emerald-50 text-emerald-600' : 'bg-indigo-50 text-indigo-600'}`}>
                                  {res.photo_url ? (
                                    <img src={res.photo_url} alt={res.name} className="w-full h-full object-cover" />
                                  ) : (
                                    res.type === 'santri' ? <GraduationCap className="w-5 h-5" /> : <User className="w-5 h-5" />
                                  )}
                                </div>
                                <div>
                                  <p className="text-sm font-black text-slate-800 tracking-tight group-hover:text-indigo-600 transition-colors">{res.name}</p>
                                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{res.type} • {res.info}</p>
                                </div>
                              </button>
                            ))}
                          </div>
                        ) : (
                          <div className="p-8 text-center">
                            <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3">
                              <Ghost className="w-6 h-6 text-slate-300" />
                            </div>
                            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Tidak ditemukan</p>
                          </div>
                        )
                      ) : (
                        <div className="p-4 text-center">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Ketik minimal 2 karakter...</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Notification Bell */}
              <button
                onClick={() => setIsNotifOpen(true)}
                className="relative p-2.5 bg-slate-100 rounded-xl hover:bg-indigo-50 hover:text-indigo-600 transition-all active:scale-95 group"
              >
                <Bell className="w-5 h-5 text-slate-600 group-hover:text-indigo-600" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-rose-500 text-white rounded-full border-2 border-white animate-in zoom-in-50 duration-300 flex items-center justify-center text-[9px] font-black">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              <button 
                onClick={() => setIsAddModalOpen(true)}
                className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-black rounded-xl transition-all shadow-lg shadow-indigo-600/20 active:scale-95"
              >
                <Plus className="w-4 h-4" />
                Santri Baru
              </button>
            </>
          )}

          {session?.role === "Seksi Keuangan" && (
            <button 
              onClick={handleLogout}
              className="flex items-center gap-2 px-5 py-2.5 bg-rose-500 hover:bg-rose-600 text-white text-sm font-black rounded-xl transition-all shadow-lg shadow-rose-600/20 active:scale-95"
            >
              <LogOut className="w-4 h-4" />
              Keluar Sistem
            </button>
          )}
        </div>
      </div>

      <AddSantriModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={() => {
            window.dispatchEvent(new CustomEvent('santri-updated'));
        }}
        initialStatus="Baru"
      />

      <NotificationModal 
        isOpen={isNotifOpen} 
        onClose={() => setIsNotifOpen(false)} 
        onRead={fetchUnread}
      />
    </header>
  );
}
