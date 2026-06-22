"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import { Armchair, Check, X } from "lucide-react";

export type SeatType = "standard" | "premium" | "vip" | "couple";

export interface Seat {
  id: string;
  row: string;
  col: number;
  type: SeatType;
  price: number;
  isBooked: boolean;
}

interface SeatSelectorProps {
  cinemaId: string;
  roomType: string;
  onConfirm: (selectedSeats: Seat[], totalPrice: number) => void;
}

export default function SeatSelector({ cinemaId, roomType, onConfirm }: SeatSelectorProps) {
  const t = useTranslations("booking");
  
  // Générer une configuration de salle fictive et des prix uniques selon le cinéma et la salle
  const seats = useMemo(() => {
    // Hasher le cinemaId pour créer une base de prix déterministe
    const hash = cinemaId.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
    // Prix de base standard entre 7€ et 14€
    let baseStandardPrice = 7 + (hash % 8);
    
    // Majoration tarifaire selon le type de salle
    if (roomType === "IMAX") baseStandardPrice += 4;
    if (roomType === "3D") baseStandardPrice += 2;
    if (roomType === "Petite") baseStandardPrice -= 1;

    // Définir la géométrie de la salle
    let rowLetters = ["A", "B", "C", "D", "E", "F", "G", "H"];
    let seatsPerRow = 10;

    if (roomType === "IMAX") {
      rowLetters = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L"];
      seatsPerRow = 14;
    } else if (roomType === "Petite") {
      rowLetters = ["A", "B", "C", "D", "E"];
      seatsPerRow = 8;
    } else if (roomType === "3D") {
      rowLetters = ["A", "B", "C", "D", "E", "F", "G"];
      seatsPerRow = 12;
    }

    const allSeats: Seat[] = [];

    rowLetters.forEach((row, rowIndex) => {
      const isBackRows = rowIndex >= rowLetters.length - 2; // Couple seats
      const isMiddleRows = rowIndex >= Math.floor(rowLetters.length / 3) && rowIndex <= Math.floor(rowLetters.length * 2/3); // VIP/Premium

      for (let col = 1; col <= seatsPerRow; col++) {
        let type: SeatType = "standard";
        let price = baseStandardPrice;

        const isCenterCols = col >= Math.floor(seatsPerRow * 0.3) && col <= Math.ceil(seatsPerRow * 0.7);

        if (isBackRows) { 
          type = "couple";
          price = Math.round(baseStandardPrice * 2.2); 
        } else if (isMiddleRows && isCenterCols) { 
          type = "vip";
          price = Math.round(baseStandardPrice * 1.6);
        } else if (isMiddleRows) {
          type = "premium";
          price = Math.round(baseStandardPrice * 1.3);
        }

        // Simuler des sièges occupés
        const randomHash = (row.charCodeAt(0) * col * 17) % 100;
        const isBooked = randomHash < 30;

        allSeats.push({
          id: `${row}${col}`,
          row,
          col,
          type,
          price,
          isBooked,
        });
      }
    });
    return allSeats;
  }, [cinemaId, roomType]);

  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const handleSeatClick = (seat: Seat) => {
    if (seat.isBooked) return;
    
    setSelectedIds(prev => {
      if (prev.includes(seat.id)) {
        return prev.filter(id => id !== seat.id);
      } else {
        // Limiter à 10 places max
        if (prev.length >= 10) return prev;
        return [...prev, seat.id];
      }
    });
  };

  // Calculer les prix pour la légende (basé sur la même logique)
  const baseStandardPrice = useMemo(() => {
    const hash = cinemaId.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return 7 + (hash % 8);
  }, [cinemaId]);

  const prices = {
    standard: baseStandardPrice,
    premium: Math.round(baseStandardPrice * 1.3),
    vip: Math.round(baseStandardPrice * 1.6),
    couple: Math.round(baseStandardPrice * 2.2),
  };

  const selectedSeats = seats.filter(s => selectedIds.includes(s.id));
  const totalPrice = selectedSeats.reduce((sum, seat) => sum + seat.price, 0);

  const getTypeColor = (type: SeatType, isSelected: boolean, isBooked: boolean) => {
    if (isBooked) return "bg-[#374151] text-[#111827] cursor-not-allowed opacity-50";
    if (isSelected) return "bg-[#FF4D4D] text-white ring-2 ring-[#FF4D4D] ring-offset-2 ring-offset-[#0B0F19]";
    
    switch (type) {
      case "vip": return "bg-purple-500/20 text-purple-400 hover:bg-purple-500/40 border border-purple-500/50";
      case "premium": return "bg-blue-500/20 text-blue-400 hover:bg-blue-500/40 border border-blue-500/50";
      case "couple": return "bg-pink-500/20 text-pink-400 hover:bg-pink-500/40 border border-pink-500/50 w-full"; // Couple est plus grand visuellement dans la grille si on veut, mais ici c'est géré au niveau couleur
      default: return "bg-[#1F2937] text-[#9CA3AF] hover:bg-[#374151] border border-[#374151]";
    }
  };

  return (
    <div className="flex flex-col gap-8 rounded-2xl bg-[#151B2B] p-4 md:p-8 border border-[#374151]">
      {/* Légende */}
      <div className="flex flex-wrap justify-center gap-4 text-xs">
        <div className="flex items-center gap-2"><div className="w-4 h-4 rounded-t-lg bg-[#1F2937] border border-[#374151]"></div> {t("standard")} ({prices.standard}€)</div>
        <div className="flex items-center gap-2"><div className="w-4 h-4 rounded-t-lg bg-blue-500/20 border border-blue-500/50"></div> {t("premium")} ({prices.premium}€)</div>
        <div className="flex items-center gap-2"><div className="w-4 h-4 rounded-t-lg bg-purple-500/20 border border-purple-500/50"></div> {t("vip")} ({prices.vip}€)</div>
        <div className="flex items-center gap-2"><div className="w-4 h-4 rounded-t-lg bg-pink-500/20 border border-pink-500/50"></div> {t("couple")} ({prices.couple}€)</div>
        <div className="flex items-center gap-2"><div className="w-4 h-4 rounded-t-lg bg-[#374151] opacity-50"></div> {t("booked")}</div>
        <div className="flex items-center gap-2"><div className="w-4 h-4 rounded-t-lg bg-[#FF4D4D]"></div> {t("selected")}</div>
      </div>

      {/* L'Écran */}
      <div className="relative mt-8 mb-12">
        <div className="h-2 w-full rounded-full bg-gradient-to-r from-transparent via-[#FF4D4D]/50 to-transparent blur-[2px]"></div>
        <div className="absolute top-0 h-16 w-full bg-gradient-to-b from-[#FF4D4D]/10 to-transparent"></div>
        <p className="absolute top-4 w-full text-center text-xs tracking-[0.3em] text-[#9CA3AF]">ÉCRAN</p>
      </div>

      {/* La grille avec scroll natif fluide */}
      <div className="relative">
        {/* Ombres de dégradé pour indiquer le scroll possible */}
        <div className="pointer-events-none absolute bottom-0 left-0 top-0 z-10 w-8 bg-gradient-to-r from-[#151B2B] to-transparent md:hidden" />
        <div className="pointer-events-none absolute bottom-0 right-0 top-0 z-10 w-8 bg-gradient-to-l from-[#151B2B] to-transparent md:hidden" />
        
        <div className="overflow-x-auto pb-6 pt-2 overscroll-x-contain [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          <div className="min-w-[600px] flex flex-col gap-3 px-4 md:px-0">
          {["A", "B", "C", "D", "E", "F", "G", "H"].map(row => (
            <div key={row} className="flex justify-center items-center gap-2 md:gap-4">
              <span className="w-6 text-center font-mono text-sm text-[#6B7280]">{row}</span>
              <div className="flex gap-2">
                {seats.filter(s => s.row === row).map(seat => {
                  const isSelected = selectedIds.includes(seat.id);
                  // Créer une allée centrale
                  const isAisle = seat.col === 5;
                  
                  return (
                    <div key={seat.id} className={`flex ${isAisle ? "mr-6" : ""}`}>
                      <button
                        onClick={() => handleSeatClick(seat)}
                        disabled={seat.isBooked}
                        className={`
                          relative flex h-8 w-8 md:h-10 md:w-10 flex-col items-center justify-center rounded-t-lg transition-all duration-200
                          ${getTypeColor(seat.type, isSelected, seat.isBooked)}
                          ${isSelected ? "scale-110 shadow-[0_0_15px_rgba(255,77,77,0.4)]" : "hover:-translate-y-1"}
                        `}
                      >
                        {seat.isBooked ? (
                          <X className="w-4 h-4" />
                        ) : (
                          <span className="text-[10px] md:text-xs font-medium">{seat.col}</span>
                        )}
                        {/* Accoudoirs */}
                        <div className="absolute -left-0.5 bottom-0 h-1/2 w-0.5 bg-black/20"></div>
                        <div className="absolute -right-0.5 bottom-0 h-1/2 w-0.5 bg-black/20"></div>
                      </button>
                    </div>
                  );
                })}
              </div>
              <span className="w-6 text-center font-mono text-sm text-[#6B7280]">{row}</span>
            </div>
          ))}
        </div>
      </div>
      </div>

      {/* Résumé */}
      <div className="mt-4 flex flex-col md:flex-row items-center justify-between gap-4 border-t border-[#374151] pt-6">
        <div>
          <p className="text-[#9CA3AF] mb-1">{selectedSeats.length > 0 ? "Vos places :" : "Aucune place sélectionnée"}</p>
          <div className="flex flex-wrap gap-2">
            {selectedSeats.map(seat => (
              <span key={seat.id} className="bg-[#1F2937] px-2 py-1 rounded text-xs text-[#F5F5F5] font-mono border border-[#374151]">
                {seat.id} <span className="text-[#9CA3AF]">({seat.price}€)</span>
              </span>
            ))}
          </div>
        </div>
        
        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <div className="text-right w-full md:w-auto">
            <p className="text-xs text-[#9CA3AF] uppercase tracking-wider">{t("total")}</p>
            <p className="text-2xl font-bold text-[#FF4D4D]">{totalPrice}€</p>
          </div>
          <button
            onClick={() => onConfirm(selectedSeats, totalPrice)}
            disabled={selectedSeats.length === 0}
            className="w-full md:w-auto bg-[#FF4D4D] text-white px-8 py-3 rounded-xl font-bold transition-all hover:bg-[#e04444] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {t("continue")}
          </button>
        </div>
      </div>
    </div>
  );
}
