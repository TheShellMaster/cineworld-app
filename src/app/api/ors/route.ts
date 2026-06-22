import { NextRequest, NextResponse } from "next/server";

const ORS_BASE = "https://api.openrouteservice.org/v2/directions";
const ORS_KEY = process.env.ORS_API_KEY || "";

// Profils disponibles
type Profile = "driving-car" | "foot-walking" | "cycling-regular";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { fromLon, fromLat, toLon, toLat, profile = "driving-car" } = body;

    if (!fromLon || !fromLat || !toLon || !toLat) {
      return NextResponse.json(
        { error: "Paramètres manquants : fromLon, fromLat, toLon, toLat" },
        { status: 400 }
      );
    }

    const validProfiles: Profile[] = ["driving-car", "foot-walking", "cycling-regular"];
    if (!validProfiles.includes(profile)) {
      return NextResponse.json({ error: "Profil invalide" }, { status: 400 });
    }

    const res = await fetch(`${ORS_BASE}/${profile}`, {
      method: "POST",
      headers: {
        Authorization: ORS_KEY,
        "Content-Type": "application/json; charset=utf-8",
        Accept: "application/json",
      },
      body: JSON.stringify({
        coordinates: [
          [parseFloat(fromLon), parseFloat(fromLat)],
          [parseFloat(toLon), parseFloat(toLat)],
        ],
      }),
      // Cache 5 minutes pour économiser les requêtes ORS
      next: { revalidate: 300 },
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("ORS Error:", res.status, err);
      return NextResponse.json(
        { error: `ORS Error: ${res.status}` },
        { status: res.status }
      );
    }

    const data = await res.json();
    const summary = data?.routes?.[0]?.summary;

    if (!summary) {
      return NextResponse.json({ error: "Aucun itinéraire trouvé" }, { status: 404 });
    }

    return NextResponse.json({
      duration: Math.round(summary.duration), // secondes
      distance: Math.round(summary.distance), // mètres
      // Formatage lisible
      durationMin: Math.ceil(summary.duration / 60),
      distanceKm: (summary.distance / 1000).toFixed(1),
    });
  } catch (error) {
    console.error("ORS fetch error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
