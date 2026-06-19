"use client";

import { useState } from "react";
import { LogIn, ShieldCheck, Lock, User, Loader2, Eye, EyeOff, FileText, HelpCircle, ArrowRight, MessageCircle, Layers, Wallet, Shirt, Trash2, Users, Building2, Camera, BookOpen, Shield } from "lucide-react";
import { useToast } from "@/components/Toast";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Accordion states for the informational panel
  const [openSection, setOpenSection] = useState<string | null>(null);

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

  const toggleSection = (section: string) => {
    setOpenSection(openSection === section ? null : section);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4 md:p-8 relative overflow-hidden font-sans">
      {/* Abstract Background 3D Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-300/30 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-300/30 rounded-full blur-[120px] pointer-events-none" />

      {/* Main Container Card */}
      <div className="w-full max-w-6xl bg-white rounded-4xl shadow-2xl shadow-slate-300/50 flex flex-col md:flex-row overflow-hidden relative z-10 md:h-[700px]">
        
        {/* LEFT PANEL - Informational (Scrollable but hidden scrollbar) */}
        <div className="w-full md:w-[50%] lg:w-[55%] relative p-8 md:p-12 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] scrollbar-none bg-linear-to-br from-emerald-900 via-slate-900 to-slate-950 text-white flex flex-col justify-start">
          
          {/* Glassmorphism Overlay Texture */}
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 pointer-events-none mix-blend-overlay"></div>
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-emerald-500/20 rounded-full blur-[60px] pointer-events-none"></div>

          <div className="relative z-10 flex-1">
            {/* Header / Logo */}
            <div className="flex items-center gap-4 mb-10">
              <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-2xl p-2.5 border border-white/20 shadow-xl">
                <img src="/logopondok.png" alt="Logo PPDS" className="w-full h-full object-contain" />
              </div>
              <div>
                <h1 className="text-3xl font-black tracking-tight text-white">SIM-PPDS</h1>
                <p className="text-emerald-400 font-bold tracking-widest text-[10px] uppercase">Sistem Informasi Manajemen</p>
              </div>
            </div>

            <div className="space-y-6">
              <h2 className="text-4xl md:text-5xl font-black leading-tight text-transparent bg-clip-text bg-linear-to-r from-white to-slate-400">
                Selamat Datang di Portal Terpadu
              </h2>
              <p className="text-slate-300 leading-relaxed text-sm md:text-base font-medium">
                Pondok Pesantren Darussalam kini hadir dengan inovasi digital untuk mempermudah tata kelola administrasi, keuangan, akademik, hingga pengawasan secara *real-time* demi kenyamanan wali santri dan efisiensi pengurus.
              </p>

              {/* Informational Accordions (Glassmorphism 3D Style) */}
              <div className="mt-8 space-y-4">
                
                {/* Modul & Fungsionalitas Sistem */}
                <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl overflow-hidden transition-all duration-300 shadow-[0_8px_30px_rgb(0,0,0,0.12)]">
                  <button 
                    onClick={() => toggleSection('modul')}
                    className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-white/10 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-amber-500/20 rounded-lg text-amber-400 shadow-inner">
                        <Layers className="w-5 h-5" />
                      </div>
                      <span className="font-bold text-white text-sm">Modul Sistem Terintegrasi</span>
                    </div>
                    <ArrowRight className={`w-4 h-4 text-slate-400 transition-transform duration-300 ${openSection === 'modul' ? 'rotate-90' : ''}`} />
                  </button>
                  <div className={`overflow-hidden transition-all duration-500 ${openSection === 'modul' ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0'}`}>
                    <div className="px-6 pb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                      
                      {/* Card Keuangan */}
                      <div className="bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-emerald-900/50 group">
                        <div className="flex items-center gap-3 mb-2">
                          <Wallet className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
                          <h3 className="font-bold text-emerald-100 text-xs uppercase tracking-wider">Keuangan & SPP</h3>
                        </div>
                        <p className="text-[11px] text-slate-300 leading-relaxed">Manajemen pembayaran SPP bulanan, tabungan santri, dan sistem transaksi <em>cashless</em> terpadu menggunakan ID Card.</p>
                      </div>

                      {/* Card Kesantrian & Keamanan */}
                      <div className="bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-red-900/50 group">
                        <div className="flex items-center gap-3 mb-2">
                          <Shield className="w-4 h-4 text-red-400 group-hover:scale-110 transition-transform" />
                          <h3 className="font-bold text-red-100 text-xs uppercase tracking-wider">Keamanan</h3>
                        </div>
                        <p className="text-[11px] text-slate-300 leading-relaxed">Pencatatan pelanggaran, poin takzir, sistem perizinan pulang/keluar kompleks, dan pemantauan buku tamu otomatis.</p>
                      </div>

                      {/* Card PLP */}
                      <div className="bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-900/50 group">
                        <div className="flex items-center gap-3 mb-2">
                          <Shirt className="w-4 h-4 text-blue-400 group-hover:scale-110 transition-transform" />
                          <h3 className="font-bold text-blue-100 text-xs uppercase tracking-wider">Layanan (PLP)</h3>
                        </div>
                        <p className="text-[11px] text-slate-300 leading-relaxed">Sistem tiket dan kuota untuk layanan galon air minum, <em>laundry</em> pakaian santri, dan operasional logistik koperasi.</p>
                      </div>

                      {/* Card KBR */}
                      <div className="bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-teal-900/50 group">
                        <div className="flex items-center gap-3 mb-2">
                          <Trash2 className="w-4 h-4 text-teal-400 group-hover:scale-110 transition-transform" />
                          <h3 className="font-bold text-teal-100 text-xs uppercase tracking-wider">Kebersihan (KBR)</h3>
                        </div>
                        <p className="text-[11px] text-slate-300 leading-relaxed">Monitoring jadwal piket asrama, audit kebersihan rutin, dan pelaporan/penanganan fasilitas sanitasi yang rusak.</p>
                      </div>

                      {/* Card Jam'iyyah */}
                      <div className="bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-purple-900/50 group">
                        <div className="flex items-center gap-3 mb-2">
                          <Users className="w-4 h-4 text-purple-400 group-hover:scale-110 transition-transform" />
                          <h3 className="font-bold text-purple-100 text-xs uppercase tracking-wider">Jam'iyyah</h3>
                        </div>
                        <p className="text-[11px] text-slate-300 leading-relaxed">Manajemen struktur organisasi santri (OSPM), arsip program kerja tahunan, serta presensi kegiatan ekstrakurikuler.</p>
                      </div>

                      {/* Card Takmir */}
                      <div className="bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-amber-900/50 group">
                        <div className="flex items-center gap-3 mb-2">
                          <BookOpen className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
                          <h3 className="font-bold text-amber-100 text-xs uppercase tracking-wider">Takmir Masjid</h3>
                        </div>
                        <p className="text-[11px] text-slate-300 leading-relaxed">Penjadwalan muazin, imam salat, petugas kultum, hingga manajemen inventaris dan perawatan fasilitas masjid.</p>
                      </div>

                      {/* Card Pembangunan */}
                      <div className="bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-orange-900/50 group">
                        <div className="flex items-center gap-3 mb-2">
                          <Building2 className="w-4 h-4 text-orange-400 group-hover:scale-110 transition-transform" />
                          <h3 className="font-bold text-orange-100 text-xs uppercase tracking-wider">Pembangunan</h3>
                        </div>
                        <p className="text-[11px] text-slate-300 leading-relaxed">Laporan progres proyek fisik pesantren, manajemen stok material bahan bangunan, dan serapan anggaran konstruksi.</p>
                      </div>

                      {/* Card Media */}
                      <div className="bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-pink-900/50 group">
                        <div className="flex items-center gap-3 mb-2">
                          <Camera className="w-4 h-4 text-pink-400 group-hover:scale-110 transition-transform" />
                          <h3 className="font-bold text-pink-100 text-xs uppercase tracking-wider">Media & Publikasi</h3>
                        </div>
                        <p className="text-[11px] text-slate-300 leading-relaxed">Pengelolaan aset digital (foto/video), penjadwalan siaran radio/podcast, dan kontrol mading/informasi pesantren.</p>
                      </div>

                    </div>
                  </div>
                </div>
                
                {/* Cara Penggunaan */}
                <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl overflow-hidden transition-all duration-300">
                  <button 
                    onClick={() => toggleSection('cara')}
                    className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-white/5 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-emerald-500/20 rounded-lg text-emerald-400">
                        <HelpCircle className="w-5 h-5" />
                      </div>
                      <span className="font-bold text-white text-sm">Cara Penggunaan</span>
                    </div>
                    <ArrowRight className={`w-4 h-4 text-slate-400 transition-transform duration-300 ${openSection === 'cara' ? 'rotate-90' : ''}`} />
                  </button>
                  <div className={`px-6 overflow-hidden transition-all duration-300 ${openSection === 'cara' ? 'max-h-96 pb-5 opacity-100' : 'max-h-0 opacity-0'}`}>
                    <div className="text-sm text-slate-300 space-y-3 leading-relaxed">
                      <p>1. Masukkan <strong>Username</strong> resmi Anda yang telah didaftarkan oleh Pusat Data pesantren.</p>
                      <p>2. Ketikkan <strong>Kata Sandi</strong> dengan benar. Jaga kerahasiaan kata sandi Anda.</p>
                      <p>3. Jika Anda melupakan akses masuk, silakan hubungi pihak Sekretariat melalui layanan *helpdesk* atau WhatsApp pengurus yang tertera di panel kanan.</p>
                      <p>4. Akses ke modul-modul (Keuangan, KBR, PLP, dll) dibatasi secara ketat berdasarkan tingkat kewenangan akun Anda.</p>
                    </div>
                  </div>
                </div>

                {/* Syarat & Ketentuan */}
                <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl overflow-hidden transition-all duration-300">
                  <button 
                    onClick={() => toggleSection('syarat')}
                    className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-white/5 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-indigo-500/20 rounded-lg text-indigo-400">
                        <FileText className="w-5 h-5" />
                      </div>
                      <span className="font-bold text-white text-sm">Syarat & Ketentuan Pengguna</span>
                    </div>
                    <ArrowRight className={`w-4 h-4 text-slate-400 transition-transform duration-300 ${openSection === 'syarat' ? 'rotate-90' : ''}`} />
                  </button>
                  <div className={`px-6 overflow-hidden transition-all duration-300 ${openSection === 'syarat' ? 'max-h-96 pb-5 opacity-100' : 'max-h-0 opacity-0'}`}>
                    <div className="text-sm text-slate-300 space-y-3 leading-relaxed">
                      <p>• Aplikasi ini dikembangkan untuk <strong>penggunaan internal terbatas</strong> oleh civitas akademika dan struktural Ponpes Darussalam.</p>
                      <p>• Segala bentuk manipulasi data, penyalahgunaan akses, atau percobaan peretasan akan tercatat dalam <em>Audit Log</em> dan ditindaklanjuti secara hukum.</p>
                      <p>• Pengguna wajib bertanggung jawab terhadap aktivitas apa pun yang terjadi menggunakan kredensial akun miliknya.</p>
                      <p>• <em>Developer (DEVELZY)</em> dan Yayasan berhak mencabut akses sewaktu-waktu apabila ditemukan indikasi pelanggaran kebijakan privasi data santri.</p>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>
          
          <div className="mt-12 text-center relative z-10 pt-6 border-t border-white/10">
            <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Infrastruktur Teknologi oleh</p>
            <p className="text-sm font-black text-slate-300 tracking-wider mt-1">DEVELZY CREATIVE</p>
          </div>
        </div>

        {/* RIGHT PANEL - Login Form (Fixed, No Scroll) */}
        <div className="w-full md:w-[50%] lg:w-[45%] bg-white p-8 md:p-14 flex flex-col justify-center overflow-hidden">
          
          <div className="max-w-sm w-full mx-auto">
            <div className="mb-10 text-center md:text-left">
              <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-6 shadow-inner mx-auto md:mx-0">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h2 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight">Login Portal</h2>
              <p className="text-slate-500 font-medium text-sm mt-2">Silakan masuk menggunakan kredensial Anda untuk melanjutkan ke Dasbor Utama.</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
              
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Username</label>
                <div className="relative group">
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-600 transition-colors">
                    <User className="w-5 h-5" />
                  </div>
                  <input 
                    type="text" 
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Masukkan Username"
                    className="w-full bg-transparent border-b-2 border-slate-200 focus:border-emerald-500 outline-none py-3 pl-10 pr-4 text-sm font-bold text-slate-800 transition-all placeholder:text-slate-300 placeholder:font-medium"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Kata Sandi</label>
                <div className="relative group">
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-600 transition-colors">
                    <Lock className="w-5 h-5" />
                  </div>
                  <input 
                    type={showPassword ? "text" : "password"} 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-transparent border-b-2 border-slate-200 focus:border-emerald-500 outline-none py-3 pl-10 pr-10 text-sm font-bold text-slate-800 transition-all placeholder:text-slate-300 placeholder:font-medium"
                    required
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-0 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <div className="w-4 h-4 rounded border-2 border-slate-300 group-hover:border-emerald-500 flex items-center justify-center transition-colors">
                    {/* Fake Checkbox Logic UI */}
                    <div className="w-2 h-2 bg-emerald-500 rounded-sm opacity-0 group-hover:opacity-50 transition-opacity" />
                  </div>
                  <span className="text-xs font-bold text-slate-500">Ingat Saya</span>
                </label>
                <a href="https://wa.me/6281527662023" target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-emerald-600 hover:text-emerald-700 transition-colors">
                  Lupa Sandi?
                </a>
              </div>

              <button 
                type="submit"
                disabled={loading}
                className="w-full mt-8 bg-slate-900 hover:bg-emerald-600 text-white py-4 rounded-xl text-sm font-black flex items-center justify-center gap-3 transition-all hover:shadow-xl hover:shadow-emerald-500/30 active:scale-95 group"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    LOG IN <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-slate-100 uppercase">
              <div className="flex flex-col gap-4 text-center">
                <p className="text-[10px] font-black text-slate-400 tracking-widest">
                  Hubungi Bantuan Teknis
                </p>
                <div className="flex items-center justify-center gap-6">
                  <a 
                    href="https://wa.me/6281527662023" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex flex-col items-center gap-1.5 group"
                    title="Sekretaris Pondok"
                  >
                    <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-all shadow-sm">
                      <MessageCircle className="w-5 h-5 fill-current" />
                    </div>
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-tighter group-hover:text-emerald-600 transition-colors">Sekretaris</span>
                  </a>

                  <div className="w-px h-6 bg-slate-200" />

                  <a 
                    href="https://wa.me/6285171542025" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex flex-col items-center gap-1.5 group"
                    title="Developer DEVELZY"
                  >
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-800 group-hover:bg-slate-800 group-hover:text-white transition-all shadow-sm">
                      <MessageCircle className="w-5 h-5 fill-current" />
                    </div>
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-tighter group-hover:text-slate-800 transition-colors">Developer</span>
                  </a>
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
