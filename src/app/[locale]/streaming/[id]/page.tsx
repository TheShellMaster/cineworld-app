import { getMovieDetails, getWatchProviders, getImageUrl } from "@/lib/tmdb";
import Image from "next/image";
import Link from "next/link";
import { Star, Clock, ExternalLink } from "lucide-react";
import { notFound } from "next/navigation";
import StreamingPlayer from "@/components/StreamingPlayer";
import WatchlistButton from "@/components/WatchlistButton";
import BackButton from "@/components/BackButton";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  try {
    const { locale, id } = await params;
    const language = locale;
    const movie = await getMovieDetails(parseInt(id), language);
    return {
      title: `${movie.title} — Streaming | CinéWorld`,
      description: movie.overview?.slice(0, 160),
    };
  } catch {
    return { title: "Streaming | CinéWorld" };
  }
}

export default async function StreamingPlayerPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  const language = locale;
  const watchRegion = locale.length === 5 ? locale.substring(3).toUpperCase() : 
                      locale === "en" ? "US" : 
                      locale === "ja" ? "JP" : 
                      locale === "ko" ? "KR" : 
                      locale === "zh" ? "CN" : 
                      locale === "ar" ? "AE" : 
                      locale.toUpperCase().slice(0, 2);

  let movie;
  try {
    movie = await getMovieDetails(parseInt(id), language);
  } catch {
    notFound();
  }

  // Watch providers depuis TMDB (temps réel, aucune API supplémentaire)
  let providers = null;
  try {
    providers = await getWatchProviders(parseInt(id), watchRegion);
  } catch {
    // providers reste null — pas critique
  }

  // Bande-annonce YouTube
  const trailer = movie.videos?.results.find(
    (v) => v.type === "Trailer" && v.site === "YouTube"
  );

  const cast = movie.credits?.cast.slice(0, 8) || [];

  const formatRuntime = (min: number) =>
    `${Math.floor(min / 60)}h ${min % 60}min`;

  return (
    <div className="min-h-screen">
      {/* Backdrop flou en fond */}
      {movie.backdrop_path && (
        <div className="fixed inset-0 -z-10 opacity-10">
          <Image
            src={getImageUrl(movie.backdrop_path, "w1280")}
            alt=""
            fill
            className="object-cover blur-2xl"
            priority
          />
        </div>
      )}

      <div className="mx-auto max-w-5xl space-y-6 px-4 py-6 md:px-6">
        {/* Retour */}
        <div>
          <BackButton />
        </div>

        {/* Titre + infos */}
        <div className="flex gap-4">
          {/* Affiche */}
          <div className="hidden w-28 flex-shrink-0 sm:block">
            <Image
              src={getImageUrl(movie.poster_path, "w185")}
              alt={movie.title}
              width={112}
              height={168}
              className="rounded-lg shadow-lg"
            />
          </div>

          <div className="flex-1 space-y-2">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-xl font-bold text-[#F5F5F5] md:text-3xl">
                  {movie.title}
                </h1>
                {movie.tagline && (
                  <p className="italic text-[#9CA3AF]">{movie.tagline}</p>
                )}
              </div>
              <WatchlistButton 
                movieId={movie.id} 
                movieTitle={movie.title} 
                posterPath={movie.poster_path} 
              />
            </div>
            <div className="flex flex-wrap gap-3 text-sm text-[#9CA3AF]">
              <span className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-[#FFD700] text-[#FFD700]" />
                {movie.vote_average ? movie.vote_average.toFixed(1) : "N/R"}/10
              </span>
              {movie.runtime > 0 && (
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {formatRuntime(movie.runtime)}
                </span>
              )}
              <span>{movie.release_date?.slice(0, 4)}</span>
            </div>
            <div className="flex flex-wrap gap-2 pt-1">
              {movie.genres.map((g) => (
                <span
                  key={g.id}
                  className="rounded-full border border-[#374151] px-3 py-0.5 text-xs text-[#9CA3AF]"
                >
                  {g.name}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* ── LECTEUR VIDÉO ── */}
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-[#F5F5F5]">Lecteur</h2>
          
          <div className="rounded-lg bg-[#FF4D4D]/10 border border-[#FF4D4D]/30 p-4 text-sm text-[#F5F5F5] flex gap-3 items-start">
            <span className="text-xl leading-none mt-0.5">⚠️</span>
            <p className="leading-relaxed">
              <strong className="text-[#FF4D4D]">Info :</strong> Si la vidéo ne se lance pas, n'hésitez pas à <strong>changer de serveur</strong> via les boutons sous le lecteur. <br/>
              <span className="text-[#9CA3AF]">Ces serveurs tiers peuvent parfois afficher des publicités. Nous vous recommandons vivement l'utilisation d'un <strong>bloqueur de publicités</strong> (ex: uBlock Origin) pour une expérience optimale.</span>
            </p>
          </div>

          <StreamingPlayer movieId={id} title={movie.title} locale={locale} />
        </section>


        {/* ── OÙ REGARDER OFFICIELLEMENT ── */}
        {providers?.flatrate && providers.flatrate.length > 0 && (
          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-[#F5F5F5]">
              Disponible sur
            </h2>
            <div className="flex flex-wrap gap-3">
              {providers.flatrate.map((p) => (
                <a
                  key={p.provider_id}
                  href={providers?.link || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-2 rounded-xl border border-[#374151] bg-[#151B2B] px-4 py-2.5 text-sm text-[#F5F5F5] transition-colors hover:border-[#FF4D4D]/50"
                >
                  {p.logo_path && (
                    <Image
                      src={`https://image.tmdb.org/t/p/w45${p.logo_path}`}
                      alt={p.provider_name}
                      width={24}
                      height={24}
                      className="rounded-md"
                    />
                  )}
                  {p.provider_name}
                  <ExternalLink className="h-3 w-3 text-[#9CA3AF] opacity-0 transition-opacity group-hover:opacity-100" />
                </a>
              ))}
            </div>
          </section>
        )}

        {/* ── BANDE-ANNONCE YOUTUBE ── */}
        {trailer && (
          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-[#F5F5F5]">
              Bande-annonce
            </h2>
            <div className="aspect-video overflow-hidden rounded-xl shadow-lg">
              <iframe
                id="trailer-player"
                src={`https://www.youtube.com/embed/${trailer.key}?rel=0`}
                title={trailer.name}
                allowFullScreen
                className="h-full w-full"
              />
            </div>
          </section>
        )}

        {/* ── SYNOPSIS ── */}
        {movie.overview && (
          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-[#F5F5F5]">Synopsis</h2>
            <p className="leading-relaxed text-[#9CA3AF]">{movie.overview}</p>
          </section>
        )}

        {/* ── CASTING ── */}
        {cast.length > 0 && (
          <section className="space-y-4 pb-10">
            <h2 className="text-lg font-semibold text-[#F5F5F5]">Casting</h2>
            <div className="grid grid-cols-4 gap-4 sm:grid-cols-8">
              {cast.map((actor) => (
                <div key={actor.id} className="text-center">
                  <div className="relative mx-auto h-16 w-16 overflow-hidden rounded-full bg-[#151B2B]">
                    {actor.profile_path ? (
                      <Image
                        src={getImageUrl(actor.profile_path, "w185")}
                        alt={actor.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-xl text-[#374151]">
                        ?
                      </div>
                    )}
                  </div>
                  <p className="mt-1.5 text-xs font-medium leading-tight text-[#F5F5F5]">
                    {actor.name}
                  </p>
                  <p className="text-xs leading-tight text-[#6B7280]">
                    {actor.character}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
