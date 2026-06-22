"use client";

import { useState, useEffect } from "react";
import { Heart } from "lucide-react";
import { toast } from "react-hot-toast";
import { createClient } from "@/lib/supabase/client";

interface WatchlistButtonProps {
  movieId: number | string;
  movieTitle: string;
  posterPath?: string | null;
}

export default function WatchlistButton({ movieId, movieTitle, posterPath }: WatchlistButtonProps) {
  const [isSaved, setIsSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const supabase = createClient();

  useEffect(() => {
    async function checkStatus() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setLoading(false);
        return;
      }
      setUser(session.user);

      // Vérifier si le film est déjà dans la watchlist
      const { data } = await supabase
        .from("watchlist")
        .select("*")
        .eq("user_id", session.user.id)
        .eq("movie_id", movieId)
        .single();

      if (data) setIsSaved(true);
      setLoading(false);
    }
    checkStatus();
  }, [movieId, supabase]);

  async function toggleWatchlist(e: React.MouseEvent) {
    e.preventDefault(); // Pour éviter de déclencher un lien parent (ex: Link de MovieCard)
    
    if (!user) {
      toast.error("Vous devez être connecté pour ajouter un film à votre Watchlist.");
      return;
    }

    setLoading(true);

    try {
      if (isSaved) {
        await supabase
          .from("watchlist")
          .delete()
          .eq("user_id", user.id)
          .eq("movie_id", movieId);
        setIsSaved(false);
        toast.success("Film retiré de votre watchlist");
      } else {
        await supabase
          .from("watchlist")
          .insert([
            {
              user_id: user.id,
              movie_id: movieId,
              movie_title: movieTitle,
              poster_path: posterPath,
            },
          ]);
        setIsSaved(true);
      }
    } catch (err) {
      console.error("Erreur Watchlist:", err);
      toast.error("Une erreur est survenue lors de la sauvegarde.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={toggleWatchlist}
      disabled={loading}
      className={`flex h-10 w-10 items-center justify-center rounded-full bg-black/50 backdrop-blur-sm transition-all hover:scale-110 hover:bg-black/70 ${loading ? "opacity-50" : ""}`}
      title={isSaved ? "Retirer de la Watchlist" : "Ajouter à la Watchlist"}
    >
      <Heart
        className={`h-5 w-5 transition-colors ${
          isSaved ? "fill-[#FF4D4D] text-[#FF4D4D]" : "text-white"
        }`}
      />
    </button>
  );
}
