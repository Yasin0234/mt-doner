'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Lock, Shield, ArrowRight, Eye, EyeOff, AlertCircle } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) {
      setError('Lütfen admin şifresini girin.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error || 'Giriş başarısız oldu.');
      } else {
        router.push('/admin');
        router.refresh();
      }
    } catch {
      setError('Bağlantı hatası oluştu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-amber-500/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-md w-full relative z-10">
        <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-8 shadow-2xl backdrop-blur-xl">
          {/* Logo & Header */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 mx-auto relative rounded-full overflow-hidden border-2 border-amber-500 shadow-xl shadow-amber-500/20 mb-4 bg-neutral-950">
              <Image src="/logo.jpg" alt="M.T. Döner" fill className="object-cover" priority />
            </div>
            <h1 className="text-2xl font-black text-white tracking-wide">
              M.T. DÖNER
            </h1>
            <p className="text-xs text-amber-400 font-bold uppercase tracking-wider mt-0.5">
              Yönetici Paneli Girişi
            </p>
            <p className="text-xs text-neutral-400 mt-2">
              Menü, fiyatlar, soslar ve masa QR kodlarını yönetmek için şifrenizi girin.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-neutral-300 block mb-1.5">
                Admin Şifresi
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none text-neutral-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Admin şifrenizi girin"
                  className="w-full pl-10 pr-10 py-3 bg-neutral-950 border border-neutral-700/80 rounded-xl text-white placeholder-neutral-600 text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all font-mono"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-3 flex items-center text-neutral-500 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-950/80 border border-red-500/50 rounded-xl flex items-start gap-2.5 text-red-300 text-xs animate-shake">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-neutral-950 font-extrabold text-sm py-3.5 px-4 rounded-xl shadow-lg shadow-amber-500/20 active:scale-98 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <span>Giriş Yapılıyor...</span>
              ) : (
                <>
                  <span>Yönetici Girişi Yap</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick info note */}
          <div className="mt-6 pt-5 border-t border-neutral-800 text-center">
            <div className="text-[11px] text-neutral-400 flex items-center justify-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-amber-400" />
              <span>Güvenli HTTP-Only oturum koruması</span>
            </div>
            <p className="text-[10px] text-neutral-400 mt-1">
              Varsayılan kurulum şifresi: <span className="font-mono text-neutral-300 font-bold">mtdoner2026</span> (Giriş yaptıktan sonra şifrenizi değiştirebilirsiniz)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
