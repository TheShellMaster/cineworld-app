"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Film, MapPin, Play, User } from "lucide-react";
import { useTranslations } from "next-intl";

interface BottomNavProps {
  locale: string;
}

export default function BottomNav({ locale }: BottomNavProps) {
  const pathname = usePathname();
  const t = useTranslations("nav");

  const links = [
    { href: `/${locale}`, icon: Home, label: t("home") },
    { href: `/${locale}/films`, icon: Film, label: t("films") },
    { href: `/${locale}/cinemas-proches`, icon: MapPin, label: t("cinemas") },
    { href: `/${locale}/streaming`, icon: Play, label: t("streaming") },
    { href: `/${locale}/profil`, icon: User, label: t("profile") },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-[#374151] bg-[#0B0F19]/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-sm md:hidden">
      <div className="flex items-center justify-around py-2 px-1">
        {links.map(({ href, icon: Icon, label }) => {
          const isActive = pathname === href || (href !== `/${locale}` && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center gap-1 px-3 py-1.5 text-[10px] transition-colors sm:text-xs sm:gap-1.5 ${
                isActive ? "text-[#FF4D4D]" : "text-[#9CA3AF] hover:text-[#F5F5F5]"
              }`}
            >
              <Icon className={`h-5 w-5 sm:h-6 sm:w-6 transition-transform ${isActive ? "scale-110" : ""}`} />
              <span className="font-medium tracking-wide">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
