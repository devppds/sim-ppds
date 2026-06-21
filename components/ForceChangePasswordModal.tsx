"use client";

import { useState, useEffect } from "react";
import { KeyRound, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { useToast } from "@/components/Toast";

export default function ForceChangePasswordModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const { showToast } = useToast();

  useEffect(() => {
    fetch("/api/auth/session")
      .then(res => res.json())
      .then((data: any) => {
        if (data.success && data.session && data.session.is_default_password) {
          setIsOpen(true);
        }
      })
      .catch(err => console.error("Error fetching session for password check", err))
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      showToast("Kata sandi baru dan konfirmasi tidak cocok!", "error");
      return;
    }
    if (newPassword.length < 6) {
      showToast("Kata sandi minimal 6 karakter!", "error");
      return;
    }

    setIsSubmitting(true);
    try {
      // Create a specific endpoint for forced password change, 
      // or we can reuse a profile update endpoint.
      // We will create /api/auth/force-change-password
      const res = await fetch("/api/auth/force-change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newPassword })
      });
      const data = await res.json() as any;
      if (data.success) {
        showToast("Kata sandi berhasil diperbarui! Silakan masuk kembali.", "success");
        // Force re-login so new session without is_default_password is created
        setTimeout(() => {
           window.location.href = "/login";
        }, 1500);
      } else {
        showToast(data.error || "Gagal mengubah kata sandi.", "error");
      }
    } catch (error) {
      showToast("Koneksi gagal saat mengubah sandi.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return null;
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-9999 bg-slate-900/90 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 relative">
        <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-amber-400 via-orange-500 to-rose-500"></div>
        <div className="p-8">
          <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <KeyRound className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-black text-slate-800 text-center mb-2">Pembaruan Kata Sandi Wajib</h2>
          <p className="text-xs text-slate-500 text-center mb-8 leading-relaxed">
            Sistem mendeteksi Anda menggunakan kata sandi default (<span className="font-mono bg-slate-100 px-1 py-0.5 rounded text-slate-700">123456</span>). 
            Demi keamanan akun dan data lembaga, Anda diwajibkan untuk mengubah kata sandi sekarang sebelum dapat mengakses sistem.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Kata Sandi Baru</label>
              <input 
                type="password" 
                required
                minLength={6}
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                className="w-full bg-slate-50 border-none rounded-2xl py-3 px-4 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-amber-500/20" 
                placeholder="Minimal 6 karakter"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Konfirmasi Kata Sandi Baru</label>
              <input 
                type="password" 
                required
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                className="w-full bg-slate-50 border-none rounded-2xl py-3 px-4 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-amber-500/20" 
                placeholder="Ulangi kata sandi baru"
              />
            </div>

            <button 
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-4 px-6 py-4 bg-linear-to-r from-amber-500 to-orange-600 text-white rounded-2xl text-xs font-black uppercase tracking-wider shadow-lg shadow-orange-500/30 hover:from-amber-600 hover:to-orange-700 transition-all flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Simpan & Lanjutkan
                </>
              )}
            </button>
          </form>
        </div>
        <div className="bg-slate-50 p-4 border-t border-slate-100 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
          <p className="text-[10px] font-medium text-slate-500 leading-relaxed">
            Kata sandi baru akan dienkripsi secara end-to-end. Pastikan Anda mengingatnya. Jika Anda lupa, Anda dapat menghubungi Super Admin untuk melakukan reset sandi.
          </p>
        </div>
      </div>
    </div>
  );
}
