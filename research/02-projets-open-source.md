# Projets Open-Source de Réservation de Cinéma (GitHub)

## 1. CineBook (Swarajbabu/movie-booking-app)
**Le plus complet et moderne**

- **Stack:** React 19 + Vite 7 (frontend), Node.js + Express 5 (backend), Convex (cloud DB), Socket.IO
- **Stars:** ~10+
- **Fonctionnalités:**
  - Real-time seat locking via Socket.IO rooms
  - Booking lifecycle complet (sélection → paiement → QR ticket)
  - Convex comme base de données cloud (stocke users, movies, theatres, showtimes, bookings)
  - QR code sur les tickets
- **Points forts:** Architecture temps réel, cycle de réservation complet
- **Points faibles:** Pas de streaming, pas d'intégration API externe (TMDB)
- **URL:** https://github.com/Swarajbabu/movie-booking-app

**Ce qu'on peut en tirer :**
- Pattern Socket.IO pour le seat locking → on utilisera Supabase Realtime à la place
- Structure du booking lifecycle (très proche de notre cahier des charges)

---

## 2. ShowPulse (Akash-298/fullstack-movie-booking-app)
**Le plus populaire (13 stars)**

- **Stack:** MERN (MongoDB, Express, React, Node.js), Material UI, JWT Auth, Redux
- **Stars:** 13
- **Fonctionnalités:**
  - Authentification JWT
  - Dashboard admin
  - Gestion des films/séances
  - Redux state management
  - Déploiement Netlify
- **Points forts:** Plus grande communauté, architecture MERN classique
- **Points faibles:** Pas de seat selection interactif, pas de streaming, design basique
- **URL:** https://github.com/Akash-298/fullstack-movie-booking-app

**Ce qu'on peut en tirer :**
- Structure de base MERN pour inspiration architecturale
- Pattern admin dashboard (pas dans notre scope immédiat mais utile plus tard)

---

## 3. Enterprise Cinema Booking Platform
**Le plus professionnel**

- **Stack:** MERN + TypeScript, Socket.IO, PayPal, Docker
- **Fonctionnalités:**
  - Real-time seat reservation via WebSockets
  - Timer de réservation 15 minutes
  - Paiement PayPal intégré
  - Architecture multi-tenant
  - Docker deployment
- **Points forts:** Architecture enterprise, TypeScript, timer de réservation
- **Points faibles:** Pas de streaming, complexité élevée
- **URL:** (enterprise-cinema-booking sur GitHub)

**Ce qu'on peut en tirer :**
- Timer 15 min pour libérer les sièges non payés → EXCELLENT pattern pour nous
- Architecture TypeScript propre

---

## 4. Movie Ticket Booking App (MERN + Stripe)

- **Stack:** React/TypeScript + Vite, Express/MongoDB, Stripe, shadcn/ui
- **Fonctionnalités:**
  - Interactive seat map avec visual theater layout
  - Paiement Stripe
  - Réservation atomique des sièges
  - Role-based access control
- **Points forts:** Utilise shadcn/ui (comme nous !), seat map interactif
- **Points faibles:** Petit projet, peu de stars
- **URL:** (movie-ticket-booking sur GitHub)

**Ce qu'on peut en tirer :**
- Implémentation seat map avec shadcn/ui → directement applicable
- Pattern de réservation atomique

---

## 5. Reservita (Next.js + Supabase)

- **Stack:** Next.js, Supabase (auth + DB), QR code generation
- **Fonctionnalités:**
  - Seat selection
  - QR code sur tickets
  - Supabase pour auth et stockage
- **Points forts:** MÊME STACK QUE NOUS (Next.js + Supabase) !
- **Points faibles:** Pas de streaming, pas d'intégration TMDB, projet petit
- **URL:** (reservita sur GitHub)

**Ce qu'on peut en tirer :**
- Référence directe pour l'intégration Next.js + Supabase pour un booking system
- Pattern QR code generation

---

## 6. MovieTix (React 19 + Vite + TailwindCSS)

- **Stack:** React 19, Vite, TailwindCSS, Node.js/Express 5, MongoDB
- **Fonctionnalités:**
  - Interactive seat selection avec réservation atomique
  - Multi-payment support
  - Role-based access control
- **Stars:** 2
- **Points forts:** Stack moderne (React 19, Tailwind)
- **Points faibles:** Très petit projet, peu de documentation

---

## 7. GGS Cinema Booking (Django/Python)

- **Stack:** Django, SQLite/PostgreSQL, déploiement Render
- **Fonctionnalités:**
  - Interactive seat reservation
  - Showtime selection
  - Admin panel
- **Points forts:** Simple, éducatif
- **Points faibles:** Python/Django (pas notre stack), très petit (3 stars)
- **URL:** (ggs-cinema sur GitHub)

---

## 8. Movie Reservation App (React + Express + MySQL)

- **Stack:** React, Express, MySQL
- **Fonctionnalités:**
  - Graphical seat selection system
  - Dual user modes (guest/registered)
  - End-to-end payment flow
- **Points forts:** Seat selection graphique complet
- **Points faibles:** Pas de streaming, pas d'APIs externes

---

## Tableau récapitulatif

| Projet | Stack | Seat Map | Realtime | Streaming | API Films | Notre utilité |
|--------|-------|----------|----------|-----------|-----------|---------------|
| CineBook | React+Convex+Socket.IO | ✅ | ✅ | ❌ | ❌ | ⭐⭐⭐⭐ |
| ShowPulse | MERN+Redux | ❌ | ❌ | ❌ | ❌ | ⭐⭐ |
| Enterprise | MERN+TS+Socket.IO | ✅ | ✅ | ❌ | ❌ | ⭐⭐⭐⭐ |
| Ticket Booking | MERN+Stripe+shadcn | ✅ | ❌ | ❌ | ❌ | ⭐⭐⭐ |
| Reservita | Next.js+Supabase | ✅ | ❌ | ❌ | ❌ | ⭐⭐⭐⭐⭐ |
| MovieTix | React19+Tailwind | ✅ | ❌ | ❌ | ❌ | ⭐⭐⭐ |

**Conclusion :** Aucun projet n'a TOUTES nos features (réservation + streaming + API externe + multilingue + multi-devise). CinéWorld sera unique en combinant tout.
