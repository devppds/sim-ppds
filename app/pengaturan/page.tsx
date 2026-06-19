"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { 
  Settings, Home, Wallet, Key, Plus, Trash2, 
  Loader2, Save, CheckCircle, Info, Lock
} from "lucide-react";
import { useToast } from "@/components/Toast";

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
  const [activeTab, setActiveTab] = useState<"profile" | "spp" | "account">("profile");
  const { showToast } = useToast();
  
  // Profile settings state (local mock storage or state)
  const [pondokProfile, setPondokProfile] = useState({
    name: "Pondok Pesantren Darussalam Lirboyo",
    address: "Jl. KH. A. Dahlan No.3, Mojoroto, Kota Kediri, Jawa Timur",
    phone: "081234567890",
    email: "info@darussalamlirboyo.org",
    head: "KH. Anwar Manshur"
  });
  
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

  // Account change password state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Fetch SPP config from Hono Worker D1
  const fetchSppRates = async () => {
    setLoadingSPP(true);
    try {
      const res = await fetch("https://api-worker.ppdslirboyo.workers.dev/api/spp/config");
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
  };

  useEffect(() => {
    if (activeTab === "spp") {
      fetchSppRates();
    }
  }, [activeTab]);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    showToast("Profil Pondok Pesantren berhasil disimpan!", "success");
  };

  const handleAddSppRate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSpp.kelas_name || !newSpp.amount) {
      showToast("Silakan lengkapi Kelas dan Biaya", "warning");
      return;
    }
    
    setIsSubmittingSPP(true);
    try {
      const res = await fetch("https://api-worker.ppdslirboyo.workers.dev/api/spp/config", {
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
      const res = await fetch(`https://api-worker.ppdslirboyo.workers.dev/api/spp/config/${id}`, {
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

  return (
    <DashboardLayout>
      <div className="fade-up space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
             <div className="w-14 h-14 bg-indigo-600 rounded-[2rem] flex items-center justify-center shadow-xl shadow-indigo-600/20">
                <Settings className="w-7 h-7 text-white" />
             </div>
             <div>
                <h1 className="text-2xl font-black text-slate-800 tracking-tight">
                   PENGATURAN
                </h1>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
                   Konfigurasi Profil Pondok, Tarif SPP, & Akun
                </p>
             </div>
          </div>

          {/* Tabs */}
          <div className="flex bg-white rounded-2xl border border-slate-100 p-1.5 shadow-sm">
             <button
               onClick={() => setActiveTab("profile")}
               className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[11px] font-black uppercase transition-all ${
                 activeTab === "profile" ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/25" : "text-slate-400 hover:text-slate-600"
               }`}
             >
                <Home className="w-3.5 h-3.5" /> Profil
             </button>
             <button
               onClick={() => setActiveTab("spp")}
               className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[11px] font-black uppercase transition-all ${
                 activeTab === "spp" ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/25" : "text-slate-400 hover:text-slate-600"
               }`}
             >
                <Wallet className="w-3.5 h-3.5" /> Tarif SPP
             </button>
             <button
               onClick={() => setActiveTab("account")}
               className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[11px] font-black uppercase transition-all ${
                 activeTab === "account" ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/25" : "text-slate-400 hover:text-slate-600"
               }`}
             >
                <Key className="w-3.5 h-3.5" /> Keamanan
             </button>
          </div>
        </div>

        {/* Tab content: Profile */}
        {activeTab === "profile" && (
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm max-w-3xl animate-in slide-in-from-bottom-2 duration-300">
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-6 flex items-center gap-2">
              <Home className="w-4 h-4 text-indigo-500" /> Identitas Lembaga Pesantren
            </h3>
            
            <form onSubmit={handleSaveProfile} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Nama Pesantren</label>
                  <input 
                    type="text" 
                    required
                    value={pondokProfile.name}
                    onChange={e => setPondokProfile({...pondokProfile, name: e.target.value})}
                    className="w-full bg-slate-50 border-none rounded-2xl py-3 px-4 text-xs font-bold text-slate-700" 
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Kiai Pengasuh</label>
                  <input 
                    type="text" 
                    required
                    value={pondokProfile.head}
                    onChange={e => setPondokProfile({...pondokProfile, head: e.target.value})}
                    className="w-full bg-slate-50 border-none rounded-2xl py-3 px-4 text-xs font-bold text-slate-700" 
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Alamat Lembaga</label>
                <input 
                  type="text" 
                  required
                  value={pondokProfile.address}
                  onChange={e => setPondokProfile({...pondokProfile, address: e.target.value})}
                  className="w-full bg-slate-50 border-none rounded-2xl py-3 px-4 text-xs font-bold text-slate-700" 
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Nomor Telepon/WA</label>
                  <input 
                    type="text" 
                    required
                    value={pondokProfile.phone}
                    onChange={e => setPondokProfile({...pondokProfile, phone: e.target.value})}
                    className="w-full bg-slate-50 border-none rounded-2xl py-3 px-4 text-xs font-bold text-slate-700" 
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Email Lembaga</label>
                  <input 
                    type="email" 
                    required
                    value={pondokProfile.email}
                    onChange={e => setPondokProfile({...pondokProfile, email: e.target.value})}
                    className="w-full bg-slate-50 border-none rounded-2xl py-3 px-4 text-xs font-bold text-slate-700" 
                  />
                </div>
              </div>

              <button 
                type="submit"
                className="mt-4 px-6 py-4 bg-indigo-600 text-white rounded-2xl text-[11px] font-black uppercase shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center gap-2"
              >
                <Save className="w-4 h-4" /> Simpan Profil Pondok
              </button>
            </form>
          </div>
        )}

        {/* Tab content: SPP Config */}
        {activeTab === "spp" && (
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
                        className="w-full bg-slate-50 border-none rounded-2xl py-3 px-4 text-xs font-bold text-slate-700" 
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
                      className="w-full bg-slate-50 border-none rounded-2xl py-3 px-4 text-xs font-bold text-slate-700" 
                      placeholder="Contoh: 1000000"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Deskripsi Tambahan</label>
                    <input 
                      type="text" 
                      value={newSpp.description}
                      onChange={e => setNewSpp({...newSpp, description: e.target.value})}
                      className="w-full bg-slate-50 border-none rounded-2xl py-3 px-4 text-xs font-bold text-slate-700" 
                      placeholder="Contoh: Biaya Syahriah Ibtida"
                    />
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

        {/* Tab content: Security change password */}
        {activeTab === "account" && (
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm max-w-md animate-in slide-in-from-bottom-2 duration-300">
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-6 flex items-center gap-2">
              <Lock className="w-4 h-4 text-rose-500" /> Perbarui Password
            </h3>
            
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Password Lama</label>
                <input 
                  type="password" 
                  required
                  value={passwordForm.currentPassword}
                  onChange={e => setPasswordForm({...passwordForm, currentPassword: e.target.value})}
                  className="w-full bg-slate-50 border-none rounded-2xl py-3 px-4 text-xs font-bold text-slate-700" 
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
                  className="w-full bg-slate-50 border-none rounded-2xl py-3 px-4 text-xs font-bold text-slate-700" 
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
                  className="w-full bg-slate-50 border-none rounded-2xl py-3 px-4 text-xs font-bold text-slate-700" 
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
