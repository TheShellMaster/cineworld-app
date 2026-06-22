import { createClient } from "@/lib/supabase/server";
import AuthForm from "@/components/AuthForm";
import SignOutButton from "@/components/SignOutButton";
import { Shield } from "lucide-react";
import DashboardClient from "./DashboardClient";
import BackButton from "@/components/BackButton";

export async function generateMetadata() {
  return {
    title: "Mon Profil | CinéWorld",
    description: "Gérez votre compte et votre watchlist sur CinéWorld",
  };
}

export default async function ProfilPage() {
  const supabase = await createClient();
  
  // Vérifier la session actuelle
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Si l'utilisateur n'est pas connecté, afficher le formulaire d'authentification
  if (!user) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 py-12">
        <div className="absolute top-20 left-4 z-10 md:top-24 md:left-8">
          <BackButton />
        </div>
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#151B2B] ring-1 ring-[#374151]">
            <Shield className="h-8 w-8 text-[#FF4D4D]" />
          </div>
          <h1 className="text-3xl font-bold text-[#F5F5F5]">Espace Membre</h1>
          <p className="mt-2 text-[#9CA3AF]">
            Connectez-vous pour sauvegarder vos films favoris et vos billets.
          </p>
        </div>
        <AuthForm />
      </div>
    );
  }

  // Si connecté, afficher le tableau de bord du profil
  return (
    <div className="mx-auto max-w-5xl px-4 py-10 md:px-6 relative">
      <div className="mb-4">
        <BackButton />
      </div>
      <div className="mb-8 flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
        <div className="flex items-center gap-4">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#FF4D4D] text-3xl font-bold text-white shadow-lg shadow-[#FF4D4D]/20">
            {user.email?.charAt(0).toUpperCase() || "U"}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#F5F5F5]">Mon Profil</h1>
            <p className="text-[#9CA3AF]">{user.email}</p>
          </div>
        </div>
        <SignOutButton />
      </div>

      <DashboardClient user={user} />
    </div>
  );
}
