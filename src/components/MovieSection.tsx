"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import MovieCard from "./MovieCard";
import { Movie } from "@/lib/tmdb";

interface MovieSectionProps {
  title: string;
  movies: Movie[];
  locale: string;
  seeAllHref?: string;
}

export default function MovieSection({ title, movies, locale, seeAllHref }: MovieSectionProps) {
  if (!movies.length) return null;

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-[#F5F5F5] md:text-xl">{title}</h2>
        {seeAllHref && (
          <Link
            href={seeAllHref}
            className="flex items-center gap-1 text-sm text-[#FF4D4D] hover:underline"
          >
            Voir tout
            <ChevronRight className="h-4 w-4" />
          </Link>
        )}
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
        {movies.slice(0, 12).map((movie) => (
          <MovieCard key={movie.id} movie={movie} locale={locale} />
        ))}
      </div>
    </section>
  );
}
