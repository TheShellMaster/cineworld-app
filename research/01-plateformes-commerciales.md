# Plateformes Commerciales de Réservation de Cinéma

## 1. BookMyShow (Inde — Leader mondial)

**Stack technique (source: GeeksforGeeks system design breakdown) :**
- Frontend: ReactJS
- Backend: Java / Spring Boot (microservices)
- Base de données: MySQL (données transactionnelles) + Cassandra (données à haute volumétrie)
- Cache: Redis (seat locking avec TTL)
- Message queue: RabbitMQ / Kafka (async workers)
- Recherche: Elasticsearch
- Déploiement: Docker, Kubernetes
- CDN pour assets statiques

**Fonctionnalités clés :**
- Réservation en temps réel avec verrouillage de sièges (Redis TTL ~10-15 min)
- Architecture microservices (auth, catalog, booking, payment, notification)
- REST API design pour chaque service
- Seat map interactif
- Paiement multi-gateway
- Notifications push + email

**Ce qu'on peut en tirer pour CinéWorld :**
- Le pattern de seat locking avec TTL est excellent (on peut le faire avec Supabase Realtime)
- L'architecture microservices est overkill pour nous, mais la séparation des concerns est bonne
- Le Redis TTL pour les sièges temporaires → on peut simuler avec Supabase Realtime Presence

---

## 2. Fandango (États-Unis)

**Stack (partiellement identifié) :**
- Frontend: React-based SPA
- Mobile: Apps natives iOS/Android
- Intégration avec Rotten Tomatoes (notation)
- Streaming via Vudu (maintenant Fandango at Home)

**Fonctionnalités clés :**
- Recherche de cinémas par géolocalisation
- Horaires en temps réel (via partenariats directs avec les cinémas)
- Achat de billets avec choix de sièges
- Bandes-annonces intégrées
- Programme de fidélité (VIP+)
- Streaming intégré dans le même écosystème

**Ce qu'on peut en tirer :**
- L'idée de combiner réservation + streaming dans une seule app (exactement notre concept)
- UX de recherche géolocalisée → notre page cinémas-proches

---

## 3. Pathé Gaumont / CGR / Kinepolis (Europe)

**Caractéristiques communes :**
- Apps mobiles natives + web responsive
- Plan de salle interactif avec types de sièges (standard, premium, IMAX, 4DX)
- Tarification dynamique (jour, horaire, type de séance)
- Cartes d'abonnement
- QR code sur billet dématérialisé

**Ce qu'on peut en tirer :**
- Le design des plans de salle avec catégories de sièges
- Le ticket QR code dématérialisé (notre feature exacte)
- La tarification par type de siège (notre multiplicateur standard/premium/VIP/couple)

---

## Architecture de référence (BookMyShow-like)

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Frontend   │────▶│  API Gateway │────▶│  Auth Service│
│   (React)    │     │              │     └──────────────┘
└──────────────┘     │              │────▶┌──────────────┐
                     │              │     │Catalog Service│
                     │              │     │  (films/API)  │
                     │              │────▶└──────────────┘
                     │              │     ┌──────────────┐
                     │              │────▶│Booking Service│
                     │              │     │(sièges/lock) │
                     │              │────▶└──────────────┘
                     │              │     ┌──────────────┐
                     └──────────────┘────▶│Payment Service│
                                          └──────────────┘
```

Pour CinéWorld (projet étudiant), on simplifie :
- Next.js API routes = notre "API Gateway"
- Supabase = Auth + DB + Realtime (remplace Redis pour le seat locking)
- TMDB = Catalog externe
