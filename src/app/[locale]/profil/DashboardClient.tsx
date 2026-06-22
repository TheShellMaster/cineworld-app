"use client";

import { useState, useEffect } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { UserCircle, Heart, Clock, Settings, Shield, Upload, Check, Ticket as TicketIcon, Volume2, VolumeX } from "lucide-react";
import Image from "next/image";
import { toast } from "react-hot-toast";
import SecurityLock from "@/components/SecurityLock";
import Ticket from "@/components/Ticket";
import { TicketData } from "@/lib/types";

export default function DashboardClient({ user }: { user: any }) {
  const [activeTab, setActiveTab] = useState<"watchlist" | "history" | "settings" | "security">("watchlist");
  const [tickets, setTickets] = useState<TicketData[]>([]);
  const [watchlistItems, setWatchlistItems] = useState<any[]>([]);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(user.user_metadata?.avatar_url || null);
  const [uploading, setUploading] = useState(false);
  
  // Security states
  const [hasPin, setHasPin] = useState(false);
  const [pinSetup, setPinSetup] = useState("");
  const [savedPin, setSavedPin] = useState(false);
  
  // Settings states
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [fullName, setFullName] = useState(user.user_metadata?.full_name || "");
  const [isSavingName, setIsSavingName] = useState(false);
  
  const [selectedTicket, setSelectedTicket] = useState<TicketData | null>(null);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    // Check local PIN (simulation for MVP)
    const localPin = localStorage.getItem("user_pin_code");
    if (localPin) setHasPin(true);

    // Initialiser le réglage du son cinématique
    const soundSetting = localStorage.getItem("cineworld_sound_enabled");
    if (soundSetting === "false") {
      setSoundEnabled(false);
    }

    // Fetch tickets
    const fetchTickets = async () => {
      const { data } = await supabase
        .from("tickets")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      
      if (data) setTickets(data);
    };

    // Fetch watchlist
    const fetchWatchlist = async () => {
      const { data } = await supabase
        .from("watchlist")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      
      if (data) setWatchlistItems(data);
    };

    fetchTickets();
    fetchWatchlist();
  }, [user.id, supabase]);

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      if (!event.target.files || event.target.files.length === 0) return;
      
      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const filePath = `${user.id}-${Math.random()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(filePath);
      
      setAvatarUrl(publicUrl);
      
      // Update auth metadata
      await supabase.auth.updateUser({
        data: { avatar_url: publicUrl }
      });
      
      // Update profile table
      await supabase.from('profiles').upsert({
        id: user.id,
        avatar_url: publicUrl,
        full_name: user.user_metadata?.full_name || ''
      });

    } catch (error) {
      console.error("Erreur lors de l'upload", error);
      toast.error("Erreur lors du téléchargement de l'image.");
    } finally {
      setUploading(false);
    }
  };

  const handleSaveName = async () => {
    try {
      setIsSavingName(true);
      
      // Update auth metadata
      const { error: authError } = await supabase.auth.updateUser({
        data: { full_name: fullName }
      });
      if (authError) throw authError;
      
      // Update profile table
      const { error: profileError } = await supabase.from('profiles').upsert({
        id: user.id,
        avatar_url: avatarUrl,
        full_name: fullName
      });
      if (profileError) throw profileError;

      toast.success("Nom d'utilisateur mis à jour avec succès.");
    } catch (error) {
      console.error("Erreur mise à jour nom", error);
      toast.error("Erreur lors de la mise à jour du nom.");
    } finally {
      setIsSavingName(false);
    }
  };

  const handleSavePin = () => {
    if (pinSetup.length < 4) {
      toast.error("Le code PIN doit contenir au moins 4 chiffres.");
      return;
    }
    localStorage.setItem("user_pin_code", pinSetup);
    setHasPin(true);
    setSavedPin(true);
    setTimeout(() => setSavedPin(false), 3000);
  };

  const handleToggleSound = () => {
    const newVal = !soundEnabled;
    setSoundEnabled(newVal);
    localStorage.setItem("cineworld_sound_enabled", newVal ? "true" : "false");
    toast.success(newVal ? "Son de la cinématique activé" : "Son de la cinématique désactivé");
  };

  const renderTabContent = () => {
    if (activeTab === "history") {
      return (
        <div className="rounded-2xl border border-[#374151] bg-[#0B0F19] p-4 md:p-6">
          <h2 className="text-xl font-bold text-[#F5F5F5] mb-6 flex items-center gap-2">
            <Clock className="w-6 h-6 text-[#FF4D4D]" />
            Historique d'Achats
          </h2>
          
          {tickets.length === 0 ? (
            <div className="flex flex-col items-center py-12 text-center">
              <TicketIcon className="mb-4 h-12 w-12 text-[#374151]" />
              <p className="text-[#9CA3AF]">Vous n'avez pas encore acheté de billets.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {tickets.map(t => (
                <div key={t.id} className="bg-[#151B2B] border border-[#374151] rounded-xl p-4 flex gap-4">
                  <div className="flex-1">
                    <h3 className="font-bold text-[#F5F5F5] truncate">{t.movie_title}</h3>
                    <p className="text-sm text-[#9CA3AF] mt-1">{t.cinema_name} • {t.room_name}</p>
                    <p className="text-xs text-blue-400 mt-2 font-mono">{t.show_date} à {t.showtime}</p>
                  </div>
                  <div className="flex flex-col items-end justify-between">
                    <span className="text-[#FF4D4D] font-bold">{t.total_price}€</span>
                    <button 
                      onClick={() => setSelectedTicket(t)}
                      className="text-xs bg-[#374151] text-[#F5F5F5] px-3 py-1.5 rounded-lg hover:bg-[#4B5563]"
                    >
                      Voir billet
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }

    if (activeTab === "settings") {
      return (
        <div className="rounded-2xl border border-[#374151] bg-[#0B0F19] p-4 md:p-6">
          <h2 className="text-xl font-bold text-[#F5F5F5] mb-6 flex items-center gap-2">
            <Settings className="w-6 h-6 text-[#FF4D4D]" />
            Paramètres du profil
          </h2>
          
          <div className="flex flex-col md:flex-row items-center gap-8 bg-[#151B2B] p-6 rounded-xl border border-[#374151]">
            <div className="relative h-24 w-24 flex-shrink-0">
              {avatarUrl ? (
                <Image src={avatarUrl} alt="Avatar" fill className="rounded-full object-cover ring-2 ring-[#FF4D4D]" />
              ) : (
                <div className="flex h-24 w-24 items-center justify-center rounded-full bg-[#374151]">
                  <UserCircle className="h-12 w-12 text-[#9CA3AF]" />
                </div>
              )}
            </div>
            
            <div className="flex-1 text-center md:text-left">
              <h3 className="text-lg font-bold text-[#F5F5F5] mb-2">Informations personnelles</h3>
              <div className="flex flex-col md:flex-row gap-3 mb-4">
                <input 
                  type="text" 
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Votre nom complet"
                  className="bg-[#0B0F19] border border-[#374151] rounded-lg px-4 py-2 text-white outline-none focus:border-[#FF4D4D] w-full md:max-w-xs"
                />
                <button 
                  onClick={handleSaveName}
                  disabled={isSavingName || fullName === (user.user_metadata?.full_name || "")}
                  className="bg-[#374151] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#4B5563] transition-colors disabled:opacity-50"
                >
                  {isSavingName ? "Enregistrement..." : "Enregistrer le nom"}
                </button>
              </div>

              <div className="mt-4 pt-4 border-t border-[#374151]">
                <p className="text-sm text-[#9CA3AF] mb-3">Téléchargez une image pour personnaliser votre espace.</p>
                <label className="cursor-pointer inline-flex items-center gap-2 bg-[#FF4D4D] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#e04444] transition-colors">
                  <Upload className="w-4 h-4" />
                  {uploading ? "Chargement..." : "Choisir une image"}
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleAvatarUpload} 
                    disabled={uploading}
                    className="hidden" 
                  />
                </label>
              </div>
            </div>
          </div>

          <div className="mt-8 border-t border-[#374151] pt-6">
            <h3 className="text-lg font-bold text-[#F5F5F5] mb-2">Expérience de l'application</h3>
            <p className="text-sm text-[#9CA3AF] mb-4">Gérez les animations et le son de démarrage.</p>
            <div className="flex items-center justify-between bg-[#151B2B] p-4 rounded-lg border border-[#374151]">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${soundEnabled ? 'bg-[#FF4D4D]/20 text-[#FF4D4D]' : 'bg-[#374151] text-[#9CA3AF]'}`}>
                  {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
                </div>
                <div>
                  <p className="font-medium text-[#F5F5F5]">Son de la cinématique</p>
                  <p className="text-xs text-[#9CA3AF]">Jouer le son d'introduction au chargement</p>
                </div>
              </div>
              <button 
                onClick={handleToggleSound}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${soundEnabled ? 'bg-[#FF4D4D]' : 'bg-[#374151]'}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${soundEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>
          </div>

          <div className="mt-8 border-t border-[#374151] pt-6">
            <h3 className="text-lg font-bold text-red-500 mb-2">Zone de danger</h3>
            <p className="text-sm text-[#9CA3AF] mb-4">La suppression de votre compte entraînera la perte définitive de votre historique et de vos billets.</p>
            <button 
              onClick={() => {
                const confirm = window.confirm("Souhaitez-vous envoyer une demande de suppression à l'administrateur ?");
                if (!confirm) return;
                
                const adminEmail = "brayandjakoua@gmail.com";
                const subject = encodeURIComponent("Demande de suppression de compte CinéWorld");
                const body = encodeURIComponent(`Bonjour,\n\nJe demande la suppression définitive de mon compte CinéWorld.\n\nDétails du compte à supprimer :\n- ID Supabase : ${user.id}\n- Email : ${user.email}\n- Nom : ${user.user_metadata?.full_name || 'Non renseigné'}\n\nMerci de traiter cette demande.`);
                
                window.location.href = `mailto:${adminEmail}?subject=${subject}&body=${body}`;
              }}
              className="bg-red-500/10 text-red-500 border border-red-500/20 px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-500/20 transition-colors"
            >
              Demander la suppression du compte
            </button>
          </div>
        </div>
      );
    }

    if (activeTab === "security") {
      return (
        <div className="rounded-2xl border border-[#374151] bg-[#0B0F19] p-4 md:p-6">
          <h2 className="text-xl font-bold text-[#F5F5F5] mb-6 flex items-center gap-2">
            <Shield className="w-6 h-6 text-[#FF4D4D]" />
            Sécurité du compte
          </h2>
          
          <div className="bg-[#151B2B] border border-[#374151] rounded-xl p-6">
            <h3 className="font-bold text-[#F5F5F5] mb-2">Verrouillage de l'application</h3>
            <p className="text-sm text-[#9CA3AF] mb-6">Protégez l'accès à vos billets et informations avec un code PIN ou votre empreinte digitale.</p>
            
            {hasPin ? (
              <div className="flex items-center justify-between bg-green-500/10 border border-green-500/20 p-4 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                    <Check className="w-5 h-5 text-green-500" />
                  </div>
                  <div>
                    <p className="font-medium text-[#F5F5F5]">Sécurité activée</p>
                    <p className="text-xs text-green-400">Vos données sont protégées.</p>
                  </div>
                </div>
                <button 
                  onClick={() => {
                    localStorage.removeItem("user_pin_code");
                    setHasPin(false);
                  }}
                  className="text-sm text-red-400 hover:text-red-300 underline"
                >
                  Désactiver
                </button>
              </div>
            ) : (
              <div className="flex flex-col max-w-sm gap-4">
                <label className="text-sm text-[#F5F5F5]">Définissez un code PIN à 4 ou 6 chiffres :</label>
                <div className="flex gap-2">
                  <input 
                    type="password" 
                    maxLength={6}
                    value={pinSetup}
                    onChange={(e) => setPinSetup(e.target.value.replace(/[^0-9]/g, ''))}
                    className="flex-1 bg-[#0B0F19] border border-[#374151] rounded-lg px-4 py-2 text-white tracking-widest outline-none focus:border-[#FF4D4D]"
                    placeholder="****"
                  />
                  <button 
                    onClick={handleSavePin}
                    disabled={pinSetup.length < 4}
                    className="bg-[#FF4D4D] text-white px-4 py-2 rounded-lg font-medium disabled:opacity-50"
                  >
                    Activer
                  </button>
                </div>
              </div>
            )}
            
            <div className="mt-8 border-t border-[#374151] pt-6">
              <h3 className="font-bold text-[#F5F5F5] mb-2">Biométrie (Empreinte / FaceID)</h3>
              <p className="text-sm text-[#9CA3AF] mb-4">La biométrie s'active automatiquement sur la page de verrouillage si votre appareil est compatible (WebAuthn / Passkeys locaux).</p>
            </div>
          </div>
        </div>
      );
    }

    // Default: Watchlist
    return (
      <div className="rounded-2xl border border-[#374151] bg-[#0B0F19] p-4 md:p-6">
        <h2 className="text-xl font-bold text-[#F5F5F5] mb-6 flex items-center gap-2">
          <Heart className="w-6 h-6 text-[#FF4D4D]" />
          Ma Watchlist
        </h2>
        
        {watchlistItems.length === 0 ? (
          <div className="flex min-h-[300px] flex-col items-center justify-center rounded-xl border border-dashed border-[#374151] bg-[#151B2B]/50 p-8 text-center">
            <Heart className="mb-4 h-12 w-12 text-[#374151]" />
            <h3 className="text-lg font-medium text-[#F5F5F5]">Votre liste est vide</h3>
            <p className="mt-2 max-w-sm text-sm text-[#9CA3AF]">
              Explorez le catalogue et cliquez sur le cœur pour ajouter des films.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {watchlistItems.map((item) => (
              <div key={item.movie_id} className="group relative flex flex-col overflow-hidden rounded-lg bg-[#151B2B] transition-transform hover:scale-[1.02] hover:shadow-xl">
                <div className="relative aspect-[2/3] w-full overflow-hidden">
                  <Image
                    src={item.poster_path ? `https://image.tmdb.org/t/p/w342${item.poster_path}` : "/placeholder-movie.svg"}
                    alt={item.movie_title || "Film"}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex flex-1 flex-col gap-1 p-3">
                  <h3 className="line-clamp-2 text-sm font-medium text-[#F5F5F5]">
                    {item.movie_title}
                  </h3>
                  <button 
                    onClick={async () => {
                      await supabase.from('watchlist').delete().eq('id', item.id);
                      setWatchlistItems(prev => prev.filter(w => w.id !== item.id));
                    }}
                    className="mt-2 text-xs text-[#FF4D4D] hover:underline text-left"
                  >
                    Retirer
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <SecurityLock hasPinConfigured={hasPin}>
      <div className="grid gap-6 md:grid-cols-4">
        {/* Colonne latérale de navigation */}
        <div className="space-y-2 md:col-span-1 flex flex-row overflow-x-auto md:flex-col pb-4 md:pb-0 scrollbar-hide">
          <button 
            onClick={() => setActiveTab("watchlist")}
            className={`flex w-full min-w-fit items-center gap-3 rounded-xl px-4 py-3 text-left font-medium transition-colors ${activeTab === 'watchlist' ? 'bg-[#FF4D4D]/10 text-[#FF4D4D]' : 'text-[#9CA3AF] hover:bg-[#151B2B] hover:text-[#F5F5F5]'}`}
          >
            <Heart className="h-5 w-5" />
            <span className="hidden md:inline">Ma Watchlist</span>
            <span className="md:hidden">Favoris</span>
          </button>
          <button 
            onClick={() => setActiveTab("history")}
            className={`flex w-full min-w-fit items-center gap-3 rounded-xl px-4 py-3 text-left font-medium transition-colors ${activeTab === 'history' ? 'bg-[#FF4D4D]/10 text-[#FF4D4D]' : 'text-[#9CA3AF] hover:bg-[#151B2B] hover:text-[#F5F5F5]'}`}
          >
            <Clock className="h-5 w-5" />
            <span className="hidden md:inline">Historique d'Achats</span>
            <span className="md:hidden">Billets</span>
          </button>
          <button 
            onClick={() => setActiveTab("settings")}
            className={`flex w-full min-w-fit items-center gap-3 rounded-xl px-4 py-3 text-left font-medium transition-colors ${activeTab === 'settings' ? 'bg-[#FF4D4D]/10 text-[#FF4D4D]' : 'text-[#9CA3AF] hover:bg-[#151B2B] hover:text-[#F5F5F5]'}`}
          >
            <Settings className="h-5 w-5" />
            Paramètres
          </button>
          <button 
            onClick={() => setActiveTab("security")}
            className={`flex w-full min-w-fit items-center gap-3 rounded-xl px-4 py-3 text-left font-medium transition-colors ${activeTab === 'security' ? 'bg-[#FF4D4D]/10 text-[#FF4D4D]' : 'text-[#9CA3AF] hover:bg-[#151B2B] hover:text-[#F5F5F5]'}`}
          >
            <Shield className="h-5 w-5" />
            Sécurité
          </button>
        </div>

        {/* Contenu principal */}
        <div className="md:col-span-3">
          {renderTabContent()}
        </div>
      </div>

      {/* Modal Billet */}
      {selectedTicket && (
        <Ticket
          userName={user.user_metadata?.full_name || user.email || "Utilisateur"}
          movieTitle={selectedTicket.movie_title}
          posterPath={selectedTicket.poster_path || null}
          cinemaName={selectedTicket.cinema_name}
          roomName={selectedTicket.room_name}
          date={selectedTicket.show_date}
          showtime={selectedTicket.showtime}
          seats={selectedTicket.seats}
          onClose={() => setSelectedTicket(null)}
        />
      )}
    </SecurityLock>
  );
}
