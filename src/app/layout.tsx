import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "CinéWorld — Réservation de billets de cinéma",
  description: "Plateforme de réservation de billets de cinéma et streaming international",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
