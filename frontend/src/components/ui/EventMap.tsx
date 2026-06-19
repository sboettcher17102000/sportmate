import { useEffect, useMemo, useState } from 'react';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useNavigate } from 'react-router-dom';
import type { Event } from '../../types';
import { formatDate, formatTime, sportEmoji, sportBg } from './eventHelpers';

// Default-Mittelpunkt: Heilbronn (falls keine Pins vorhanden)
const HEILBRONN: [number, number] = [49.1427, 9.2109];

interface EventMapProps {
  events: Event[];
}

function hasCoords(e: Event): e is Event & { latitude: number; longitude: number } {
  return typeof e.latitude === 'number' && typeof e.longitude === 'number';
}

// Emoji-Pin als Leaflet-divIcon (umgeht das Default-Marker-Bundling-Problem)
function pinIcon(event: Event, active: boolean): L.DivIcon {
  return L.divIcon({
    className: 'pin-icon',
    html: `<div class="pin${active ? ' active' : ''}" style="background:${sportBg(event.sport)}">${sportEmoji(event.sport)}</div>`,
    iconSize: [44, 55],
    iconAnchor: [22, 55],
  });
}

// Passt den Kartenausschnitt auf alle Pins an (einmalig bzw. wenn sich die Events ändern)
function FitBounds({ points }: { points: [number, number][] }) {
  const map = useMap();
  useEffect(() => {
    if (points.length === 0) {
      map.setView(HEILBRONN, 13);
      return;
    }
    if (points.length === 1) {
      map.setView(points[0]!, 15);
      return;
    }
    map.fitBounds(points, { padding: [48, 48], maxZoom: 16 });
  }, [points, map]);
  return null;
}

export default function EventMap({ events }: EventMapProps) {
  const navigate = useNavigate();
  const [selected, setSelected] = useState<Event | null>(null);

  const located = useMemo(() => events.filter(hasCoords), [events]);
  const missing = events.length - located.length;

  // Stabile Punktliste -> FitBounds feuert nur bei echter Datenänderung, nicht bei Auswahl
  const points = useMemo<[number, number][]>(
    () => located.map((e) => [e.latitude, e.longitude] as [number, number]),
    [located]
  );

  // Auswahl zurücksetzen, wenn das gewählte Event nicht mehr in der Liste ist (z. B. nach Filter)
  useEffect(() => {
    if (selected && !located.some((e) => e.id === selected.id)) setSelected(null);
  }, [located, selected]);

  return (
    <div className="relative isolate h-[62vh] min-h-[420px] overflow-hidden card-pop p-0">
      <MapContainer
        center={HEILBRONN}
        zoom={13}
        scrollWheelZoom
        className="h-full w-full"
        style={{ background: '#EAF1EC' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FitBounds points={points} />
        {located.map((event) => (
          <Marker
            key={event.id}
            position={[event.latitude, event.longitude]}
            icon={pinIcon(event, selected?.id === event.id)}
            zIndexOffset={selected?.id === event.id ? 1000 : 0}
            eventHandlers={{ click: () => setSelected(event) }}
          />
        ))}
      </MapContainer>

      {missing > 0 && (
        <div className="absolute left-3 top-3 z-[1200] pill !text-[11px] !py-1" style={{ background: '#fff' }}>
          📍 {missing} ohne Standort
        </div>
      )}

      {located.length === 0 && (
        <div className="absolute inset-x-3 top-3 z-[1200] card-pop p-3 text-center text-sm font-bold text-ink-2">
          Keine Events mit Standort gefunden
        </div>
      )}

      {selected && (
        <button
          type="button"
          onClick={() => navigate(`/events/${selected.id}`)}
          className="peek text-left"
        >
          <div className="flex items-center gap-3">
            <span className="badge-pop !w-12 !h-12 !text-[22px]" style={{ background: sportBg(selected.sport) }}>
              {sportEmoji(selected.sport)}
            </span>
            <div className="flex-1 min-w-0">
              <h4 className="font-display text-base font-extrabold leading-tight text-ink truncate">
                {selected.title}
              </h4>
              <p className="text-[11.5px] font-bold text-ink-2 mt-0.5 truncate">
                {formatDate(selected.date)} · {formatTime(selected.date)} · {selected.location}
              </p>
              <p className="text-[11.5px] font-bold mt-0.5">
                {selected.myStatus === 'registered' ? (
                  <span className="text-teal">✓ Du bist dabei</span>
                ) : (
                  <span className="text-violet">{selected.sport}</span>
                )}
                <span className="text-ink-2"> · 👥 {selected.participationCount ?? 0}
                  {selected.maxCapacity ? `/${selected.maxCapacity}` : ''}</span>
              </p>
            </div>
            <span className="peek-go" aria-hidden>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" className="w-[19px] h-[19px]"><path d="M9 6l6 6-6 6" /></svg>
            </span>
          </div>
        </button>
      )}
    </div>
  );
}
