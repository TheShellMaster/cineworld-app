"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Mail, Lock, Loader2, LogIn, UserPlus, Eye, EyeOff, KeyRound } from "lucide-react";

export default function AuthForm() {
  const [isLogin, setIsLogin] = useState(true);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      if (isForgotPassword) {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/auth/callback`,
        });
        if (error) throw error;
        setMessage("Un lien de réinitialisation a été envoyé à votre adresse email.");
        setIsForgotPassword(false);
      } else if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        router.refresh();
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        
        if (data?.session) {
          // L'email n'a pas besoin d'être confirmé, connexion immédiate
          router.refresh();
        } else {
          // L'email doit être confirmé
          setMessage("Inscription réussie ! Veuillez vérifier votre boîte mail pour confirmer votre compte (vérifiez aussi les spams).");
          setIsLogin(true);
          setPassword(""); // On vide le mot de passe par sécurité
        }
      }
    } catch (err: any) {
      setError(err.message || "Une erreur est survenue.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-md rounded-2xl border border-[#374151] bg-[#151B2B] p-8 shadow-2xl">
      <h2 className="mb-6 text-center text-2xl font-bold text-[#F5F5F5]">
        {isForgotPassword ? "Mot de passe oublié" : isLogin ? "Connexion" : "Inscription"}
      </h2>

      {error && (
        <div className="mb-4 rounded-lg bg-red-500/10 p-3 text-sm text-red-500 border border-red-500/20">
          {error}
        </div>
      )}

      {message && (
        <div className="mb-4 rounded-lg bg-green-500/10 p-3 text-sm text-green-500 border border-green-500/20">
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-[#9CA3AF]">
            Email
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[#6B7280]" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-[#374151] bg-[#0B0F19] py-2.5 pl-10 pr-4 text-[#F5F5F5] placeholder-[#6B7280] focus:border-[#FF4D4D] focus:outline-none focus:ring-1 focus:ring-[#FF4D4D]"
              placeholder="votre@email.com"
              required
            />
          </div>
        </div>

        {!isForgotPassword && (
          <div>
            <label className="mb-1 block text-sm font-medium text-[#9CA3AF]">
              Mot de passe
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[#6B7280]" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-[#374151] bg-[#0B0F19] py-2.5 pl-10 pr-12 text-[#F5F5F5] placeholder-[#6B7280] focus:border-[#FF4D4D] focus:outline-none focus:ring-1 focus:ring-[#FF4D4D]"
                placeholder="••••••••"
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B7280] hover:text-[#F5F5F5] transition-colors"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            {isLogin && (
              <div className="mt-2 text-right">
                <button
                  type="button"
                  onClick={() => {
                    setIsForgotPassword(true);
                    setError(null);
                    setMessage(null);
                  }}
                  className="text-xs text-[#FF4D4D] hover:underline"
                >
                  Mot de passe oublié ?
                </button>
              </div>
            )}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#FF4D4D] py-2.5 font-semibold text-white transition-colors hover:bg-[#FF3333] disabled:opacity-50"
        >
          {loading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : isForgotPassword ? (
            <>
              <KeyRound className="h-5 w-5" /> Réinitialiser
            </>
          ) : isLogin ? (
            <>
              <LogIn className="h-5 w-5" /> Se connecter
            </>
          ) : (
            <>
              <UserPlus className="h-5 w-5" /> S'inscrire
            </>
          )}
        </button>

      </form>

      <div className="mt-6 text-center text-sm text-[#9CA3AF]">
        {isForgotPassword ? (
          <button
            type="button"
            onClick={() => {
              setIsForgotPassword(false);
              setError(null);
              setMessage(null);
            }}
            className="font-medium text-[#FF4D4D] hover:underline"
          >
            Retour à la connexion
          </button>
        ) : (
          <>
            {isLogin ? "Pas encore de compte ? " : "Déjà un compte ? "}
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                setError(null);
                setMessage(null);
              }}
              className="font-medium text-[#FF4D4D] hover:underline"
            >
              {isLogin ? "S'inscrire" : "Se connecter"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
