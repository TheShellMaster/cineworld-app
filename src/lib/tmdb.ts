const BASE_URL = "https://api.themoviedb.org/3";
const API_KEY = process.env.TMDB_API_KEY || "";

interface TMDBResponse<T> {
  page: number;
  results: T[];
  total_pages: number;
  total_results: number;
}

export interface Movie {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  vote_average: number;
  vote_count: number;
  genre_ids: number[];
  popularity: number;
  original_language: string;
}

export interface Genre {
  id: number;
  name: string;
}

export interface MovieDetails extends Movie {
  genres: Genre[];
  runtime: number;
  tagline: string;
  budget: number;
  revenue: number;
  status: string;
  videos?: { results: Video[] };
  credits?: { cast: CastMember[] };
}

export interface Video {
  id: string;
  key: string;
  name: string;
  site: string;
  type: string;
}

export interface CastMember {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
}

async function tmdbFetch<T>(endpoint: string, params: Record<string, string> = {}): Promise<T> {
  // TMDB préfère le format 'fr-FR', 'en-US' au lieu de juste 'fr' ou 'en'
  if (params.language) {
    if (params.language === "fr") params.language = "fr-FR";
    else if (params.language === "en") params.language = "en-US";
    else if (params.language === "es") params.language = "es-ES";
    else if (params.language === "de") params.language = "de-DE";
    else if (params.language === "it") params.language = "it-IT";
  }

  const searchParams = new URLSearchParams({
    api_key: API_KEY,
    ...params,
  });
  const res = await fetch(`${BASE_URL}${endpoint}?${searchParams}`, {
    next: { revalidate: 600 },
  });
  if (!res.ok) throw new Error(`TMDB Error: ${res.status}`);
  return res.json();
}

export async function getGenres(language = "fr-FR"): Promise<Genre[]> {
  const data = await tmdbFetch<{ genres: Genre[] }>("/genre/movie/list", { language });
  return data.genres;
}

export async function getTrending(language = "fr-FR"): Promise<Movie[]> {
  const data = await tmdbFetch<TMDBResponse<Movie>>("/trending/movie/day", { language });
  return data.results;
}

export async function getNowPlaying(language = "fr-FR", page = "1"): Promise<TMDBResponse<Movie>> {
  return tmdbFetch<TMDBResponse<Movie>>("/movie/now_playing", { language, page });
}

export async function getPopular(language = "fr-FR", page = "1"): Promise<TMDBResponse<Movie>> {
  return tmdbFetch<TMDBResponse<Movie>>("/movie/popular", { language, page });
}

export async function getTopRated(language = "fr-FR", page = "1"): Promise<TMDBResponse<Movie>> {
  return tmdbFetch<TMDBResponse<Movie>>("/movie/top_rated", { language, page });
}

export async function getMoviesByGenre(genreId: number, language = "fr-FR", page = "1"): Promise<TMDBResponse<Movie>> {
  return tmdbFetch<TMDBResponse<Movie>>("/discover/movie", {
    language,
    page,
    with_genres: genreId.toString(),
    sort_by: "popularity.desc",
  });
}

export async function getMovieDetails(id: number, language = "fr-FR"): Promise<MovieDetails> {
  return tmdbFetch<MovieDetails>(`/movie/${id}`, {
    language,
    append_to_response: "videos,credits",
  });
}

export async function searchMovies(query: string, language = "fr-FR", page = "1"): Promise<TMDBResponse<Movie>> {
  return tmdbFetch<TMDBResponse<Movie>>("/search/movie", { language, page, query });
}

export function getImageUrl(path: string | null, size = "w500"): string {
  if (!path) return "/placeholder-movie.svg";
  return `https://image.tmdb.org/t/p/${size}${path}`;
}

export interface WatchProvider {
  provider_id: number;
  provider_name: string;
  logo_path: string;
}

export interface WatchProvidersResult {
  link?: string;
  flatrate?: WatchProvider[]; // abonnement streaming
  buy?: WatchProvider[];
  rent?: WatchProvider[];
}

/**
 * Retourne les plateformes de streaming disponibles pour un film dans une région donnée.
 * region : "FR", "US", "ES", etc.
 */
export async function getWatchProviders(
  id: number,
  region = "FR"
): Promise<WatchProvidersResult | null> {
  const data = await tmdbFetch<{ results: Record<string, WatchProvidersResult> }>(
    `/movie/${id}/watch/providers`
  );
  return data.results[region] ?? data.results["US"] ?? null;
}

/**
 * Films disponibles sur les plateformes de streaming dans une région.
 * providers : IDs JustWatch séparés par "|", ex: "8|9|337" (Netflix|Prime|Disney+)
 */
export async function getStreamingMovies(
  language = "fr-FR",
  page = "1",
  providers = "8|9|337|350|384", // Netflix|Prime|Disney+|AppleTV+|Max
  region = "FR"
): Promise<TMDBResponse<Movie>> {
  return tmdbFetch<TMDBResponse<Movie>>("/discover/movie", {
    language,
    page,
    with_watch_providers: providers,
    watch_region: region,
    sort_by: "popularity.desc",
  });
}
