import { NextRequest, NextResponse } from "next/server";

const BASE_URL = "https://api.themoviedb.org/3";
const API_KEY = process.env.TMDB_API_KEY || "";

// Whitelist des endpoints autorisés (regex)
const ALLOWED = [
  /^\/genre\/movie\/list$/,
  /^\/trending\/movie\/day$/,
  /^\/movie\/now_playing$/,
  /^\/movie\/popular$/,
  /^\/movie\/top_rated$/,
  /^\/discover\/movie$/,
  /^\/search\/movie$/,
  /^\/movie\/\d+$/,
  /^\/movie\/\d+\/watch\/providers$/,
  /^\/movie\/\d+\/similar$/,
  /^\/movie\/\d+\/credits$/,
  /^\/movie\/\d+\/videos$/,
  /^\/configuration\/countries$/,
];

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const endpoint = searchParams.get("endpoint");

  if (!endpoint) {
    return NextResponse.json({ error: "endpoint parameter required" }, { status: 400 });
  }

  if (!ALLOWED.some((r) => r.test(endpoint))) {
    return NextResponse.json({ error: "Endpoint not allowed" }, { status: 403 });
  }

  // Passe tous les params reçus vers TMDB (sauf "endpoint"), ajoute la clé API
  const params = new URLSearchParams(searchParams);
  params.delete("endpoint");
  params.set("api_key", API_KEY);

  try {
    const res = await fetch(`${BASE_URL}${endpoint}?${params}`, {
      next: { revalidate: 300 },
    });
    if (!res.ok) {
      return NextResponse.json({ error: `TMDB ${res.status}` }, { status: res.status });
    }
    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Failed to fetch from TMDB" }, { status: 500 });
  }
}
