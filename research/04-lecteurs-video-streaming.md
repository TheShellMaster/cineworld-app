# Lecteurs Vidéo / Streaming Open-Source

## 1. Video.js — LE STANDARD
**Le lecteur vidéo open-source le plus populaire**

- **URL:** https://github.com/videojs/video.js
- **Stars:** 39,800+
- **Licence:** Apache 2.0
- **Technologies:** JavaScript vanilla, compatible tous frameworks
- **Fonctionnalités:**
  - Support HLS et DASH streaming natif
  - Plugins extensibles (sous-titres, quality selector, etc.)
  - CDN disponible pour embed rapide
  - Cross-platform (desktop, mobile, tablette)
  - Skinnable (thèmes personnalisables)
  - API complète pour contrôle programmatique
- **Intégration React:** `video-react` ou wrapper custom simple
- **Points forts:** Mature, stable, énorme communauté, bien documenté
- **Points faibles:** Un peu lourd si on veut juste un embed simple

**Utilité pour CinéWorld :** Si on veut un lecteur custom au lieu d'un iframe embed (vidsrc.to), Video.js est le choix solide.

---

## 2. hls.js — STREAMING HLS PUR
**Client HLS JavaScript haute performance**

- **URL:** https://github.com/video-dev/hls.js
- **Stars:** 15,000+
- **Dernière version:** v1.6.16 (avril 2026)
- **Licence:** Apache 2.0
- **Technologies:** TypeScript
- **Fonctionnalités:**
  - Lecture HLS (HTTP Live Streaming) en JavaScript pur
  - Adaptive bitrate streaming
  - Support sous-titres (WebVTT, CEA-608/708)
  - DRM via EME (Encrypted Media Extensions)
  - Faible latence streaming
- **Points forts:** Léger, performant, spécialisé HLS
- **Points faibles:** Uniquement HLS (pas DASH), nécessite un wrapper UI

**Utilité pour CinéWorld :** Si on a des sources HLS directes. Sinon, Video.js avec plugin HLS est plus simple.

---

## 3. Plyr — LECTEUR ÉLÉGANT
**Lecteur vidéo simple et beau**

- **Stars:** 26,000+
- **Licence:** MIT
- **Fonctionnalités:**
  - Design moderne out-of-the-box
  - Support HTML5 video, YouTube embed, Vimeo embed
  - Responsive, accessible
  - Léger (~16KB gzipped)
- **Points forts:** Le plus beau par défaut, très léger
- **Points faibles:** Moins de plugins que Video.js

---

## 4. Approche iframe embed (RETENU pour CinéWorld v1)
**Solution simple sans hébergement de contenu**

- **Concept:** Utiliser un fournisseur tiers qui agrège les sources
- **Format URL:**
  ```
  https://vidsrc.to/embed/movie/{tmdb_id}
  https://vidsrc.to/embed/tv/{tmdb_id}/{saison}/{episode}
  ```
- **Alternatives:**
  - vidsrc.xyz
  - 2embed.cc
  - autoembed.cc
- **Points forts:** Zéro infrastructure, contenu déjà disponible, multi-langue
- **Points faibles:** Services instables (changent de domaine), qualité variable, zone grise légale

**Recommandation pour CinéWorld :**
- V1 : iframe embed (rapide à implémenter, démo fonctionnelle)
- V2 : Video.js avec sources légitimes si le projet évolue vers le commercial

---

## 5. Supabase Realtime pour le "Now Watching"
**Pas un lecteur mais pertinent pour le streaming social**

- **URL:** https://supabase.com/docs/guides/realtime
- **Fonctionnalités Realtime:**
  - **Broadcast:** Envoyer des messages entre clients (chat pendant un film)
  - **Presence:** Voir qui est en ligne / qui regarde quoi
  - **Postgres Changes:** Écouter les changements en DB en temps réel
- **Utilité pour CinéWorld :** 
  - Présence temps réel pendant la sélection de sièges
  - Notification quand un siège est pris par quelqu'un d'autre

---

## Tableau comparatif

| Lecteur | Stars | Poids | HLS | DASH | Embed YT | Skin | Notre usage |
|---------|-------|-------|-----|------|----------|------|-------------|
| Video.js | 39.8k | ~150KB | ✅ | ✅ | Plugin | ✅ | V2 (custom) |
| hls.js | 15k | ~80KB | ✅ | ❌ | ❌ | ❌ | Spécialisé |
| Plyr | 26k | ~16KB | ❌ | ❌ | ✅ | ✅ | Bandes-annonces |
| iframe embed | - | 0KB | - | - | - | - | ✅ V1 (streaming) |

**Décision CinéWorld :**
- Bandes-annonces YouTube : embed YouTube natif (via TMDB videos endpoint)
- Streaming films complets : iframe vidsrc.to ou équivalent
- Évolution future : Video.js si on veut plus de contrôle
