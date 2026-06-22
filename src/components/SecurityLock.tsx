"use client";

import { useState, useEffect } from "react";
import { Lock, Fingerprint, KeyRound, ArrowRight, ShieldCheck } from "lucide-react";
import { toast } from "react-hot-toast";

interface SecurityLockProps {
  children: React.ReactNode;
  hasPinConfigured: boolean;
  pinCodeHash?: string | null;
  onUnlock?: () => void;
}

export default function SecurityLock({ children, hasPinConfigured, pinCodeHash, onUnlock }: SecurityLockProps) {
  const [isLocked, setIsLocked] = useState(hasPinConfigured);
  const [pinInput, setPinInput] = useState("");
  const [error, setError] = useState(false);

  // Pour la simulation locale, on stocke si l'app est déverrouillée dans la session
  useEffect(() => {
    if (hasPinConfigured) {
      const isUnlocked = sessionStorage.getItem("app_unlocked");
      if (isUnlocked === "true") {
        setIsLocked(false);
      }
    } else {
      setIsLocked(false);
    }
  }, [hasPinConfigured]);

  const handleUnlockSuccess = () => {
    setIsLocked(false);
    sessionStorage.setItem("app_unlocked", "true");
    if (onUnlock) onUnlock();
  };

  const handlePinSubmit = () => {
    // Si pas de hash côté serveur (simulation), on vérifie le PIN dans le localStorage ou on fait une simple comparaison
    // Pour cet exercice, si l'utilisateur a configuré un PIN, on simule une API locale
    const storedPin = localStorage.getItem("user_pin_code");
    
    if (storedPin && pinInput === storedPin) {
      handleUnlockSuccess();
    } else {
      setError(true);
      setPinInput("");
      setTimeout(() => setError(false), 500);
    }
  };

  const handleBiometricUnlock = async () => {
    try {
      // Simulation WebAuthn - demande l'autorisation biométrique du navigateur
      // Note: L'implémentation complète Passkeys nécessiterait un challenge serveur.
      // Ici, on invoque l'interface native si disponible, sinon on fait une simulation.
      if (window.PublicKeyCredential) {
        // En vrai, il faudrait utiliser navigator.credentials.get(...)
        // Pour la démo, si l'utilisateur a cliqué, on l'autorise (simulation d'empreinte réussie)
        handleUnlockSuccess();
      } else {
        toast.error("La biométrie n'est pas supportée sur cet appareil.");
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (!isLocked) {
    return <>{children}</>;
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#0B0F19] p-4 text-center">
      <div className="mb-8 flex h-24 w-24 items-center justify-center rounded-full bg-[#151B2B] ring-1 ring-[#374151] shadow-[0_0_40px_rgba(255,77,77,0.1)]">
        <Lock className="h-10 w-10 text-[#FF4D4D]" />
      </div>
      
      <h1 className="text-2xl font-bold text-[#F5F5F5]">Espace Sécurisé</h1>
      <p className="mt-2 text-[#9CA3AF]">
        Veuillez déverrouiller pour accéder à vos billets et paramètres.
      </p>

      <div className="mt-8 flex w-full max-w-xs flex-col gap-4">
        <div className="relative">
          <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#9CA3AF]" />
          <input
            type="password"
            maxLength={6}
            value={pinInput}
            onChange={(e) => {
              setPinInput(e.target.value);
              setError(false);
            }}
            onKeyDown={(e) => e.key === 'Enter' && handlePinSubmit()}
            placeholder="Code PIN"
            className={`w-full rounded-xl bg-[#151B2B] px-12 py-4 text-center text-xl font-bold tracking-[0.5em] text-[#F5F5F5] outline-none ring-1 transition-all focus:ring-[#FF4D4D] ${
              error ? "ring-red-500 animate-shake" : "ring-[#374151]"
            }`}
          />
          <button 
            onClick={handlePinSubmit}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg bg-[#FF4D4D] p-2 text-white hover:bg-[#e04444]"
          >
            <ArrowRight className="h-5 w-5" />
          </button>
        </div>

        <div className="flex items-center gap-4 my-2">
          <div className="h-px flex-1 bg-[#374151]"></div>
          <span className="text-xs font-medium text-[#9CA3AF] uppercase">OU</span>
          <div className="h-px flex-1 bg-[#374151]"></div>
        </div>

        <button
          onClick={handleBiometricUnlock}
          className="flex w-full items-center justify-center gap-3 rounded-xl border border-[#374151] bg-[#151B2B] py-4 text-sm font-bold text-[#F5F5F5] transition-colors hover:bg-[#1F2937]"
        >
          <Fingerprint className="h-6 w-6 text-blue-400" />
          Utiliser l'empreinte digitale
        </button>
      </div>
    </div>
  );
}
