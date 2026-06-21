"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import SectionDashboardCards, { DashboardCardConfig } from "@/components/SectionDashboardCards";
import { 
  ShoppingCart, Store, PackageOpen, FileSpreadsheet, Plus, 
  Search, Trash2, DollarSign, Loader2, RefreshCw, Box, ArrowUpRight, TrendingUp
} from "lucide-react";
import { useToast } from "@/components/Toast";
import { API_BASE_URL } from "@/lib/config";

interface Product {
  id: number;
  nama_barang: string;
  sku: string;
  harga_beli: number;
  harga_jual: number;
  stok: number;
  kategori: string;
}

interface CartItem extends Product {
  quantity: number;
}

interface SaleRecord {
  id: number;
  sales_number: string;
  total_amount: number;
  metode_bayar: "Tunai" | "Cashless";
  total_items?: number;
  created_at?: string;
}

export default function BumpPage() {
  const [activeTab, setActiveTab] = useState<"pos" | "inventory" | "sales">("pos");
  const { showToast } = useToast();

  const [products, setProducts] = useState<Product[]>([]);
  const [sales, setSales] = useState<SaleRecord[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");
  const [metodeBayar, setMetodeBayar] = useState<"Tunai" | "Cashless">("Tunai");

  // Modals state
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);

  // Form states
  const [productForm, setProductForm] = useState({ nama_barang: "", sku: "", harga_beli: 0, harga_jual: 0, stok: 10, kategori: "Konsumsi" });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [iRes, sRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/bump/inventory`),
        fetch(`${API_BASE_URL}/api/bump/sales`)
      ]);

      const iJson = await iRes.json() as { success: boolean; data: Product[] };
      const sJson = await sRes.json() as { success: boolean; data: SaleRecord[] };

      if (iJson.success) setProducts(iJson.data);
      if (sJson.success) setSales(sJson.data);
    } catch {
      // Fallback
      setProducts([
        { id: 1, nama_barang: "Sabun mandi Nuvo 75g", sku: "NUV-001", harga_beli: 3000, harga_jual: 4000, stok: 55, kategori: "Mandi" },
        { id: 2, nama_barang: "Pepsodent Pencegah Gigi Berlubang 75g", sku: "PEP-002", harga_beli: 5500, harga_jual: 7000, stok: 34, kategori: "Mandi" },
        { id: 3, nama_barang: "Buku Tulis Sidu 38 Lembar", sku: "SID-010", harga_beli: 2500, harga_jual: 3500, stok: 120, kategori: "ATK" },
        { id: 4, nama_barang: "Pulpen Snowman V-1 Hitam", sku: "SNO-012", harga_beli: 1500, harga_jual: 2500, stok: 80, kategori: "ATK" },
        { id: 5, nama_barang: "Kopiah Hitam Standard Lirboyo", sku: "KOP-099", harga_beli: 35000, harga_jual: 45000, stok: 15, kategori: "Pakaian" }
      ]);
      setSales([
        { id: 1, sales_number: "INV-BUMP-17188092182", total_amount: 15000, metode_bayar: "Tunai", total_items: 3, created_at: "2026-06-19 10:22:00" },
        { id: 2, sales_number: "INV-BUMP-17188092391", total_amount: 45000, metode_bayar: "Cashless", total_items: 1, created_at: "2026-06-19 11:35:00" }
      ]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchData();
    }, 0);
    return () => clearTimeout(timer);
  }, [fetchData]);

  // Cart operations
  const addToCart = (product: Product) => {
    if (product.stok <= 0) {
      showToast("Stok barang habis!", "warning");
      return;
    }
    setCart(prev => {
      const exist = prev.find(item => item.id === product.id);
      if (exist) {
        if (exist.quantity >= product.stok) {
          showToast("Kuantitas melebihi stok tersedia!", "warning");
          return prev;
        }
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (id: number) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const updateQuantity = (id: number, qty: number) => {
    const product = products.find(p => p.id === id);
    if (!product) return;
    if (qty > product.stok) {
      showToast("Kuantitas melebihi stok!", "warning");
      return;
    }
    if (qty <= 0) {
      removeFromCart(id);
      return;
    }
    setCart(prev => prev.map(item => item.id === id ? { ...item, quantity: qty } : item));
  };

  const totalAmount = useMemo(() => {
    return cart.reduce((sum, item) => sum + (item.harga_jual * item.quantity), 0);
  }, [cart]);

  // Checkout Cashier
  const handleCheckout = async () => {
    if (cart.length === 0) {
      showToast("Keranjang kosong!", "warning");
      return;
    }
    try {
      const res = await fetch(`${API_BASE_URL}/api/bump/checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: cart.map(i => ({ id: i.id, quantity: i.quantity, price: i.harga_jual })),
          total_amount: totalAmount,
          metode_bayar: metodeBayar
        })
      });
      const json = await res.json() as { success: boolean; invoice?: string };
      if (json.success) {
        showToast(`Checkout sukses! Invoice: ${json.invoice}`, "success");
        setCart([]);
        fetchData();
      }
    } catch {
      // Fallback
      const invoice = `INV-BUMP-${Date.now()}`;
      const newSale: SaleRecord = {
        id: Date.now(),
        sales_number: invoice,
        total_amount: totalAmount,
        metode_bayar: metodeBayar,
        total_items: cart.length,
        created_at: new Date().toISOString()
      };
      setSales(prev => [newSale, ...prev]);

      // Deduct stock locally
      setProducts(prev => prev.map(p => {
        const cartItem = cart.find(c => c.id === p.id);
        if (cartItem) {
          return { ...p, stok: p.stok - cartItem.quantity };
        }
        return p;
      }));

      showToast(`Checkout Sukses (Lokal)! Invoice: ${invoice}`, "success");
      setCart([]);
    }
  };

  // Add Product Item
  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productForm.nama_barang || !productForm.sku || !productForm.harga_beli || !productForm.harga_jual) {
      showToast("Harap isi semua kolom!", "warning");
      return;
    }
    try {
      const res = await fetch(`${API_BASE_URL}/api/bump/inventory`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(productForm)
      });
      const json = await res.json() as { success: boolean };
      if (json.success) {
        showToast("Barang berhasil didaftarkan ke inventori!", "success");
        setIsProductModalOpen(false);
        setProductForm({ nama_barang: "", sku: "", harga_beli: 0, harga_jual: 0, stok: 10, kategori: "Konsumsi" });
        fetchData();
      }
    } catch {
      const newItem: Product = {
        id: Date.now(),
        ...productForm
      };
      setProducts(prev => [...prev, newItem]);
      showToast("Barang terdaftar di inventori (Lokal)!", "success");
      setIsProductModalOpen(false);
      setProductForm({ nama_barang: "", sku: "", harga_beli: 0, harga_jual: 0, stok: 10, kategori: "Konsumsi" });
    }
  };

  const formatIDR = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  const filteredProducts = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return products.filter(p => p.nama_barang.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q) || p.kategori.toLowerCase().includes(q));
  }, [products, searchQuery]);

  const filteredSales = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return sales.filter(s =>
      (s.sales_number || "").toLowerCase().includes(q) ||
      (s.metode_bayar || "").toLowerCase().includes(q)
    );
  }, [sales, searchQuery]);

  const getAddBtnConfig = () => {
    switch (activeTab) {
      case "inventory":
        return { label: "Tambah Barang", action: () => setIsProductModalOpen(true), bg: "bg-indigo-600 hover:bg-indigo-700 shadow-indigo-500/20" };
      default:
        return null;
    }
  };

  const getCardsData = (): DashboardCardConfig[] => {
    switch (activeTab) {
      case "pos":
        return [
          { title: "Barang Tersedia", value: products.filter(p => p.stok > 0).length, description: "Siap Dijual", icon: <Store className="w-6 h-6" />, colorTheme: "emerald" },
          { title: "Barang Habis", value: products.filter(p => p.stok <= 0).length, description: "Perlu Restock", icon: <Box className="w-6 h-6" />, colorTheme: "rose" },
          { title: "Penjualan Hari Ini", value: sales.filter(s => new Date(s.created_at || "").toDateString() === new Date().toDateString()).length, description: "Transaksi Berhasil", icon: <ShoppingCart className="w-6 h-6" />, colorTheme: "indigo" },
        ];
      case "inventory":
        return [
          { title: "Total Item", value: products.length, description: "Jenis Barang", icon: <Box className="w-6 h-6" />, colorTheme: "indigo" },
          { title: "Stok Menipis", value: products.filter(p => p.stok > 0 && p.stok < 10).length, description: "Stok < 10 pcs", icon: <TrendingUp className="w-6 h-6" />, colorTheme: "amber" },
          { title: "Estimasi Aset", value: formatIDR(products.reduce((acc, p) => acc + (p.harga_beli * p.stok), 0)), description: "Nilai Modal Stok", icon: <DollarSign className="w-6 h-6" />, colorTheme: "emerald" },
        ];
      case "sales":
        return [
          { title: "Total Transaksi", value: sales.length, description: "Keseluruhan Penjualan", icon: <FileSpreadsheet className="w-6 h-6" />, colorTheme: "blue" },
          { title: "Pendapatan Kotor", value: formatIDR(sales.reduce((acc, s) => acc + s.total_amount, 0)), description: "Total Uang Masuk", icon: <DollarSign className="w-6 h-6" />, colorTheme: "emerald" },
          { title: "Rata-rata Transaksi", value: formatIDR(sales.length > 0 ? sales.reduce((acc, s) => acc + s.total_amount, 0) / sales.length : 0), description: "Per Penjualan", icon: <ArrowUpRight className="w-6 h-6" />, colorTheme: "teal" },
        ];
      default:
        return [];
    }
  };

  const addBtn = getAddBtnConfig();

  return (
    <>
      <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto relative">
        <SectionDashboardCards cards={getCardsData()} />

        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
              <Store className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-800 tracking-tight">Badan Usaha Milik Pesantren (BUMP)</h1>
              <p className="text-sm text-slate-500 font-medium">POS Kasir Kas Pesantren, Inventori Toko, & Setoran Usaha</p>
            </div>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button 
              onClick={fetchData}
              className="p-2.5 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all"
              title="Refresh Data"
            >
              <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            </button>
            {addBtn && (
              <button 
                onClick={addBtn.action} 
                className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 text-white font-semibold rounded-xl shadow-lg transition-all active:scale-95 ${addBtn.bg}`}
              >
                <Plus className="w-5 h-5" />
                <span>{addBtn.label}</span>
              </button>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 p-1 bg-slate-100 rounded-xl max-w-fit overflow-x-auto">
          <button
            onClick={() => { setActiveTab("pos"); setSearchQuery(""); }}
            className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${
              activeTab === "pos" 
                ? "bg-white text-emerald-600 shadow-sm" 
                : "text-slate-500 hover:text-slate-700 hover:bg-slate-200"
            }`}
          >
            Kasir POS
          </button>
          <button
            onClick={() => { setActiveTab("inventory"); setSearchQuery(""); }}
            className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${
              activeTab === "inventory" 
                ? "bg-white text-indigo-600 shadow-sm" 
                : "text-slate-500 hover:text-slate-700 hover:bg-slate-200"
            }`}
          >
            Inventori Toko
          </button>
          <button
            onClick={() => { setActiveTab("sales"); setSearchQuery(""); }}
            className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${
              activeTab === "sales" 
                ? "bg-white text-slate-700 shadow-sm" 
                : "text-slate-500 hover:text-slate-700 hover:bg-slate-200"
            }`}
          >
            Rekap Penjualan
          </button>
        </div>

        {/* Contents */}
        {activeTab === "pos" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Products grid */}
            <div className="lg:col-span-2 space-y-6">
              <div className="flex gap-3 bg-white p-3 rounded-2xl border border-slate-100 shadow-xs">
                <div className="relative flex-1">
                  <Search className="w-5 h-5 text-slate-400 absolute left-3 top-3.5" />
                  <input 
                    type="text" 
                    placeholder="Cari barang atau scan SKU barcode..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 rounded-xl text-slate-600 placeholder-slate-400 focus:outline-hidden text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {loading ? (
                  <div className="col-span-full flex flex-col items-center justify-center py-20 text-slate-400">
                    <Loader2 className="w-10 h-10 animate-spin text-emerald-600 mb-4" />
                    <p className="text-xs font-medium">Memuat inventori BUMP...</p>
                  </div>
                ) : filteredProducts.length === 0 ? (
                  <div className="col-span-full flex flex-col items-center justify-center py-20 text-slate-400">
                    <p className="text-xs font-medium">Barang tidak ditemukan</p>
                  </div>
                ) : (
                  filteredProducts.map((p) => (
                    <div key={p.id} onClick={() => addToCart(p)} className="bg-white border border-slate-100 rounded-2xl p-5 shadow-xs relative hover:shadow-md hover:scale-[1.02] cursor-pointer transition-all flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded font-mono font-bold">{p.sku}</span>
                          <span className="text-[10px] text-slate-400 font-bold">{p.kategori}</span>
                        </div>
                        <h3 className="font-extrabold text-slate-800 text-sm leading-tight h-10 line-clamp-2">{p.nama_barang}</h3>
                      </div>
                      <div className="mt-4 flex items-center justify-between">
                        <div className="text-emerald-600 font-black text-sm">{formatIDR(p.harga_jual)}</div>
                        <div className={`text-[10px] font-bold ${p.stok < 10 ? 'text-rose-500' : 'text-slate-400'}`}>Stok: {p.stok}</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Cart checkout */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex flex-col justify-between h-[600px]">
              <div>
                <h2 className="text-base font-extrabold text-slate-800 mb-4 flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5 text-indigo-600" /> Keranjang Kasir
                </h2>
                
                <div className="space-y-4 overflow-y-auto max-h-[350px] pr-1">
                  {cart.length === 0 && (
                    <div className="text-center py-16 text-slate-400 text-xs">
                      <ShoppingCart className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                      Keranjang kosong
                    </div>
                  )}
                  {cart.map((item) => (
                    <div key={item.id} className="flex justify-between items-center text-xs pb-3 border-b border-slate-50">
                      <div className="flex-1 pr-3">
                        <div className="font-bold text-slate-800 line-clamp-1">{item.nama_barang}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">{formatIDR(item.harga_jual)} x {item.quantity}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="w-6 h-6 border border-slate-200 rounded-sm font-bold text-slate-600">-</button>
                        <span className="font-bold text-slate-800 w-4 text-center">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="w-6 h-6 border border-slate-200 rounded-sm font-bold text-slate-600">+</button>
                        <button onClick={() => removeFromCart(item.id)} className="text-rose-500 hover:text-rose-600 p-1">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-slate-100 pt-4 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-500">Metode Pembayaran</span>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setMetodeBayar("Tunai")}
                      className={`px-3 py-1 rounded text-xs font-bold transition-all ${metodeBayar === "Tunai" ? "bg-slate-800 text-white" : "bg-slate-100 text-slate-500"}`}
                    >
                      Tunai
                    </button>
                    <button 
                      onClick={() => setMetodeBayar("Cashless")}
                      className={`px-3 py-1 rounded text-xs font-bold transition-all ${metodeBayar === "Cashless" ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-500"}`}
                    >
                      E-Money
                    </button>
                  </div>
                </div>

                <div className="flex justify-between items-center text-sm border-t border-slate-50 pt-3">
                  <span className="font-bold text-slate-800">Total Belanja</span>
                  <span className="text-lg font-black text-emerald-600">{formatIDR(totalAmount)}</span>
                </div>

                <button 
                  onClick={handleCheckout} 
                  disabled={cart.length === 0}
                  className="w-full py-3 bg-emerald-600 disabled:bg-slate-200 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/20 text-sm flex items-center justify-center gap-2 hover:scale-[1.02] transition-all cursor-pointer"
                >
                  <DollarSign className="w-4 h-4" /> Bayar Sekarang
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === "inventory" && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4 bg-slate-50/50">
              <h2 className="font-bold text-slate-800 text-lg">Manajemen Inventori & Stok BUMP</h2>
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="text"
                  placeholder="Cari data..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr className="text-xs text-slate-500 font-bold uppercase text-left">
                    <th className="px-6 py-4">SKU / Nama Barang</th>
                    <th className="px-6 py-4">Kategori</th>
                    <th className="px-6 py-4">Harga Beli (Modal)</th>
                    <th className="px-6 py-4">Harga Jual (Retail)</th>
                    <th className="px-6 py-4">Margin Untung</th>
                    <th className="px-6 py-4">Sisa Stok</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredProducts.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-800">{p.nama_barang}</div>
                        <div className="text-xs text-slate-400 mt-1 font-mono">{p.sku}</div>
                      </td>
                      <td className="px-6 py-4 text-slate-600">{p.kategori}</td>
                      <td className="px-6 py-4 text-slate-600">{formatIDR(p.harga_beli)}</td>
                      <td className="px-6 py-4 text-emerald-600 font-bold">{formatIDR(p.harga_jual)}</td>
                      <td className="px-6 py-4 text-blue-600 font-semibold">{formatIDR(p.harga_jual - p.harga_beli)}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2 py-0.5 rounded text-xs font-bold ${
                          p.stok < 10 ? "bg-rose-50 text-rose-600" : "bg-emerald-50 text-emerald-600"
                        }`}>
                          {p.stok} pcs
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "sales" && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4 bg-slate-50/50">
              <h2 className="font-bold text-slate-800 text-lg">Laporan Transaksi Kasir BUMP</h2>
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="text"
                  placeholder="Cari transaksi..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-500/20 focus:border-slate-500 transition-all"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr className="text-xs text-slate-500 font-bold uppercase text-left">
                    <th className="px-6 py-4">Invoice / ID Penjualan</th>
                    <th className="px-6 py-4">Metode Pembayaran</th>
                    <th className="px-6 py-4">Jumlah Item</th>
                    <th className="px-6 py-4">Total Uang Penjualan</th>
                    <th className="px-6 py-4">Tanggal Transaksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredSales.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 font-mono font-bold text-slate-800">{s.sales_number}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2 py-0.5 rounded text-xs font-bold ${
                          s.metode_bayar === "Cashless" ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-700"
                        }`}>
                          {s.metode_bayar}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-600">{s.total_items || 1} pcs</td>
                      <td className="px-6 py-4 text-emerald-600 font-black">{formatIDR(s.total_amount)}</td>
                      <td className="px-6 py-4 text-slate-400 text-xs">{s.created_at}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Product Modal */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form onSubmit={handleCreateProduct} className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 bg-indigo-600 text-white flex justify-between items-center">
              <h3 className="font-bold text-lg">Tambah Barang Baru</h3>
              <button type="button" onClick={() => setIsProductModalOpen(false)} className="text-white hover:text-slate-100 font-bold">&times;</button>
            </div>
            <div className="p-6 space-y-4 text-sm text-slate-600">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nama Barang</label>
                <input 
                  type="text" 
                  value={productForm.nama_barang}
                  onChange={(e) => setProductForm(prev => ({ ...prev, nama_barang: e.target.value }))}
                  placeholder="Contoh: Sabun Mandi Nuvo"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">SKU / Barcode</label>
                  <input 
                    type="text" 
                    value={productForm.sku}
                    onChange={(e) => setProductForm(prev => ({ ...prev, sku: e.target.value }))}
                    placeholder="Contoh: NUV-001"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Kategori</label>
                  <input 
                    type="text" 
                    value={productForm.kategori}
                    onChange={(e) => setProductForm(prev => ({ ...prev, kategori: e.target.value }))}
                    placeholder="Contoh: Mandi, ATK"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden"
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Harga Beli</label>
                  <input 
                    type="number" 
                    value={productForm.harga_beli}
                    onChange={(e) => setProductForm(prev => ({ ...prev, harga_beli: parseInt(e.target.value) }))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Harga Jual</label>
                  <input 
                    type="number" 
                    value={productForm.harga_jual}
                    onChange={(e) => setProductForm(prev => ({ ...prev, harga_jual: parseInt(e.target.value) }))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Stok Awal</label>
                  <input 
                    type="number" 
                    value={productForm.stok}
                    onChange={(e) => setProductForm(prev => ({ ...prev, stok: parseInt(e.target.value) }))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden"
                  />
                </div>
              </div>
            </div>
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-2">
              <button type="button" onClick={() => setIsProductModalOpen(false)} className="px-4 py-2 border border-slate-200 text-slate-500 font-bold rounded-lg hover:bg-slate-100 text-xs">Batal</button>
              <button type="submit" className="px-4 py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 text-xs">Simpan</button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}

