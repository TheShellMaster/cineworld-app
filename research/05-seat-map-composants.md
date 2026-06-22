# Systèmes de Sélection de Sièges (Seat Map)

## 1. seatmap-canvas — LE FRAMEWORK DE RÉFÉRENCE
**Le plus mature et complet pour les seat maps**

- **URL:** https://github.com/AlinaBeltsova/seatmap-canvas (topic: seat-selection)
- **Stars:** 148
- **Dernière version:** v2.7.6 (avril 2026)
- **Licence:** MIT
- **Technologies:** TypeScript, d3.js, Canvas
- **Fonctionnalités:**
  - Multi-block layouts (plusieurs sections de salle)
  - Custom backgrounds (plan de salle personnalisé)
  - Event system pour les clics sur sièges
  - Zoom/pan
  - Sièges avec états (available, selected, booked, disabled)
  - Labels de rangées et colonnes
- **Wrappers:** React wrapper et Next.js wrapper (en phase de test)
- **Points forts:** Le plus complet, TypeScript natif, maintenu activement
- **Points faibles:** Wrappers React encore en beta, complexité d'intégration

**Utilité pour CinéWorld :** Référence pour l'architecture du seat map, mais on peut faire plus simple en custom.

---

## 2. Cinema-Seat-Booking (React + TailwindCSS + Vite)
**Implémentation simple et éducative**

- **URL:** https://github.com/ (topic seat-selection, 4 stars)
- **Stars:** 4
- **Technologies:** React, TailwindCSS, Vite
- **Fonctionnalités:**
  - Props-driven seat map component
  - Configuration par props (rows, cols, types)
  - Live deployment sur Vercel
- **Architecture:**
  ```jsx
  <SeatMap
    rows={8}
    cols={10}
    bookedSeats={["A1", "A2", "C5"]}
    seatTypes={{ A: "standard", F: "vip" }}
    onSelect={(seat) => handleSelect(seat)}
  />
  ```
- **Points forts:** Simple, React + Tailwind (notre stack !), facile à comprendre
- **Points faibles:** Très basique, pas de zoom/pan

**Utilité pour CinéWorld :** DIRECTEMENT APPLICABLE. Architecture prop-driven qu'on peut reproduire.

---

## 3. Android Jetpack Compose Cinema (35 stars)
**Référence design uniquement**

- **Technologies:** Kotlin, Jetpack Compose (Android natif)
- **Stars:** 35
- **Fonctionnalités:**
  - Seat selection multi-select component
  - Animated movie slider
  - Material Design cinema UI
- **Points forts:** Beau design, animations fluides
- **Points faibles:** Android natif, pas réutilisable en web

**Utilité pour CinéWorld :** Inspiration visuelle pour le design du seat map.

---

## 4. FVSeatsPicker (124 stars)
**Librairie iOS populaire**

- **Technologies:** Objective-C (iOS)
- **Stars:** 124
- **Points faibles:** iOS natif, pas pertinent pour le web

---

## 5. Notre approche recommandée pour CinéWorld

### Architecture du SeatMap Component (custom)

```typescript
// components/SeatMap.tsx
interface SeatMapProps {
  rows: number;
  cols: number;
  seatTypes: Record<string, 'standard' | 'premium' | 'vip' | 'couple'>;
  bookedSeats: string[];
  selectedSeats: string[];
  onSeatToggle: (seatId: string) => void;
  priceMultipliers: Record<string, number>;
}
```

### Design pattern inspiré des projets analysés :

1. **Grille CSS/Flexbox** (pas Canvas — plus simple, accessible, responsive)
2. **États des sièges :**
   - `available` → cliquable, couleur par type
   - `selected` → highlight, ajouté au panier
   - `booked` → grisé, non-cliquable
   - `disabled` → invisible (allées, espaces)
3. **Responsive :**
   - Desktop : grille centrée, sièges 40x40px
   - Mobile : scroll horizontal, sièges 36x36px min (touch-friendly)
4. **Temps réel :**
   - Supabase Realtime pour écouter les changements de `seat_map.booked`
   - Quand un autre user réserve → le siège passe en `booked` instantanément

### Palette de couleurs des sièges :

| Type | Couleur | Multiplicateur |
|------|---------|----------------|
| Standard | Gris clair (#6B7280) | x1.0 |
| Premium | Bleu (#3B82F6) | x1.5 |
| VIP | Or (#F59E0B) | x2.0 |
| Couple | Rose (#EC4899) | x1.8 |
| Réservé | Gris foncé (#374151) | - |
| Sélectionné | Vert (#10B981) | - |

---

## Librairies utiles complémentaires

| Librairie | Usage | npm |
|-----------|-------|-----|
| qrcode.react | QR code sur ticket | `qrcode.react` |
| html2canvas | Capture ticket en image | `html2canvas` |
| jsPDF | Export ticket PDF | `jspdf` |
| react-zoom-pan-pinch | Zoom sur seat map mobile | `react-zoom-pan-pinch` |
