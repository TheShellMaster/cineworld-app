"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Film, MonitorPlay, Ticket, Menu, MapPin, User, X } from "lucide-react";
import LanguageSelector from "./LanguageSelector";
import { useTranslations } from "next-intl";
import { AnimatePresence, motion } from "framer-motion";

interface TopNavProps {
  locale: string;
}

export default function TopNav({ locale }: TopNavProps) {
  const pathname = usePathname();
  const t = useTranslations("nav");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const NAV_ITEMS = [
    { label: t("home") || "Accueil", href: `/${locale}`, icon: Film, isMobileOnly: true },
    { label: t("films"), href: `/${locale}/films`, icon: Film },
    { label: t("streaming"), href: `/${locale}/streaming`, icon: MonitorPlay },
    { label: t("cinemas"), href: `/${locale}/cinemas-proches`, icon: MapPin },
  ];

  return (
    <>
      <nav className="sticky top-0 z-50 border-b border-[#374151] bg-[#0B0F19]/80 pt-[env(safe-area-inset-top)] backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          
          {/* Logo & Liens Desktop */}
          <div className="flex items-center gap-8">
            <Link href={`/${locale}`} className="flex items-center gap-2 transition-transform hover:scale-105">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#FF4D4D] shadow-lg shadow-[#FF4D4D]/30">
                <Film className="h-4 w-4 text-white" />
              </div>
              <span className="text-xl font-bold tracking-tight text-white">
                Cine<span className="text-[#FF4D4D]">World</span>
              </span>
            </Link>

            <div className="hidden md:flex md:items-center md:gap-1">
              {NAV_ITEMS.filter(item => !item.isMobileOnly).map((item) => {
                const isActive = item.href === `/${locale}` ? pathname === item.href : pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                      isActive
                        ? "bg-[#1E293B] text-white"
                        : "text-[#9CA3AF] hover:bg-[#151B2B] hover:text-[#F5F5F5]"
                    }`}
                  >
                    <item.icon className={`h-4 w-4 ${isActive ? "text-[#FF4D4D]" : ""}`} />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Droite : Sélecteur de Langue + Actions */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:block">
              <LanguageSelector locale={locale} />
            </div>
            
            <Link href={`/${locale}/profil`} className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#374151] text-[#9CA3AF] transition-colors hover:border-[#FF4D4D]/40 hover:text-white sm:h-auto sm:w-auto sm:px-3">
              <Ticket className="h-4 w-4" />
              <span className="hidden sm:ml-2 sm:inline sm:text-sm">Billets</span>
            </Link>

            {/* Lien Profil (Desktop) */}
            <Link href={`/${locale}/profil`} className="hidden md:flex h-9 w-9 items-center justify-center rounded-lg border border-[#374151] text-[#9CA3AF] transition-colors hover:border-[#FF4D4D]/40 hover:text-white sm:h-auto sm:w-auto sm:px-3">
              <User className="h-4 w-4" />
              <span className="hidden sm:ml-2 sm:inline sm:text-sm">{t("profile") || "Profil"}</span>
            </Link>

            {/* Menu Mobile Button */}
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-[#9CA3AF] hover:bg-[#1E293B] hover:text-white md:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>
      </nav>

      {/* Drawer Menu Mobile */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm md:hidden"
            />
            {/* Drawer */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed bottom-0 right-0 top-0 z-[101] w-4/5 max-w-sm border-l border-[#374151] bg-[#0B0F19] p-6 pt-[calc(1.5rem+env(safe-area-inset-top))] shadow-2xl md:hidden"
            >
              <div className="flex items-center justify-between mb-8">
                <span className="text-lg font-bold text-white">Menu</span>
                <button 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="rounded-full p-2 text-[#9CA3AF] hover:bg-[#1E293B] hover:text-white"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="flex flex-col gap-4">
                {NAV_ITEMS.map((item) => {
                  const isActive = item.href === `/${locale}` ? pathname === item.href : pathname.startsWith(item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex items-center gap-3 rounded-xl p-3 text-base font-medium transition-colors ${
                        isActive ? "bg-[#1E293B] text-white" : "text-[#9CA3AF] hover:bg-[#151B2B] hover:text-white"
                      }`}
                    >
                      <item.icon className={`h-5 w-5 ${isActive ? "text-[#FF4D4D]" : ""}`} />
                      {item.label}
                    </Link>
                  );
                })}
              </div>

              <div className="mt-8 border-t border-[#374151] pt-8">
                <p className="mb-4 text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Préférences</p>
                <LanguageSelector locale={locale} />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
