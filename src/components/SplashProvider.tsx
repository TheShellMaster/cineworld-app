"use client";

import { useState, useEffect } from "react";
import SplashScreen from "./SplashScreen";

const STORAGE_KEY = "cineworld_splash_seen";

export default function SplashProvider({ children }: { children: React.ReactNode }) {
  const [show, setShow] = useState<boolean>(true);

  // Plus de sessionStorage : l'animation se joue à chaque chargement
  function handleComplete() {
    setShow(false);
  }

  return (
    <>
      {show && <SplashScreen onComplete={handleComplete} />}
      {/* Les enfants sont rendus derrière le splash, pas de second flash */}
      <div
        style={{
          opacity: show ? 0 : 1,
          transition: "opacity 0.4s ease",
          // Garde le layout normal pendant le splash
          visibility: show ? "hidden" : "visible",
        }}
      >
        {children}
      </div>
    </>
  );
}
