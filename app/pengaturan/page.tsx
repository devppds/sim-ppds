"use client";

import { useState, useEffect, useCallback } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { 
  Settings, Home, Wallet, Key, Plus, Trash2, 
  Loader2, Save, Lock, User, Users, Bell, Upload, ShieldAlert
} from "lucide-react";
import { useToast } from "@/components/Toast";
import { API_BASE_URL } from "@/lib/config";

interface SPPRate {
  id: number;
  status: string;
  kelas_name: string;
  madrasah: string;
  period_name: string;
  amount: number;
  description: string;
}

export default function PengaturanPage() {
  const { showToast } = useToast();
  const [session, setSession] = useState<any>(null);
  const [loadingSession, setLoadingSession] = useState(true);
  
  // Available Tabs: profile_pesantren | spp_rates | user_management | app_settings | personal_profile | security
  const [activeTab, setActiveTab] = useState<string>("personal_profile");
  
  // Profile settings state (D1 Backed)
  const [pondokProfile, setPondokProfile] = useState({
    pondok_name: "",
    pondok_address: "",
    pondok_phone: "",
    pondok_email: "",
    pondok_head: "",
    academic_year: "",
    spp_due_day: "10",
    cashless_enabled: "1",
    notify_wa_active: "1",
    notify_email_active: "1"
  });
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  
  // SPP Rates state
  const [sppRates, setSppRates] = useState<SPPRate[]>([]);
  const [loadingSPP, setLoadingSPP] = useState(false);
  const [isSubmittingSPP, setIsSubmittingSPP] = useState(false);
  
  // New SPP Form state
  const [newSpp, setNewSpp] = useState({
    status: "Biasa",
    kelas_name: "",
    madrasah: "MHM",
    period_name: "Semua",
    amount: "",
    description: ""
  });

  // Personal Profile state
  const [personalProfile, setPersonalProfile] = useState({
    name: "",
    username: "",
    role: "",
    avatar_url: ""
  });
  const [loadingPersonal, setLoadingPersonal] = useState(false);
  const [isSavingPersonal, setIsSavingPersonal] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  // User Accounts state
  const [userList, setUserList] = useState<any[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  // Account change password state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Fetch session data
  useEffect(() => {
    fetch("/api/auth/session")
      .then(res => res.json())
      .then((data: any) => {
        if (data.success && data.session) {
          setSession(data.session);
          // Set default tab based on role
          const role = (data.session.role || "").toUpperCase();
          const level = data.session.role_level;
          const isAdmin = level === "ROOT" || level === "SEKRETARIAT" || role === "DEVELOPER";
          
          if (isAdmin) {
            setActiveTab("profile_pesantren");
          } else {
            setActiveTab("personal_profile");
          }
        }
      })
      .catch(e => console.error("Session fetch error", e))
      .finally(() => setLoadingSession(false));
  }, []);

  const isAdmin = session && (
    session.role_level === "ROOT" || 
    session.role_level === "SEKRETARIAT" || 
    (session.role || "").toUpperCase() === "DEVELOPER" ||
    (session.role || "").toUpperCase().includes("SEKRETARIS") ||
    (session.role || "").toUpperCase().includes("SEKRETARIAT")
  );

  const isSeksiAdmin = session && (
    (session.role || "").toUpperCase().includes("KEAMANAN") ||
    (session.role || "").toUpperCase().includes("PENDIDIKAN") ||
    (session.role || "").toUpperCase().includes("WAJAR") ||
    (session.role || "").toUpperCase().includes("JAMIYYAH") ||
    (session.role || "").toUpperCase().includes("JAMI'YYAH") ||
    (session.role || "").toUpperCase().includes("JAM'IYYAH") ||
    (session.role || "").toUpperCase().includes("PLP") ||
    (session.role || "").toUpperCase().includes("KBR") ||
    (session.role || "").toUpperCase().includes("KEBERSIHAN") ||
    (session.role || "").toUpperCase().includes("PEMBANGUNAN") ||
    (session.role || "").toUpperCase().includes("MEDIA") ||
    (session.role || "").toUpperCase().includes("TAKMIR") ||
    (session.role || "").toUpperCase().includes("FASILITAS") ||
    (session.role || "").toUpperCase().includes("LOGISTIK") ||
    (session.role || "").toUpperCase().includes("HUMASY") ||
    (session.role || "").toUpperCase().includes("KESEHATAN") ||
    (session.role || "").toUpperCase().includes("KLINIK") ||
    (session.role || "").toUpperCase().includes("BUMP") ||
    (session.role || "").toUpperCase().includes("BENDAHARA") ||
    (session.role || "").toUpperCase().includes("KEUANGAN")
  );

  const isUserOnline = (lastLogin: string | null) => {
    if (!lastLogin) return false;
    try {
      const loginTime = new Date(lastLogin).getTime();
      const now = new Date().getTime();
      return (now - loginTime) < 15 * 60 * 1000;
    } catch (e) {
      return false;
    }
  };

  const canManageSpp = session && (
    (session.role || "").toUpperCase() === "BENDAHARA" ||
    (session.role || "").toUpperCase() === "KEUANGAN" ||
    (session.role || "").toUpperCase() === "SEKSI KEUANGAN" ||
    session.role_level === "KEUANGAN" ||
    session.role_level === "RESTRICTED_SPP" ||
    session.role_level === "ROOT" ||
    (session.role || "").toUpperCase() === "DEVELOPER"
  );

  // Fetch Pondok Profile settings
  const fetchProfile = useCallback(async () => {
    setLoadingProfile(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/settings`);
      const json = await res.json() as any;
      if (json.success) {
        setPondokProfile({
          pondok_name: json.data.pondok_name || "",
          pondok_address: json.data.pondok_address || "",
          pondok_phone: json.data.pondok_phone || "",
          pondok_email: json.data.pondok_email || "",
          pondok_head: json.data.pondok_head || "",
          academic_year: json.data.academic_year || "",
          spp_due_day: json.data.spp_due_day || "10",
          cashless_enabled: json.data.cashless_enabled || "1",
          notify_wa_active: json.data.notify_wa_active || "1",
          notify_email_active: json.data.notify_email_active || "1"
        });
      } else {
        showToast(json.error || "Gagal memuat profil pesantren", "error");
      }
    } catch (e) {
      showToast("Koneksi gagal ke API Worker", "error");
    } finally {
      setLoadingProfile(false);
    }
  }, [showToast]);

  // Fetch personal profile details
  const fetchPersonalProfile = useCallback(async () => {
    setLoadingPersonal(true);
    try {
      const res = await fetch("/api/auth/profile");
      const json = await res.json() as any;
      if (json.success && json.data) {
        setPersonalProfile({
          name: json.data.name || "",
          username: json.data.username || "",
          role: json.data.role || "",
          avatar_url: json.data.avatar_url || ""
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingPersonal(false);
    }
  }, []);

  // Fetch SPP rates
  const fetchSppRates = useCallback(async () => {
    setLoadingSPP(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/spp/config`);
      const json = await res.json() as any;
      if (json.success) {
        setSppRates(json.data);
      } else {
        showToast(json.error || "Gagal memuat tarif SPP", "error");
      }
    } catch (e) {
      console.error(e);
      showToast("Koneksi gagal ke API Worker", "error");
    } finally {
      setLoadingSPP(false);
    }
  }, [showToast]);

  // Fetch all user accounts
  const fetchUserList = useCallback(async () => {
    setLoadingUsers(true);
    try {
      const res = await fetch("/api/admin/users");
      const json = await res.json() as any;
      if (json.success) {
        setUserList(json.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingUsers(false);
    }
  }, []);

  // Fetch dynamic content on tab change
  useEffect(() => {
    if (!session) return;
    if (activeTab === "profile_pesantren" || activeTab === "app_settings") {
      fetchProfile();
    } else if (activeTab === "spp_rates") {
      fetchSppRates();
    } else if (activeTab === "user_management") {
      fetchUserList();
    } else if (activeTab === "personal_profile") {
      fetchPersonalProfile();
    }
  }, [activeTab, session, fetchProfile, fetchPersonalProfile, fetchSppRates, fetchUserList]);

  // Save pesantren profile and settings
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/settings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(pondokProfile)
      });
      const json = await res.json() as any;
      if (json.success) {
        showToast("Pengaturan pesantren berhasil disimpan ke D1!", "success");
      } else {
        showToast(json.error || "Gagal menyimpan profil", "error");
      }
    } catch (e) {
      showToast("Koneksi gagal ke API Worker", "error");
    } finally {
      setIsSavingProfile(false);
    }
  };

  // Save personal profile
  const handleSavePersonalProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingPersonal(true);
    try {
      const res = await fetch("/api/auth/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(personalProfile)
      });
      const json = await res.json() as any;
      if (json.success) {
        showToast("Profil pribadi berhasil diperbarui!", "success");
        // Reload to apply changes across topbar and sidebar
        window.location.reload();
      } else {
        showToast(json.error || "Gagal memperbarui profil", "error");
      }
    } catch (e) {
      showToast("Koneksi gagal ke server", "error");
    } finally {
      setIsSavingPersonal(false);
    }
  };

  // Upload personal profile photo
  const handleUploadPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", "sim-ppds/avatars");

    setUploadingPhoto(true);
    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData
      });
      const json = await res.json() as any;
      if (json.success) {
        setPersonalProfile(prev => ({ ...prev, avatar_url: json.url }));
        showToast("Foto berhasil diunggah! Klik Simpan untuk memperbarui profil.", "success");
      } else {
        showToast(json.error || "Upload foto gagal", "error");
      }
    } catch (err) {
      showToast("Gagal terhubung ke Cloudinary", "error");
    } finally {
      setUploadingPhoto(false);
    }
  };

  // SPP rate commands
  const handleAddSppRate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSpp.kelas_name || !newSpp.amount) {
      showToast("Silakan lengkapi Kelas dan Biaya", "warning");
      return;
    }
    
    setIsSubmittingSPP(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/spp/config`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newSpp,
          amount: parseInt(newSpp.amount)
        })
      });
      const json = await res.json() as any;
      if (json.success) {
        showToast("Tarif baru berhasil disimpan!", "success");
        setNewSpp({
          status: "Biasa",
          kelas_name: "",
          madrasah: "MHM",
          period_name: "Semua",
          amount: "",
          description: ""
        });
        fetchSppRates();
      } else {
        showToast(json.error || "Gagal menyimpan tarif", "error");
      }
    } catch (e) {
      showToast("Koneksi gagal ke API Worker", "error");
    } finally {
      setIsSubmittingSPP(false);
    }
  };

  const handleDeleteSppRate = async (id: number) => {
    if (!confirm("Hapus konfigurasi tarif ini? Tindakan ini tidak dapat dibatalkan.")) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/spp/config/${id}`, {
        method: "DELETE"
      });
      const json = await res.json() as any;
      if (json.success) {
        showToast("Tarif berhasil dihapus!", "success");
        fetchSppRates();
      } else {
        showToast(json.error || "Gagal menghapus tarif", "error");
      }
    } catch (e) {
      showToast("Koneksi gagal ke API Worker", "error");
    }
  };

  // Toggle user active state
  const handleToggleUserStatus = async (userId: number, currentStatus: number) => {
    try {
      const res = await fetch("/api/admin/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: userId,
          is_active: currentStatus === 1 ? false : true
        })
      });
      const json = await res.json() as any;
      if (json.success) {
        showToast(json.message || "Status pengguna diperbarui", "success");
        fetchUserList();
      } else {
        showToast(json.error || "Gagal mengubah status pengguna", "error");
      }
    } catch (e) {
      showToast("Gagal terhubung ke server", "error");
    }
  };

  // Reset user password
  const handleResetPassword = async (userId: number, targetName: string) => {
    if (!confirm(`Reset kata sandi ${targetName} ke password default (123456)?`)) return;
    try {
      const res = await fetch("/api/admin/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: userId,
          reset_password: true
        })
      });
      const json = await res.json() as any;
      if (json.success) {
        showToast("Kata sandi berhasil di-reset ke 123456", "success");
      } else {
        showToast(json.error || "Gagal me-reset kata sandi", "error");
      }
    } catch (e) {
      showToast("Gagal terhubung ke server", "error");
    }
  };

  // Change password
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      showToast("Harap isi semua input password", "warning");
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      showToast("Konfirmasi password baru tidak cocok", "error");
      return;
    }

    setIsChangingPassword(true);
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword
        })
      });
      const json = await res.json() as any;
      if (json.success) {
        showToast("Password Anda berhasil diperbarui!", "success");
        setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      } else {
        showToast(json.error || "Gagal mengganti password", "error");
      }
    } catch (e) {
      showToast("Gagal terhubung ke server", "error");
    } finally {
      setIsChangingPassword(false);
    }
  };

  const getInitials = (name: string | undefined | null) => {
    if (!name) return "??";
    return name.split(' ').map(n => n?.[0] || '').join('').toUpperCase().substring(0, 2);
  };

  if (loadingSession) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mb-3" />
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Memuat Sesi Pengaturan...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto relative">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
              <Settings className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-800 tracking-tight">Pengaturan</h1>
              <p className="text-sm text-slate-500 font-medium">Konfigurasi Aplikasi & Pengaturan Akun</p>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-1 p-1 bg-slate-100 rounded-xl max-w-fit overflow-x-auto">
          {isAdmin && (
            <>
              <button
                onClick={() => setActiveTab("profile_pesantren")}
                className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${
                  activeTab === "profile_pesantren"
                    ? "bg-white text-indigo-600 shadow-sm"
                    : "text-slate-500 hover:text-slate-700 hover:bg-slate-200"
                }`}
              >
                Pesantren
              </button>
              <button
                onClick={() => setActiveTab("app_settings")}
                className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${
                  activeTab === "app_settings"
                    ? "bg-white text-indigo-600 shadow-sm"
                    : "text-slate-500 hover:text-slate-700 hover:bg-slate-200"
                }`}
              >
                Aplikasi & Notifikasi
              </button>
            </>
          )}

          {(isAdmin || isSeksiAdmin) && (
            <button
              onClick={() => setActiveTab("user_management")}
              className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${
                activeTab === "user_management"
                  ? "bg-white text-indigo-600 shadow-sm"
                  : "text-slate-500 hover:text-slate-700 hover:bg-slate-200"
              }`}
            >
              Akun Pengguna
            </button>
          )}

          <button
            onClick={() => setActiveTab("personal_profile")}
            className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${
              activeTab === "personal_profile"
                ? "bg-white text-indigo-600 shadow-sm"
                : "text-slate-500 hover:text-slate-700 hover:bg-slate-200"
            }`}
          >
            Profil Saya
          </button>

          {canManageSpp && (
            <button
              onClick={() => setActiveTab("spp_rates")}
              className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${
                activeTab === "spp_rates"
                  ? "bg-white text-indigo-600 shadow-sm"
                  : "text-slate-500 hover:text-slate-700 hover:bg-slate-200"
              }`}
            >
              Tarif SPP
            </button>
          )}

          <button
            onClick={() => setActiveTab("security")}
            className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${
              activeTab === "security"
                ? "bg-white text-indigo-600 shadow-sm"
                : "text-slate-500 hover:text-slate-700 hover:bg-slate-200"
            }`}
          >
            Keamanan
          </button>
        </div>

        {/* Tab Content: Profil Pesantren */}
        {activeTab === "profile_pesantren" && isAdmin && (
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm w-full animate-in slide-in-from-bottom-2 duration-300">
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-6 flex items-center gap-2">
              <Home className="w-4 h-4 text-indigo-500" /> Identitas Lembaga Pesantren
            </h3>
            
            {loadingProfile ? (
              <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mb-3" />
                <p className="text-xs font-black text-slate-400 uppercase tracking-wider">Memuat profil...</p>
              </div>
            ) : (
              <form onSubmit={handleSaveProfile} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Nama Pesantren</label>
                    <input 
                      type="text" 
                      required
                      value={pondokProfile.pondok_name}
                      onChange={e => setPondokProfile({...pondokProfile, pondok_name: e.target.value})}
                      className="w-full bg-slate-50 border-none rounded-2xl py-3 px-4 text-xs font-bold text-slate-700 outline-none" 
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Kiai Pengasuh</label>
                    <input 
                      type="text" 
                      required
                      value={pondokProfile.pondok_head}
                      onChange={e => setPondokProfile({...pondokProfile, pondok_head: e.target.value})}
                      className="w-full bg-slate-50 border-none rounded-2xl py-3 px-4 text-xs font-bold text-slate-700 outline-none" 
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Alamat Lembaga</label>
                  <input 
                    type="text" 
                    required
                    value={pondokProfile.pondok_address}
                    onChange={e => setPondokProfile({...pondokProfile, pondok_address: e.target.value})}
                    className="w-full bg-slate-50 border-none rounded-2xl py-3 px-4 text-xs font-bold text-slate-700 outline-none" 
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Nomor Telepon/WA</label>
                    <input 
                      type="text" 
                      required
                      value={pondokProfile.pondok_phone}
                      onChange={e => setPondokProfile({...pondokProfile, pondok_phone: e.target.value})}
                      className="w-full bg-slate-50 border-none rounded-2xl py-3 px-4 text-xs font-bold text-slate-700 outline-none" 
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Email Lembaga</label>
                    <input 
                      type="email" 
                      required
                      value={pondokProfile.pondok_email}
                      onChange={e => setPondokProfile({...pondokProfile, pondok_email: e.target.value})}
                      className="w-full bg-slate-50 border-none rounded-2xl py-3 px-4 text-xs font-bold text-slate-700 outline-none" 
                    />
                  </div>
                </div>

                <button 
                  type="submit"
                  disabled={isSavingProfile}
                  className="mt-4 px-6 py-4 bg-indigo-600 text-white rounded-2xl text-[11px] font-black uppercase shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center gap-2"
                >
                  {isSavingProfile ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} 
                  Simpan Identitas Pesantren
                </button>
              </form>
            )}
          </div>
        )}

        {/* Tab Content: Aplikasi & Notifikasi */}
        {activeTab === "app_settings" && isAdmin && (
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm w-full animate-in slide-in-from-bottom-2 duration-300">
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-6 flex items-center gap-2">
              <Settings className="w-4 h-4 text-indigo-500" /> Konfigurasi Aplikasi & Notifikasi Real-time
            </h3>

            {loadingProfile ? (
              <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mb-3" />
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Memuat pengaturan...</p>
              </div>
            ) : (
              <form onSubmit={handleSaveProfile} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Tahun Ajaran</label>
                    <input 
                      type="text" 
                      required
                      placeholder="Contoh: 2025/2026"
                      value={pondokProfile.academic_year}
                      onChange={e => setPondokProfile({...pondokProfile, academic_year: e.target.value})}
                      className="w-full bg-slate-50 border-none rounded-2xl py-3 px-4 text-xs font-bold text-slate-700 outline-none" 
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Jatuh Tempo SPP (Tanggal)</label>
                    <input 
                      type="number" 
                      min="1" 
                      max="31"
                      required
                      value={pondokProfile.spp_due_day}
                      onChange={e => setPondokProfile({...pondokProfile, spp_due_day: e.target.value})}
                      className="w-full bg-slate-50 border-none rounded-2xl py-3 px-4 text-xs font-bold text-slate-700 outline-none" 
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Status Cashless BUMP</label>
                    <select 
                      value={pondokProfile.cashless_enabled}
                      onChange={e => setPondokProfile({...pondokProfile, cashless_enabled: e.target.value})}
                      className="w-full bg-slate-50 border-none rounded-2xl py-3.5 px-4 text-xs font-bold text-slate-700 outline-none"
                    >
                      <option value="1">Aktif / Diaktifkan</option>
                      <option value="0">Nonaktif / Dibatasi</option>
                    </select>
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-6">
                  <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-1.5">
                    <Bell className="w-3.5 h-3.5 text-indigo-500" /> Saluran Notifikasi Tagihan
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <div>
                        <p className="text-xs font-black text-slate-800">Notifikasi WhatsApp Otomatis</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">Kirim pesan WhatsApp gateway tagihan SPP bulanan ke wali santri</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={pondokProfile.notify_wa_active === "1"}
                          onChange={e => setPondokProfile({...pondokProfile, notify_wa_active: e.target.checked ? "1" : "0"})}
                          className="sr-only peer"
                        />
                        <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <div>
                        <p className="text-xs font-black text-slate-800">Notifikasi Email Tagihan</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">Kirim email pengingat bulanan ke email pengguna / pengurus</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={pondokProfile.notify_email_active === "1"}
                          onChange={e => setPondokProfile({...pondokProfile, notify_email_active: e.target.checked ? "1" : "0"})}
                          className="sr-only peer"
                        />
                        <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                      </label>
                    </div>
                  </div>
                </div>

                <button 
                  type="submit"
                  disabled={isSavingProfile}
                  className="mt-4 px-6 py-4 bg-indigo-600 text-white rounded-2xl text-[11px] font-black uppercase shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center gap-2"
                >
                  {isSavingProfile ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} 
                  Simpan Konfigurasi Aplikasi & Notifikasi
                </button>
              </form>
            )}
          </div>
        )}

        {/* Tab Content: Akun Pengguna */}
        {activeTab === "user_management" && (isAdmin || isSeksiAdmin) && (
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm w-full animate-in slide-in-from-bottom-2 duration-300">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
                  <Users className="w-4 h-4 text-indigo-500" /> Manajemen Akun & Hak Akses
                </h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">
                  {isAdmin 
                    ? "Pantau status login pengurus dan lakukan reset kata sandi jika diperlukan"
                    : "Pantau status login dan aktifitas anggota seksi Anda"
                  }
                </p>
              </div>
            </div>

            {loadingUsers ? (
              <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mb-3" />
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Mengambil data pengguna...</p>
              </div>
            ) : userList.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 text-[9px] font-black text-slate-400 uppercase tracking-wider">
                    <tr>
                      <th className="px-6 py-4">Username & Nama</th>
                      <th className="px-6 py-4">Jabatan/Peran</th>
                      <th className="px-6 py-4">Login Terakhir</th>
                      <th className="px-6 py-4 text-center">Status</th>
                      {isAdmin && <th className="px-6 py-4 text-center">Tindakan</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 text-slate-700">
                    {userList.map((user) => (
                      <tr key={user.id} className="hover:bg-slate-50/50 transition-colors text-xs font-bold">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center text-[10px] font-black shrink-0">
                              {getInitials(user.name)}
                            </div>
                            <div>
                              <p className="text-slate-800">{user.name}</p>
                              <p className="text-[10px] font-bold text-slate-400">@{user.username}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-[9px] font-black uppercase tracking-wider">
                            {user.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-slate-400">
                          {user.last_login ? new Date(user.last_login).toLocaleString("id-ID", {
                            day: "numeric",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit"
                          }) : "-"}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            {user.is_active === 1 && isUserOnline(user.last_login) && (
                              <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                              </span>
                            )}
                            <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${
                              user.is_active === 1 
                                ? (isUserOnline(user.last_login) ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-slate-50 text-slate-500') 
                                : 'bg-rose-50 text-rose-600'
                            }`}>
                              {user.is_active === 1 
                                ? (isUserOnline(user.last_login) ? "Sedang Aktif" : "Aktif") 
                                : "Nonaktif"
                              }
                            </span>
                          </div>
                        </td>
                        {isAdmin && (
                          <td className="px-6 py-4 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => handleToggleUserStatus(user.id, user.is_active)}
                                className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all ${
                                  user.is_active === 1 
                                  ? 'bg-rose-50 text-rose-600 hover:bg-rose-100' 
                                  : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                                }`}
                              >
                                {user.is_active === 1 ? "Nonaktifkan" : "Aktifkan"}
                              </button>
                              <button
                                onClick={() => handleResetPassword(user.id, user.name)}
                                className="px-3 py-1.5 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg text-[9px] font-black uppercase transition-all"
                              >
                                Reset Sandi
                              </button>
                            </div>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-20 text-center text-slate-300 italic text-sm font-bold">
                Tidak ada pengguna terdaftar yang dapat ditampilkan.
              </div>
            )}
          </div>
        )}

        {/* Tab Content: Profil Saya */}
        {activeTab === "personal_profile" && (
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm w-full animate-in slide-in-from-bottom-2 duration-300">
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-6 flex items-center gap-2">
              <User className="w-4 h-4 text-indigo-500" /> Informasi Data Diri Pribadi
            </h3>

            {loadingPersonal ? (
              <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mb-3" />
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Memuat profil pribadi...</p>
              </div>
            ) : (
              <form onSubmit={handleSavePersonalProfile} className="space-y-6">
                {/* Photo Profile Section */}
                <div className="flex flex-col sm:flex-row items-center gap-6 p-4 bg-slate-50/50 rounded-2xl border border-slate-100 w-fit">
                  <div className="w-20 h-20 rounded-4xl bg-linear-to-br from-indigo-500 to-purple-600 border border-slate-200/50 shadow-lg overflow-hidden flex items-center justify-center text-white text-2xl font-black shrink-0 relative group">
                    {personalProfile.avatar_url ? (
                      <img src={personalProfile.avatar_url} alt="Foto Profil" className="w-full h-full object-cover" />
                    ) : (
                      getInitials(personalProfile.name)
                    )}
                    {uploadingPhoto && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <Loader2 className="w-6 h-6 animate-spin text-white" />
                      </div>
                    )}
                  </div>
                  <div className="space-y-2 text-center sm:text-left">
                    <p className="text-xs font-black text-slate-800 uppercase tracking-wider">Foto Profil</p>
                    <p className="text-[10px] text-slate-400">Direkomendasikan foto wajah formal, rasio 1:1, max 2MB</p>
                    <label className="relative inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 text-[10px] font-black uppercase rounded-xl transition-all cursor-pointer">
                      <Upload className="w-3.5 h-3.5" />
                      {uploadingPhoto ? "Mengunggah..." : "Unggah Foto Baru"}
                      <input 
                        type="file" 
                        accept="image/*"
                        disabled={uploadingPhoto}
                        onChange={handleUploadPhoto}
                        className="hidden" 
                      />
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Username (Tidak Dapat Diubah)</label>
                    <input 
                      type="text" 
                      disabled
                      value={personalProfile.username}
                      className="w-full bg-slate-100 border-none rounded-2xl py-3.5 px-4 text-xs font-bold text-slate-500 cursor-not-allowed outline-none" 
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Jabatan / Level Akses</label>
                    <input 
                      type="text" 
                      disabled
                      value={personalProfile.role}
                      className="w-full bg-slate-100 border-none rounded-2xl py-3.5 px-4 text-xs font-bold text-slate-500 cursor-not-allowed outline-none" 
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Nama Lengkap</label>
                  <input 
                    type="text" 
                    required
                    value={personalProfile.name}
                    onChange={e => setPersonalProfile({...personalProfile, name: e.target.value})}
                    className="w-full bg-slate-50 border-none rounded-2xl py-3.5 px-4 text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-100" 
                  />
                </div>

                <button 
                  type="submit"
                  disabled={isSavingPersonal || uploadingPhoto}
                  className="mt-4 px-6 py-4 bg-indigo-600 text-white rounded-2xl text-[11px] font-black uppercase shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center gap-2"
                >
                  {isSavingPersonal ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} 
                  Simpan Profil Pribadi
                </button>
              </form>
            )}
          </div>
        )}

        {/* Tab Content: Tarif SPP */}
        {activeTab === "spp_rates" && canManageSpp && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in slide-in-from-bottom-2 duration-300">
            {/* Create SPP Tariff Form */}
            <div className="lg:col-span-1">
              <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm sticky top-6">
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-6 flex items-center gap-2">
                  <Plus className="w-4 h-4 text-emerald-500" /> Tambah Tarif SPP
                </h3>
                
                <form onSubmit={handleAddSppRate} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Madrasah</label>
                      <select 
                        value={newSpp.madrasah}
                        onChange={e => setNewSpp({...newSpp, madrasah: e.target.value})}
                        className="w-full bg-slate-50 border-none rounded-2xl py-3 px-4 text-xs font-bold text-slate-700 outline-none"
                      >
                        <option value="MHM">MHM</option>
                        <option value="MIU">MIU</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Kategori Kelas</label>
                      <input 
                        type="text" 
                        required
                        value={newSpp.kelas_name}
                        onChange={e => setNewSpp({...newSpp, kelas_name: e.target.value})}
                        className="w-full bg-slate-50 border-none rounded-2xl py-3 px-4 text-xs font-bold text-slate-700 outline-none" 
                        placeholder="Contoh: Ibtida, Ula"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Status Keanggotaan</label>
                      <select 
                        value={newSpp.status}
                        onChange={e => setNewSpp({...newSpp, status: e.target.value})}
                        className="w-full bg-slate-50 border-none rounded-2xl py-3 px-4 text-xs font-bold text-slate-700 outline-none"
                      >
                        <option value="Biasa">Biasa</option>
                        <option value="Ndalem 50%">Ndalem 50%</option>
                        <option value="Ndalem 100%">Ndalem 100%</option>
                        <option value="PKJ 50%">PKJ 50%</option>
                        <option value="PKJ 100%">PKJ 100%</option>
                        <option value="Nduduk">Nduduk</option>
                        <option value="Dzuriyyah">Dzuriyyah</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Batas Periode</label>
                      <select 
                        value={newSpp.period_name}
                        onChange={e => setNewSpp({...newSpp, period_name: e.target.value})}
                        className="w-full bg-slate-50 border-none rounded-2xl py-3 px-4 text-xs font-bold text-slate-700 outline-none"
                      >
                        <option value="Semua">Semua Periode</option>
                        <option value="Syawal">Syawal</option>
                        <option value="Maulid">Maulid</option>
                        <option value="Rajab">Rajab</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Biaya SPP (Rp)</label>
                    <input 
                      type="number" 
                      required
                      value={newSpp.amount}
                      onChange={e => setNewSpp({...newSpp, amount: e.target.value})}
                      className="w-full bg-slate-50 border-none rounded-2xl py-3 px-4 text-xs font-bold text-slate-700 outline-none" 
                      placeholder="Contoh: 1000000"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Deskripsi Tambahan</label>
                    <input 
                      type="text" 
                      value={newSpp.description}
                      onChange={e => setNewSpp({...newSpp, description: e.target.value})}
                      className="w-full bg-slate-50 border-none rounded-2xl py-3 px-4 text-xs font-bold text-slate-700 outline-none" 
                      placeholder="Contoh: Biaya Syahriah Ibtida"
                    />
                  </div>

                  <div className="p-3 bg-amber-50 rounded-2xl border border-amber-100 text-[10px] text-amber-800 font-bold leading-normal flex items-start gap-2">
                    <ShieldAlert className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                    <span>Catatan: Segala perubahan nominal SPP harap disesuaikan dengan instruksi atau verifikasi dari Bendahara Umum.</span>
                  </div>

                  <button 
                    type="submit"
                    disabled={isSubmittingSPP}
                    className="w-full bg-indigo-600 text-white py-4 rounded-2xl text-[11px] font-black uppercase shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center justify-center gap-2"
                  >
                    {isSubmittingSPP ? <Loader2 className="w-4 h-4 animate-spin" /> : "Simpan Tarif"}
                  </button>
                </form>
              </div>
            </div>

            {/* SPP Tariff List */}
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-8 border-b border-slate-50 bg-slate-50/10">
                  <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
                    <Wallet className="w-4 h-4 text-indigo-500" /> Konfigurasi Tarif Aktif ({sppRates.length})
                  </h3>
                </div>

                {loadingSPP ? (
                  <div className="flex flex-col items-center justify-center py-20">
                    <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mb-3" />
                    <p className="text-xs font-black text-slate-400 uppercase tracking-wider">Menghubungkan ke database...</p>
                  </div>
                ) : sppRates.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead className="bg-slate-50/50 text-[9px] font-black text-slate-400 uppercase tracking-wider">
                        <tr>
                          <th className="px-6 py-4">Madrasah & Kelas</th>
                          <th className="px-6 py-4">Status Santri</th>
                          <th className="px-6 py-4">Periode</th>
                          <th className="px-6 py-4 text-right">Nominal</th>
                          <th className="px-6 py-4 text-center">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50 text-slate-700">
                        {sppRates.map((rate) => (
                          <tr key={rate.id} className="hover:bg-slate-50/50 transition-colors text-xs font-bold">
                            <td className="px-6 py-4">
                              <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded text-[9px] font-black uppercase tracking-wider mr-2">
                                {rate.madrasah}
                              </span>
                              {rate.kelas_name}
                            </td>
                            <td className="px-6 py-4 text-slate-500">{rate.status}</td>
                            <td className="px-6 py-4">
                              <span className="text-[10px] font-black uppercase text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                                {rate.period_name}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-right font-black text-slate-800">
                              Rp {rate.amount.toLocaleString("id-ID")}
                            </td>
                            <td className="px-6 py-4 text-center">
                              <button 
                                onClick={() => handleDeleteSppRate(rate.id)}
                                className="p-2 text-slate-300 hover:text-rose-500 transition-colors active:scale-90"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="py-20 text-center text-slate-300 italic text-sm font-bold">
                    Belum ada tarif SPP terdaftar.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tab Content: Keamanan (Ganti Password) */}
        {activeTab === "security" && (
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm w-full max-w-xl animate-in slide-in-from-bottom-2 duration-300">
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-6 flex items-center gap-2">
              <Lock className="w-4 h-4 text-rose-500" /> Perbarui Password Akun
            </h3>
            
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Password Lama</label>
                <input 
                  type="password" 
                  required
                  value={passwordForm.currentPassword}
                  onChange={e => setPasswordForm({...passwordForm, currentPassword: e.target.value})}
                  className="w-full bg-slate-50 border-none rounded-2xl py-3 px-4 text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-100" 
                  placeholder="••••••••"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Password Baru</label>
                <input 
                  type="password" 
                  required
                  value={passwordForm.newPassword}
                  onChange={e => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                  className="w-full bg-slate-50 border-none rounded-2xl py-3 px-4 text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-100" 
                  placeholder="Minimal 6 karakter"
                />
              </div>

              <div className="space-y-1 pb-4">
                <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Konfirmasi Password Baru</label>
                <input 
                  type="password" 
                  required
                  value={passwordForm.confirmPassword}
                  onChange={e => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
                  className="w-full bg-slate-50 border-none rounded-2xl py-3 px-4 text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-100" 
                  placeholder="Ulangi password baru"
                />
              </div>

              <button 
                type="submit"
                disabled={isChangingPassword}
                className="w-full bg-rose-600 text-white py-4 rounded-2xl text-[11px] font-black uppercase shadow-lg shadow-rose-900/10 hover:bg-rose-500 transition-all flex items-center justify-center gap-2"
              >
                {isChangingPassword ? <Loader2 className="w-4 h-4 animate-spin" /> : "Perbarui Kata Sandi"}
              </button>
            </form>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
