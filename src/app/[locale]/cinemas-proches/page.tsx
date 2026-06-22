"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import {
  MapPin, Navigation, Search, Loader2, Car, Footprints,
  ExternalLink, MapIcon, RefreshCw, Film
} from "lucide-react";

// ── Types ──────────────────────────────────────────────────────────────
interface Cinema {
  id: string;
  name: string;
  lat: number;
  lon: number;
  distance: number; // km, ligne droite Haversine
  address: string;
}

interface RouteInfo {
  durationMin: number;
  distanceKm: string;
}

interface CinemaRoutes {
  driving?: RouteInfo | null;
  walking?: RouteInfo | null;
  loading: boolean;
}

// ── Helpers ────────────────────────────────────────────────────────────
function haversine(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function osmDirectionsUrl(
  fromLat: number, fromLon: number,
  toLat: number, toLon: number,
  mode: "car" | "foot"
) {
  const engine = mode === "car" ? "fossgis_osrm_car" : "fossgis_osrm_foot";
  return `https://www.openstreetmap.org/directions?engine=${engine}&route=${fromLat}%2C${fromLon}%3B${toLat}%2C${toLon}`;
}

function osmEmbedUrl(lat: number, lon: number, zoom = 13) {
  const delta = 0.05;
  const bbox = `${lon - delta},${lat - delta},${lon + delta},${lat + delta}`;
  return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat},${lon}`;
}

// ── Composant principal ────────────────────────────────────────────────
export default function CinemasProchesPage() {
  const { locale } = useParams<{ locale: string }>();
  const [cinemas, setCinemas] = useState<Cinema[]>([]);
  const [userLocation, setUserLocation] = useState<{ lat: number; lon: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchCity, setSearchCity] = useState("");
  const [routes, setRoutes] = useState<Record<string, CinemaRoutes>>({});
  const [showMap, setShowMap] = useState(false);

  // Fetch cinemas depuis Overpass (amélioration : nodes + ways + relations)
  const fetchCinemas = useCallback(async (lat: number, lon: number) => {
    setLoading(true);
    setError("");
    setRoutes({});
    try {
      const query = `
        [out:json][timeout:25];
        (
          node["amenity"="cinema"](around:15000,${lat},${lon});
          way["amenity"="cinema"](around:15000,${lat},${lon});
          relation["amenity"="cinema"](around:15000,${lat},${lon});
        );
        out center;
      `.trim();

      const res = await fetch(
        `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`
      );
      if (!res.ok) throw new Error("Overpass error");
      const data = await res.json();

      const results: Cinema[] = data.elements
        .map((el: {
          id: number;
          lat?: number;
          lon?: number;
          center?: { lat: number; lon: number };
          tags?: { name?: string; "addr:street"?: string; "addr:housenumber"?: string; "addr:city"?: string };
        }) => {
          const elLat = el.lat ?? el.center?.lat ?? 0;
          const elLon = el.lon ?? el.center?.lon ?? 0;
          if (!elLat || !elLon) return null;

          const street = el.tags?.["addr:street"] || "";
          const number = el.tags?.["addr:housenumber"] || "";
          const city = el.tags?.["addr:city"] || "";
          const address = [number, street, city].filter(Boolean).join(" ") || "";

          return {
            id: el.id.toString(),
            name: el.tags?.name || "Cinéma",
            lat: elLat,
            lon: elLon,
            distance: haversine(lat, lon, elLat, elLon),
            address,
          };
        })
        .filter(Boolean)
        .sort((a: Cinema, b: Cinema) => a.distance - b.distance);

      setCinemas(results);
      setShowMap(true);
    } catch {
      setError("Impossible de charger les cinémas. Vérifiez votre connexion.");
    }
    setLoading(false);
  }, []);

  // Géolocalisation navigateur
  function requestLocation() {
    if (!navigator.geolocation) {
      setError("Géolocalisation non supportée par votre navigateur.");
      return;
    }
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const loc = { lat: pos.coords.latitude, lon: pos.coords.longitude };
        setUserLocation(loc);
        fetchCinemas(loc.lat, loc.lon);
      },
      () => {
        setError("Géolocalisation refusée. Recherchez une ville manuellement.");
        setLoading(false);
      },
      { enableHighAccuracy: true }
    );
  }

  // Recherche par ville via Nominatim (OpenStreetMap, gratuit, sans clé)
  async function searchByCity() {
    if (!searchCity.trim()) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchCity)}&limit=1`,
        { headers: { "Accept-Language": locale || "fr" } }
      );
      const data = await res.json();
      if (data.length > 0) {
        const loc = { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) };
        setUserLocation(loc);
        fetchCinemas(loc.lat, loc.lon);
      } else {
        setError("Ville non trouvée. Essayez avec un nom différent.");
        setLoading(false);
      }
    } catch {
      setError("Erreur lors de la recherche.");
      setLoading(false);
    }
  }

  // Calcul itinéraire ORS pour un cinéma (voiture + pied)
  async function fetchRoutes(cinema: Cinema) {
    if (!userLocation) return;
    if (routes[cinema.id]?.driving !== undefined) return; // déjà calculé

    setRoutes((prev) => ({ ...prev, [cinema.id]: { loading: true } }));

    async function getRoute(profile: "driving-car" | "foot-walking") {
      try {
        const res = await fetch("/api/ors", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fromLon: userLocation!.lon,
            fromLat: userLocation!.lat,
            toLon: cinema.lon,
            toLat: cinema.lat,
            profile,
          }),
        });
        if (!res.ok) return null;
        return await res.json() as RouteInfo;
      } catch {
        return null;
      }
    }

    const [driving, walking] = await Promise.all([
      getRoute("driving-car"),
      getRoute("foot-walking"),
    ]);

    setRoutes((prev) => ({
      ...prev,
      [cinema.id]: { driving, walking, loading: false },
    }));
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-6 md:px-6">
      {/* ── En-tête ── */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FF4D4D]/10">
          <MapPin className="h-5 w-5 text-[#FF4D4D]" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-[#F5F5F5]">Cinémas à proximité</h1>
          <p className="text-xs text-[#9CA3AF]">
            Données OpenStreetMap · Itinéraires OpenRouteService
          </p>
        </div>
      </div>

      {/* ── Recherche ville ── */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CA3AF]" />
          <input
            id="city-search-input"
            type="text"
            value={searchCity}
            onChange={(e) => setSearchCity(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && searchByCity()}
            placeholder="Paris, Douala, Montréal, Madrid…"
            className="w-full rounded-xl border border-[#374151] bg-[#151B2B] py-3 pl-10 pr-4 text-sm text-[#F5F5F5] placeholder-[#9CA3AF] outline-none transition-colors focus:border-[#FF4D4D]"
          />
        </div>
        <button
          id="city-search-btn"
          onClick={searchByCity}
          disabled={loading}
          className="rounded-xl border border-[#374151] bg-[#151B2B] px-4 py-3 text-sm text-[#F5F5F5] transition-colors hover:bg-[#1E293B] disabled:opacity-50"
        >
          <Search className="h-4 w-4" />
        </button>
        <button
          id="geoloc-btn"
          onClick={requestLocation}
          disabled={loading}
          title="Utiliser ma position"
          className="flex items-center gap-2 rounded-xl bg-[#FF4D4D] px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-[#e04444] disabled:opacity-50"
        >
          <Navigation className="h-4 w-4" />
          <span className="hidden sm:inline">Ma position</span>
        </button>
      </div>

      {/* ── Invite initiale ── */}
      {!userLocation && !loading && !error && (
        <div className="flex flex-col items-center gap-4 rounded-2xl border border-[#374151] bg-[#151B2B] py-16 text-center">
          <MapIcon className="h-12 w-12 text-[#374151]" />
          <div className="space-y-1">
            <p className="font-medium text-[#F5F5F5]">Trouvez un cinéma près de chez vous</p>
            <p className="text-sm text-[#9CA3AF]">
              Utilisez votre position GPS ou recherchez une ville
            </p>
          </div>
          <button
            onClick={requestLocation}
            className="flex items-center gap-2 rounded-xl bg-[#FF4D4D] px-6 py-3 text-sm font-medium text-white hover:bg-[#e04444]"
          >
            <Navigation className="h-4 w-4" />
            Utiliser ma position
          </button>
        </div>
      )}

      {/* ── Loader ── */}
      {loading && (
        <div className="flex flex-col items-center justify-center gap-3 py-16">
          <Loader2 className="h-8 w-8 animate-spin text-[#FF4D4D]" />
          <p className="text-sm text-[#9CA3AF]">Recherche des cinémas…</p>
        </div>
      )}

      {/* ── Erreur ── */}
      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-red-600/30 bg-red-900/10 p-4 text-sm text-red-300">
          <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* ── Carte OSM + résultats ── */}
      {userLocation && !loading && (
        <div className="space-y-6">
          {/* Carte OpenStreetMap intégrée */}
          {showMap && (
            <div className="overflow-hidden rounded-2xl border border-[#374151] shadow-lg">
              <div className="flex items-center justify-between border-b border-[#374151] bg-[#151B2B] px-4 py-2">
                <span className="flex items-center gap-2 text-xs text-[#9CA3AF]">
                  <MapIcon className="h-3.5 w-3.5" />
                  Carte OpenStreetMap
                </span>
                <button
                  onClick={() => fetchCinemas(userLocation.lat, userLocation.lon)}
                  className="flex items-center gap-1 text-xs text-[#9CA3AF] hover:text-[#F5F5F5]"
                >
                  <RefreshCw className="h-3 w-3" />
                  Actualiser
                </button>
              </div>
              <iframe
                src={osmEmbedUrl(userLocation.lat, userLocation.lon)}
                className="h-64 w-full md:h-80"
                title="Carte OpenStreetMap"
                loading="lazy"
              />
            </div>
          )}

          {/* Compteur */}
          {cinemas.length > 0 && (
            <p className="text-sm text-[#9CA3AF]">
              <span className="font-medium text-[#F5F5F5]">{cinemas.length}</span> cinéma
              {cinemas.length > 1 ? "s" : ""} trouvé{cinemas.length > 1 ? "s" : ""} dans un rayon de 15 km
            </p>
          )}

          {cinemas.length === 0 && !loading && (
            <div className="flex flex-col items-center gap-3 rounded-2xl border border-[#374151] bg-[#151B2B] py-12 text-center">
              <MapPin className="h-10 w-10 text-[#374151]" />
              <p className="text-[#9CA3AF]">Aucun cinéma trouvé dans ce secteur</p>
              <p className="text-xs text-[#6B7280]">Essayez d&apos;élargir la zone de recherche</p>
            </div>
          )}

          {/* Liste des cinémas */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {cinemas.map((cinema) => {
              const route = routes[cinema.id];
              return (
                <div
                  key={cinema.id}
                  className="flex flex-col gap-3 rounded-2xl border border-[#374151] bg-[#151B2B] p-4 transition-colors hover:border-[#FF4D4D]/30"
                >
                  {/* Nom + adresse */}
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-[#FF4D4D]/10">
                      <MapPin className="h-4 w-4 text-[#FF4D4D]" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate font-semibold text-[#F5F5F5]">{cinema.name}</h3>
                      {cinema.address && (
                        <p className="mt-0.5 truncate text-xs text-[#9CA3AF]">{cinema.address}</p>
                      )}
                      {/* Distance ligne droite */}
                      <p className="mt-1 text-xs font-medium text-[#FF4D4D]">
                        à vol d&apos;oiseau : {cinema.distance.toFixed(1)} km
                      </p>
                    </div>
                  </div>

                  {/* Temps de trajet ORS */}
                  {route && !route.loading && (
                    <div className="flex gap-3">
                      {route.driving && (
                        <div className="flex flex-1 items-center gap-1.5 rounded-lg bg-[#0B0F19] px-3 py-2">
                          <Car className="h-3.5 w-3.5 text-[#9CA3AF]" />
                          <div>
                            <p className="text-xs font-semibold text-[#F5F5F5]">
                              {route.driving.durationMin} min
                            </p>
                            <p className="text-[10px] text-[#6B7280]">{route.driving.distanceKm} km</p>
                          </div>
                        </div>
                      )}
                      {route.walking && (
                        <div className="flex flex-1 items-center gap-1.5 rounded-lg bg-[#0B0F19] px-3 py-2">
                          <Footprints className="h-3.5 w-3.5 text-[#9CA3AF]" />
                          <div>
                            <p className="text-xs font-semibold text-[#F5F5F5]">
                              {route.walking.durationMin} min
                            </p>
                            <p className="text-[10px] text-[#6B7280]">{route.walking.distanceKm} km</p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {route?.loading && (
                    <div className="flex items-center gap-2 text-xs text-[#9CA3AF]">
                      <Loader2 className="h-3 w-3 animate-spin" />
                      Calcul de l&apos;itinéraire…
                    </div>
                  )}

                  {/* Boutons d'action */}
                  <div className="flex gap-2">
                    <a
                      href={`/${locale}/cinemas/${cinema.id}?name=${encodeURIComponent(cinema.name)}`}
                      className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-[#FF4D4D] px-3 py-2 text-xs font-bold text-white transition-colors hover:bg-[#e04444] shadow-[0_0_10px_rgba(255,77,77,0.3)] hover:shadow-[0_0_15px_rgba(255,77,77,0.5)]"
                    >
                      <Film className="h-3.5 w-3.5" />
                      Réserver
                    </a>
                    
                    {/* Bouton ORS — calcule les temps sur demande */}
                    {!route && (
                      <button
                        id={`route-btn-${cinema.id}`}
                        onClick={() => fetchRoutes(cinema)}
                        className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-[#374151] px-3 py-2 text-xs text-[#9CA3AF] transition-colors hover:border-[#FF4D4D]/40 hover:text-[#F5F5F5]"
                      >
                        <Car className="h-3.5 w-3.5" />
                        Trajet
                      </button>
                    )}

                    {/* Itinéraire voiture OSM */}
                    <a
                      href={osmDirectionsUrl(
                        userLocation.lat, userLocation.lon,
                        cinema.lat, cinema.lon,
                        "car"
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                      id={`osm-car-${cinema.id}`}
                      className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-[#374151] bg-[#151B2B] px-3 py-2 text-xs font-medium text-[#F5F5F5] transition-colors hover:bg-[#1E293B]"
                    >
                      <ExternalLink className="h-3 w-3" />
                      Naviguer
                    </a>
                  </div>

                  {/* Liens supplémentaires si itinéraire calculé */}
                  {route && !route.loading && (
                    <div className="flex gap-2 border-t border-[#374151]/50 pt-2">
                      <a
                        href={osmDirectionsUrl(userLocation.lat, userLocation.lon, cinema.lat, cinema.lon, "car")}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex flex-1 items-center justify-center gap-1 text-xs text-[#9CA3AF] hover:text-[#F5F5F5]"
                      >
                        <Car className="h-3 w-3" />
                        Voiture OSM
                      </a>
                      <a
                        href={osmDirectionsUrl(userLocation.lat, userLocation.lon, cinema.lat, cinema.lon, "foot")}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex flex-1 items-center justify-center gap-1 text-xs text-[#9CA3AF] hover:text-[#F5F5F5]"
                      >
                        <Footprints className="h-3 w-3" />
                        À pied OSM
                      </a>
                      <a
                        href={`https://maps.google.com/?saddr=${userLocation.lat},${userLocation.lon}&daddr=${cinema.lat},${cinema.lon}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex flex-1 items-center justify-center gap-1 text-xs text-[#9CA3AF] hover:text-[#F5F5F5]"
                      >
                        <MapPin className="h-3 w-3" />
                        Google Maps
                      </a>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
