import { Seat } from "@/components/SeatSelector";

export interface UserProfile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  pin_code: string | null;
  webauthn_credentials: any;
  created_at: string;
}

export interface TicketData {
  id: string;
  user_id: string;
  cinema_id: string;
  cinema_name: string;
  movie_id: number;
  movie_title: string;
  poster_path?: string | null;
  showtime: string;
  show_date: string;
  room_name: string;
  seats: Seat[];
  total_price: number;
  created_at: string;
}
