import { getTrending, getNowPlaying, getPopular, getMoviesByGenre, getGenres, Movie } from "@/lib/tmdb";
import HeroSection from "@/components/HeroSection";
import MovieSection from "@/components/MovieSection";

export const dynamic = "force-dynamic";

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const language = locale;

  let trending: Movie[] = [];
  let nowPlayingResults: Movie[] = [];
  let popularResults: Movie[] = [];
  let actionMovies: Movie[] = [];
  let comedyMovies: Movie[] = [];
  let horrorMovies: Movie[] = [];

  try {
    const [trendingData, nowPlaying, popular, genres] = await Promise.all([
      getTrending(language),
      getNowPlaying(language),
      getPopular(language),
      getGenres(language),
    ]);

    trending = trendingData;
    nowPlayingResults = nowPlaying.results;
    popularResults = popular.results;

    const actionGenre = genres?.find((g) => g?.name?.toLowerCase().includes("action"));
    const comedyGenre = genres?.find((g) => g?.name?.toLowerCase().includes("comédie") || g?.name?.toLowerCase().includes("comedy") || g?.name?.toLowerCase().includes("comedia"));
    const horrorGenre = genres?.find((g) => g?.name?.toLowerCase().includes("horreur") || g?.name?.toLowerCase().includes("horror") || g?.name?.toLowerCase().includes("terror"));

    const [action, comedy, horror] = await Promise.all([
      actionGenre ? getMoviesByGenre(actionGenre.id, language) : null,
      comedyGenre ? getMoviesByGenre(comedyGenre.id, language) : null,
      horrorGenre ? getMoviesByGenre(horrorGenre.id, language) : null,
    ]);

    actionMovies = action?.results || [];
    comedyMovies = comedy?.results || [];
    horrorMovies = horror?.results || [];
  } catch (error) {
    console.error("TMDB fetch error:", error);
  }

  if (!trending.length) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
        <h1 className="mb-4 text-3xl font-bold text-[#FF4D4D]">CinéWorld</h1>
        <p className="text-[#9CA3AF]">
          Impossible de charger les films. Vérifiez votre connexion internet et rafraîchissez la page.
        </p>
      </div>
    );
  }

  // Sélection aléatoire parmi les 5 premiers films tendances pour le Hero
  const topTrending = trending.slice(0, 5);
  const heroMovie = topTrending.length > 0 
    ? topTrending[Math.floor(Math.random() * topTrending.length)] 
    : trending[0];

  return (
    <div className="space-y-8">
      {heroMovie && <HeroSection movie={heroMovie} locale={locale} />}

      <div className="mx-auto max-w-7xl space-y-10 px-4 md:px-6">
        <MovieSection
          title="🔥 Tendance aujourd'hui"
          movies={trending}
          locale={locale}
        />

        <MovieSection
          title="🎬 À l'affiche"
          movies={nowPlayingResults}
          locale={locale}
          seeAllHref={`/${locale}/films`}
        />

        <MovieSection
          title="⭐ Films populaires"
          movies={popularResults}
          locale={locale}
        />

        {actionMovies.length > 0 && (
          <MovieSection
            title="💥 Action"
            movies={actionMovies}
            locale={locale}
            seeAllHref={`/${locale}/films?genre=28`}
          />
        )}

        {comedyMovies.length > 0 && (
          <MovieSection
            title="😂 Comédie"
            movies={comedyMovies}
            locale={locale}
            seeAllHref={`/${locale}/films?genre=35`}
          />
        )}

        {horrorMovies.length > 0 && (
          <MovieSection
            title="👻 Horreur"
            movies={horrorMovies}
            locale={locale}
            seeAllHref={`/${locale}/films?genre=27`}
          />
        )}
      </div>
    </div>
  );
}
