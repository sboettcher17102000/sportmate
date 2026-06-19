/**
 * Geocoding über OpenStreetMap/Nominatim (kostenlos, kein API-Key).
 *
 * Wandelt einen Orts-Text (z. B. "Gymnastikhalle Bildungscampus") in
 * Koordinaten um, damit Events auf der Kartenansicht als Pins erscheinen.
 *
 * Best-effort: Bei Fehler, Timeout oder ohne Treffer wird `null` geliefert –
 * das Event wird trotzdem gespeichert und taucht dann nur nicht als Pin auf.
 *
 * Nominatim-Nutzungsregeln: aussagekräftiger User-Agent ist Pflicht, max.
 * 1 Anfrage/Sekunde. Wir rufen die API nur beim Anlegen/Import von Events auf.
 */

export interface Coordinates {
  lat: number;
  lng: number;
}

const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search';
const USER_AGENT = 'SportMate/0.1 (Projektstudie Prototyp; hochschulsport-app)';
const TIMEOUT_MS = 5000;

export async function geocodeLocation(location: string): Promise<Coordinates | null> {
  const trimmed = location?.trim();
  if (!trimmed) return null;

  // Region-Bias auf Heilbronn, sofern nicht bereits im Text enthalten – die
  // Orte sind durchweg lokale Plätze, das macht die Treffer deutlich genauer.
  const query = /heilbronn/i.test(trimmed) ? trimmed : `${trimmed}, Heilbronn`;

  const params = new URLSearchParams({
    format: 'json',
    limit: '1',
    q: query,
  });

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const res = await fetch(`${NOMINATIM_URL}?${params.toString()}`, {
      headers: { 'User-Agent': USER_AGENT, Accept: 'application/json' },
      signal: controller.signal,
    });
    if (!res.ok) return null;

    const data = (await res.json()) as Array<{ lat?: string; lon?: string }>;
    const hit = data[0];
    if (!hit?.lat || !hit?.lon) return null;

    const lat = parseFloat(hit.lat);
    const lng = parseFloat(hit.lon);
    if (Number.isNaN(lat) || Number.isNaN(lng)) return null;

    return { lat, lng };
  } catch {
    // Netzwerkfehler / Timeout / Abort -> best-effort, kein Pin
    return null;
  } finally {
    clearTimeout(timeout);
  }
}
