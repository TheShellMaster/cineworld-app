"use client";

import { useState } from "react";
import { RotateCcw, Play, AlertCircle, Settings2 } from "lucide-react";

// Sources gratuites, sans compte, classées par fiabilité
const SOURCES = [
  {
    id: "vidsrc-cc",
    label: "Source 1 (Multi-langues/VF)",
    getUrl: (id: string | number, q: string, loc: string) => `https://vidsrc.cc/v2/embed/movie/${id}?autoPlay=false&lang=${loc}${q !== 'auto' ? `&quality=${q}` : ''}`,
  },
  {
    id: "vidsrc-xyz",
    label: "Source 2",
    getUrl: (id: string | number, q: string, loc: string) => `https://vidsrc.xyz/embed/movie?tmdb=${id}&lang=${loc}${q !== 'auto' ? `&quality=${q}` : ''}`,
  },
  {
    id: "2embed",
    label: "Source 3",
    getUrl: (id: string | number, q: string, loc: string) => `https://www.2embed.cc/embed/${id}`,
  },
  {
    id: "vidlink",
    label: "Source 4",
    getUrl: (id: string | number, q: string, loc: string) => `https://vidlink.pro/movie/${id}?primaryColor=FF4D4D&playerLang=${loc}${q !== 'auto' ? `&quality=${q}` : ''}`,
  },
];

const QUALITIES = [
  { id: "auto", label: "Auto" },
  { id: "1080p", label: "1080p (FHD)" },
  { id: "720p", label: "720p (HD)" },
  { id: "480p", label: "480p (SD)" },
  { id: "360p", label: "360p (Low)" },
];

interface StreamingPlayerProps {
  movieId: string | number;
  title: string;
  locale?: string;
}

export default function StreamingPlayer({ movieId, title, locale = "fr" }: StreamingPlayerProps) {
  const [sourceIndex, setSourceIndex] = useState(0);
  const [quality, setQuality] = useState("auto");
  const [showSettings, setShowSettings] = useState(false);
  const [key, setKey] = useState(0);

  const currentSource = SOURCES[sourceIndex];

  function changeQuality(qId: string) {
    setQuality(qId);
    setKey((k) => k + 1);
    setShowSettings(false);
  }

  function reload() {
    setKey((k) => k + 1);
  }

  function nextSource() {
    setSourceIndex((prev) => (prev + 1) % SOURCES.length);
    setKey((k) => k + 1);
  }

  return (
    <div className="space-y-4">
      {/* Lecteur iframe (plus grand, plus immersif) */}
      <div className="overflow-hidden rounded-2xl bg-[#080A10] shadow-2xl ring-1 ring-white/10">
        <div className="relative aspect-video w-full">
          <iframe
            key={`${movieId}-${sourceIndex}-${quality}-${key}`}
            src={currentSource.getUrl(movieId, quality.replace('p', ''), locale)}
            title={`${title} — Player`}
            allowFullScreen
            allow="fullscreen; autoplay; encrypted-media"
            className="h-full w-full"
          />
        </div>
        
        {/* Barre de contrôle intégrée sous le lecteur */}
        <div className="flex items-center justify-between border-t border-[#374151]/30 bg-[#111621] px-4 py-3">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-2 text-sm font-semibold text-[#F5F5F5]">
              <Play className="h-4 w-4 text-[#FF4D4D] fill-[#FF4D4D]" />
              Lecteur Principal
            </span>
            <span className="text-xs text-[#9CA3AF]">
              (Résolution : {QUALITIES.find(q => q.id === quality)?.label})
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={nextSource}
              className="rounded-lg px-3 py-1.5 text-xs text-[#9CA3AF] transition-colors hover:bg-[#1E293B] hover:text-[#F5F5F5]"
            >
              Changer de serveur
            </button>
            <button
              onClick={reload}
              className="rounded-lg px-3 py-1.5 text-xs text-[#9CA3AF] transition-colors hover:bg-[#1E293B] hover:text-[#F5F5F5]"
            >
              <RotateCcw className="h-3 w-3" />
            </button>
            
            {/* Bouton Qualité */}
            <div className="relative">
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-[#9CA3AF] transition-colors hover:bg-[#1E293B] hover:text-[#F5F5F5]"
              >
                <Settings2 className="h-4 w-4" />
              </button>
              
              {showSettings && (
                <div className="absolute bottom-full right-0 z-50 mb-2 w-36 overflow-hidden rounded-xl border border-[#374151] bg-[#0D1117] shadow-2xl">
                  {QUALITIES.map((q) => (
                    <button
                      key={q.id}
                      onClick={() => changeQuality(q.id)}
                      className={`flex w-full items-center px-3 py-2 text-left text-xs transition-colors hover:bg-[#1F2937] ${
                        quality === q.id ? "bg-[#FF4D4D]/10 text-[#FF4D4D]" : "text-[#D1D5DB]"
                      }`}
                    >
                      {q.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Message d'aide discret */}
      <div className="flex items-start gap-2 rounded-xl bg-[#FF4D4D]/5 px-4 py-3">
        <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#FF4D4D]/70" />
        <p className="text-xs leading-relaxed text-[#9CA3AF]">
          Ce lecteur est fourni par des serveurs externes gratuits. Des fenêtres publicitaires peuvent s'ouvrir lors du premier clic sur "Play". 
          C'est normal : fermez simplement la page de pub et recliquez sur Play pour lancer le film. Si le film ne charge pas, utilisez le bouton "Changer de serveur".
        </p>
      </div>
    </div>
  );
}
