'use client';

import React, { useState } from 'react';
import { Bell, CreditCard, Banknote, Sparkles, CheckCircle2, X } from 'lucide-react';
import { RestaurantSettings } from '@/types/menu';

interface WaiterModalProps {
  isOpen: boolean;
  onClose: () => void;
  tableNumber: string | null;
  settings: RestaurantSettings;
}

export default function WaiterModal({
  isOpen,
  onClose,
  tableNumber,
  settings,
}: WaiterModalProps) {
  const [selectedTable, setSelectedTable] = useState<string>(tableNumber || '1');
  const [sentMessage, setSentMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleAction = (actionTitle: string) => {
    setSentMessage(`Masa ${selectedTable} için "${actionTitle}" bildirimi iletildi.`);
    setTimeout(() => {
      setSentMessage(null);
      onClose();
    }, 2800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 max-w-sm w-full shadow-2xl relative animate-slideUp">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-neutral-400 hover:text-white rounded-full bg-neutral-800"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-5">
          <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 mx-auto flex items-center justify-center mb-2 shadow-inner">
            <Bell className="w-6 h-6 animate-bounce" />
          </div>
          <h3 className="font-extrabold text-lg text-white">Garson & Servis Hizmeti</h3>
          <p className="text-xs text-neutral-400 mt-0.5">
            Ekibimiz saniyeler içinde masanızda olacaktır.
          </p>
        </div>

        {/* Table Selector */}
        <div className="mb-4 bg-neutral-950 p-3 rounded-2xl border border-neutral-800 flex items-center justify-between">
          <span className="text-xs font-bold text-neutral-300">Bulunduğunuz Masa:</span>
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-amber-400">Masa</span>
            <input
              type="text"
              value={selectedTable}
              onChange={(e) => setSelectedTable(e.target.value)}
              className="w-14 px-2 py-1 bg-neutral-800 border border-neutral-700 rounded-lg text-white font-bold text-xs text-center focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>

        {sentMessage ? (
          <div className="p-4 rounded-2xl bg-emerald-950/80 border border-emerald-500/50 text-center space-y-2 animate-fadeIn">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
            <div className="text-emerald-300 font-bold text-sm">{sentMessage}</div>
            <div className="text-emerald-400/80 text-xs">Garsonumuz yönlendirildi.</div>
          </div>
        ) : (
          <div className="space-y-2.5">
            <button
              onClick={() => handleAction('Garson Masaya Çağrıldı')}
              className="w-full p-3 rounded-2xl bg-neutral-800 hover:bg-neutral-700 text-white font-bold text-xs flex items-center gap-3 transition-colors border border-neutral-700/50"
            >
              <div className="p-2 bg-amber-500/20 text-amber-400 rounded-xl">
                <Bell className="w-4 h-4" />
              </div>
              <div className="text-left">
                <div>Garson Çağır</div>
                <div className="text-[10px] text-neutral-400 font-normal">Sipariş vermek veya yardım istemek için</div>
              </div>
            </button>

            <button
              onClick={() => handleAction('Hesap İstendi (Kredi Kartı)')}
              className="w-full p-3 rounded-2xl bg-neutral-800 hover:bg-neutral-700 text-white font-bold text-xs flex items-center gap-3 transition-colors border border-neutral-700/50"
            >
              <div className="p-2 bg-blue-500/20 text-blue-400 rounded-xl">
                <CreditCard className="w-4 h-4" />
              </div>
              <div className="text-left">
                <div>Hesap İste (Kredi Kartı / POS)</div>
                <div className="text-[10px] text-neutral-400 font-normal">Mobil POS cihazı masanıza getirilir</div>
              </div>
            </button>

            <button
              onClick={() => handleAction('Hesap İstendi (Nakit)')}
              className="w-full p-3 rounded-2xl bg-neutral-800 hover:bg-neutral-700 text-white font-bold text-xs flex items-center gap-3 transition-colors border border-neutral-700/50"
            >
              <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl">
                <Banknote className="w-4 h-4" />
              </div>
              <div className="text-left">
                <div>Hesap İste (Nakit)</div>
                <div className="text-[10px] text-neutral-400 font-normal">Nakit ödeme için hesap pusulası</div>
              </div>
            </button>

            <button
              onClick={() => handleAction('Peçete / Islak Mendil İstendi')}
              className="w-full p-3 rounded-2xl bg-neutral-800 hover:bg-neutral-700 text-white font-bold text-xs flex items-center gap-3 transition-colors border border-neutral-700/50"
            >
              <div className="p-2 bg-purple-500/20 text-purple-400 rounded-xl">
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="text-left">
                <div>Peçete / Islak Mendil / Bardak</div>
                <div className="text-[10px] text-neutral-400 font-normal">Masa servis takviyesi</div>
              </div>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
