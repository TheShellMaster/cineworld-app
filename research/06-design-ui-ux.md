# Designs UI/UX de Référence pour App Cinéma

## 1. Cinezy — Movie Ticket Booking App UI Kit (Figma)
**Kit complet dark-themed**

- **Plateforme:** Figma Community
- **Type:** UI Kit complet
- **Caractéristiques:**
  - Thème sombre (cohérent avec l'univers cinéma)
  - Écrans complets : accueil, catalogue, fiche film, seat selection, paiement, ticket
  - Composants réutilisables
  - Mobile-first design
- **Accès:** Figma Community (gratuit, inscription requise)

**Ce qu'on peut en tirer :** Référence visuelle directe pour notre thème sombre et nos écrans.

---

## 2. Movie Ticket Booking App — Figma Design (GitHub)
**Prototype 3 écrans essentiels**

- **URL:** GitHub (movie-ticket-booking-figma)
- **Écrans:**
  1. Réservation (choix film/cinéma/horaire)
  2. Sélection de sièges (grille interactive)
  3. Ticket mobile (QR code)
- **Style:** Dark mode, UI moderne
- **Figma prototype:** Accessible publiquement
- **Assets:** Icônes et éléments UI spécifiques cinéma

**Ce qu'on peut en tirer :** Les 3 écrans clés de notre parcours utilisateur, déjà designés.

---

## 3. Principes Design pour CinéWorld (synthèse de la recherche)

### Thème et palette

```
Fond principal     : #0B0F19 (quasi-noir bleuté)
Fond secondaire    : #151B2B (cartes, modales)
Fond tertiaire     : #1E293B (inputs, hover states)
Accent primaire    : #FF4D4D (rouge cinéma chaud)
Accent secondaire  : #FFD700 (or — notes/étoiles)
Accent succès      : #10B981 (vert — confirmations)
Texte principal    : #F5F5F5
Texte secondaire   : #9CA3AF
Border subtil      : #374151
```

### Typographie
- **Police:** Inter (via next/font — chargement optimisé)
- **Hiérarchie:**
  - H1: 2rem, bold (titres de page)
  - H2: 1.5rem, semibold (sections)
  - H3: 1.25rem, medium (sous-sections)
  - Body: 1rem, regular
  - Small: 0.875rem (métadonnées, légendes)

### Patterns UI récurrents dans les apps cinéma analysées

1. **Hero section :** Backdrop film en plein écran avec gradient overlay + titre + CTA
2. **Carrousels horizontaux :** Films par catégorie (snap scroll sur mobile)
3. **Cards films :** Poster ratio 2:3, titre, note avec étoile dorée, année
4. **Seat map :** Vue "écran" en haut (trapèze), grille de sièges en dessous
5. **Ticket :** Design "tearable" (effet de déchirure entre info et QR code)
6. **Bottom nav mobile :** 5 icônes (Home, Films, Cinémas, Streaming, Profil)
7. **Transitions :** Fade-in au scroll, slide pour les pages

### Inspirations spécifiques par écran

| Écran | Inspiration | Pattern |
|-------|-------------|---------|
| Accueil | Netflix + BookMyShow | Hero + carrousels par genre |
| Catalogue | TMDB website | Grille filtrable + pagination |
| Fiche film | IMDb mobile | Backdrop + poster side-by-side (desktop) |
| Cinémas proches | Google Maps | Carte + liste latérale |
| Seat selection | BookMyShow | Écran en haut + grille colorée |
| Paiement | Apple Pay UI | Clean, minimal, focus sécurité |
| Ticket | Billet réel | QR + tearable effect + couleurs du cinéma |

---

## 4. Composants shadcn/ui à utiliser

| Composant shadcn | Usage dans CinéWorld |
|------------------|---------------------|
| Button | CTAs (réserver, payer, etc.) |
| Card | MovieCard, CinemaCard |
| Dialog/Sheet | Modales confirmation, détails |
| Input | Formulaires auth, recherche, paiement |
| Select | Filtres (genre, langue, tri) |
| Tabs | Navigation dans fiche film |
| Badge | Genres, statuts |
| Avatar | Profil utilisateur |
| Skeleton | Loading states |
| Toast | Notifications (succès/erreur) |
| Carousel | Films par catégorie (si shadcn a) |

---

## 5. Responsive breakpoints (rappel)

```
Mobile first:
- < 640px  : 2 colonnes films, bottom nav, seat map scroll-x
- 640px+   : 3 colonnes films
- 768px+   : 4 colonnes, top nav apparaît
- 1024px+  : 5 colonnes, layout 2 colonnes fiche film
- 1280px+  : 6 colonnes, max-width container
```

---

## 6. Animations recommandées (légères)

- **Page transitions:** Fade 200ms
- **Cards hover:** Scale 1.02 + shadow
- **Seat selection:** Pulse animation sur sélection
- **Loading:** Skeleton shimmer
- **Ticket generation:** Confetti ou slide-up reveal
- **Bottom nav:** Active icon scale bounce

Librairie recommandée : `framer-motion` (intégration React native, performant)
