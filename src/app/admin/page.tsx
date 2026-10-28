'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import QRCode from 'qrcode';
import {
  Product,
  RestaurantSettings,
  Category,
  CategoryId,
  ProductOptionItem,
} from '@/types/menu';
import { INITIAL_CATEGORIES } from '@/data/initialData';
import {
  Plus,
  Trash2,
  Edit3,
  QrCode,
  Settings,
  Shield,
  Download,
  Upload,
  LogOut,
  ExternalLink,
  Flame,
  Search,
  Check,
  X,
  AlertCircle,
  Save,
  Printer,
  Sparkles,
  Layers,
  Coffee,
  Heart,
  PlusCircle,
  Eye,
} from 'lucide-react';

export default function AdminPage() {
  const router = useRouter();

  // Auth state
  const [authChecking, setAuthChecking] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'products' | 'add' | 'qr' | 'settings' | 'security' | 'backup'>('products');

  // Menu data
  const [products, setProducts] = useState<Product[]>([]);
  const [settings, setSettings] = useState<RestaurantSettings | null>(null);
  const [categories, setCategories] = useState<Category[]>(INITIAL_CATEGORIES);
  const [loading, setLoading] = useState<boolean>(true);
  const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Search & Filter in admin
  const [filterCategory, setFilterCategory] = useState<CategoryId | 'all'>('all');
  const [adminSearch, setAdminSearch] = useState<string>('');

  // Editing product modal state
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // New Product Form state
  const [newProdName, setNewProdName] = useState('');
  const [newProdCategory, setNewProdCategory] = useState<CategoryId>('doner');
  const [newProdPrice, setNewProdPrice] = useState<number | ''>('');
  const [newProdDesc, setNewProdDesc] = useState('');
  const [newProdImage, setNewProdImage] = useState('');
  const [newProdPopular, setNewProdPopular] = useState(false);
  const [newProdChef, setNewProdChef] = useState(false);
  const [newProdNew, setNewProdNew] = useState(false);
  const [newProdSpicy, setNewProdSpicy] = useState(false);
  const [newProdVeg, setNewProdVeg] = useState(false);
  // Options strings
  const [newProdSauces, setNewProdSauces] = useState('Kräuter (Yeşillikli), Knoblauch (Sarımsaklı), Scharf (Acılı)');
  const [newProdRemovables, setNewProdRemovables] = useState('Kırmızı Lahana, Domates, Salatalık, Sumaklı Soğan');
  const [newProdExtras, setNewProdExtras] = useState('Hakiki Beyaz Peynir:35, Eritilmiş Sıcak Cheddar:40, Ekstra Döner Eti (+50g):85');

  // Settings form state
  const [settingsForm, setSettingsForm] = useState<RestaurantSettings | null>(null);

  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMsg, setPasswordMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // QR Generator state
  const [qrTable, setQrTable] = useState<string>('all'); // 'all' for general menu or table number like '1'
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const qrCanvasRef = useRef<HTMLCanvasElement>(null);

  // Preset image suggestions
  const presetImages = [
    { label: 'Ekmek Arası Döner', url: 'https://images.unsplash.com/photo-1561651823-34feb02250e4?auto=format&fit=crop&w=800&q=80' },
    { label: 'Dürüm Döner', url: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=800&q=80' },
    { label: 'Döner Kutu (Box)', url: 'https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?auto=format&fit=crop&w=800&q=80' },
    { label: 'Porsiyon Döner', url: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=800&q=80' },
    { label: 'Berlin Sos', url: 'https://images.unsplash.com/photo-1472476443507-c7a5948772fc?auto=format&fit=crop&w=800&q=80' },
    { label: 'Çıtır Patates', url: 'https://images.unsplash.com/photo-1576107232684-1279f3908594?auto=format&fit=crop&w=800&q=80' },
    { label: 'Kola / İçecek', url: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=800&q=80' },
    { label: 'Baklava / Tatlı', url: 'https://images.unsplash.com/photo-1519676867240-f03562e64548?auto=format&fit=crop&w=800&q=80' },
  ];

  // 1. Verify Authentication
  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch('/api/auth/check');
        const data = await res.json();
        if (!data.authenticated) {
          router.replace('/admin/login');
        } else {
          setAuthChecking(false);
          fetchData();
        }
      } catch {
        router.replace('/admin/login');
      }
    }
    checkAuth();
  }, [router]);

  // 2. Fetch Menu & Settings Data
  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/menu');
      const data = await res.json();
      if (data.success) {
        setProducts(data.products || []);
        setSettings(data.settings);
        setSettingsForm(data.settings);
      }
    } catch (err) {
      console.error(err);
      notify('error', 'Veriler alınamadı.');
    } finally {
      setLoading(false);
    }
  };

  const notify = (type: 'success' | 'error', text: string) => {
    setActionMessage({ type, text });
    setTimeout(() => setActionMessage(null), 4000);
  };

  // 3. Generate QR Code whenever qrTable changes
  useEffect(() => {
    async function generateQR() {
      if (typeof window === 'undefined') return;
      const host = window.location.origin;
      const targetUrl = qrTable === 'all' ? `${host}/` : `${host}/?table=${qrTable}`;

      try {
        const url = await QRCode.toDataURL(targetUrl, {
          width: 600,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#ffffff',
          },
        });
        setQrDataUrl(url);
      } catch (err) {
        console.error('QR generation error:', err);
      }
    }
    generateQR();
  }, [qrTable]);

  // 4. Logout handler
  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/admin/login');
  };

  // 5. Toggle Product Availability
  const handleToggleAvailable = async (product: Product) => {
    try {
      const updatedStatus = !product.isAvailable;
      const res = await fetch(`/api/menu/${product.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isAvailable: updatedStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setProducts((prev) =>
          prev.map((p) => (p.id === product.id ? { ...p, isAvailable: updatedStatus } : p))
        );
        notify('success', `"${product.name}" durumu güncellendi.`);
      }
    } catch {
      notify('error', 'Güncelleme başarısız oldu.');
    }
  };

  // 6. Delete Product
  const handleDeleteProduct = async (id: string, name: string) => {
    if (!confirm(`"${name}" ürününü silmek istediğinize emin misiniz?`)) return;

    try {
      const res = await fetch(`/api/menu/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setProducts((prev) => prev.filter((p) => p.id !== id));
        notify('success', `"${name}" başarıyla silindi.`);
      } else {
        notify('error', data.error || 'Silme başarısız.');
      }
    } catch {
      notify('error', 'Bağlantı hatası.');
    }
  };

  // 7. Add New Product
  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProdName || !newProdPrice || !newProdDesc) {
      notify('error', 'Lütfen ürün adı, fiyat ve açıklama alanlarını doldurun.');
      return;
    }

    // Parse options
    const parsedSauces = newProdSauces
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const parsedRemovables = newProdRemovables
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const parsedExtras: ProductOptionItem[] = newProdExtras
      .split(',')
      .map((item, idx) => {
        const [name, priceStr] = item.split(':');
        if (!name) return null;
        return {
          id: `ext-${Date.now()}-${idx}`,
          name: name.trim(),
          price: Number(priceStr) || 0,
        };
      })
      .filter(Boolean) as ProductOptionItem[];

    const payload = {
      name: newProdName,
      category: newProdCategory,
      price: Number(newProdPrice),
      description: newProdDesc,
      image: newProdImage || presetImages[0].url,
      isPopular: newProdPopular,
      isChefSpecial: newProdChef,
      isNew: newProdNew,
      isSpicy: newProdSpicy,
      isVegetarian: newProdVeg,
      isAvailable: true,
      allowedSauces: parsedSauces,
      removableIngredients: parsedRemovables,
      availableExtras: parsedExtras,
    };

    try {
      const res = await fetch('/api/menu', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        setProducts((prev) => [data.product, ...prev]);
        notify('success', `"${newProdName}" başarıyla eklendi!`);
        // Reset form
        setNewProdName('');
        setNewProdPrice('');
        setNewProdDesc('');
        setNewProdImage('');
        setActiveTab('products');
      } else {
        notify('error', data.error || 'Ürün eklenemedi.');
      }
    } catch {
      notify('error', 'Bağlantı hatası.');
    }
  };

  // 8. Update Product from Edit Modal
  const handleUpdateProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    try {
      const res = await fetch(`/api/menu/${editingProduct.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingProduct),
      });
      const data = await res.json();
      if (data.success) {
        setProducts((prev) =>
          prev.map((p) => (p.id === editingProduct.id ? data.product : p))
        );
        notify('success', `"${editingProduct.name}" güncellendi.`);
        setEditingProduct(null);
      } else {
        notify('error', data.error || 'Güncelleme başarısız.');
      }
    } catch {
      notify('error', 'Bağlantı hatası.');
    }
  };

  // 9. Save Settings
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settingsForm) return;

    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settingsForm),
      });
      const data = await res.json();
      if (data.success) {
        setSettings(data.settings);
        notify('success', 'Restoran ayarları kaydedildi.');
      }
    } catch {
      notify('error', 'Ayarlar kaydedilemedi.');
    }
  };

  // 10. Change Password
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMsg(null);

    if (newPassword.length < 6) {
      setPasswordMsg({ type: 'error', text: 'Yeni şifre en az 6 karakter olmalıdır.' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordMsg({ type: 'error', text: 'Yeni şifreler birbiriyle eşleşmiyor.' });
      return;
    }

    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (data.success) {
        setPasswordMsg({ type: 'success', text: 'Admin şifresi başarıyla değiştirildi.' });
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setPasswordMsg({ type: 'error', text: data.error || 'Şifre değiştirilemedi.' });
      }
    } catch {
      setPasswordMsg({ type: 'error', text: 'Bağlantı hatası.' });
    }
  };

  // 11. Backup / Restore handlers
  const handleExportBackup = () => {
    window.open('/api/backup', '_blank');
  };

  const handleImportBackup = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const json = JSON.parse(text);

      const res = await fetch('/api/backup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(json),
      });
      const data = await res.json();
      if (data.success) {
        notify('success', data.message);
        fetchData();
      } else {
        notify('error', data.error || 'Geri yükleme başarısız.');
      }
    } catch {
      notify('error', 'Geçersiz JSON dosyası.');
    }
  };

  // Print QR Code Card
  const handlePrintQR = () => {
    window.print();
  };

  if (authChecking) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center text-amber-400 font-bold text-sm">
        Yetki Kontrol Ediliyor...
      </div>
    );
  }

  // Filtered products in admin list
  const adminFilteredProducts = products.filter((p) => {
    if (filterCategory !== 'all' && p.category !== filterCategory) return false;
    if (adminSearch.trim()) {
      const q = adminSearch.toLowerCase();
      return p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col">
      {/* Admin Top Navigation */}
      <header className="sticky top-0 z-40 bg-neutral-950/95 backdrop-blur-md border-b border-neutral-800 px-4 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full overflow-hidden border border-amber-500/80 relative bg-neutral-900 shrink-0">
              <Image src="/logo.jpg" alt="Logo" fill className="object-cover" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base text-white tracking-wider">
                  M.T. DÖNER
                </span>
                <span className="bg-amber-500 text-neutral-950 font-black text-[10px] uppercase px-1.5 py-0.5 rounded">
                  Admin Paneli
                </span>
              </div>
              <p className="text-[11px] text-neutral-400 hidden sm:block">
                Menü, Sos, İçecek, Malzeme, Tatlı & QR Yönetim Sistemi
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/"
              target="_blank"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-xs font-semibold text-neutral-200 transition-colors border border-neutral-700"
            >
              <Eye className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Canlı Menüyü Gör</span>
              <ExternalLink className="w-3 h-3 text-neutral-400" />
            </Link>

            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-950/40 hover:bg-red-900/60 border border-red-500/30 text-xs font-semibold text-red-300 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Çıkış</span>
            </button>
          </div>
        </div>
      </header>

      {/* Global Notification Banner */}
      {actionMessage && (
        <div
          className={`px-4 py-2.5 text-xs font-bold text-center fixed top-16 inset-x-0 z-50 transition-all ${
            actionMessage.type === 'success'
              ? 'bg-emerald-600 text-white shadow-lg'
              : 'bg-red-600 text-white shadow-lg'
          }`}
        >
          {actionMessage.text}
        </div>
      )}

      {/* Tab Selector */}
      <div className="bg-neutral-900 border-b border-neutral-800 px-4 py-2">
        <div className="max-w-6xl mx-auto flex items-center gap-2 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('products')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
              activeTab === 'products'
                ? 'bg-amber-500 text-neutral-950'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Ürün Listesi ({products.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('add')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
              activeTab === 'add'
                ? 'bg-amber-500 text-neutral-950'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
            }`}
          >
            <Plus className="w-4 h-4" />
            <span>Yeni Ürün Ekle</span>
          </button>

          <button
            onClick={() => setActiveTab('qr')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
              activeTab === 'qr'
                ? 'bg-amber-500 text-neutral-950'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
            }`}
          >
            <QrCode className="w-4 h-4" />
            <span>QR Kod Stüdyosu</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
              activeTab === 'settings'
                ? 'bg-amber-500 text-neutral-950'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>Restoran Ayarları</span>
          </button>

          <button
            onClick={() => setActiveTab('security')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
              activeTab === 'security'
                ? 'bg-amber-500 text-neutral-950'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>Güvenlik & Şifre</span>
          </button>

          <button
            onClick={() => setActiveTab('backup')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
              activeTab === 'backup'
                ? 'bg-amber-500 text-neutral-950'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
            }`}
          >
            <Download className="w-4 h-4" />
            <span>Yedekleme & Geri Yükle</span>
          </button>
        </div>
      </div>

      {/* Main Container */}
      <main className="max-w-6xl mx-auto p-4 sm:p-6 flex-1 w-full">
        {/* ================= TAB 1: PRODUCTS LIST ================= */}
        {activeTab === 'products' && (
          <div className="space-y-4">
            {/* Search & Filter Header */}
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-neutral-500 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={adminSearch}
                  onChange={(e) => setAdminSearch(e.target.value)}
                  placeholder="Ürün adı veya açıklamayla ara..."
                  className="w-full pl-10 pr-4 py-2 bg-neutral-950 border border-neutral-700/70 rounded-xl text-white text-xs placeholder-neutral-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Category Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                <button
                  onClick={() => setFilterCategory('all')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-colors ${
                    filterCategory === 'all'
                      ? 'bg-amber-500 text-neutral-950'
                      : 'bg-neutral-950 text-neutral-400 hover:text-white'
                  }`}
                >
                  Tümü ({products.length})
                </button>
                {categories.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setFilterCategory(c.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-colors ${
                      filterCategory === c.id
                        ? 'bg-amber-500 text-neutral-950'
                        : 'bg-neutral-950 text-neutral-400 hover:text-white'
                    }`}
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Products Table / Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {adminFilteredProducts.map((p) => (
                <div
                  key={p.id}
                  className={`bg-neutral-900/90 border rounded-2xl p-4 flex flex-col justify-between transition-all ${
                    p.isAvailable ? 'border-neutral-800' : 'border-red-900/60 opacity-60'
                  }`}
                >
                  <div>
                    {/* Image & Status Row */}
                    <div className="flex gap-3 mb-3">
                      <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-neutral-800 shrink-0">
                        <Image src={p.image} alt={p.name} fill className="object-cover" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between gap-1">
                          <h4 className="font-extrabold text-sm text-white line-clamp-1">
                            {p.name}
                          </h4>
                        </div>
                        <span className="text-amber-400 font-black text-sm block mt-0.5">
                          {p.price} {settings?.currency || '₺'}
                        </span>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 bg-neutral-800 px-2 py-0.5 rounded mt-1 inline-block">
                          {categories.find((c) => c.id === p.category)?.name || p.category}
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-neutral-400 line-clamp-2 mb-3">
                      {p.description}
                    </p>

                    {/* Options Details */}
                    <div className="space-y-1 mb-3 text-[11px] text-neutral-400 bg-neutral-950/60 p-2.5 rounded-xl border border-neutral-800/60">
                      {p.allowedSauces && p.allowedSauces.length > 0 && (
                        <div>
                          <span className="text-amber-400 font-semibold">Soslar: </span>
                          {p.allowedSauces.join(', ')}
                        </div>
                      )}
                      {p.removableIngredients && p.removableIngredients.length > 0 && (
                        <div>
                          <span className="text-neutral-300 font-semibold">Çıkarılabilir: </span>
                          {p.removableIngredients.join(', ')}
                        </div>
                      )}
                      {p.availableExtras && p.availableExtras.length > 0 && (
                        <div>
                          <span className="text-emerald-400 font-semibold">Ekstralar: </span>
                          {p.availableExtras.map((e) => `${e.name} (+${e.price}₺)`).join(', ')}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div className="pt-3 border-t border-neutral-800 flex items-center justify-between">
                    {/* Available Toggle */}
                    <button
                      onClick={() => handleToggleAvailable(p)}
                      className={`text-xs font-bold px-2.5 py-1 rounded-lg border transition-colors ${
                        p.isAvailable
                          ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-400'
                          : 'bg-red-950/60 border-red-500/50 text-red-400'
                      }`}
                    >
                      {p.isAvailable ? '✓ Mevcut' : '✕ Tükendi'}
                    </button>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => setEditingProduct(p)}
                        className="p-2 text-neutral-400 hover:text-white bg-neutral-800 hover:bg-neutral-700 rounded-lg transition-colors"
                        title="Düzenle"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(p.id, p.name)}
                        className="p-2 text-neutral-400 hover:text-red-400 bg-neutral-800 hover:bg-red-950/50 rounded-lg transition-colors"
                        title="Sil"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================= TAB 2: ADD PRODUCT ================= */}
        {activeTab === 'add' && (
          <div className="max-w-2xl mx-auto bg-neutral-900 border border-neutral-800 rounded-3xl p-6 sm:p-8 shadow-xl">
            <div className="mb-6">
              <h3 className="text-lg font-extrabold text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-amber-500" />
                <span>Yeni Ürün Ekle</span>
              </h3>
              <p className="text-xs text-neutral-400 mt-1">
                Döner, sos, içecek, malzeme veya tatlı ürünlerinizi buradan menüye ekleyebilirsiniz.
              </p>
            </div>

            <form onSubmit={handleAddProduct} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-neutral-300 block mb-1.5">
                    Ürün Adı *
                  </label>
                  <input
                    type="text"
                    value={newProdName}
                    onChange={(e) => setNewProdName(e.target.value)}
                    placeholder="Örn: MT Berlin Dürüm Döner"
                    className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-700 rounded-xl text-white text-xs focus:outline-none focus:border-amber-500"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-neutral-300 block mb-1.5">
                    Kategori *
                  </label>
                  <select
                    value={newProdCategory}
                    onChange={(e) => setNewProdCategory(e.target.value as CategoryId)}
                    className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-700 rounded-xl text-white text-xs focus:outline-none focus:border-amber-500"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-neutral-300 block mb-1.5">
                    Tutar / Fiyat ({settings?.currency || '₺'}) *
                  </label>
                  <input
                    type="number"
                    value={newProdPrice}
                    onChange={(e) => setNewProdPrice(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="Örn: 320"
                    className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-700 rounded-xl text-white text-xs focus:outline-none focus:border-amber-500"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-neutral-300 block mb-1.5">
                    Görsel URL
                  </label>
                  <input
                    type="text"
                    value={newProdImage}
                    onChange={(e) => setNewProdImage(e.target.value)}
                    placeholder="https://... veya aşağıdaki şablonlardan seçin"
                    className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-700 rounded-xl text-white text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Preset Image Chips */}
              <div>
                <label className="text-[11px] font-semibold text-neutral-400 block mb-1.5">
                  Hazır Görsel Şablonları (Dokunarak Seçebilirsiniz):
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {presetImages.map((img, i) => (
                    <button
                      type="button"
                      key={i}
                      onClick={() => setNewProdImage(img.url)}
                      className={`text-[10px] px-2.5 py-1 rounded-lg border transition-colors ${
                        newProdImage === img.url
                          ? 'bg-amber-500 text-neutral-950 font-bold border-amber-400'
                          : 'bg-neutral-950 text-neutral-400 border-neutral-800 hover:text-white'
                      }`}
                    >
                      {img.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-neutral-300 block mb-1.5">
                  Detay & Açıklama *
                </label>
                <textarea
                  value={newProdDesc}
                  onChange={(e) => setNewProdDesc(e.target.value)}
                  rows={3}
                  placeholder="Ürün içeriği, ekmek türü, marine et detayları..."
                  className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-700 rounded-xl text-white text-xs focus:outline-none focus:border-amber-500"
                  required
                />
              </div>

              {/* Badges */}
              <div className="bg-neutral-950 p-3.5 rounded-2xl border border-neutral-800 space-y-2">
                <span className="text-xs font-bold text-neutral-300 block">
                  Etiketler & Rozetler
                </span>
                <div className="flex flex-wrap gap-3 text-xs">
                  <label className="flex items-center gap-1.5 text-neutral-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newProdPopular}
                      onChange={(e) => setNewProdPopular(e.target.checked)}
                      className="accent-amber-500"
                    />
                    <span>🔥 Çok Satan</span>
                  </label>
                  <label className="flex items-center gap-1.5 text-neutral-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newProdChef}
                      onChange={(e) => setNewProdChef(e.target.checked)}
                      className="accent-amber-500"
                    />
                    <span>👑 Şefin Özel</span>
                  </label>
                  <label className="flex items-center gap-1.5 text-neutral-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newProdNew}
                      onChange={(e) => setNewProdNew(e.target.checked)}
                      className="accent-amber-500"
                    />
                    <span>✨ Yeni</span>
                  </label>
                  <label className="flex items-center gap-1.5 text-neutral-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newProdSpicy}
                      onChange={(e) => setNewProdSpicy(e.target.checked)}
                      className="accent-amber-500"
                    />
                    <span>🌶️ Acılı</span>
                  </label>
                  <label className="flex items-center gap-1.5 text-neutral-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newProdVeg}
                      onChange={(e) => setNewProdVeg(e.target.checked)}
                      className="accent-amber-500"
                    />
                    <span>🌱 Vejetaryen</span>
                  </label>
                </div>
              </div>

              {/* Berlin Döner Custom Options */}
              <div className="bg-neutral-950 p-4 rounded-2xl border border-neutral-800 space-y-3">
                <span className="text-xs font-bold text-amber-400 block uppercase tracking-wider">
                  Berlin Usulü Seçenekler (Döner veya Menüler İçin)
                </span>

                <div>
                  <label className="text-[11px] font-semibold text-neutral-300 block mb-1">
                    Seçilebilir Soslar (virgülle ayırın):
                  </label>
                  <input
                    type="text"
                    value={newProdSauces}
                    onChange={(e) => setNewProdSauces(e.target.value)}
                    placeholder="Kräuter, Knoblauch, Scharf..."
                    className="w-full px-3 py-2 bg-neutral-900 border border-neutral-700/80 rounded-xl text-white text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-neutral-300 block mb-1">
                    Çıkarılabilir Malzemeler (virgülle ayırın):
                  </label>
                  <input
                    type="text"
                    value={newProdRemovables}
                    onChange={(e) => setNewProdRemovables(e.target.value)}
                    placeholder="Kırmızı Lahana, Domates, Soğan..."
                    className="w-full px-3 py-2 bg-neutral-900 border border-neutral-700/80 rounded-xl text-white text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-neutral-300 block mb-1">
                    Ekstra Malzemeler (İsim:Fiyat şeklinde, virgülle ayırın):
                  </label>
                  <input
                    type="text"
                    value={newProdExtras}
                    onChange={(e) => setNewProdExtras(e.target.value)}
                    placeholder="Hakiki Beyaz Peynir:35, Eritilmiş Cheddar:40, Ekstra Döner Eti:85"
                    className="w-full px-3 py-2 bg-neutral-900 border border-neutral-700/80 rounded-xl text-white text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-neutral-950 font-extrabold text-sm py-3.5 px-4 rounded-xl shadow-lg shadow-amber-500/20 active:scale-98 transition-all flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>Ürünü Menüye Ekle</span>
              </button>
            </form>
          </div>
        )}

        {/* ================= TAB 3: QR CODE STUDIO ================= */}
        {activeTab === 'qr' && (
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 sm:p-8 text-center shadow-xl">
              <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 mx-auto flex items-center justify-center mb-3">
                <QrCode className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-extrabold text-white">
                Masa & Menü QR Kod Stüdyosu
              </h3>
              <p className="text-xs text-neutral-400 max-w-md mx-auto mt-1 mb-6">
                Masalarınıza yapıştırmak veya masalara özel menü açtırmak için logolu yüksek çözünürlüklü QR kodları üretin.
              </p>

              {/* QR Mode Selector */}
              <div className="max-w-xs mx-auto mb-6 bg-neutral-950 p-1.5 rounded-2xl border border-neutral-800 flex items-center justify-center gap-2">
                <button
                  onClick={() => setQrTable('all')}
                  className={`flex-1 py-2 text-xs font-bold rounded-xl transition-colors ${
                    qrTable === 'all'
                      ? 'bg-amber-500 text-neutral-950'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  Genel Menü
                </button>
                <button
                  onClick={() => setQrTable('1')}
                  className={`flex-1 py-2 text-xs font-bold rounded-xl transition-colors ${
                    qrTable !== 'all'
                      ? 'bg-amber-500 text-neutral-950'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  Masaya Özel
                </button>
              </div>

              {/* Table Number Picker */}
              {qrTable !== 'all' && (
                <div className="mb-6 flex items-center justify-center gap-2">
                  <span className="text-xs font-bold text-neutral-300">Masa Numarası:</span>
                  <select
                    value={qrTable}
                    onChange={(e) => setQrTable(e.target.value)}
                    className="px-3 py-1.5 bg-neutral-950 border border-neutral-700 rounded-xl text-white text-xs font-bold focus:outline-none focus:border-amber-500"
                  >
                    {Array.from({ length: settings?.tableCount || 20 }, (_, i) => i + 1).map((num) => (
                      <option key={num} value={String(num)}>
                        Masa {num}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Live Printable QR Card Preview */}
              <div
                id="printable-qr-card"
                className="bg-neutral-950 border-2 border-amber-500/60 rounded-3xl p-6 max-w-sm mx-auto shadow-2xl relative overflow-hidden my-4"
              >
                {/* Gold corner ornaments */}
                <div className="w-16 h-16 border-t-2 border-l-2 border-amber-500 absolute top-3 left-3 rounded-tl-xl pointer-events-none" />
                <div className="w-16 h-16 border-t-2 border-r-2 border-amber-500 absolute top-3 right-3 rounded-tr-xl pointer-events-none" />
                <div className="w-16 h-16 border-b-2 border-l-2 border-amber-500 absolute bottom-3 left-3 rounded-bl-xl pointer-events-none" />
                <div className="w-16 h-16 border-b-2 border-r-2 border-amber-500 absolute bottom-3 right-3 rounded-br-xl pointer-events-none" />

                <div className="relative z-10 space-y-3">
                  {/* Brand Header */}
                  <div className="w-16 h-16 mx-auto relative rounded-full overflow-hidden border-2 border-amber-500 shadow-md">
                    <Image src="/logo.jpg" alt="Logo" fill className="object-cover" />
                  </div>
                  <div>
                    <h4 className="font-black text-lg text-white tracking-wider">
                      {settings?.name || 'M.T. DÖNER'}
                    </h4>
                    <p className="text-[11px] text-amber-400 font-bold uppercase tracking-widest">
                      Berlin Usulü Orijinal Döner
                    </p>
                  </div>

                  {/* QR Image Box */}
                  <div className="p-3 bg-white rounded-2xl inline-block shadow-xl relative">
                    {qrDataUrl && (
                      <img
                        src={qrDataUrl}
                        alt="M.T. Döner QR Kodu"
                        className="w-48 h-48 mx-auto"
                      />
                    )}
                  </div>

                  {/* Badge */}
                  <div className="pt-1">
                    <span className="bg-amber-500 text-neutral-950 text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full inline-block shadow">
                      {qrTable === 'all' ? '📱 Menüyü Gör & Sipariş Ver' : `📍 MASA ${qrTable}`}
                    </span>
                  </div>

                  <p className="text-[10px] text-neutral-400 pt-1">
                    Telefonunuzun kamerasını QR koda tutarak menüyü anında açabilirsiniz.
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
                <a
                  href={qrDataUrl}
                  download={`mt-doner-qr-${qrTable === 'all' ? 'menu' : `masa-${qrTable}`}.png`}
                  className="bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs px-5 py-3 rounded-xl transition-all flex items-center gap-2 shadow-lg shadow-amber-500/20"
                >
                  <Download className="w-4 h-4" />
                  <span>QR Kodu PNG Olarak İndir</span>
                </a>

                <button
                  onClick={handlePrintQR}
                  className="bg-neutral-800 hover:bg-neutral-700 text-white font-bold text-xs px-5 py-3 rounded-xl transition-all flex items-center gap-2 border border-neutral-700"
                >
                  <Printer className="w-4 h-4 text-amber-400" />
                  <span>Masa Kartını Yazdır</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 4: SETTINGS ================= */}
        {activeTab === 'settings' && settingsForm && (
          <div className="max-w-2xl mx-auto bg-neutral-900 border border-neutral-800 rounded-3xl p-6 sm:p-8 shadow-xl">
            <div className="mb-6">
              <h3 className="text-lg font-extrabold text-white flex items-center gap-2">
                <Settings className="w-5 h-5 text-amber-500" />
                <span>Restoran & Menü Ayarları</span>
              </h3>
              <p className="text-xs text-neutral-400 mt-1">
                İletişim numaraları, WhatsApp sipariş hattı, Wi-Fi ve çalışma saatlerini güncelleyin.
              </p>
            </div>

            <form onSubmit={handleSaveSettings} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-neutral-300 block mb-1.5">
                    Restoran Adı
                  </label>
                  <input
                    type="text"
                    value={settingsForm.name}
                    onChange={(e) => setSettingsForm({ ...settingsForm, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-700 rounded-xl text-white text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-neutral-300 block mb-1.5">
                    Slogan
                  </label>
                  <input
                    type="text"
                    value={settingsForm.slogan}
                    onChange={(e) => setSettingsForm({ ...settingsForm, slogan: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-700 rounded-xl text-white text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-neutral-300 block mb-1.5">
                    WhatsApp Sipariş Numarası
                  </label>
                  <input
                    type="text"
                    value={settingsForm.whatsapp}
                    onChange={(e) => setSettingsForm({ ...settingsForm, whatsapp: e.target.value })}
                    placeholder="+90 532 000 00 00"
                    className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-700 rounded-xl text-white text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-neutral-300 block mb-1.5">
                    Telefon Numarası
                  </label>
                  <input
                    type="text"
                    value={settingsForm.phone}
                    onChange={(e) => setSettingsForm({ ...settingsForm, phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-700 rounded-xl text-white text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-neutral-300 block mb-1.5">
                    Wi-Fi Ağ Adı
                  </label>
                  <input
                    type="text"
                    value={settingsForm.wifiName || ''}
                    onChange={(e) => setSettingsForm({ ...settingsForm, wifiName: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-700 rounded-xl text-white text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-neutral-300 block mb-1.5">
                    Wi-Fi Şifresi
                  </label>
                  <input
                    type="text"
                    value={settingsForm.wifiPassword || ''}
                    onChange={(e) => setSettingsForm({ ...settingsForm, wifiPassword: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-700 rounded-xl text-white text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-neutral-300 block mb-1.5">
                    Çalışma Saatleri
                  </label>
                  <input
                    type="text"
                    value={settingsForm.openingHours}
                    onChange={(e) => setSettingsForm({ ...settingsForm, openingHours: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-700 rounded-xl text-white text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-neutral-300 block mb-1.5">
                    Masa Sayısı
                  </label>
                  <input
                    type="number"
                    value={settingsForm.tableCount}
                    onChange={(e) => setSettingsForm({ ...settingsForm, tableCount: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-700 rounded-xl text-white text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-neutral-300 block mb-1.5">
                  Restoran Adresi
                </label>
                <textarea
                  value={settingsForm.address}
                  onChange={(e) => setSettingsForm({ ...settingsForm, address: e.target.value })}
                  rows={2}
                  className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-700 rounded-xl text-white text-xs focus:outline-none focus:border-amber-500"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-neutral-950 font-extrabold text-sm py-3 px-4 rounded-xl shadow-lg shadow-amber-500/20 active:scale-98 transition-all flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4" />
                <span>Ayarları Kaydet</span>
              </button>
            </form>
          </div>
        )}

        {/* ================= TAB 5: SECURITY ================= */}
        {activeTab === 'security' && (
          <div className="max-w-md mx-auto bg-neutral-900 border border-neutral-800 rounded-3xl p-6 sm:p-8 shadow-xl">
            <div className="mb-6 text-center">
              <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 mx-auto flex items-center justify-center mb-3">
                <Shield className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-extrabold text-white">
                Admin Şifresi Değiştir
              </h3>
              <p className="text-xs text-neutral-400 mt-1">
                Yönetici panelinizin güvenliği için güçlü bir şifre belirleyin.
              </p>
            </div>

            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-neutral-300 block mb-1.5">
                  Mevcut Şifre
                </label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Mevcut admin şifreniz"
                  className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-700 rounded-xl text-white text-xs focus:outline-none focus:border-amber-500 font-mono"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-neutral-300 block mb-1.5">
                  Yeni Şifre (En az 6 karakter)
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Yeni güçlü şifreniz"
                  className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-700 rounded-xl text-white text-xs focus:outline-none focus:border-amber-500 font-mono"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-neutral-300 block mb-1.5">
                  Yeni Şifre (Tekrar)
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Yeni şifrenizi tekrar girin"
                  className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-700 rounded-xl text-white text-xs focus:outline-none focus:border-amber-500 font-mono"
                  required
                />
              </div>

              {passwordMsg && (
                <div
                  className={`p-3 rounded-xl text-xs font-bold ${
                    passwordMsg.type === 'success'
                      ? 'bg-emerald-950/80 border border-emerald-500/50 text-emerald-300'
                      : 'bg-red-950/80 border border-red-500/50 text-red-300'
                  }`}
                >
                  {passwordMsg.text}
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-neutral-950 font-extrabold text-sm py-3 px-4 rounded-xl shadow-lg shadow-amber-500/20 active:scale-98 transition-all flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4" />
                <span>Şifreyi Güncelle</span>
              </button>
            </form>
          </div>
        )}

        {/* ================= TAB 6: BACKUP & RESTORE ================= */}
        {activeTab === 'backup' && (
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 sm:p-8 shadow-xl">
              <div className="mb-4">
                <h3 className="text-lg font-extrabold text-white flex items-center gap-2">
                  <Download className="w-5 h-5 text-amber-500" />
                  <span>Veri Yedekleme (Dışa Aktar)</span>
                </h3>
                <p className="text-xs text-neutral-400 mt-1">
                  M.T. Döner&apos;e ait tüm ürünleri, sosları, fiyatları ve ayarları tek tıkla bilgisayarınıza .json formatında yedekleyin.
                </p>
              </div>

              <button
                onClick={handleExportBackup}
                className="bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs px-5 py-3 rounded-xl transition-all flex items-center gap-2 shadow-lg shadow-amber-500/20"
              >
                <Download className="w-4 h-4" />
                <span>Yedek Dosyasını İndir (.json)</span>
              </button>
            </div>

            <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 sm:p-8 shadow-xl">
              <div className="mb-4">
                <h3 className="text-lg font-extrabold text-white flex items-center gap-2">
                  <Upload className="w-5 h-5 text-emerald-500" />
                  <span>Yedekten Geri Yükle (İçe Aktar)</span>
                </h3>
                <p className="text-xs text-neutral-400 mt-1">
                  Önceden indirdiğiniz bir .json yedek dosyasını yükleyerek tüm menüyü ve ayarları saniyeler içinde geri yükleyebilirsiniz.
                </p>
              </div>

              <label className="inline-flex items-center gap-2 px-5 py-3 bg-neutral-800 hover:bg-neutral-700 text-white font-bold text-xs rounded-xl cursor-pointer border border-neutral-700 transition-colors">
                <Upload className="w-4 h-4 text-emerald-400" />
                <span>Yedek Dosyası Seç (.json)</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportBackup}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        )}
      </main>

      {/* ================= EDIT PRODUCT MODAL ================= */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fadeIn">
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl relative no-scrollbar">
            <button
              onClick={() => setEditingProduct(null)}
              className="absolute top-4 right-4 p-1.5 text-neutral-400 hover:text-white rounded-full bg-neutral-800"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-extrabold text-white mb-4 flex items-center gap-2">
              <Edit3 className="w-4 h-4 text-amber-500" />
              <span>Ürünü Düzenle: {editingProduct.name}</span>
            </h3>

            <form onSubmit={handleUpdateProductSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-neutral-300 block mb-1">
                  Ürün Adı
                </label>
                <input
                  type="text"
                  value={editingProduct.name}
                  onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-700 rounded-xl text-white text-xs focus:outline-none focus:border-amber-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-neutral-300 block mb-1">
                    Kategori
                  </label>
                  <select
                    value={editingProduct.category}
                    onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value as CategoryId })}
                    className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-700 rounded-xl text-white text-xs focus:outline-none focus:border-amber-500"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-neutral-300 block mb-1">
                    Tutar ({settings?.currency || '₺'})
                  </label>
                  <input
                    type="number"
                    value={editingProduct.price}
                    onChange={(e) => setEditingProduct({ ...editingProduct, price: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-700 rounded-xl text-white text-xs focus:outline-none focus:border-amber-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-neutral-300 block mb-1">
                  Görsel URL
                </label>
                <input
                  type="text"
                  value={editingProduct.image}
                  onChange={(e) => setEditingProduct({ ...editingProduct, image: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-700 rounded-xl text-white text-xs focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-neutral-300 block mb-1">
                  Detay & Açıklama
                </label>
                <textarea
                  value={editingProduct.description}
                  onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                  rows={3}
                  className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-700 rounded-xl text-white text-xs focus:outline-none focus:border-amber-500"
                  required
                />
              </div>

              {/* Badges */}
              <div className="bg-neutral-950 p-3 rounded-xl border border-neutral-800 flex flex-wrap gap-3 text-xs">
                <label className="flex items-center gap-1.5 text-neutral-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!!editingProduct.isPopular}
                    onChange={(e) => setEditingProduct({ ...editingProduct, isPopular: e.target.checked })}
                    className="accent-amber-500"
                  />
                  <span>🔥 Çok Satan</span>
                </label>
                <label className="flex items-center gap-1.5 text-neutral-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!!editingProduct.isChefSpecial}
                    onChange={(e) => setEditingProduct({ ...editingProduct, isChefSpecial: e.target.checked })}
                    className="accent-amber-500"
                  />
                  <span>👑 Şefin Özel</span>
                </label>
                <label className="flex items-center gap-1.5 text-neutral-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!!editingProduct.isSpicy}
                    onChange={(e) => setEditingProduct({ ...editingProduct, isSpicy: e.target.checked })}
                    className="accent-amber-500"
                  />
                  <span>🌶️ Acılı</span>
                </label>
                <label className="flex items-center gap-1.5 text-neutral-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!!editingProduct.isVegetarian}
                    onChange={(e) => setEditingProduct({ ...editingProduct, isVegetarian: e.target.checked })}
                    className="accent-amber-500"
                  />
                  <span>🌱 Vejetaryen</span>
                </label>
              </div>

              {/* Sauces editing */}
              <div>
                <label className="text-xs font-bold text-neutral-300 block mb-1">
                  Sos Seçenekleri (virgülle ayırın)
                </label>
                <input
                  type="text"
                  value={editingProduct.allowedSauces?.join(', ') || ''}
                  onChange={(e) =>
                    setEditingProduct({
                      ...editingProduct,
                      allowedSauces: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                    })
                  }
                  className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-700 rounded-xl text-white text-xs focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="px-4 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-white font-bold text-xs rounded-xl"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-extrabold text-xs rounded-xl shadow-lg shadow-amber-500/20"
                >
                  Kaydet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
