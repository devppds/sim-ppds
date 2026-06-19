"use client";

import { useState, useEffect } from "react";
import { API_BASE_URL } from "@/lib/config";
import { Plus, Search, RefreshCw, X, Pencil, CheckCircle2, AlertCircle, Trash2 } from "lucide-react";

export default function KebersihanPage() {
  const tabs: any[] = [{"id":"hygiene","label":"Hygiene Checks","api":"kbr/kbr_hygiene_checks","columns":[{"key":"area","label":"Area / Blok","type":"text","required":true},{"key":"checked_by","label":"Petugas KBR","type":"text","required":true},{"key":"date","label":"Tanggal Pengecekan","type":"date"},{"key":"status","label":"Status Area","type":"select","options":["Clean","Warning","Dirty"]},{"key":"notes","label":"Catatan Tambahan","type":"textarea"}]}];
  const [activeTab, setActiveTab] = useState<number>(0);
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [saving, setSaving] = useState<boolean>(false);
  const [notification, setNotification] = useState<{ show: boolean; message: string; type: 'success' | 'error' }>({ show: false, message: '', type: 'success' });

  const currentTab = tabs[activeTab];

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/${currentTab.api}`);
      const json = await res.json() as { success: boolean; data: any };
      if (json.success) {
        setData(json.data);
      }
    } catch (e) {
      console.error(e);
      showNotification("Gagal mengambil data", "error");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: '', type: 'success' }), 3000);
  };

  const handleInputChange = (key: string, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const openAddModal = () => {
    setFormData({});
    setEditingItem(null);
    setIsModalOpen(true);
  };

  const openEditModal = (item: any) => {
    setFormData({ ...item });
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number | string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus data ini?")) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/${currentTab.api}/${id}`, { method: 'DELETE' });
      const json = await res.json() as { success: boolean };
      if (json.success) {
        showNotification("Data berhasil dihapus", "success");
        fetchData();
      } else {
        showNotification("Gagal menghapus data", "error");
      }
    } catch (e) {
      showNotification("Terjadi kesalahan server", "error");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const url = editingItem 
        ? `${API_BASE_URL}/api/${currentTab.api}/${editingItem.id}`
        : `${API_BASE_URL}/api/${currentTab.api}`;
      
      const res = await fetch(url, {
        method: editingItem ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const json = await res.json() as { success: boolean };
      if (json.success) {
        showNotification(`Data berhasil ${editingItem ? 'diperbarui' : 'ditambahkan'}`, "success");
        setIsModalOpen(false);
        fetchData();
      } else {
        showNotification("Gagal menyimpan data", "error");
      }
    } catch (err) {
      showNotification("Terjadi kesalahan jaringan", "error");
    }
    setSaving(false);
  };

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto relative">
      {/* Notification Toast */}
      {notification.show && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl animate-in slide-in-from-top-10 duration-300 font-bold text-sm text-white ${notification.type === 'success' ? 'bg-emerald-500' : 'bg-rose-500'}`}>
          {notification.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          {notification.message}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <Trash2 className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight">Seksi Kebersihan (KBR)</h1>
            <p className="text-sm text-slate-500 font-medium">Manajemen data operasional terpadu</p>
          </div>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button 
            onClick={fetchData}
            className="p-2.5 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button onClick={openAddModal} className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl shadow-lg shadow-emerald-500/20 transition-all active:scale-95">
            <Plus className="w-5 h-5" />
            <span>Tambah Data</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 p-1 bg-slate-100 rounded-xl max-w-fit">
        {tabs.map((tab, idx) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(idx)}
            className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === idx ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200'}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Main Table Content */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4 bg-slate-50/50">
          <h2 className="font-bold text-slate-800 text-lg">{currentTab.label}</h2>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text"
              placeholder="Cari data..."
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
            />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="px-6 py-4">ID</th>
                {currentTab.columns.map((col: any) => (
                  <th key={col.key} className="px-6 py-4">{col.label}</th>
                ))}
                <th className="px-6 py-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={currentTab.columns.length + 2} className="px-6 py-12 text-center text-slate-400 font-medium">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-3 text-emerald-500" />
                    Memuat data...
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={currentTab.columns.length + 2} className="px-6 py-12 text-center text-slate-400 font-medium">
                    Belum ada data tercatat di {currentTab.label}.
                  </td>
                </tr>
              ) : (
                data.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-400">#{item.id}</td>
                    {currentTab.columns.map((col: any) => (
                      <td key={col.key} className="px-6 py-4">
                        {col.key === 'status' ? (
                          <span className={`inline-flex px-3 py-1 text-xs font-black rounded-full ${
                            ['Completed', 'Approved', 'Clean', 'Paid'].includes(item[col.key]) ? 'bg-emerald-100 text-emerald-700' : 
                            ['Warning', 'Draft', 'Pending', 'Unpaid'].includes(item[col.key]) ? 'bg-amber-100 text-amber-700' : 
                            'bg-slate-100 text-slate-700'
                          }`}>
                            {item[col.key] || 'N/A'}
                          </span>
                        ) : (
                          <span className="font-semibold text-slate-700">{item[col.key] || '-'}</span>
                        )}
                      </td>
                    ))}
                    <td className="px-6 py-4 text-right space-x-2">
                      <button onClick={() => openEditModal(item)} className="text-emerald-600 hover:bg-emerald-50 p-2 rounded-lg transition-colors inline-flex">
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(item.id)} className="text-rose-500 hover:bg-rose-50 p-2 rounded-lg transition-colors inline-flex">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CRUD Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-6 border-b border-slate-100">
              <h3 className="text-lg font-black text-slate-800">
                {editingItem ? 'Edit Data' : 'Tambah Data'} {currentTab.label}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              {currentTab.columns.map((col: any) => (
                <div key={col.key}>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">{col.label}</label>
                  {col.type === 'textarea' ? (
                    <textarea 
                      required={col.required}
                      value={formData[col.key] || ''}
                      onChange={(e) => handleInputChange(col.key, e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all min-h-[100px]"
                    />
                  ) : col.type === 'select' ? (
                    <select 
                      required={col.required}
                      value={formData[col.key] || ''}
                      onChange={(e) => handleInputChange(col.key, e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                    >
                      <option value="">-- Pilih --</option>
                      {(col.options || []).map((opt: string) => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  ) : (
                    <input 
                      type={col.type}
                      required={col.required}
                      value={formData[col.key] || ''}
                      onChange={(e) => handleInputChange(col.key, col.type === 'number' ? Number(e.target.value) : e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                    />
                  )}
                </div>
              ))}
              
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-2.5 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition-all">
                  Batal
                </button>
                <button type="submit" disabled={saving} className="flex-1 px-4 py-2.5 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-50">
                  {saving ? 'Menyimpan...' : 'Simpan Data'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
