"use client";

import Image from "next/image";
import Link from "next/link";
import { Star } from "lucide-react";
import { Movie, getImageUrl } from "@/lib/tmdb";

interface MovieCardProps {
  movie: Movie;
  locale: string;
  /** Segment de route cible, ex: "films" ou "streaming". Défaut: "films" */
  linkBase?: string;
}

export default function MovieCard({ movie, locale, linkBase = "films" }: MovieCardProps) {
  return (
    <Link
      href={`/${locale}/${linkBase}/${movie.id}`}
      className="group relative flex flex-col overflow-hidden rounded-lg bg-[#151B2B] transition-transform hover:scale-[1.02] hover:shadow-xl"
    >
      <div className="relative aspect-[2/3] w-full overflow-hidden">
        <Image
          src={getImageUrl(movie.poster_path, "w342")}
          alt={movie.title}
          fill
          className="object-cover transition-transform group-hover:scale-105"
          sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
        />
      </div>
      <div className="flex flex-1 flex-col gap-1 p-3">
        <h3 className="line-clamp-2 text-sm font-medium text-[#F5F5F5]">
          {movie.title}
        </h3>
        <div className="mt-auto flex items-center gap-1">
          <Star className="h-3.5 w-3.5 fill-[#FFD700] text-[#FFD700]" />
          <span className="text-xs text-[#9CA3AF]">
            {movie.vote_average ? movie.vote_average.toFixed(1) : "N/R"}
          </span>
          <span className="ml-auto text-xs text-[#9CA3AF]">
            {movie.release_date?.slice(0, 4)}
          </span>
        </div>
      </div>
    </Link>
  );
}
