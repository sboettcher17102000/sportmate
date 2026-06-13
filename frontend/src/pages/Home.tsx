import { useState, useEffect } from 'react';
import AppShell from '../components/layout/AppShell';
import EventCard from '../components/ui/EventCard';
import { getEvents } from '../api/events';
import type { Event } from '../types';
import { sportEmoji, sportBg } from '../components/ui/eventHelpers';

const SOURCE_TABS = [
  { label: 'Alle', value: '' },
  { label: 'Hochschulsport', value: 'university' },
  { label: 'Lokales Event', value: 'external' },
];

const SPORT_TAGS = ['Laufen', 'Volleyball', 'Yoga', 'Fußball', 'Klettern', 'Wasser', 'Tennis', 'Basketball'];

export default function Home() {
  const [events, setEvents] = useState<Event[]>([]);
  const [search, setSearch] = useState('');
  const [activeSource, setActiveSource] = useState('');
  const [activeSport, setActiveSport] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getEvents({
      source: activeSource || undefined,
      sport: activeSport || undefined,
      search: search || undefined,
    })
      .then(setEvents)
      .finally(() => setLoading(false));
  }, [search, activeSource, activeSport]);

  return (
    <AppShell title="Hey! 👋" subtitle="Bereit für die nächste Runde?">
      <div className="px-4 pt-4 space-y-3.5">
        <div className="card-pop flex items-center gap-3 px-4 py-3">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" className="w-5 h-5 text-ink flex-none"><circle cx="11" cy="11" r="7" /><path d="M21 21l-4-4" /></svg>
          <input
            type="search"
            placeholder="Events durchsuchen…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-transparent outline-none font-bold text-[14.5px] text-ink placeholder:text-ink-2"
          />
        </div>

        <div className="flex gap-2">
          {SOURCE_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveSource(tab.value)}
              className={`seg-btn ${activeSource === tab.value ? 'on' : ''}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex gap-2.5 overflow-x-auto pb-1.5 -mx-1 px-1">
          {SPORT_TAGS.map((sport) => (
            <button
              key={sport}
              onClick={() => setActiveSport(activeSport === sport ? '' : sport)}
              className={`chip ${activeSport === sport ? 'on' : ''}`}
            >
              <span className="chip-ci" style={{ background: activeSport === sport ? 'rgba(255,255,255,.15)' : sportBg(sport) }}>
                {sportEmoji(sport)}
              </span>
              {sport}
            </button>
          ))}
        </div>

        <div className="flex items-center justify-between px-1">
          <p className="font-display text-base font-extrabold text-ink">
            {loading ? 'Lade Events…' : <><span className="text-violet">{events.length}</span> Events am Start</>}
          </p>
        </div>

        <div className="space-y-3.5 pb-4">
          {events.map((event) => (
            <EventCard key={event.id} event={event} onUpdate={() => {
              getEvents({ source: activeSource || undefined, sport: activeSport || undefined, search: search || undefined })
                .then(setEvents);
            }} />
          ))}
          {!loading && events.length === 0 && (
            <div className="text-center py-12 font-bold text-ink-2 text-sm">
              Keine Events gefunden
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
