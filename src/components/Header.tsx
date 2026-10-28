'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ShoppingBag, Bell, Wifi, Clock, Phone, MapPin, X, Shield } from 'lucide-react';
import { RestaurantSettings } from '@/types/menu';

interface HeaderProps {
  settings: RestaurantSettings;
  tableNumber: string | null;
  cartCount: number;
  onOpenCart: () => void;
  onOpenWaiter: () => void;
}

export default function Header({
  settings,
  tableNumber,
  cartCount,
  onOpenCart,
  onOpenWaiter,
}: HeaderProps) {
  const [showInfo, setShowInfo] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 bg-neutral-950/90 backdrop-blur-md border-b border-neutral-800/80 px-4 py-3 transition-all">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-3">
          {/* Logo & Brand */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative w-11 h-11 rounded-full overflow-hidden border-2 border-amber-500/70 shadow-lg shadow-amber-500/10 group-hover:scale-105 transition-transform bg-neutral-900">
              <Image
                src="/logo.jpg"
                alt="M.T. Döner"
                fill
                className="object-cover"
                priority
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base tracking-wider text-white">
                  M.T. DÖNER
                </span>
                <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  Berlin
                </span>
              </div>
              <p className="text-[11px] text-neutral-400 hidden sm:block">
                {settings.slogan}
              </p>
            </div>
          </Link>

          {/* Table Indicator & Quick Actions */}
          <div className="flex items-center gap-2">
            {tableNumber && (
              <div className="bg-amber-500/10 border border-amber-500/40 text-amber-400 text-xs font-semibold px-2.5 py-1.5 rounded-full flex items-center gap-1.5 animate-pulse">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                <span>Masa {tableNumber}</span>
              </div>
            )}

            {/* Restaurant Info Trigger */}
            <button
              onClick={() => setShowInfo(true)}
              className="p-2 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-full transition-colors relative"
              title="Restoran Bilgileri & WiFi"
            >
              <Wifi className="w-5 h-5 text-amber-400/80" />
            </button>

            {/* Call Waiter */}
            <button
              onClick={onOpenWaiter}
              className="p-2 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-full transition-colors flex items-center gap-1 text-xs"
              title="Garson Çağır"
            >
              <Bell className="w-5 h-5 text-amber-400/80" />
              <span className="hidden md:inline font-medium">Garson</span>
            </button>

            {/* Admin Link */}
            <Link
              href="/admin"
              className="p-2 text-neutral-500 hover:text-amber-400 hover:bg-neutral-800 rounded-full transition-colors"
              title="Yönetim Paneli"
            >
              <Shield className="w-4 h-4" />
            </Link>

            {/* Cart Button */}
            <button
              onClick={onOpenCart}
              className="relative flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-neutral-950 font-bold px-3.5 py-2 rounded-full shadow-lg shadow-amber-500/20 transition-all active:scale-95"
            >
              <ShoppingBag className="w-4 h-4" />
              <span className="text-xs">Sipariş</span>
              {cartCount > 0 && (
                <span className="bg-black text-amber-400 text-[11px] font-black w-5 h-5 rounded-full flex items-center justify-center border border-amber-400/40">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Restaurant Info Modal */}
      {showInfo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-neutral-900 border border-neutral-700/80 rounded-2xl p-6 max-w-sm w-full shadow-2xl relative">
            <button
              onClick={() => setShowInfo(false)}
              className="absolute top-4 right-4 p-1 text-neutral-400 hover:text-white rounded-full bg-neutral-800"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center mb-5">
              <div className="w-16 h-16 mx-auto relative rounded-full overflow-hidden border-2 border-amber-500 mb-2">
                <Image src="/logo.jpg" alt="Logo" fill className="object-cover" />
              </div>
              <h3 className="font-extrabold text-lg text-white">{settings.name}</h3>
              <p className="text-xs text-amber-400 font-medium">{settings.slogan}</p>
            </div>

            <div className="space-y-3.5 text-sm">
              <div className="flex items-start gap-3 p-3 rounded-xl bg-neutral-800/60 border border-neutral-700/50">
                <Wifi className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs text-neutral-400 font-semibold uppercase">Ücretsiz Müşteri Wi-Fi</div>
                  <div className="font-mono text-white text-xs mt-0.5">Ağ: <span className="text-amber-400 font-bold">{settings.wifiName || 'MT_GUEST'}</span></div>
                  <div className="font-mono text-white text-xs">Şifre: <span className="text-amber-400 font-bold">{settings.wifiPassword || 'berlindoner2026'}</span></div>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-neutral-800/60 border border-neutral-700/50">
                <Clock className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs text-neutral-400 font-semibold uppercase">Çalışma Saatleri</div>
                  <div className="text-white text-xs mt-0.5">{settings.openingHours}</div>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-neutral-800/60 border border-neutral-700/50">
                <Phone className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs text-neutral-400 font-semibold uppercase">Telefon & WhatsApp</div>
                  <div className="text-white text-xs mt-0.5">{settings.phone}</div>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-neutral-800/60 border border-neutral-700/50">
                <MapPin className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs text-neutral-400 font-semibold uppercase">Adres</div>
                  <div className="text-neutral-300 text-xs mt-0.5">{settings.address}</div>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowInfo(false)}
              className="mt-5 w-full py-2.5 bg-neutral-800 hover:bg-neutral-700 text-white rounded-xl text-sm font-semibold transition-colors"
            >
              Kapat
            </button>
          </div>
        </div>
      )}
    </>
  );
}
