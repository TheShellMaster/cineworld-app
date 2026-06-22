# APIs Gratuites pour Données Films, Cinémas, Streaming

## 1. TMDB (The Movie Database) — RETENU POUR CINEWORLD
**Le standard de l'industrie pour les métadonnées de films**

- **URL:** https://developer.themoviedb.org/docs
- **Gratuit:** Oui, usage non-commercial, ~40 req/sec
- **Données:** Films, séries, acteurs, images, bandes-annonces, genres, tendances, recherche
- **Internationalisation:** Support multilingue natif (language=fr-FR, en-US, es-ES...)
- **Optimisation:** "Append to Response" pour réduire les appels API (combiner movie details + videos + credits en 1 appel)
- **Couverture:** 1M+ titres
- **Points forts:** Complet, rapide, bien documenté, multilingue natif
- **Points faibles:** Pas de données de streaming, pas de données de cinémas physiques

---

## 2. OMDb API (Open Movie Database)
**Alternative légère à TMDB**

- **URL:** https://www.omdbapi.com/
- **Gratuit:** Oui avec API key (tier gratuit limité)
- **Données:** Titre, plot, ratings (IMDb/Rotten Tomatoes/Metacritic), année, genre
- **Licence:** CC BY-NC 4.0 (restriction commerciale !)
- **Points forts:** Simple, inclut notes IMDb/Rotten Tomatoes
- **Points faibles:** Moins complet que TMDB, posters HD payants (Patreon), pas de multilingue
- **Utilité pour CinéWorld:** Backup ou complément pour les notes multi-sources

---

## 3. Streaming Availability API (Movie of the Night)
**Alternative à Watchmode pour la disponibilité streaming**

- **URL:** https://www.movieofthenight.com/about/api
- **Gratuit:** Tier gratuit disponible
- **Données:** Disponibilité streaming par pays (66 pays, 200,000+ titres)
- **Plateformes couvertes:** Netflix, Prime Video, Disney+, HBO Max, Apple TV+, etc.
- **Points forts:** Couverture géographique étendue (66 pays), données fraîches
- **Points faibles:** Limites du tier gratuit à vérifier

**Utilité pour CinéWorld :** Alternative sérieuse à Watchmode (2500 appels/mois) si on dépasse le quota.

---

## 4. Watchmode — RETENU POUR CINEWORLD
**Disponibilité streaming par pays**

- **URL:** https://api.watchmode.com/
- **Gratuit:** 2500 appels/mois, 3 pays, aucune CB
- **Données:** Plateformes de streaming disponibles par film et par région
- **Points forts:** Intégration directe avec TMDB IDs
- **Points faibles:** Quota limité (2500/mois), 3 pays max en gratuit

---

## 5. OpenStreetMap Overpass API — RETENU POUR CINEWORLD
**Cinémas physiques géolocalisés**

- **URL:** https://overpass-api.de/
- **Gratuit:** 100% gratuit, aucune inscription, aucune CB
- **Données:** POI (Points of Interest) dont cinémas, avec coordonnées GPS
- **Requête type:**
  ```
  [out:json];
  node["amenity"="cinema"](around:5000,{lat},{lon});
  out;
  ```
- **Points forts:** Mondial, gratuit, pas de clé API
- **Points faibles:** Peut être lent (instance publique partagée), données inégales selon les pays
- **Fallback:** Nominatim pour géocodage de villes

---

## 6. ExchangeRate API — RETENU POUR CINEWORLD
**Taux de change en temps réel**

- **URL:** https://www.exchangerate-api.com/
- **Gratuit:** 1500 req/mois, aucune CB
- **Données:** Taux de change pour toutes les devises
- **Points forts:** Simple, fiable, couvre toutes les devises
- **Points faibles:** 1500 req/mois → nécessite cache (revalidation 1h)

---

## 7. Nominatim (OpenStreetMap)
**Géocodage gratuit**

- **URL:** https://nominatim.openstreetmap.org/
- **Gratuit:** Oui (rate limit 1 req/sec)
- **Données:** Géocodage (adresse → coordonnées) et reverse géocodage
- **Utilité:** Fallback quand la géolocalisation navigateur est refusée

---

## Tableau récapitulatif des APIs

| API | Usage | Gratuit | Limite | Retenu |
|-----|-------|---------|--------|--------|
| TMDB | Films/séries/metadata | ✅ | ~40 req/sec | ✅ OUI |
| OMDb | Notes multi-sources | ✅ | Limité | ❌ Backup |
| Streaming Availability | Streaming par pays | ✅ | À vérifier | 🔄 Alternative |
| Watchmode | Streaming par pays | ✅ | 2500/mois | ✅ OUI |
| Overpass (OSM) | Cinémas géolocalisés | ✅ | Aucune | ✅ OUI |
| ExchangeRate | Devises | ✅ | 1500/mois | ✅ OUI |
| Nominatim | Géocodage | ✅ | 1 req/sec | ✅ OUI |
| Google Places | Cinémas (meilleur) | 💳 CB requise | $200/mois gratuit | ❌ Optionnel |
