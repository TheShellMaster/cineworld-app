"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { CreditCard, X, ShieldCheck, Loader2 } from "lucide-react";

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  totalPrice: number;
  onSuccess: () => void;
}

export default function CheckoutModal({ isOpen, onClose, totalPrice, onSuccess }: CheckoutModalProps) {
  const t = useTranslations("payment");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simuler un appel réseau pour le paiement
    setTimeout(() => {
      setLoading(false);
      onSuccess();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl bg-[#151B2B] border border-[#374151] shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#374151] px-6 py-4">
          <h2 className="text-xl font-bold text-[#F5F5F5] flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-[#FF4D4D]" />
            {t("title")}
          </h2>
          <button 
            onClick={onClose}
            className="rounded-lg p-1.5 text-[#9CA3AF] hover:bg-[#1F2937] hover:text-[#F5F5F5] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Warning Simulation */}
        <div className="bg-yellow-500/10 border-b border-yellow-500/20 px-6 py-3">
          <p className="text-xs text-yellow-500/90 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4" />
            {t("simulation")}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          <div className="space-y-1.5">
            <label className="text-sm text-[#9CA3AF]">{t("cardHolder")}</label>
            <input 
              required
              type="text" 
              placeholder="Ex: John Doe"
              defaultValue="Test User"
              className="w-full rounded-xl border border-[#374151] bg-[#0B0F19] px-4 py-3 text-sm text-[#F5F5F5] outline-none focus:border-[#FF4D4D] transition-colors"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm text-[#9CA3AF]">{t("cardNumber")}</label>
            <div className="relative">
              <input 
                required
                type="text" 
                maxLength={19}
                placeholder="0000 0000 0000 0000"
                defaultValue="4242 4242 4242 4242"
                className="w-full rounded-xl border border-[#374151] bg-[#0B0F19] px-4 py-3 text-sm text-[#F5F5F5] outline-none focus:border-[#FF4D4D] transition-colors tracking-widest font-mono"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-1">
                <div className="w-8 h-5 bg-red-500/20 rounded"></div>
                <div className="w-8 h-5 bg-yellow-500/20 rounded -ml-4"></div>
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="space-y-1.5 flex-1">
              <label className="text-sm text-[#9CA3AF]">{t("expiry")}</label>
              <input 
                required
                type="text" 
                placeholder="MM/YY"
                defaultValue="12/25"
                maxLength={5}
                className="w-full rounded-xl border border-[#374151] bg-[#0B0F19] px-4 py-3 text-sm text-[#F5F5F5] outline-none focus:border-[#FF4D4D] transition-colors text-center"
              />
            </div>
            <div className="space-y-1.5 flex-1">
              <label className="text-sm text-[#9CA3AF]">{t("cvv")}</label>
              <input 
                required
                type="password" 
                placeholder="123"
                defaultValue="123"
                maxLength={3}
                className="w-full rounded-xl border border-[#374151] bg-[#0B0F19] px-4 py-3 text-sm text-[#F5F5F5] outline-none focus:border-[#FF4D4D] transition-colors text-center"
              />
            </div>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#FF4D4D] px-4 py-3.5 font-bold text-white transition-all hover:bg-[#e04444] disabled:opacity-70"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                `${t("pay")} - ${totalPrice}€`
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
