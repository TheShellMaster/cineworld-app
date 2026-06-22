"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { getImageUrl, Movie } from "@/lib/tmdb";
import { Clock, Calendar, ChevronRight } from "lucide-react";
import SeatSelector, { Seat } from "@/components/SeatSelector";
import CheckoutModal from "@/components/CheckoutModal";
import Ticket from "@/components/Ticket";
import { createBrowserClient } from "@supabase/ssr";

interface BookingFlowProps {
  cinemaId: string;
  cinemaName: string;
  movies: Movie[];
}

export default function BookingFlow({ cinemaId, cinemaName, movies }: BookingFlowProps) {
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [selectedShowtime, setSelectedShowtime] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  
  const showtimesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (selectedMovie && showtimesRef.current) {
      setTimeout(() => {
        showtimesRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  }, [selectedMovie]);
  
  // States for flow
  const [step, setStep] = useState<1 | 2 | 3>(1); // 1: Movie/Time, 2: Seats, 3: Checkout/Ticket
  const [seats, setSeats] = useState<Seat[]>([]);
  const [totalPrice, setTotalPrice] = useState(0);
  
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isTicketOpen, setIsTicketOpen] = useState(false);

  // Mock dates (today, tomorrow, etc)
  const dates = [
    { label: "Aujourd'hui", value: new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }) },
    { label: "Demain", value: new Date(Date.now() + 86400000).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }) }
  ];
  // Génération déterministe de séances avec salles assignées
  const getShowtimesForMovie = (movieId: number) => {
    const baseTimes = ["10:30", "13:15", "16:00", "19:45", "22:30"];
    const roomTypes = ["IMAX", "Standard", "Petite", "3D", "Standard"];
    
    return baseTimes.map((time, index) => {
      const roomIndex = (movieId + index) % 5;
      const roomName = `Salle ${roomIndex + 1}`;
      const roomType = roomTypes[roomIndex];
      return { time, roomName, roomType };
    });
  };

  const handleSeatsConfirm = (selectedSeats: Seat[], price: number) => {
    setSeats(selectedSeats);
    setTotalPrice(price);
    setIsCheckoutOpen(true);
  };

  const currentShowtimes = selectedMovie ? getShowtimesForMovie(selectedMovie.id) : [];
  const selectedShowtimeData = currentShowtimes.find(s => s.time === selectedShowtime);

