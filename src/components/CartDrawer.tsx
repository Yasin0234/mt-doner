'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { CartItem, RestaurantSettings } from '@/types/menu';
import { X, Trash2, Plus, Minus, Send, CheckCircle2, QrCode, UtensilsCrossed } from 'lucide-react';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  currency: string;
  settings: RestaurantSettings;
  tableNumber: string | null;
  onUpdateQuantity: (id: string, delta: number) => void;
  onRemoveItem: (id: string) => void;
  onClearCart: () => void;
}

export default function CartDrawer({
  isOpen,
  onClose,
  items,
  currency,
  settings,
  tableNumber,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
}: CartDrawerProps) {
  const [currentTable, setCurrentTable] = useState<string>(tableNumber || '1');
  const [showReceipt, setShowReceipt] = useState<boolean>(false);
  const [orderSent, setOrderSent] = useState<boolean>(false);

  if (!isOpen) return null;

  const totalAmount = items.reduce((sum, item) => sum + item.price, 0);

  // Prepares WhatsApp order message
  const handleWhatsAppOrder = () => {
    let message = `*🌯 ${settings.name} SİPARİŞİ*\n`;
    message += `📍 *Masa:* ${currentTable}\n`;
    message += `🕒 *Tarih:* ${new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}\n`;
    message += `--------------------------------\n`;

    items.forEach((item, index) => {
      message += `*${index + 1}. ${item.quantity}x ${item.name}* - ${item.price} ${currency}\n`;
      if (item.options.selectedSauce) {
        message += `   🥣 *Sos:* ${item.options.selectedSauce}\n`;
      }
      if (item.options.removedIngredients && item.options.removedIngredients.length > 0) {
        message += `   ❌ *Çıkarılanlar:* ${item.options.removedIngredients.join(', ')}\n`;
      }
      if (item.options.addedExtras && item.options.addedExtras.length > 0) {
        const extraNames = item.options.addedExtras.map((e) => `${e.name} (+${e.price} ${currency})`).join(', ');
        message += `   ➕ *Ekstralar:* ${extraNames}\n`;
      }
      if (item.options.notes) {
        message += `   📝 *Not:* ${item.options.notes}\n`;
      }
      message += `\n`;
    });

    message += `--------------------------------\n`;
    message += `💰 *TOPLAM TUTAR: ${totalAmount} ${currency}*\n`;
    message += `Lütfen siparişimizi onaylayınız. Teşekkürler!`;

    const cleanPhone = settings.whatsapp.replace(/[^0-9]/g, '');
    const encoded = encodeURIComponent(message);
    const url = `https://wa.me/${cleanPhone}?text=${encoded}`;
    window.open(url, '_blank');
    setOrderSent(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/85 backdrop-blur-sm animate-fadeIn">
      <div className="bg-neutral-900 border-l border-neutral-800 w-full max-w-md h-full flex flex-col shadow-2xl relative animate-slideLeft">
        {/* Header */}
        <div className="p-4 border-b border-neutral-800 flex items-center justify-between bg-neutral-950">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <UtensilsCrossed className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-extrabold text-white text-base">Sipariş Özeti</h2>
              <p className="text-[11px] text-neutral-400">
                {items.length} çeşit ürün seçildi
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-neutral-400 hover:text-white rounded-full bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <div className="w-20 h-20 rounded-full bg-neutral-800/80 border border-neutral-700/60 flex items-center justify-center text-neutral-500 mb-4">
              <UtensilsCrossed className="w-10 h-10" />
            </div>
            <h3 className="font-extrabold text-white text-lg mb-1">Siparişiniz Boş</h3>
            <p className="text-xs text-neutral-400 max-w-xs mb-6">
              Berlin usulü çıtır ekmek arası döner ve özel soslarımızdan siparişinize ekleyin.
            </p>
            <button
              onClick={onClose}
              className="bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs px-5 py-2.5 rounded-xl transition-all"
            >
              Menüye Dön
            </button>
          </div>
        ) : (
          <>
            {/* Table Number Selector */}
            <div className="px-4 py-3 bg-neutral-950/60 border-b border-neutral-800/80 flex items-center justify-between">
              <label className="text-xs font-bold text-neutral-300">
                Masa Numarası:
              </label>
              <div className="flex items-center gap-2">
                <span className="text-xs text-amber-400 font-bold">Masa</span>
                <input
                  type="text"
                  value={currentTable}
                  onChange={(e) => setCurrentTable(e.target.value)}
                  className="w-16 px-2 py-1 bg-neutral-800 border border-neutral-700 rounded-lg text-white font-bold text-xs text-center focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            {/* Items List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 no-scrollbar">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="bg-neutral-950/80 border border-neutral-800 rounded-2xl p-3.5 space-y-2.5 transition-all"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex gap-3">
                      <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-neutral-800 shrink-0">
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div>
                        <h4 className="font-bold text-xs text-white leading-tight">
                          {item.name}
                        </h4>
                        <span className="text-xs font-black text-amber-400 mt-0.5 block">
                          {item.price} {currency}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => onRemoveItem(item.id)}
                      className="p-1.5 text-neutral-500 hover:text-red-400 rounded-lg hover:bg-neutral-900 transition-colors"
                      title="Kaldır"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Options Display */}
                  <div className="text-[11px] bg-neutral-900/90 rounded-xl p-2.5 space-y-1 border border-neutral-800/60">
                    {item.options.selectedSauce && (
                      <div className="text-neutral-300">
                        <span className="text-amber-400 font-semibold">Sos: </span>
                        {item.options.selectedSauce}
                      </div>
                    )}
                    {item.options.removedIngredients && item.options.removedIngredients.length > 0 && (
                      <div className="text-red-400/90">
                        <span className="font-semibold">Çıkarılan: </span>
                        {item.options.removedIngredients.join(', ')}
                      </div>
                    )}
                    {item.options.addedExtras && item.options.addedExtras.length > 0 && (
                      <div className="text-emerald-400/90">
                        <span className="font-semibold">Ekstra: </span>
                        {item.options.addedExtras.map((e) => e.name).join(', ')}
                      </div>
                    )}
                    {item.options.notes && (
                      <div className="text-neutral-400 italic">
                        <span className="font-semibold text-neutral-300">Not: </span>
                        {item.options.notes}
                      </div>
                    )}
                  </div>

                  {/* Quantity Actions */}
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[11px] text-neutral-500">
                      Birim: {item.unitPrice} {currency}
                    </span>
                    <div className="flex items-center bg-neutral-900 border border-neutral-800 rounded-lg">
                      <button
                        onClick={() => onUpdateQuantity(item.id, -1)}
                        className="p-1.5 text-neutral-400 hover:text-white"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-6 text-center text-xs font-bold text-white">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => onUpdateQuantity(item.id, 1)}
                        className="p-1.5 text-neutral-400 hover:text-white"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="p-4 bg-neutral-950 border-t border-neutral-800 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs text-neutral-400">Genel Toplam</span>
                  <div className="text-xl font-black text-amber-400">
                    {totalAmount} {currency}
                  </div>
                </div>
                <button
                  onClick={onClearCart}
                  className="text-xs text-neutral-500 hover:text-red-400 transition-colors"
                >
                  Siparişi Sıfırla
                </button>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setShowReceipt(true)}
                  className="w-full bg-neutral-800 hover:bg-neutral-700 text-white font-bold text-xs py-3 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 border border-neutral-700"
                >
                  <QrCode className="w-4 h-4 text-amber-400" />
                  <span>Garsona Göster</span>
                </button>

                <button
                  onClick={handleWhatsAppOrder}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs py-3 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-600/20 active:scale-98"
                >
                  <Send className="w-4 h-4" />
                  <span>WhatsApp Sipariş</span>
                </button>
              </div>

              {orderSent && (
                <div className="p-2.5 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                  <span>Siparişiniz WhatsApp üzerinden gönderildi. Afiyet olsun!</span>
                </div>
              )}
            </div>
          </>
        )}

        {/* Digital Receipt Overlay for Waiter */}
        {showReceipt && (
          <div className="absolute inset-0 bg-neutral-950 z-30 flex flex-col p-6 animate-fadeIn">
            <div className="flex items-center justify-between pb-4 border-b border-neutral-800 mb-4">
              <h3 className="font-black text-white text-lg">Masa {currentTable} Sipariş Fişi</h3>
              <button
                onClick={() => setShowReceipt(false)}
                className="p-1.5 bg-neutral-800 text-neutral-300 hover:text-white rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 font-mono text-xs">
              <div className="text-center py-2 border-b border-dashed border-neutral-700">
                <div className="font-extrabold text-amber-400 text-sm">{settings.name}</div>
                <div className="text-neutral-400 text-[10px]">{settings.slogan}</div>
                <div className="text-neutral-400 text-[10px] mt-1">
                  Saat: {new Date().toLocaleTimeString('tr-TR')}
                </div>
              </div>

              {items.map((item, idx) => (
                <div key={idx} className="border-b border-neutral-800/80 pb-2">
                  <div className="flex justify-between font-bold text-white">
                    <span>{item.quantity}x {item.name}</span>
                    <span>{item.price} {currency}</span>
                  </div>
                  {item.options.selectedSauce && (
                    <div className="text-amber-400 text-[10px]">• Sos: {item.options.selectedSauce}</div>
                  )}
                  {item.options.removedIngredients && (
                    <div className="text-red-400 text-[10px]">• Çıkarılan: {item.options.removedIngredients.join(', ')}</div>
                  )}
                  {item.options.addedExtras && (
                    <div className="text-emerald-400 text-[10px]">• Ekstra: {item.options.addedExtras.map((e) => e.name).join(', ')}</div>
                  )}
                  {item.options.notes && (
                    <div className="text-neutral-400 text-[10px]">• Not: {item.options.notes}</div>
                  )}
                </div>
              ))}

              <div className="pt-2 flex justify-between font-black text-base text-amber-400 border-t-2 border-neutral-700">
                <span>TOPLAM:</span>
                <span>{totalAmount} {currency}</span>
              </div>
            </div>

            <button
              onClick={() => setShowReceipt(false)}
              className="mt-4 w-full py-3 bg-neutral-800 hover:bg-neutral-700 text-white font-bold rounded-xl text-xs"
            >
              Kapat
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
