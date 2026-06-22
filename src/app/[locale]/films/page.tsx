"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Search, Filter } from "lucide-react";
import { useTranslations } from "next-intl";
import MovieCard from "@/components/MovieCard";
import { Movie, Genre } from "@/lib/tmdb";

interface FilmsPageProps {
  params: Promise<{ locale: string }>;
}

export default function FilmsPage({ params }: FilmsPageProps) {
  const [locale, setLocale] = useState("fr");
  const searchParams = useSearchParams();
  const t = useTranslations("films");

  const [movies, setMovies] = useState<Movie[]>([]);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [countries, setCountries] = useState<{ iso_3166_1: string; native_name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [selectedGenre, setSelectedGenre] = useState(searchParams.get("genre") || "");
  const [selectedCountry, setSelectedCountry] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    params.then((p) => setLocale(p.locale));
  }, [params]);

  const language = locale;

  useEffect(() => {
    async function fetchFiltersData() {
      try {
        const [genresRes, countriesRes] = await Promise.all([
          fetch(`/api/tmdb?endpoint=/genre/movie/list&language=${language}`),
          fetch(`/api/tmdb?endpoint=/configuration/countries&language=${language}`)
        ]);
        const genresData = await genresRes.json();
        const countriesData = await countriesRes.json();
        
        setGenres(genresData.genres || []);
        // On trie les pays par ordre alphabétique
        const sortedCountries = (Array.isArray(countriesData) ? countriesData : []).sort((a, b) => 
          a.native_name.localeCompare(b.native_name)
        );
        setCountries(sortedCountries);
      } catch (e) {
        console.error("Failed to load filters", e);
      }
    }
    fetchFiltersData();
  }, [language]);

  useEffect(() => {
    async function fetchMovies() {
      setLoading(true);
      let endpoint = "/discover/movie";
      let extra = "";
      
      if (selectedGenre) {
        extra += `&with_genres=${selectedGenre}`;
      }
      if (selectedCountry) {
        extra += `&with_origin_country=${selectedCountry}`;
      }

      if (query) {
        endpoint = "/search/movie";
        extra = `&query=${encodeURIComponent(query)}`;
      }

      const res = await fetch(
        `/api/tmdb?endpoint=${endpoint}&language=${language}&page=${page}${extra}`
      );
      const data = await res.json();
      setMovies(data.results || []);
      setTotalPages(data.total_pages || 1);
      setLoading(false);
    }
    fetchMovies();
  }, [query, selectedGenre, selectedCountry, page, language]);

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-6 md:px-6">
      <h1 className="text-2xl font-bold">{t("title")}</h1>

      <div className="flex flex-col gap-3 sm:flex-row flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CA3AF]" />
          <input
            type="text"
            placeholder={t("search")}
            value={query}
            onChange={(e) => { setQuery(e.target.value); setPage(1); }}
            className="w-full rounded-lg border border-[#374151] bg-[#151B2B] py-2.5 pl-10 pr-4 text-sm text-[#F5F5F5] placeholder-[#9CA3AF] outline-none focus:border-[#FF4D4D]"
          />
        </div>

        <div className="relative w-full sm:w-auto flex-shrink-0">
          <Filter className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CA3AF] pointer-events-none" />
          <select
            value={selectedGenre}
            onChange={(e) => { setSelectedGenre(e.target.value); setPage(1); setQuery(""); }}
            className="w-full sm:w-48 rounded-lg border border-[#374151] bg-[#151B2B] py-2.5 pl-10 pr-2 text-sm text-[#F5F5F5] outline-none focus:border-[#FF4D4D] cursor-pointer"
          >
            <option value="">{t("allGenres")}</option>
            {genres.map((genre) => (
              <option key={genre.id} value={genre.id}>
                {genre.name}
              </option>
            ))}
          </select>
        </div>

        <div className="relative w-full sm:w-auto flex-shrink-0">
          <Filter className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CA3AF] pointer-events-none" />
          <select
            value={selectedCountry}
            onChange={(e) => { setSelectedCountry(e.target.value); setPage(1); setQuery(""); }}
            className="w-full sm:w-48 rounded-lg border border-[#374151] bg-[#151B2B] py-2.5 pl-10 pr-2 text-sm text-[#F5F5F5] outline-none focus:border-[#FF4D4D] cursor-pointer"
          >
            <option value="">Tous les pays</option>
            {countries.map((country) => (
              <option key={country.iso_3166_1} value={country.iso_3166_1}>
                {country.native_name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="aspect-[2/3] animate-pulse rounded-lg bg-[#151B2B]" />
          ))}
        </div>
      ) : movies.length === 0 ? (
        <p className="py-12 text-center text-[#9CA3AF]">{t("noResults")}</p>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {movies.map((movie) => (
              <MovieCard key={movie.id} movie={movie} locale={locale} />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 pt-4">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="rounded-lg border border-[#374151] px-4 py-2 text-sm text-[#F5F5F5] disabled:opacity-40"
              >
                ←
              </button>
              <span className="text-sm text-[#9CA3AF]">
                {page} / {Math.min(totalPages, 500)}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="rounded-lg border border-[#374151] px-4 py-2 text-sm text-[#F5F5F5] disabled:opacity-40"
              >
                →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