// ...

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const [isSaving, setIsSaving] = useState(false);
  const [userName, setUserName] = useState("Utilisateur");

  const handlePaymentSuccess = async () => {
    if (!selectedMovie || !selectedShowtimeData || !selectedDate) return;
    
    try {
      setIsSaving(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        setUserName(session.user.user_metadata?.full_name || session.user.email || "Utilisateur");
        
        // Enregistrer en DB
        await supabase.from("tickets").insert({
          user_id: session.user.id,
          cinema_id: cinemaId,
          cinema_name: cinemaName,
          movie_id: selectedMovie.id,
          movie_title: selectedMovie.title,
          poster_path: selectedMovie.poster_path,
          showtime: selectedShowtime,
          show_date: selectedDate,
          room_name: selectedShowtimeData.roomName,
          seats: seats,
          total_price: totalPrice,
        });
      }
    } catch (e) {
      console.error("Failed to save ticket", e);
    } finally {
      setIsSaving(false);
      setIsCheckoutOpen(false);
      setIsTicketOpen(true);
    }
  };

  if (step === 1) {
    return (
      <div className="space-y-8 animate-in fade-in duration-500">
        <h2 className="text-2xl font-bold text-[#F5F5F5]">1. Choisissez un film à l'affiche</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {movies.map(movie => {
            const isSelected = selectedMovie?.id === movie.id;
            return (
              <div 
                key={movie.id}
                onClick={() => {
                  setSelectedMovie(movie);
                  setSelectedDate(dates[0].value);
                  setSelectedShowtime(null);
                }}
                className={`relative overflow-hidden rounded-2xl border-2 transition-all cursor-pointer bg-[#151B2B] flex flex-col ${
                  isSelected ? "border-[#FF4D4D] shadow-[0_0_20px_rgba(255,77,77,0.3)]" : "border-[#374151] hover:border-[#9CA3AF]"
                }`}
              >
                <div className="relative aspect-[2/3] w-full">
                  <Image 
                    src={getImageUrl(movie.poster_path)}
                    alt={movie.title}
                    fill
                    className="object-cover"
                  />
                  {isSelected && (
                    <div className="absolute inset-0 bg-[#FF4D4D]/20 flex items-center justify-center backdrop-blur-[2px]">
                      <div className="bg-[#FF4D4D] text-white px-4 py-2 rounded-full font-bold">
                        Sélectionné
                      </div>
                    </div>
                  )}
                </div>
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-[#F5F5F5] line-clamp-2">{movie.title}</h3>
                    <p className="text-xs text-[#9CA3AF] mt-1">Sortie : {movie.release_date}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {selectedMovie && (
          <div ref={showtimesRef} className="bg-[#151B2B] border border-[#374151] rounded-2xl p-6 mt-8 animate-in slide-in-from-bottom-4 scroll-mt-24">
            <h3 className="text-xl font-bold text-[#F5F5F5] mb-4">2. Choisissez votre séance</h3>
            
            <div className="space-y-6">
              {/* Dates */}
              <div className="flex flex-wrap gap-3">
                <Calendar className="w-5 h-5 text-[#9CA3AF] mt-1" />
                {dates.map(d => (
                  <button
                    key={d.value}
                    onClick={() => setSelectedDate(d.value)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      selectedDate === d.value 
                        ? "bg-[#FF4D4D] text-white" 
                        : "bg-[#1F2937] text-[#9CA3AF] hover:bg-[#374151]"
                    }`}
                  >
                    {d.label} ({d.value})
                  </button>
                ))}
              </div>

              {/* Showtimes */}
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-[#9CA3AF]" />
                  <span className="text-sm text-[#9CA3AF]">Horaires et salles disponibles</span>
                </div>
                <div className="flex flex-wrap gap-4 mt-2">
                  {currentShowtimes.map(st => (
                    <button
                      key={st.time}
                      onClick={() => setSelectedShowtime(st.time)}
                      className={`flex flex-col items-center px-5 py-3 rounded-xl border transition-all ${
                        selectedShowtime === st.time 
                          ? "bg-[#FF4D4D]/10 border-[#FF4D4D] ring-1 ring-[#FF4D4D]" 
                          : "bg-[#1F2937] border-[#374151] hover:border-[#9CA3AF]"
                      }`}
                    >
                      <span className={`text-lg font-bold font-mono ${selectedShowtime === st.time ? "text-[#FF4D4D]" : "text-[#F5F5F5]"}`}>
                        {st.time}
                      </span>
                      <span className="text-xs text-[#9CA3AF] mt-1">
                        {st.roomName}
                      </span>
                      <span className={`text-[10px] uppercase font-bold mt-1 px-2 py-0.5 rounded ${
                        st.roomType === "IMAX" ? "bg-blue-500/20 text-blue-400" :
                        st.roomType === "3D" ? "bg-purple-500/20 text-purple-400" :
                        "bg-[#374151] text-[#9CA3AF]"
                      }`}>
                        {st.roomType}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-8 flex justify-end">
              <button
                onClick={() => setStep(2)}
                disabled={!selectedShowtime}
                className="flex items-center gap-2 bg-[#FF4D4D] text-white px-6 py-3 rounded-xl font-bold transition-all hover:bg-[#e04444] disabled:opacity-50"
              >
                Valider la séance
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in slide-in-from-right-8 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#F5F5F5]">3. Choisissez vos places</h2>
          <p className="text-[#9CA3AF]">
            {selectedMovie?.title} • Le {selectedDate} à {selectedShowtime} • <span className="text-[#FF4D4D] font-medium">{selectedShowtimeData?.roomName} ({selectedShowtimeData?.roomType})</span>
          </p>
        </div>
        <button
          onClick={() => setStep(1)}
          className="text-sm text-[#9CA3AF] hover:text-[#F5F5F5] underline underline-offset-4"
        >
          Modifier la séance
        </button>
      </div>

      <SeatSelector 
        cinemaId={cinemaId} 
        roomType={selectedShowtimeData?.roomType || "Standard"} 
        onConfirm={handleSeatsConfirm} 
      />

      <CheckoutModal 
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        totalPrice={totalPrice}
        onSuccess={handlePaymentSuccess}
      />

      {isTicketOpen && selectedMovie && (
        <Ticket
          userName={userName}
          movieTitle={selectedMovie.title}
          posterPath={selectedMovie.poster_path}
          cinemaName={cinemaName}
          roomName={selectedShowtimeData?.roomName}
          date={selectedDate!}
          showtime={selectedShowtime!}
          seats={seats}
          onClose={() => {
            setIsTicketOpen(false);
            setStep(1);
            setSelectedMovie(null);
            setSelectedShowtime(null);
          }}
        />
      )}
    </div>
  );
}
