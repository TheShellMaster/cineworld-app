"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Globe, ChevronDown, Check } from "lucide-react";
import { LOCALES } from "@/proxy";

interface LanguageSelectorProps {
  locale: string;
}

export default function LanguageSelector({ locale }: LanguageSelectorProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Génération dynamique des noms de langues
  const languageNames = useMemo(() => {
    try {
      // On utilise la locale courante pour traduire les noms de langue
      // ex: si on est en "fr", on veut "Anglais" pour "en", "Espagnol" pour "es"
      // Si on veut le nom de la langue DANS sa propre langue, on fait :
      // new Intl.DisplayNames([l], { type: "language" }).of(l)
      const labels: Record<string, string> = {};
      LOCALES.forEach(loc => {
        try {
          const displayNames = new Intl.DisplayNames([loc], { type: "language" });
          const name = displayNames.of(loc);
          labels[loc] = name ? name.charAt(0).toUpperCase() + name.slice(1) : loc;
        } catch {
          labels[loc] = loc;
        }
      });
      return labels;
    } catch {
      return { fr: "Français", en: "English", es: "Español" };
    }
  }, []);

  const sortedLocales = useMemo(() => {
    return [...LOCALES].sort((a, b) => 
      (languageNames[a] || a).localeCompare(languageNames[b] || b)
    );
  }, [languageNames]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleSelect(newLocale: string) {
    setOpen(false);
    if (newLocale !== locale) {
      // Nettoyer l'ancienne locale de l'URL
      // pathname commence toujours par /locale/...
      const segments = pathname.split("/");
      segments[1] = newLocale;
      router.push(segments.join("/"));
    }
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 rounded-lg border border-[#374151] bg-[#0B0F19]/60 px-3 py-1.5 text-sm text-[#9CA3AF] transition-colors hover:border-[#FF4D4D]/40 hover:text-[#F5F5F5]"
      >
        <Globe className="h-3.5 w-3.5" />
        <span className="hidden text-xs sm:inline">{languageNames[locale] || locale}</span>
        <ChevronDown
          className={`h-3 w-3 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-48 overflow-hidden rounded-xl border border-[#374151] bg-[#0D1117] shadow-2xl max-h-96 overflow-y-auto custom-scrollbar">
          <div className="p-1">
            {sortedLocales.map((loc) => (
              <button
                key={loc}
                onClick={() => handleSelect(loc)}
                className={`flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2 text-left text-sm transition-colors hover:bg-[#1F2937] ${
                  locale === loc
                    ? "bg-[#FF4D4D]/10 text-[#FF4D4D]"
                    : "text-[#D1D5DB]"
                }`}
              >
                <span className="flex-1">{languageNames[loc] || loc}</span>
                {locale === loc && (
                  <Check className="h-3.5 w-3.5 flex-shrink-0" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
