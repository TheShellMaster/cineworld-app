"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface SplashScreenProps {
  onComplete: () => void;
}

export default function SplashScreen({ onComplete }: SplashScreenProps) {
  const [count, setCount] = useState(3);
  const [phase, setPhase] = useState<"bars" | "countdown" | "logo" | "done">("bars");

  const complete = useCallback(() => {
    setPhase("done");
    setTimeout(onComplete, 500);
  }, [onComplete]);

  useEffect(() => {
    // Les fonctions de son
    const isSoundEnabled = () => {
      try {
        return localStorage.getItem("cineworld_sound_enabled") !== "false";
      } catch (e) {
        return true;
      }
    };

    const playBeep = () => {
      if (!isSoundEnabled()) return;
      try {
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioContext) return;
        const ctx = new AudioContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = "sine";
        osc.frequency.setValueAtTime(800, ctx.currentTime);
        gain.gain.setValueAtTime(0.05, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
        osc.start();
        osc.stop(ctx.currentTime + 0.1);
      } catch (e) {}
    };

    const playImpact = () => {
      if (!isSoundEnabled()) return;
      try {
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioContext) return;
        const ctx = new AudioContext();
        
        // Fréquences pour un accord cinématique harmonieux et ouvert (Do majeur 9)
        const freqs = [261.63, 329.63, 392.00, 493.88, 587.33];
        
        // Gain principal pour l'accord
        const masterGain = ctx.createGain();
        masterGain.connect(ctx.destination);
        
        // Courbe de volume : Fade in doux (0.5s) puis long fade out (4s)
        masterGain.gain.setValueAtTime(0, ctx.currentTime);
        masterGain.gain.linearRampToValueAtTime(0.25, ctx.currentTime + 0.5);
        masterGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 4.0);
        
        // Filtre pour donner un effet d'ouverture (swell) puis de fermeture
        const filter = ctx.createBiquadFilter();
        filter.type = "lowpass";
        filter.frequency.setValueAtTime(400, ctx.currentTime);
        filter.frequency.linearRampToValueAtTime(2500, ctx.currentTime + 0.6);
        filter.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 4.0);
        filter.connect(masterGain);

        // On joue chaque note de l'accord
        freqs.forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const panner = ctx.createStereoPanner ? ctx.createStereoPanner() : null;
          
          // "triangle" donne un son plus doux et riche qu'un simple "sine"
          osc.type = "triangle"; 
          // Légère désynchronisation (detune) pour un son plus "large"
          osc.frequency.value = freq + (Math.random() * 2 - 1); 
          
          if (panner) {
            // Spatialisation stéréo (gauche/droite) pour l'ampleur
            panner.pan.value = (i % 2 === 0 ? 0.6 : -0.6); 
            osc.connect(panner);
            panner.connect(filter);
          } else {
            osc.connect(filter);
          }
          
          osc.start(ctx.currentTime);
          osc.stop(ctx.currentTime + 4.0);
        });
        
        // Ajout d'une note basse très grave pour la profondeur (sub-bass)
        const bassOsc = ctx.createOscillator();
        const bassGain = ctx.createGain();
        bassOsc.type = "sine";
        bassOsc.frequency.value = 65.41; // Do très grave
        bassGain.gain.setValueAtTime(0, ctx.currentTime);
        bassGain.gain.linearRampToValueAtTime(0.4, ctx.currentTime + 0.6);
        bassGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 4.0);
        bassOsc.connect(bassGain);
        bassGain.connect(ctx.destination);
        bassOsc.start(ctx.currentTime);
        bassOsc.stop(ctx.currentTime + 4.0);

      } catch (e) {}
    };

    // Démarre la cinématique automatiquement
    const t: ReturnType<typeof setTimeout>[] = [];
    t.push(setTimeout(() => { setPhase("countdown"); playBeep(); }, 600)); // 0.6s
    t.push(setTimeout(() => { setCount(2); playBeep(); }, 1600)); // 1.6s
    t.push(setTimeout(() => { setCount(1); playBeep(); }, 2600)); // 2.6s
    t.push(setTimeout(() => { setPhase("logo"); playImpact(); }, 3600)); // 3.6s
    t.push(setTimeout(() => complete(), 6500)); // 6.5s
    return () => t.forEach(clearTimeout);
  }, [complete]);

  if (phase === "done") return null;

  return (
    <AnimatePresence>
      <motion.div
        key="splash"
        initial={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
        className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden bg-[#080A10]"
      >
        {/* Film grain (texture SVG) */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='g'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23g)' opacity='1'/%3E%3C/svg%3E")`,
            backgroundRepeat: "repeat",
          }}
        />

        {/* Bandes cinématiques (letterbox) */}
        <motion.div
          className="absolute left-0 right-0 top-0 bg-black"
          initial={{ height: 0 }}
          animate={{ height: phase === "bars" ? 0 : "14vh" }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-0 left-0 right-0 bg-black"
          initial={{ height: 0 }}
          animate={{ height: phase === "bars" ? 0 : "14vh" }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
        />

        {/* Perforations de pellicule — gauche */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: phase !== "bars" ? 1 : 0 }}
          className="absolute left-3 top-0 flex h-full flex-col justify-around py-[14vh]"
        >
          {Array.from({ length: 7 }).map((_, i) => (
            <div
              key={i}
              className="h-5 w-[10px] rounded-[2px] border border-white/20 bg-black"
            />
          ))}
        </motion.div>

        {/* Perforations de pellicule — droite */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: phase !== "bars" ? 1 : 0 }}
          className="absolute right-3 top-0 flex h-full flex-col justify-around py-[14vh]"
        >
          {Array.from({ length: 7 }).map((_, i) => (
            <div
              key={i}
              className="h-5 w-[10px] rounded-[2px] border border-white/20 bg-black"
            />
          ))}
        </motion.div>

        {/* ── COUNTDOWN ── */}
        <AnimatePresence mode="wait">
          {phase === "countdown" && (
            <motion.div
              key={`count-${count}`}
              initial={{ opacity: 0, scale: 1.4 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.7 }}
              transition={{ duration: 0.18 }}
              className="relative flex items-center justify-center"
            >
              {/* Cercle animé SVG style pellicule */}
              <svg
                className="absolute h-52 w-52 -rotate-90"
                viewBox="0 0 120 120"
              >
                {/* Cercle fond */}
                <circle
                  cx="60" cy="60" r="54"
                  fill="none"
                  stroke="rgba(255,255,255,0.08)"
                  strokeWidth="1"
                />
                {/* Cercle intérieur */}
                <circle
                  cx="60" cy="60" r="46"
                  fill="none"
                  stroke="rgba(255,255,255,0.04)"
                  strokeWidth="0.5"
                />
                {/* Arc animé rouge */}
                <motion.circle
                  cx="60" cy="60" r="54"
                  fill="none"
                  stroke="#FF4D4D"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeDasharray="339.3"
                  initial={{ strokeDashoffset: 339.3 }}
                  animate={{ strokeDashoffset: 0 }}
                  transition={{ duration: 0.48, ease: "linear" }}
                />
              </svg>

              {/* Lignes de réticule */}
              <div className="absolute h-px w-44 bg-white/5" />
              <div className="absolute h-44 w-px bg-white/5" />
              <div className="absolute h-px w-24 bg-white/10" />
              <div className="absolute h-24 w-px bg-white/10" />

              {/* Croix centrale */}
              <div className="absolute h-3 w-px bg-white/30" />
              <div className="absolute h-px w-3 bg-white/30" />

              {/* Chiffre */}
              <span className="relative z-10 font-mono text-7xl font-extralight tracking-widest text-white">
                {count}
              </span>

              {/* Indicateurs de ticks */}
              {Array.from({ length: 12 }).map((_, i) => (
                <div
                  key={i}
                  className="absolute h-2 w-px origin-bottom bg-white/20"
                  style={{
                    transform: `rotate(${i * 30}deg) translateY(-96px)`,
                    transformOrigin: "50% 100%",
                  }}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── LOGO REVEAL ── */}
        <AnimatePresence>
          {phase === "logo" && (
            <motion.div
              key="logo"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
              className="text-center"
            >
              {/* Ligne décorative supérieure */}
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.4, delay: 0.1 }}
                className="mx-auto mb-6 h-px w-40 origin-left bg-[#FF4D4D]"
              />

              {/* Logo — les deux mots arrivent des côtés */}
              <div className="flex items-baseline justify-center gap-2 overflow-hidden">
                <motion.span
                  initial={{ x: -60, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.15, ease: "easeOut" }}
                  className="font-sans text-5xl font-bold tracking-[0.15em] text-white md:text-7xl"
                >
                  CINÉ
                </motion.span>
                <motion.span
                  initial={{ x: 60, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.15, ease: "easeOut" }}
                  className="font-sans text-5xl font-bold tracking-[0.15em] text-[#FF4D4D] md:text-7xl"
                >
                  WORLD
                </motion.span>
              </div>

              {/* Tagline */}
              <motion.p
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.6 }}
                className="mt-5 text-xs tracking-[0.4em] text-[#9CA3AF] uppercase"
              >
                Votre cinéma, partout dans le monde
              </motion.p>

              {/* Ligne décorative inférieure */}
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.4, delay: 0.1 }}
                className="mx-auto mt-6 h-px w-40 origin-right bg-[#FF4D4D]"
              />

              {/* Barre de chargement */}
              <motion.div className="mx-auto mt-8 h-px w-48 overflow-hidden rounded-full bg-white/10">
                <motion.div
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 1.4, delay: 0.3, ease: "easeInOut" }}
                  className="h-full origin-left bg-[#FF4D4D]"
                />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Coin bas-droit : petite mention */}
        {phase !== "bars" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.3 }}
            className="absolute bottom-[14vh] right-8 font-mono text-[10px] tracking-widest text-white"
          >
            CW-2026
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
