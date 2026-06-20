"use client";

import { useState, useEffect } from "react";
import { Download, ArrowRight, Sparkles, Layers, Wallet, Shield, Shirt, Trash2, Users, BookOpen, Building2, Camera, HelpCircle, FileText, ChevronDown, CheckCircle2, Loader2 } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/components/Toast";
import { useRouter } from "next/navigation";

const footerTexts = [
  "Sistem cerdas ini dikembangkan oleh alumni Pondok Pesantren Darussalam Lirboyo.",
  "Semoga aplikasi ini menjadi jariyyah dan bermanfa'at bagi Pondok Pesantren Darussalam Lirboyo.",
  "© 2026 DEVELZY"
];

export default function LoginPage() {
  const { showToast } = useToast();
  const router = useRouter();
  const [openSection, setOpenSection] = useState<string | null>("modul");
  const [footerIndex, setFooterIndex] = useState(0);
  const [fade, setFade] = useState(true);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallModal, setShowInstallModal] = useState(false);
  const [platform, setPlatform] = useState<"android" | "ios" | "desktop" | "loading">("loading");

  useEffect(() => {
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone;
    if (isStandalone) {
      router.replace('/login');
    }

    // Deteksi platform OS
    const ua = navigator.userAgent;
    if (/Android/i.test(ua)) {
      setPlatform("android");
    } else if (/iPhone|iPad|iPod/i.test(ua)) {
      setPlatform("ios");
    } else {
      setPlatform("desktop");
    }

    // 2. Tangkap event install PWA dari browser
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault(); // Mencegah prompt bawaan muncul
      setDeferredPrompt(e); // Simpan event untuk dipanggil tombol khusus kita
      
      // Tampilkan modal kustom secara otomatis setelah 2 detik
      setTimeout(() => {
        setShowInstallModal(true);
      }, 2000);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Animasi Footer
    const interval = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setFooterIndex((prev) => (prev + 1) % footerTexts.length);
        setFade(true);
      }, 800);
    }, 5000);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, [router]);

  const toggleSection = (section: string) => {
    setOpenSection(openSection === section ? null : section);
  };

  const handleDownload = () => {
    showToast("Mempersiapkan unduhan APK SIM-PPDS...", "success");
  };

  return (
    <div className="min-h-screen bg-[#021c14] flex flex-col font-sans relative overflow-x-hidden selection:bg-amber-500/30">
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes blinkBtn {
          0%, 100% { background: linear-gradient(to right, #10b981, #047857); box-shadow: 0 0 15px rgba(16,185,129,0.4); transform: scale(1); }
          50% { background: linear-gradient(to right, #f59e0b, #10b981); box-shadow: 0 0 35px rgba(245,158,11,0.8); transform: scale(1.02); }
        }
        .btn-blink { animation: blinkBtn 1.5s infinite alternate; border: 1px solid rgba(245,158,11,0.4); }

        @keyframes float3D {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-6px) scale(1.05); filter: drop-shadow(0 5px 8px rgba(245,158,11,0.4)); }
        }
        .icon-float-1 { animation: float3D 3s ease-in-out infinite; }
        .icon-float-2 { animation: float3D 4s ease-in-out infinite 0.5s; }
        .icon-float-3 { animation: float3D 3.5s ease-in-out infinite 1s; }
        .icon-float-4 { animation: float3D 4.5s ease-in-out infinite 0.2s; }
        .icon-float-5 { animation: float3D 3.2s ease-in-out infinite 0.8s; }
        .icon-float-6 { animation: float3D 4.1s ease-in-out infinite 1.2s; }
        .icon-float-7 { animation: float3D 3.8s ease-in-out infinite 0.3s; }
        .icon-float-8 { animation: float3D 4.3s ease-in-out infinite 0.7s; }

        .btn-3d-gold {
          background: linear-gradient(to bottom, #fbbf24, #f59e0b);
          border-bottom: 4px solid #b45309;
          text-shadow: 0 1px 1px rgba(0,0,0,0.15);
          transition: all 0.1s ease;
        }
        .btn-3d-gold:hover {
          background: linear-gradient(to bottom, #f59e0b, #d97706);
          transform: translateY(1px);
          border-bottom-width: 3px;
        }
        .btn-3d-gold:active {
          transform: translateY(4px);
          border-bottom-width: 0px;
        }

        .btn-3d-dark {
          background: linear-gradient(to bottom, #064e3b, #022c22);
          border-bottom: 4px solid #02140f;
          transition: all 0.1s ease;
        }
        .btn-3d-dark:hover {
          background: linear-gradient(to bottom, #022c22, #011c15);
          transform: translateY(1px);
          border-bottom-width: 3px;
        }
        .btn-3d-dark:active {
          transform: translateY(4px);
          border-bottom-width: 0px;
        }
      `}} />
      {/* Premium Texture / Orbs */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-emerald-900/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-amber-900/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Top Navigation */}
      <nav className="w-full px-4 sm:px-6 py-5 flex items-center justify-between max-w-5xl mx-auto relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-linear-to-br from-[#064e3b] to-[#022c22] shadow-[0_0_15px_rgba(245,158,11,0.1)] flex items-center justify-center p-1.5 border border-amber-500/20">
            <img src="/logopondok.png" alt="Logo" className="w-full h-full object-contain" />
          </div>
          <span className="font-black text-white text-base md:text-lg tracking-wide uppercase">SIM-PPDS</span>
        </div>
        <Link href="/login" passHref>
          <button className="bg-amber-500 hover:bg-amber-400 text-[#021c14] px-6 py-2.5 rounded-full text-sm font-black tracking-widest flex items-center gap-2 transition-all shadow-[0_0_15px_rgba(245,158,11,0.2)] hover:shadow-[0_0_25px_rgba(245,158,11,0.4)] active:scale-95 uppercase">
            Masuk <ArrowRight className="w-4 h-4" />
          </button>
        </Link>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col items-center px-4 max-w-4xl mx-auto w-full pb-24 pt-8 md:pt-16 relative z-10">
        
        {/* --- HERO SECTION --- */}
        <div className="text-center w-full mb-16">
          <div className="inline-flex items-center gap-2 bg-[#064e3b]/50 border border-amber-500/30 text-amber-400 px-4 py-2 rounded-full text-[11px] md:text-xs font-bold mb-8 shadow-sm backdrop-blur-sm">
            <Sparkles className="w-3.5 h-3.5" />
            <span className="uppercase tracking-wider">Sistem Administrasi Eksklusif</span>
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight mb-2">
            Pesantren Digital
          </h1>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-transparent bg-clip-text bg-linear-to-r from-amber-300 via-amber-400 to-amber-600 tracking-tight leading-tight mb-6 drop-shadow-sm">
            Darussalam Lirboyo
          </h1>

          <p className="text-emerald-100/70 text-sm md:text-base font-medium leading-relaxed max-w-2xl mx-auto mb-10">
            Platform PWA enterprise untuk tata kelola administrasi, keuangan, akademik, hingga pengawasan secara realtime demi kenyamanan wali santri dan efisiensi pengurus.
          </p>

          {/* --- INSTALASI & DOWNLOAD SECTION --- */}
          <div className="w-full bg-[#064e3b]/40 backdrop-blur-md border border-amber-500/20 rounded-3xl p-6 sm:p-8 shadow-2xl text-left transition-all duration-500 mb-8 font-sans">
            {platform === "loading" ? (
              <div className="w-full flex flex-col items-center justify-center py-12">
                <Loader2 className="w-10 h-10 animate-spin text-amber-500" />
                <p className="text-sm font-bold text-emerald-100/60 mt-3">Mendeteksi perangkat Anda...</p>
              </div>
            ) : (
              <div className="flex flex-col gap-6 items-start justify-between">
                <div className="w-full space-y-5">
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <Download className="w-5 h-5 text-amber-400" />
                    {platform === "android" && "Instalasi Aplikasi Android (.APK)"}
                    {platform === "ios" && "Instalasi Aplikasi iPhone / iOS"}
                    {platform === "desktop" && "Instalasi Aplikasi PC / Desktop"}
                  </h2>

                  {platform === "android" && (
                    <ul className="space-y-4 text-sm text-emerald-100/80 font-medium">
                      <li className="flex items-start gap-3">
                        <div className="bg-[#021c14] border border-amber-500/30 rounded-full p-1 mt-0.5 shrink-0 shadow-sm">
                          <CheckCircle2 className="w-3.5 h-3.5 text-amber-500" />
                        </div>
                        <span className="leading-relaxed">Ketuk tombol <strong className="text-white">Download APK</strong> di bawah untuk mengunduh berkas aplikasi berkas <code className="bg-[#021c14] border border-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded text-[11px] font-bold">.apk</code> resmi.</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="bg-[#021c14] border border-amber-500/30 rounded-full p-1 mt-0.5 shrink-0 shadow-sm">
                          <CheckCircle2 className="w-3.5 h-3.5 text-amber-500" />
                        </div>
                        <span className="leading-relaxed">Buka berkas <code className="bg-[#021c14] border border-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded text-[11px] font-bold">SIM-PPDS.apk</code> dari folder Unduhan di Android Anda.</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="bg-[#021c14] border border-amber-500/30 rounded-full p-1 mt-0.5 shrink-0 shadow-sm">
                          <CheckCircle2 className="w-3.5 h-3.5 text-amber-500" />
                        </div>
                        <span className="leading-relaxed">Jika sistem mendeteksi sumber tidak dikenal, aktifkan opsi <strong className="text-white">&quot;Izinkan Instalasi dari Sumber Ini&quot;</strong> pada pengaturan browser/perangkat Anda.</span>
                      </li>
                    </ul>
                  )}

                  {platform === "ios" && (
                    <ul className="space-y-4 text-sm text-emerald-100/80 font-medium">
                      <li className="flex items-start gap-3">
                        <div className="bg-[#021c14] border border-amber-500/30 rounded-full p-1 mt-0.5 shrink-0 shadow-sm">
                          <CheckCircle2 className="w-3.5 h-3.5 text-amber-500" />
                        </div>
                        <span className="leading-relaxed">Pastikan Anda membuka website ini melalui browser bawaan <strong className="text-white">Safari</strong> di iPhone Anda.</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="bg-[#021c14] border border-amber-500/30 rounded-full p-1 mt-0.5 shrink-0 shadow-sm">
                          <CheckCircle2 className="w-3.5 h-3.5 text-amber-500" />
                        </div>
                        <span className="leading-relaxed">Ketuk ikon <strong className="text-white">Share / Bagikan</strong> (persegi dengan panah menunjuk ke atas) di bagian bawah layar Safari.</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="bg-[#021c14] border border-amber-500/30 rounded-full p-1 mt-0.5 shrink-0 shadow-sm">
                          <CheckCircle2 className="w-3.5 h-3.5 text-amber-500" />
                        </div>
                        <span className="leading-relaxed">Gulir ke bawah pada lembar menu share, lalu pilih opsi <strong className="text-white">Tambahkan ke Layar Utama</strong> (Add to Home Screen).</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="bg-[#021c14] border border-amber-500/30 rounded-full p-1 mt-0.5 shrink-0 shadow-sm">
                          <CheckCircle2 className="w-3.5 h-3.5 text-amber-500" />
                        </div>
                        <span className="leading-relaxed">Ketuk tombol <strong className="text-white">Tambah</strong> di pojok kanan atas untuk memasang shortcut PWA di layar utama.</span>
                      </li>
                    </ul>
                  )}

                  {platform === "desktop" && (
                    <>
                      {deferredPrompt ? (
                        <ul className="space-y-4 text-sm text-emerald-100/80 font-medium">
                          <li className="flex items-start gap-3">
                            <div className="bg-[#021c14] border border-emerald-500/30 rounded-full p-1 mt-0.5 shrink-0 shadow-sm">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                            </div>
                            <span className="leading-relaxed">Komputer Anda mendukung fitur aplikasi <strong className="text-white">Progressive Web App (PWA)</strong>.</span>
                          </li>
                          <li className="flex items-start gap-3">
                            <div className="bg-[#021c14] border border-emerald-500/30 rounded-full p-1 mt-0.5 shrink-0 shadow-sm">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                            </div>
                            <span className="leading-relaxed">Klik tombol <strong className="text-white">Pasang Aplikasi</strong> di bawah untuk memasang sistem langsung ke desktop Anda.</span>
                          </li>
                          <li className="flex items-start gap-3">
                            <div className="bg-[#021c14] border border-emerald-500/30 rounded-full p-1 mt-0.5 shrink-0 shadow-sm">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                            </div>
                            <span className="leading-relaxed">Shortcut aplikasi SIM-PPDS akan otomatis muncul di desktop PC/Laptop Anda.</span>
                          </li>
                        </ul>
                      ) : (
                        <ul className="space-y-4 text-sm text-emerald-100/80 font-medium">
                          <li className="flex items-start gap-3">
                            <div className="bg-[#021c14] border border-amber-500/30 rounded-full p-1 mt-0.5 shrink-0 shadow-sm">
                              <CheckCircle2 className="w-3.5 h-3.5 text-amber-500" />
                            </div>
                            <span className="leading-relaxed">Klik tombol **instalasi** (ikon monitor dengan panah ke bawah) di sebelah kanan address bar browser Anda.</span>
                          </li>
                          <li className="flex items-start gap-3">
                            <div className="bg-[#021c14] border border-amber-500/30 rounded-full p-1 mt-0.5 shrink-0 shadow-sm">
                              <CheckCircle2 className="w-3.5 h-3.5 text-amber-500" />
                            </div>
                            <span className="leading-relaxed">Atau buka menu browser (ikon titik tiga di kanan atas) lalu pilih menu <strong className="text-white">Pasang SIM-PPDS</strong> (Save as App / Install SIM-PPDS).</span>
                          </li>
                          <li className="flex items-start gap-3">
                            <div className="bg-[#021c14] border border-amber-500/30 rounded-full p-1 mt-0.5 shrink-0 shadow-sm">
                              <CheckCircle2 className="w-3.5 h-3.5 text-amber-500" />
                            </div>
                            <span className="leading-relaxed">Aplikasi ini berjalan sebagai Progressive Web App (PWA) di desktop Anda tanpa membutuhkan file .EXE.</span>
                          </li>
                        </ul>
                      )}
                    </>
                  )}
                </div>

                <div className="w-full flex flex-col items-center justify-center pt-6 shrink-0 border-t border-emerald-800/50">
                  {platform === "android" && (
                    <a 
                      href="/download/SIM-PPDS.apk" 
                      download="SIM-PPDS.apk"
                      onClick={handleDownload}
                      className="w-full sm:w-2/3 md:w-1/2 inline-flex items-center justify-center gap-3 text-white rounded-full py-4 px-8 font-black text-base md:text-lg transition-all active:scale-95 group uppercase tracking-widest btn-blink"
                    >
                      <Download className="w-6 h-6 group-hover:-translate-y-1 transition-transform" />
                      <span>Download APK (.apk)</span>
                    </a>
                  )}

                  {platform === "ios" && (
                    <div className="w-full py-4 px-6 bg-[#021c14]/40 border border-amber-500/20 text-amber-400 rounded-2xl text-center text-xs font-black uppercase tracking-wider">
                      Instalasi PWA melalui Safari Share Menu (Tidak memerlukan file unduhan)
                    </div>
                  )}

                  {platform === "desktop" && (
                    <>
                      {deferredPrompt ? (
                        <button 
                          onClick={() => {
                            setShowInstallModal(true);
                          }}
                          className="w-full sm:w-2/3 md:w-1/2 inline-flex items-center justify-center gap-3 text-white rounded-full py-4 px-8 font-black text-base md:text-lg transition-all active:scale-95 group uppercase tracking-widest btn-blink"
                        >
                          <Download className="w-6 h-6 group-hover:-translate-y-1 transition-transform" />
                          <span>Pasang Aplikasi</span>
                        </button>
                      ) : (
                        <div className="w-full py-4 px-6 bg-[#021c14]/40 border border-amber-500/20 text-amber-400 rounded-2xl text-center text-xs font-black uppercase tracking-wider">
                          Gunakan Menu Browser atau Address Bar untuk Memasang Aplikasi ke Desktop
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* --- INFORMATION SECTION --- */}
        <div className="w-full space-y-4">
          
          {/* Modul Sistem */}
          <div className="bg-[#064e3b]/30 backdrop-blur-sm border border-emerald-800/50 rounded-2xl overflow-hidden transition-all duration-300 group hover:border-amber-500/30 hover:shadow-[0_0_20px_rgba(245,158,11,0.05)]">
            <button onClick={() => toggleSection("modul")} className="w-full px-6 py-5 flex items-center justify-between text-left transition-colors">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#021c14] rounded-lg text-amber-400 border border-amber-500/20">
                  <Layers className="w-5 h-5" />
                </div>
                <span className="font-bold text-emerald-50 text-sm md:text-base tracking-wide">Modul Sistem Terintegrasi</span>
              </div>
              <ChevronDown className={`w-5 h-5 text-amber-500/50 transition-transform duration-300 ${openSection === "modul" ? "rotate-180" : ""}`} />
            </button>
            <div className={`overflow-hidden transition-all duration-500 ease-in-out ${openSection === "modul" ? "max-h-[1200px] opacity-100" : "max-h-0 opacity-0"}`}>
              <div className="px-6 pb-6 pt-2 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-4">
                {[
                  { icon: <Wallet className="w-5 h-5 text-amber-400" />, title: "Keuangan & SPP", desc: "Manajemen SPP bulanan, tabungan santri, dan transaksi cashless." },
                  { icon: <Shield className="w-5 h-5 text-amber-400" />, title: "Keamanan", desc: "Pencatatan pelanggaran, takzir, dan sistem perizinan santri." },
                  { icon: <Shirt className="w-5 h-5 text-amber-400" />, title: "Layanan (PLP)", desc: "Tiket galon air minum, laundry, dan operasional logistik." },
                  { icon: <Trash2 className="w-5 h-5 text-amber-400" />, title: "Kebersihan (KBR)", desc: "Monitoring jadwal piket, audit kebersihan, dan laporan fasilitas." },
                  { icon: <Users className="w-5 h-5 text-amber-400" />, title: "Jam'iyyah", desc: "Struktur organisasi, arsip program kerja, dan presensi." },
                  { icon: <BookOpen className="w-5 h-5 text-amber-400" />, title: "Takmir Masjid", desc: "Jadwal muazin, imam salat, dan perawatan fasilitas masjid." },
                  { icon: <Building2 className="w-5 h-5 text-amber-400" />, title: "Pembangunan", desc: "Laporan progres proyek fisik dan serapan anggaran." },
                  { icon: <Camera className="w-5 h-5 text-amber-400" />, title: "Media & Publikasi", desc: "Pengelolaan aset digital dan kontrol informasi pesantren." },
                ].map((item, i) => (
                  <div key={i} className="bg-[#021c14]/50 border border-emerald-800/50 rounded-xl p-4 hover:-translate-y-1 hover:border-amber-500/40 transition-all duration-300 group/card">
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`p-2 bg-[#064e3b] rounded-lg shadow-sm border border-emerald-700/50 group-hover/card:border-amber-500/30 transition-colors icon-float-${(i % 8) + 1}`}>{item.icon}</div>
                      <h3 className="font-bold text-white text-sm tracking-wide">{item.title}</h3>
                    </div>
                    <p className="text-[12px] text-emerald-100/60 leading-relaxed font-medium">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Cara Penggunaan */}
          <div className="bg-[#064e3b]/30 backdrop-blur-sm border border-emerald-800/50 rounded-2xl overflow-hidden transition-all duration-300 group hover:border-amber-500/30">
            <button onClick={() => toggleSection("cara")} className="w-full px-6 py-5 flex items-center justify-between text-left transition-colors">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#021c14] rounded-lg text-amber-400 border border-amber-500/20">
                  <HelpCircle className="w-5 h-5" />
                </div>
                <span className="font-bold text-emerald-50 text-sm md:text-base tracking-wide">Cara Penggunaan</span>
              </div>
              <ChevronDown className={`w-5 h-5 text-amber-500/50 transition-transform duration-300 ${openSection === "cara" ? "rotate-180" : ""}`} />
            </button>
            <div className={`px-6 overflow-hidden transition-all duration-300 ease-in-out ${openSection === "cara" ? "max-h-96 pb-6 opacity-100" : "max-h-0 opacity-0"}`}>
              <div className="text-sm text-emerald-100/80 space-y-3 leading-relaxed font-medium bg-[#021c14]/50 p-5 rounded-xl border border-emerald-800/50">
                <p>1. Masukkan <strong className="text-amber-400 font-bold">Username</strong> resmi yang telah didaftarkan oleh Pusat Data pesantren.</p>
                <p>2. Ketikkan <strong className="text-amber-400 font-bold">Kata Sandi</strong> dengan benar. Jaga kerahasiaan kata sandi Anda.</p>
                <p>3. Jika lupa akses, silakan hubungi pihak Sekretariat melalui layanan bantuan teknis di halaman login.</p>
                <p>4. Akses ke modul dibatasi secara ketat berdasarkan tingkat kewenangan akun Anda.</p>
              </div>
            </div>
          </div>

          {/* Syarat & Ketentuan */}
          <div className="bg-[#064e3b]/30 backdrop-blur-sm border border-emerald-800/50 rounded-2xl overflow-hidden transition-all duration-300 group hover:border-amber-500/30">
            <button onClick={() => toggleSection("syarat")} className="w-full px-6 py-5 flex items-center justify-between text-left transition-colors">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#021c14] rounded-lg text-amber-400 border border-amber-500/20">
                  <FileText className="w-5 h-5" />
                </div>
                <span className="font-bold text-emerald-50 text-sm md:text-base tracking-wide">Syarat & Ketentuan Pengguna</span>
              </div>
              <ChevronDown className={`w-5 h-5 text-amber-500/50 transition-transform duration-300 ${openSection === "syarat" ? "rotate-180" : ""}`} />
            </button>
            <div className={`px-6 overflow-hidden transition-all duration-300 ease-in-out ${openSection === "syarat" ? "max-h-96 pb-6 opacity-100" : "max-h-0 opacity-0"}`}>
              <div className="text-sm text-emerald-100/80 space-y-3 leading-relaxed font-medium bg-[#021c14]/50 p-5 rounded-xl border border-emerald-800/50">
                <p>• Aplikasi ini dikembangkan untuk <strong className="text-amber-400">penggunaan internal terbatas</strong> oleh struktural Ponpes Darussalam.</p>
                <p>• Segala bentuk manipulasi data, atau percobaan peretasan akan tercatat dalam <em className="text-white">Audit Log</em> dan ditindaklanjuti secara hukum.</p>
                <p>• Pengguna wajib bertanggung jawab terhadap aktivitas apa pun yang terjadi menggunakan kredensial miliknya.</p>
                <p>• Pihak pengembang dan Yayasan berhak mencabut akses sewaktu-waktu jika terindikasi pelanggaran privasi data.</p>
              </div>
            </div>
          </div>

        </div>

      </main>

      {/* Footer */}
      <footer className="w-full text-center py-6 text-[11px] text-emerald-500/60 uppercase tracking-widest font-bold z-10 border-t border-emerald-900/50 h-[90px] flex items-center justify-center">
        <p className={`transition-opacity duration-700 max-w-2xl px-4 leading-relaxed ${fade ? 'opacity-100' : 'opacity-0'}`}>
          {footerTexts[footerIndex]}
        </p>
      </footer>

      {/* Custom 3D Install PWA Modal */}
      {showInstallModal && deferredPrompt && (
        <div className="fixed inset-0 z-200 flex items-center justify-center p-4 bg-[#021c14]/65 backdrop-blur-xs animate-in fade-in duration-300">
          <div className="bg-linear-to-b from-[#064e3b] to-[#022c22] border-t-2 border-t-amber-400 border-x border-x-amber-400/20 border-b-8 border-b-amber-950 w-full max-w-sm rounded-[32px] p-6 text-center shadow-[0_30px_70px_-15px_rgba(245,158,11,0.3)] animate-in zoom-in-95 duration-300 relative overflow-hidden">
            {/* Ambient gold glow in card */}
            <div className="absolute -top-12 -left-12 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
            
            {/* Logo Wrapper with 3D shadow */}
            <div className="w-20 h-20 mx-auto mb-5 bg-[#021c14] border-t-2 border-t-[#10b981]/30 border-x border-x-[#10b981]/10 border-b-4 border-b-emerald-950 rounded-2xl p-3 flex items-center justify-center shadow-[0_8px_20px_rgba(0,0,0,0.3)] select-none">
              <img src="/logopondok.png" alt="Logo" className="w-full h-full object-contain animate-pulse" />
            </div>

            <h3 className="text-xl font-black text-white uppercase tracking-wider mb-1">Instal Aplikasi</h3>
            <p className="text-xs font-bold text-amber-400 uppercase tracking-widest mb-4">SIM-PPDS Enterprise</p>
            
            <p className="text-sm text-emerald-100/70 leading-relaxed font-medium mb-6">
              Pasang aplikasi di perangkat Anda untuk akses cepat, performa maksimal, dan fitur offline lengkap.
            </p>

            <div className="flex flex-col gap-3">
              <button 
                onClick={async () => {
                  deferredPrompt.prompt();
                  const { outcome } = await deferredPrompt.userChoice;
                  if (outcome === 'accepted') {
                    setDeferredPrompt(null);
                  }
                  setShowInstallModal(false);
                }}
                className="w-full py-4 text-[#021c14] font-black text-sm rounded-2xl uppercase tracking-widest btn-3d-gold cursor-pointer"
              >
                Instal Sekarang
              </button>
              <button 
                onClick={() => setShowInstallModal(false)}
                className="w-full py-4 text-emerald-100/80 font-black text-sm rounded-2xl uppercase tracking-widest btn-3d-dark cursor-pointer border border-[#10b981]/10"
              >
                Nanti Saja
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
