"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { Play, Search, Loader2 } from "lucide-react";
import MovieCard from "@/components/MovieCard";
import { Movie } from "@/lib/tmdb";

// Plateformes de streaming — IDs JustWatch (fournis par TMDB)
const PLATFORMS = [
  { id: "", label: "Tout", icon: "🌐" },
  { id: "8", label: "Netflix", icon: "🎬" },
  { id: "9", label: "Prime Video", icon: "📦" },
  { id: "337", label: "Disney+", icon: "✨" },
  { id: "350", label: "Apple TV+", icon: "🍎" },
  { id: "384", label: "Max", icon: "🎭" },
  { id: "381", label: "Canal+", icon: "📡" },
];

// Tous les providers sauf "Tout"
const ALL_PROVIDERS = PLATFORMS.filter((p) => p.id).map((p) => p.id).join("|");

function getRegion(locale: string) {
  if (locale.length === 5) return locale.substring(3).toUpperCase();
  if (locale === "en") return "US";
  if (locale === "ja") return "JP";
  if (locale === "ko") return "KR";
  if (locale === "zh") return "CN";
  if (locale === "ar") return "AE";
  return locale.toUpperCase().slice(0, 2);
}

function getLanguage(locale: string) {
  return locale;
}

export default function StreamingPage() {
  const { locale } = useParams<{ locale: string }>();
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [platform, setPlatform] = useState("");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [inputValue, setInputValue] = useState("");

  const language = getLanguage(locale);
  const watchRegion = getRegion(locale);

  const fetchMovies = useCallback(async () => {
    setLoading(true);
    try {
      let url: string;

      if (query) {
        url = `/api/tmdb?endpoint=/search/movie&language=${language}&page=${page}&query=${encodeURIComponent(query)}`;
      } else {
        const providerParam = platform || ALL_PROVIDERS;
        url =
          `/api/tmdb?endpoint=/discover/movie` +
          `&language=${language}` +
          `&page=${page}` +
          `&sort_by=popularity.desc` +
          `&with_watch_providers=${encodeURIComponent(providerParam)}` +
          `&watch_region=${watchRegion}`;
      }

      const res = await fetch(url);
      const data = await res.json();
      setMovies(data.results || []);
      setTotalPages(Math.min(data.total_pages || 1, 500));
    } catch (e) {
      console.error("Streaming fetch error:", e);
    }
    setLoading(false);
  }, [query, platform, page, language, watchRegion]);

  useEffect(() => {
    fetchMovies();
  }, [fetchMovies]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setQuery(inputValue);
    setPage(1);
  }

  function handlePlatform(id: string) {
    setPlatform(id);
    setPage(1);
    setQuery("");
    setInputValue("");
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-6 md:px-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FF4D4D]/10">
          <Play className="h-5 w-5 fill-[#FF4D4D] text-[#FF4D4D]" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-[#F5F5F5]">Streaming</h1>
          <p className="text-xs text-[#9CA3AF]">Films disponibles sur les plateformes</p>
        </div>
      </div>

      {/* Barre de recherche */}
      <form onSubmit={handleSearch} className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CA3AF]" />
        <input
          id="streaming-search"
          type="text"
          placeholder="Rechercher un film..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          className="w-full rounded-xl border border-[#374151] bg-[#151B2B] py-3 pl-10 pr-4 text-sm text-[#F5F5F5] placeholder-[#9CA3AF] outline-none transition-colors focus:border-[#FF4D4D]"
        />
        {inputValue && (
          <button
            type="button"
            onClick={() => { setInputValue(""); setQuery(""); setPage(1); }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#9CA3AF] hover:text-[#F5F5F5]"
          >
            ✕
          </button>
        )}
      </form>

      {/* Filtres plateformes */}
      <div className="flex flex-wrap gap-2">
        {PLATFORMS.map((p) => (
          <button
            key={p.id}
            id={`platform-${p.id || "all"}`}
            onClick={() => handlePlatform(p.id)}
            className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-all ${
              platform === p.id
                ? "bg-[#FF4D4D] text-white shadow-lg shadow-[#FF4D4D]/25"
                : "border border-[#374151] bg-[#151B2B] text-[#9CA3AF] hover:border-[#FF4D4D]/50 hover:text-[#F5F5F5]"
            }`}
          >
            <span>{p.icon}</span>
            {p.label}
          </button>
        ))}
      </div>

      {/* Compteur résultats */}
      {!loading && movies.length > 0 && (
        <p className="text-xs text-[#9CA3AF]">
          {query
            ? `Résultats pour "${query}"`
            : `Films disponibles ${platform ? `sur ${PLATFORMS.find((p) => p.id === platform)?.label}` : "en streaming"}`}
        </p>
      )}

      {/* Grille films */}
      {loading ? (
        <div className="flex flex-col items-center justify-center gap-3 py-16">
          <Loader2 className="h-8 w-8 animate-spin text-[#FF4D4D]" />
          <p className="text-sm text-[#9CA3AF]">Chargement des films...</p>
        </div>
      ) : movies.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-[#374151] bg-[#151B2B] py-16">
          <span className="text-4xl">🎬</span>
          <p className="text-[#9CA3AF]">Aucun film trouvé</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {movies.map((movie) => (
              <div key={movie.id} className="relative">
                <MovieCard movie={movie} locale={locale} linkBase="streaming" />
                {/* Badge play */}
                <div className="pointer-events-none absolute right-2 top-2 rounded-full bg-[#FF4D4D] p-1.5 shadow-lg">
                  <Play className="h-3 w-3 fill-white text-white" />
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 pt-4">
              <button
                id="streaming-prev"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="rounded-lg border border-[#374151] px-5 py-2 text-sm text-[#F5F5F5] transition-colors hover:bg-[#151B2B] disabled:cursor-not-allowed disabled:opacity-40"
              >
                ← Précédent
              </button>
              <span className="text-sm text-[#9CA3AF]">
                Page {page} / {totalPages}
              </span>
              <button
                id="streaming-next"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="rounded-lg border border-[#374151] px-5 py-2 text-sm text-[#F5F5F5] transition-colors hover:bg-[#151B2B] disabled:cursor-not-allowed disabled:opacity-40"
              >
                Suivant →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
