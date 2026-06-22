# Architecture Technique de Référence

## 1. Pattern Next.js + Supabase (notre stack)

### Architecture globale

```
┌─────────────────────────────────────────────────────┐
│                    FRONTEND                          │
│          Next.js 14+ (App Router, TypeScript)       │
│   ┌─────────────┐  ┌──────────┐  ┌──────────────┐  │
│   │  Pages/UI   │  │  Hooks   │  │  Components  │  │
│   │  (RSC+Client)│  │(useAuth, │  │(SeatMap,Card,│  │
│   │             │  │useBooking)│  │TicketPreview)│  │
│   └─────────────┘  └──────────┘  └──────────────┘  │
└───────────────┬────────────────────┬────────────────┘
                │                    │
    ┌───────────▼──────┐   ┌────────▼─────────┐
    │  Next.js API      │   │  Client-side     │
    │  Routes (proxy)   │   │  Supabase SDK    │
    │  /api/tmdb        │   │  (auth, DB,      │
    │  /api/overpass    │   │   realtime)      │
    │  /api/exchange    │   │                  │
    └───────┬──────────┘   └────────┬─────────┘
            │                       │
  ┌─────────▼──────────┐  ┌────────▼─────────┐
  │  APIs EXTERNES     │  │    SUPABASE      │
  │  - TMDB            │  │  - Auth          │
  │  - Overpass/OSM    │  │  - PostgreSQL    │
  │  - ExchangeRate    │  │  - Realtime      │
  │  - Watchmode       │  │  - Storage (opt) │
  └────────────────────┘  └──────────────────┘
```

### Pourquoi Next.js API Routes comme proxy ?

1. **Sécurité :** Les clés API (TMDB, Watchmode, ExchangeRate) ne sont jamais exposées au client
2. **Cache :** `revalidate` sur les routes pour respecter les quotas API
3. **CORS :** Pas de problèmes cross-origin puisque tout passe par notre domaine

---

## 2. Pattern Supabase Realtime pour Seat Locking

### Le problème
Deux utilisateurs sélectionnent le même siège en même temps → conflit.

### Solutions observées dans les projets analysés

| Projet | Solution | Technologie |
|--------|----------|-------------|
| CineBook | Rooms Socket.IO | Socket.IO |
| Enterprise | WebSocket + Redis TTL | Redis |
| BookMyShow | Redis TTL 15min | Redis |

### Notre solution : Supabase Realtime + Presence

```typescript
// Quand un user sélectionne un siège
const channel = supabase.channel(`showtime:${showtimeId}`)

// Écouter les sièges pris par d'autres
channel.on('postgres_changes', {
  event: 'UPDATE',
  schema: 'public',
  table: 'showtimes',
  filter: `id=eq.${showtimeId}`
}, (payload) => {
  // Mettre à jour le seat map en temps réel
  updateBookedSeats(payload.new.seat_map.booked)
})

// Presence pour voir qui est sur la page
channel.on('presence', { event: 'sync' }, () => {
  const state = channel.presenceState()
  // Afficher "3 personnes consultent cette séance"
})

channel.subscribe()
```

### Timer de réservation (inspiré BookMyShow)
- L'utilisateur a **10 minutes** pour compléter le paiement
- Passé ce délai, les sièges sont libérés automatiquement
- Implémentation : timestamp en DB + cron Supabase Edge Function ou vérification client-side

---

## 3. Pattern de cache pour les APIs à quota limité

```typescript
// app/api/exchange-rate/route.ts
export const revalidate = 3600; // Cache 1 heure

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const base = searchParams.get('base') || 'USD';
  
  const res = await fetch(
    `https://v6.exchangerate-api.com/v6/${process.env.EXCHANGERATE_API_KEY}/latest/${base}`,
    { next: { revalidate: 3600 } } // ISR cache
  );
  
  return Response.json(await res.json());
}
```

**Budget API mensuel :**
- ExchangeRate: 1500 req → avec cache 1h = ~720 req/mois max (OK)
- Watchmode: 2500 req → avec cache par film = dépend du trafic
- TMDB: Illimité pratiquement
- Overpass: Illimité mais lent → cache côté client (localStorage)

---

## 4. Structure de données Supabase (optimisée)

### Relations

```
auth.users (géré par Supabase)
    ├── profiles (1:1)
    ├── bookings (1:N)
    │       └── showtimes (N:1)
    └── fake_payment_methods (1:N)
```

### Indexes recommandés

```sql
-- Pour la recherche de séances par film+cinéma
CREATE INDEX idx_showtimes_movie_cinema 
  ON showtimes(tmdb_movie_id, cinema_osm_id);

-- Pour les réservations par utilisateur
CREATE INDEX idx_bookings_user 
  ON bookings(user_id, created_at DESC);

-- Pour le ticket unique
CREATE UNIQUE INDEX idx_bookings_ticket 
  ON bookings(ticket_number);
```

---

## 5. Pattern i18n avec next-intl

```
app/
└── [locale]/
    ├── layout.tsx        (provider next-intl)
    ├── page.tsx          (accueil)
    └── films/
        ├── page.tsx
        └── [id]/page.tsx

middleware.ts             (détection locale + redirect)
i18n.ts                   (config next-intl)
messages/
├── fr.json
├── en.json
└── es.json
```

### Double source de traduction :
1. **Interface (next-intl):** Boutons, labels, messages → fichiers JSON
2. **Contenu films (TMDB):** Titres, synopsis → paramètre `language` de l'API

---

## 6. Déploiement Vercel (gratuit)

```
Vercel Free Tier:
├── Bandwidth: 100GB/mois
├── Serverless Functions: 100GB-hours/mois
├── Edge Functions: 500K invocations/mois
├── Build: 6000 min/mois
├── Preview deployments: illimités
└── Domains custom: 50
```

**Optimisations pour rester dans le free tier :**
- ISR (Incremental Static Regeneration) pour les pages populaires
- Cache agressif sur les API routes
- Images optimisées via next/image (automatic WebP/AVIF)
- Lazy loading systématique

---

## 7. Sécurité (checklist)

| Risque | Mitigation |
|--------|-----------|
| Clés API exposées | API routes proxy (server-side only) |
| XSS | React escape natif + sanitize inputs |
| SQL Injection | Supabase SDK paramétré (pas de raw SQL client) |
| Auth bypass | Middleware Next.js + RLS Supabase |
| Données bancaires | JAMAIS stockées (simulation, 4 derniers chiffres only) |
| CORS | API routes same-origin |
| Rate limiting | Vercel Edge + cache |

---

## 8. Comparaison avec les projets analysés

| Feature | CineBook | Enterprise | Reservita | **CinéWorld** |
|---------|----------|-----------|-----------|---------------|
| Framework | React+Vite | React+Vite | Next.js | **Next.js 14** |
| DB | Convex | MongoDB | Supabase | **Supabase** |
| Realtime | Socket.IO | Socket.IO | ❌ | **Supabase RT** |
| Auth | Custom | JWT | Supabase | **Supabase** |
| Films API | ❌ (mock) | ❌ (mock) | ❌ | **TMDB** |
| Cinémas | ❌ (mock) | ❌ (mock) | ❌ | **Overpass** |
| Streaming | ❌ | ❌ | ❌ | **✅ iframe** |
| i18n | ❌ | ❌ | ❌ | **✅ 3 langues** |
| Multi-devise | ❌ | ❌ | ❌ | **✅** |
| Géolocalisation | ❌ | ❌ | ❌ | **✅** |
| Déploiement | Vercel | Docker | ❌ | **Vercel** |

**CinéWorld est le SEUL projet qui combine toutes ces features.**
