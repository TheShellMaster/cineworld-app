import Image from "next/image";
import Link from "next/link";
import { Star, Clock, Calendar, Play, Ticket } from "lucide-react";
import { getMovieDetails, getImageUrl } from "@/lib/tmdb";
import BackButton from "@/components/BackButton";
import WatchlistButton from "@/components/WatchlistButton";

export default async function MovieDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  const language = locale;
  const movie = await getMovieDetails(parseInt(id), language);

  const trailer = movie.videos?.results.find(
    (v) => v.type === "Trailer" && v.site === "YouTube"
  );
  const cast = movie.credits?.cast.slice(0, 8) || [];

  return (
    <div className="min-h-screen">
      {/* Backdrop */}
      <div className="relative h-[40vh] w-full md:h-[50vh]">
        <div className="absolute top-4 left-4 z-10">
          <BackButton />
        </div>
        <Image
          src={getImageUrl(movie.backdrop_path, "w1280")}
          alt={movie.title}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F19] via-[#0B0F19]/50 to-transparent" />
      </div>

      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <div className="relative -mt-32 flex flex-col gap-6 md:-mt-40 md:flex-row">
          {/* Poster */}
          <div className="hidden w-64 flex-shrink-0 md:block">
            <Image
              src={getImageUrl(movie.poster_path, "w500")}
              alt={movie.title}
              width={256}
              height={384}
              className="rounded-lg shadow-xl"
            />
          </div>

          {/* Info */}
          <div className="flex-1 space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-[#F5F5F5] md:text-4xl">
                  {movie.title}
                </h1>

                {movie.tagline && (
                  <p className="italic text-[#9CA3AF] mt-1">{movie.tagline}</p>
                )}
              </div>
              
              <WatchlistButton 
                movieId={movie.id} 
                movieTitle={movie.title} 
                posterPath={movie.poster_path} 
              />
            </div>

            <div className="flex flex-wrap items-center gap-4 text-sm text-[#9CA3AF]">
              <span className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-[#FFD700] text-[#FFD700]" />
                {movie.vote_average ? movie.vote_average.toFixed(1) : "N/R"}/10
              </span>
              {movie.runtime > 0 && (
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {Math.floor(movie.runtime / 60)}h {movie.runtime % 60}min
                </span>
              )}
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {movie.release_date}
              </span>
            </div>

            <div className="flex flex-wrap gap-2">
              {movie.genres.map((genre) => (
                <span
                  key={genre.id}
                  className="rounded-full border border-[#374151] px-3 py-1 text-xs text-[#9CA3AF]"
                >
                  {genre.name}
                </span>
              ))}
            </div>

            <p className="leading-relaxed text-[#9CA3AF]">{movie.overview}</p>

            <div className="flex gap-3 pt-2">
              <Link
                href={`/${locale}/cinemas-proches?movie=${movie.id}`}
                className="flex items-center gap-2 rounded-lg bg-[#FF4D4D] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#e04444]"
              >
                <Ticket className="h-4 w-4" />
                Réserver une séance
              </Link>
              <Link
                href={`/${locale}/streaming/${movie.id}`}
                className="flex items-center gap-2 rounded-lg border border-[#374151] bg-[#151B2B] px-5 py-2.5 text-sm font-medium text-[#F5F5F5] hover:bg-[#1E293B]"
              >
                <Play className="h-4 w-4" />
                Streaming
              </Link>
            </div>
          </div>
        </div>

        {/* Trailer */}
        {trailer && (
          <section className="mt-10 space-y-4">
            <h2 className="text-xl font-semibold">Bande-annonce</h2>
            <div className="aspect-video w-full overflow-hidden rounded-lg">
              <iframe
                src={`https://www.youtube.com/embed/${trailer.key}`}
                title={trailer.name}
                allowFullScreen
                className="h-full w-full"
              />
            </div>
          </section>
        )}

        {/* Cast */}
        {cast.length > 0 && (
          <section className="mt-10 space-y-4 pb-10">
            <h2 className="text-xl font-semibold">Casting</h2>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 md:grid-cols-8">
              {cast.map((actor) => (
                <div key={actor.id} className="text-center">
                  <div className="relative mx-auto h-20 w-20 overflow-hidden rounded-full bg-[#151B2B]">
                    {actor.profile_path ? (
                      <Image
                        src={getImageUrl(actor.profile_path, "w185")}
                        alt={actor.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-2xl text-[#9CA3AF]">
                        ?
                      </div>
                    )}
                  </div>
                  <p className="mt-2 text-xs font-medium text-[#F5F5F5]">{actor.name}</p>
                  <p className="text-xs text-[#9CA3AF]">{actor.character}</p>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
