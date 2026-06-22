"use client";

import { useTranslations } from "next-intl";
import { QrCode, Download, Calendar, Clock, MapPin, Film, User } from "lucide-react";
import Image from "next/image";
import { useRef } from "react";
import html2canvas from "html2canvas";
import { toast } from "react-hot-toast";
import type { Seat } from "./SeatSelector";

interface TicketProps {
  userName?: string;
  movieTitle: string;
  posterPath: string | null;
  cinemaName: string;
  roomName?: string;
  showtime: string;
  date: string;
  seats: Seat[];
  onClose: () => void;
}

export default function Ticket({ userName = "Utilisateur", movieTitle, posterPath, cinemaName, roomName = "Salle Standard", showtime, date, seats, onClose }: TicketProps) {
  const t = useTranslations("ticket");
  const ticketRef = useRef<HTMLDivElement>(null);

  // Format the seats for display
  const seatNumbers = seats.map(s => s.id).join(", ");
  const ticketNumber = Math.random().toString(36).substring(2, 10).toUpperCase();

  const handleDownload = async () => {
    if (!ticketRef.current) return;
    try {
      const canvas = await html2canvas(ticketRef.current, { backgroundColor: null, useCORS: true });
      const image = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = image;
      link.download = `CineWorld_Billet_${movieTitle.replace(/\s+/g, '_')}.png`;
      link.click();
    } catch (err) {
      console.error("Erreur téléchargement:", err);
      toast.error("Impossible de télécharger le billet.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 overflow-y-auto">
      <div className="flex flex-col items-center max-w-sm w-full gap-6 animate-in slide-in-from-bottom-8 duration-500 my-8">
        
        {/* Le Billet Physique */}
        <div ref={ticketRef} className="relative w-full bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col">
          {/* Header Image */}
          <div className="relative h-48 w-full bg-black">
            {posterPath ? (
              <Image 
                src={`https://image.tmdb.org/t/p/w500${posterPath}`} 
                alt={movieTitle}
                fill
                className="object-cover opacity-80"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-[#151B2B]">
                <Film className="w-12 h-12 text-[#374151]" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent"></div>
            <div className="absolute bottom-4 left-4 right-4">
              <h2 className="text-2xl font-black text-white leading-tight shadow-black drop-shadow-md">
                {movieTitle}
              </h2>
            </div>
          </div>

          {/* Découpe dentelée */}
          <div className="relative h-4 w-full flex overflow-hidden bg-white">
            <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-black/90 shadow-inner"></div>
            <div className="w-full border-t-2 border-dashed border-gray-300 mx-4 mt-2"></div>
            <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-black/90 shadow-inner"></div>
          </div>

          {/* Infos */}
          <div className="px-6 py-4 flex flex-col gap-4 bg-white text-black">
            {/* Nom Utilisateur */}
            <div className="flex items-start gap-3 border-b border-gray-100 pb-3">
              <User className="w-5 h-5 text-[#9CA3AF] flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Titulaire</p>
                <p className="font-bold text-gray-900">{userName}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-[#FF4D4D] flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Cinéma</p>
                <p className="font-bold text-gray-900">{cinemaName} <span className="text-gray-500 font-normal">({roomName})</span></p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Date</p>
                  <p className="font-bold text-gray-900">{date}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">{t("showtime")}</p>
                  <p className="font-bold text-gray-900">{showtime}</p>
                </div>
              </div>
            </div>

            <div className="bg-gray-100 rounded-xl p-4 flex flex-col items-center text-center mt-2">
              <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">{t("seat")}</p>
              <p className="text-xl font-black text-[#FF4D4D] tracking-widest">{seatNumbers}</p>
            </div>
          </div>

          {/* Footer QR Code */}
          <div className="px-6 pb-6 pt-2 bg-white flex items-center gap-4">
            <div className="w-20 h-20 bg-gray-100 rounded-lg p-2 flex-shrink-0 border border-gray-200">
              {/* Fake QR */}
              <QrCode className="w-full h-full text-black" />
            </div>
            <div className="flex flex-col justify-center">
              <p className="text-xs text-gray-500 font-mono mb-1">{t("ticketNumber")}</p>
              <p className="text-lg font-mono font-bold text-gray-900">{ticketNumber}</p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col w-full gap-3">
          <button
            onClick={handleDownload}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#FF4D4D] px-4 py-3.5 font-bold text-white transition-all hover:bg-[#e04444]"
          >
            <Download className="w-5 h-5" />
            {t("download")}
          </button>
          <button
            onClick={onClose}
            className="w-full flex items-center justify-center gap-2 rounded-xl border border-[#374151] bg-[#151B2B] px-4 py-3.5 font-bold text-[#F5F5F5] transition-all hover:bg-[#1E293B]"
          >
            Fermer
          </button>
        </div>

      </div>
    </div>
  );
}
