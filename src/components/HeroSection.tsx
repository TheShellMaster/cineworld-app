"use client";

import Image from "next/image";
import Link from "next/link";
import { Play, Ticket } from "lucide-react";
import { Movie, getImageUrl } from "@/lib/tmdb";

interface HeroSectionProps {
  movie: Movie;
  locale: string;
}

export default function HeroSection({ movie, locale }: HeroSectionProps) {
  return (
    <section className="relative h-[50vh] w-full overflow-hidden md:h-[60vh]">
      <Image
        src={getImageUrl(movie.backdrop_path, "w1280")}
        alt={movie.title}
        fill
        className="object-cover"
        priority
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F19] via-[#0B0F19]/60 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12">
        <div className="mx-auto max-w-7xl">
          <h1 className="mb-2 text-2xl font-bold text-[#F5F5F5] md:text-4xl">
            {movie.title}
          </h1>
          <p className="mb-4 line-clamp-2 max-w-xl text-sm text-[#9CA3AF] md:text-base">
            {movie.overview}
          </p>
          <div className="flex gap-3">
            <Link
              href={`/${locale}/films/${movie.id}`}
              className="flex items-center gap-2 rounded-lg bg-[#FF4D4D] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#e04444]"
            >
              <Play className="h-4 w-4" />
              Voir plus
            </Link>
            <Link
              href={`/${locale}/cinemas-proches?movie=${movie.id}`}
              className="flex items-center gap-2 rounded-lg border border-[#374151] bg-[#151B2B]/80 px-4 py-2.5 text-sm font-medium text-[#F5F5F5] transition-colors hover:bg-[#1E293B]"
            >
              <Ticket className="h-4 w-4" />
              Réserver
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
