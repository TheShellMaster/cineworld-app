# Recherche CinéWorld App — Juin 2026

Ce dossier contient toute la recherche effectuée avant le développement du projet CinéWorld.
Tout agent ou développeur travaillant sur ce projet DOIT lire ces fichiers pour comprendre le contexte.

## Fichiers

| # | Fichier | Contenu |
|---|---------|---------|
| 1 | [01-plateformes-commerciales.md](01-plateformes-commerciales.md) | BookMyShow, Fandango, Pathé — leur stack, architecture, features |
| 2 | [02-projets-open-source.md](02-projets-open-source.md) | 8 projets GitHub analysés — CineBook, ShowPulse, Reservita, etc. |
| 3 | [03-apis-gratuites.md](03-apis-gratuites.md) | TMDB, Watchmode, Overpass, ExchangeRate, OMDb, alternatives |
| 4 | [04-lecteurs-video-streaming.md](04-lecteurs-video-streaming.md) | Video.js, hls.js, Plyr, iframe embed — comparaison |
| 5 | [05-seat-map-composants.md](05-seat-map-composants.md) | seatmap-canvas, Cinema-Seat-Booking, notre architecture custom |
| 6 | [06-design-ui-ux.md](06-design-ui-ux.md) | Palette, typo, patterns UI, composants shadcn, responsive |
| 7 | [07-architecture-technique.md](07-architecture-technique.md) | Next.js+Supabase, Realtime, cache, sécurité, déploiement |

## Conclusion clé

**Aucun projet existant ne combine toutes nos features :**
- Réservation de billets + Streaming + API films en temps réel + Multilingue + Multi-devise + Géolocalisation

CinéWorld sera unique sur ce point. Les projets analysés servent de référence pour chaque module individuel.

## Stack technique retenue

- **Frontend:** Next.js 14+ (App Router) + TypeScript + Tailwind CSS + shadcn/ui
- **Backend/DB:** Supabase (Auth + PostgreSQL + Realtime)
- **APIs:** TMDB + Overpass + ExchangeRate + Watchmode
- **Streaming:** iframe embed (v1) → Video.js (v2)
- **Déploiement:** Vercel (free tier)
- **i18n:** next-intl (fr/en/es)
