import { useState, useEffect } from 'react';
import AppShell from '../components/layout/AppShell';
import EventCard from '../components/ui/EventCard';
import EventMap from '../components/ui/EventMap';
import EventFilterSheet, { SOURCE_TABS } from '../components/ui/EventFilterSheet';
import { getEvents } from '../api/events';
import type { Event } from '../types';
import { sportEmoji } from '../components/ui/eventHelpers';

export default function Home() {
  const [events, setEvents] = useState<Event[]>([]);
  const [search, setSearch] = useState('');
  const [activeSource, setActiveSource] = useState('');
  const [activeSports, setActiveSports] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');

  const sportParam = activeSports.join(',');

  useEffect(() => {
    setLoading(true);
    getEvents({
      source: activeSource || undefined,
      sport: sportParam || undefined,
      search: search || undefined,
    })
      .then(setEvents)
      .finally(() => setLoading(false));
  }, [search, activeSource, sportParam]);

  const toggleSport = (sport: string) =>
    setActiveSports((prev) =>
      prev.includes(sport) ? prev.filter((s) => s !== sport) : [...prev, sport]
    );

  const activeCount = (activeSource ? 1 : 0) + activeSports.length;
  const sourceLabel = SOURCE_TABS.find((t) => t.value === activeSource)?.label;

  return (
    <AppShell title="Hey! 👋" subtitle="Bereit für die nächste Runde?">
      <div className="px-4 pt-4 space-y-3.5">
        <div className="flex items-stretch gap-3">
          <div className="card-pop flex flex-1 min-w-0 items-center gap-3 px-4 py-3">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" className="w-5 h-5 text-ink flex-none"><circle cx="11" cy="11" r="7" /><path d="M21 21l-4-4" /></svg>
            <input
              type="search"
              placeholder="Events durchsuchen…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-transparent outline-none font-bold text-[14.5px] text-ink placeholder:text-ink-2"
            />
          </div>
          <button className="filterbtn" onClick={() => setSheetOpen(true)} aria-label="Filter öffnen">
            {activeCount > 0 && <span className="badge">{activeCount}</span>}
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" className="w-[22px] h-[22px]"><path d="M4 6h16M7 12h10M10 18h4" /></svg>
          </button>
        </div>

        <div className="flex gap-2.5">
          <button
            className={`seg-btn flex items-center justify-center gap-2 ${viewMode === 'list' ? 'on' : ''}`}
            onClick={() => setViewMode('list')}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" className="w-[17px] h-[17px]"><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" /></svg>
            Liste
          </button>
          <button
            className={`seg-btn flex items-center justify-center gap-2 ${viewMode === 'map' ? 'on' : ''}`}
            onClick={() => setViewMode('map')}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="w-[17px] h-[17px]"><path d="M12 21s7-6.2 7-11a7 7 0 10-14 0c0 4.8 7 11 7 11z" /><circle cx="12" cy="10" r="2.5" /></svg>
            Karte
          </button>
        </div>

        {activeCount > 0 && (
          <div className="flex flex-wrap gap-2">
            {activeSource && (
              <button className="afc" onClick={() => setActiveSource('')}>
                {sourceLabel}
                <span className="x">✕</span>
              </button>
            )}
            {activeSports.map((sport) => (
              <button key={sport} className="afc" onClick={() => toggleSport(sport)}>
                {sportEmoji(sport)} {sport}
                <span className="x">✕</span>
              </button>
            ))}
            <button className="afc clear" onClick={() => { setActiveSource(''); setActiveSports([]); }}>
              Alle löschen
            </button>
          </div>
        )}

        <div className="flex items-center justify-between px-1">
          <p className="font-display text-base font-extrabold text-ink">
            {loading ? 'Lade Events…' : <><span className="text-violet">{events.length}</span> Events am Start</>}
          </p>
        </div>

        {viewMode === 'list' ? (
          <div className="space-y-3.5 pb-4">
            {events.map((event) => (
              <EventCard key={event.id} event={event} onUpdate={() => {
                getEvents({ source: activeSource || undefined, sport: sportParam || undefined, search: search || undefined })
                  .then(setEvents);
              }} />
            ))}
            {!loading && events.length === 0 && (
              <div className="text-center py-12 font-bold text-ink-2 text-sm">
                Keine Events gefunden
              </div>
            )}
          </div>
        ) : (
          <div className="pb-4">
            <EventMap events={events} />
          </div>
        )}
      </div>

      <EventFilterSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        activeSource={activeSource}
        setActiveSource={setActiveSource}
        activeSports={activeSports}
        toggleSport={toggleSport}
        setActiveSports={setActiveSports}
        resultCount={events.length}
      />
    </AppShell>
  );
}
