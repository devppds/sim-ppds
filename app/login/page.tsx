"use client";

import { useState } from "react";
import { LogIn, ShieldCheck, Lock, User, Loader2, Eye, EyeOff, MessageCircle, Headphones } from "lucide-react";
import { useToast } from "@/components/Toast";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
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
        setTimeout(() => {
          router.push("/");
        }, 800);
      } else {
        showToast(json.error || "Akses Ditolak", "error");
      }
    } catch (err) {
      showToast("Server tidak merespon", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Decorative Gradients */}
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-emerald-100 rounded-full blur-[100px] opacity-60" />
      <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-indigo-100 rounded-full blur-[100px] opacity-60" />
      
      <div className="w-full max-w-md relative z-10">
        {/* Header Section */}
        <div className="text-center mb-10 fade-up">
           <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-2xl mb-6 shadow-xl shadow-slate-200/50 group transition-all hover:scale-105 overflow-hidden border border-slate-100">
              <img src="/logopondok.png" alt="Logo PPDS" className="w-full h-full object-contain" />
           </div>
           <h1 className="text-4xl font-black text-[#1e293b] tracking-tight mb-2">
              SIM<span className="text-emerald-600">-</span>PPDS
           </h1>
           <div className="flex flex-col gap-1 items-center">
              <p className="text-[#64748b] text-xs font-black tracking-[0.2em] uppercase">
                 Sistem Informasi Manajemen
              </p>
              <div className="w-8 h-1 bg-emerald-500 rounded-full mt-1" />
           </div>
        </div>

        {/* Login Card */}
        <div className="bg-white border border-slate-200/60 p-10 rounded-[2.5rem] shadow-2xl shadow-slate-200/50 fade-up delay-100">
           <div className="mb-8 text-center">
              <h2 className="text-xl font-bold text-[#1e293b]">Selamat Datang</h2>
              <p className="text-sm text-[#64748b] mt-1 font-medium">Pondok Pesantren Darussalam</p>
           </div>

           <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Username / NIP</label>
                 <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-600 transition-colors">
                       <User className="w-5 h-5" />
                    </div>
                    <input 
                      type="text" 
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Masukkan username anda"
                      className="w-full bg-[#f1f5f9]/50 border border-slate-200 focus:border-emerald-500 focus:bg-white outline-none rounded-2xl py-4 pl-12 pr-6 text-sm font-bold text-[#334155] transition-all placeholder:text-slate-400"
                      required
                    />
                 </div>
              </div>

              <div className="space-y-2">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Kata Sandi</label>
                 <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-600 transition-colors">
                       <Lock className="w-5 h-5" />
                    </div>
                    <input 
                      type={showPassword ? "text" : "password"} 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-[#f1f5f9]/50 border border-slate-200 focus:border-emerald-500 focus:bg-white outline-none rounded-2xl py-4 pl-12 pr-12 text-sm font-bold text-[#334155] transition-all placeholder:text-slate-400"
                      required
                    />
                    <button 
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#1e293b] transition-colors"
                    >
                       {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                 </div>
              </div>

              <button 
                type="submit"
                disabled={loading}
                className="w-full bg-[#0f1011] hover:bg-[#1f2937] text-white py-4 rounded-2xl text-sm font-black flex items-center justify-center gap-3 transition-all hover:scale-[1.02] active:scale-95 shadow-xl shadow-slate-200 relative overflow-hidden group"
              >
                 {loading ? (
                   <Loader2 className="w-5 h-5 animate-spin" />
                 ) : (
                   <>
                     Masuk ke Sistem <LogIn className="w-5 h-5" />
                   </>
                 )}
              </button>
           </form>

           <div className="mt-10 pt-6 border-t border-slate-100 uppercase">
              <div className="flex flex-col gap-4 text-center">
                <p className="text-[10px] font-black text-slate-400 tracking-widest">
                   Hubungi Bantuan
                </p>
                <div className="flex items-center justify-center gap-6">
                  <a 
                    href="https://wa.me/6281527662023" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex flex-col items-center gap-1.5 group"
                    title="Sekretaris Pondok"
                  >
                    <div className="w-10 h-10 rounded-full bg-[#25D366]/10 flex items-center justify-center text-[#25D366] group-hover:bg-[#25D366] group-hover:text-white transition-all shadow-sm">
                      <MessageCircle className="w-5 h-5 fill-current" />
                    </div>
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-tighter group-hover:text-emerald-600 transition-colors">Sekretaris</span>
                  </a>

                  <div className="w-[1px] h-6 bg-slate-100" />

                  <a 
                    href="https://wa.me/6285171542025" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex flex-col items-center gap-1.5 group"
                    title="Developer DEVELZY"
                  >
                    <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-sm">
                      <MessageCircle className="w-5 h-5 fill-current" />
                    </div>
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-tighter group-hover:text-indigo-600 transition-colors">Developer</span>
                  </a>
                </div>
              </div>
           </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-10 text-[10px] font-bold text-[#94a3b8] uppercase tracking-widest flex items-center justify-center gap-2 fade-up delay-200">
           Hak Cipta &copy; {new Date().getFullYear()} Yayasan Darussalam • SIM-PPDS
        </div>
      </div>
    </div>
  );
}
