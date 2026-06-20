"use client";

import { useState, useEffect } from "react";
import { User, Lock, Eye, EyeOff, Loader2, ArrowLeft } from "lucide-react";
import { useToast } from "@/components/Toast";
import { useRouter } from "next/navigation";
import Link from "next/link";

const footerTexts = [
  "Sistem cerdas ini dikembangkan oleh alumni Pondok Pesantren Darussalam Lirboyo.",
  "Semoga aplikasi ini menjadi jariyyah dan bermanfa'at bagi Pondok Pesantren Darussalam Lirboyo.",
  "© 2026 DEVELZY"
];

export default function MasukPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [footerIndex, setFooterIndex] = useState(0);
  const [fade, setFade] = useState(true);
  const [isAppMode, setIsAppMode] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches || 
                          (window.navigator as any).standalone || 
                          navigator.userAgent.includes('Electron');
      setIsAppMode(!!isStandalone);
    }

    const interval = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setFooterIndex((prev) => (prev + 1) % footerTexts.length);
        setFade(true);
      }, 800);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const { showToast } = useToast();
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const json = await res.json() as any;
      if (json.success) {
        showToast("Login Berhasil. Selamat datang!", "success");
        setTimeout(() => { router.push("/dashboard"); }, 800);
      } else {
        showToast(json.error || "Akses Ditolak", "error");
      }
    } catch {
      showToast("Server tidak merespon", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `body { background-color: #021c14 !important; }` }} />
      <div className="fixed inset-0 bg-[#021c14] overflow-y-auto selection:bg-amber-500/30">
        <div className="min-h-full w-full flex items-center justify-center p-4 sm:p-6 relative font-sans">
        
        {/* Premium Background Orbs */}
        <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-amber-600/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-[600px] h-[600px] bg-emerald-600/10 rounded-full blur-[120px] pointer-events-none" />

        {/* Top Bar for back navigation */}
        {!isAppMode && (
          <div className="absolute top-0 left-0 w-full p-4 sm:p-6 z-20">
            <Link 
              href="/" 
              className="inline-flex items-center gap-2 text-emerald-400/70 hover:text-emerald-400 transition-colors bg-[#021c14]/50 backdrop-blur-md px-4 py-2 rounded-full border border-emerald-500/20"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm font-bold uppercase tracking-wider">Kembali</span>
            </Link>
          </div>
        )}

        {/* Main Card */}
        <div className="w-full max-w-md bg-[#064e3b]/40 backdrop-blur-xl border border-amber-500/20 rounded-[2.5rem] shadow-[0_30px_60px_rgba(0,0,0,0.5)] shadow-amber-900/10 relative z-10 flex flex-col overflow-hidden">
          
          <div className="p-8 sm:p-10 flex-1">
            {/* Logo */}
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-linear-to-br from-[#064e3b] to-[#022c22] rounded-3xl flex items-center justify-center p-4 shadow-[0_0_20px_rgba(245,158,11,0.15)] border border-amber-500/30">
                <img src="/logopondok.png" alt="Logo" className="w-full h-full object-contain" />
              </div>
            </div>

            {/* Title */}
            <div className="text-center mb-10">
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mb-2">SIM-PPDS</h1>
              <p className="text-xs font-bold uppercase tracking-widest text-amber-400">Sistem Informasi Manajemen</p>
            </div>

            {/* Form */}
            <form onSubmit={handleLogin} className="space-y-6">
              
              {/* Username */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-emerald-100/70 ml-1 uppercase tracking-wider">Username</label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500/50 group-focus-within:text-amber-400 transition-colors">
                    <User className="w-5 h-5" />
                  </div>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Contoh: admin, ustadz, wali"
                    className="w-full bg-[#021c14] border border-emerald-800/50 focus:border-amber-400/50 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold text-white transition-all outline-none placeholder:text-emerald-700 focus:ring-1 focus:ring-amber-400/50 shadow-inner"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-emerald-100/70 ml-1 uppercase tracking-wider">Password</label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500/50 group-focus-within:text-amber-400 transition-colors">
                    <Lock className="w-5 h-5" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-[#021c14] border border-emerald-800/50 focus:border-amber-400/50 rounded-2xl py-4 pl-12 pr-12 text-sm font-bold text-white transition-all outline-none placeholder:text-emerald-700 focus:ring-1 focus:ring-amber-400/50 shadow-inner"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-500/50 hover:text-amber-400 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Remember Me & Help */}
              <div className="flex items-center justify-between pt-2">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className="w-5 h-5 rounded-md border-2 border-emerald-800 bg-[#021c14] flex items-center justify-center group-hover:border-amber-500/50 transition-colors">
                     <div className="w-2.5 h-2.5 bg-amber-400 rounded-sm opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <span className="text-xs font-bold text-emerald-100/70 group-hover:text-amber-100 transition-colors">Ingat Saya</span>
                </label>
                <a href="https://wa.me/6281527662023" target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-amber-500 hover:text-amber-400 transition-colors underline decoration-amber-500/30 underline-offset-4">
                  Bantuan Akses?
                </a>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full mt-4 bg-linear-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-[#021c14] py-4 rounded-2xl text-sm font-black tracking-widest flex items-center justify-center gap-3 transition-all shadow-[0_0_20px_rgba(245,158,11,0.2)] hover:shadow-[0_0_30px_rgba(245,158,11,0.4)] active:scale-95 uppercase"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Masuk ke Sistem"}
              </button>

            </form>
          </div>
          
          {/* Footer in Card */}
          <div className="flex flex-col items-center justify-center pb-8 pt-6 bg-[#021c14]/80 border-t border-amber-500/10 relative z-10 mt-auto backdrop-blur-md h-[100px] px-6 text-center">
            <p className={`text-[10px] font-black text-amber-500/50 uppercase tracking-widest transition-opacity duration-700 leading-relaxed ${fade ? 'opacity-100' : 'opacity-0'}`}>
              {footerTexts[footerIndex]}
            </p>
          </div>

        </div>
        </div>
      </div>
    </>
  );
}
