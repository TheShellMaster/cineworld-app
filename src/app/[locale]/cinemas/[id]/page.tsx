import { getNowPlaying } from "@/lib/tmdb";
import BookingFlow from "./BookingFlow";
import { notFound } from "next/navigation";
import { MapPin } from "lucide-react";
import BackButton from "@/components/BackButton";

interface CinemaPageProps {
  params: Promise<{ locale: string; id: string }>;
  searchParams: Promise<{ name?: string }>;
}

export default async function CinemaPage({ params, searchParams }: CinemaPageProps) {
  const { locale, id } = await params;
  const resolvedSearchParams = await searchParams;
  const cinemaName = resolvedSearchParams?.name || "Cinéma Inconnu";

  if (!id) return notFound();

  // Fetch only movies currently playing in theaters
  const nowPlaying = await getNowPlaying(locale, "1");
  // Afficher tous les films actuellement à l'affiche récupérés (environ 20)
  const movies = nowPlaying.results;

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 py-8 md:px-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center gap-4 border-b border-[#374151] pb-6">
        <div className="flex items-center gap-4">
          <BackButton />
          <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-2xl bg-[#FF4D4D]/10">
            <MapPin className="h-8 w-8 text-[#FF4D4D]" />
          </div>
        </div>
        <div>
          <h1 className="text-3xl font-black text-[#F5F5F5]">{cinemaName}</h1>
          <p className="text-[#9CA3AF]">Réservez vos places en ligne</p>
        </div>
      </div>

      <BookingFlow cinemaId={id} cinemaName={cinemaName} movies={movies} />
    </div>
  );
}
