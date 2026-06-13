import { useState, useEffect } from 'react';
import AppShell from '../components/layout/AppShell';
import EventCard from '../components/ui/EventCard';
import { getEvents } from '../api/events';
import type { Event } from '../types';

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
    <AppShell>
      <div className="px-4 pt-4 space-y-3">
        <input
          type="search"
          placeholder="Events durchsuchen..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-purple-400"
        />

        <div className="flex gap-2">
          {SOURCE_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveSource(tab.value)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition ${
                activeSource === tab.value
                  ? 'bg-purple-600 text-white'
                  : 'bg-white border border-gray-200 text-gray-600 hover:border-purple-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
          {SPORT_TAGS.map((sport) => (
            <button
              key={sport}
              onClick={() => setActiveSport(activeSport === sport ? '' : sport)}
              className={`flex-shrink-0 px-3 py-1 rounded-full text-xs font-medium transition ${
                activeSport === sport
                  ? 'bg-purple-100 text-purple-700 border border-purple-300'
                  : 'bg-white border border-gray-200 text-gray-500 hover:border-purple-200'
              }`}
            >
              {sport}
            </button>
          ))}
        </div>

        <p className="text-sm text-gray-500 font-medium">
          {loading ? 'Lade Events…' : `${events.length} Events verfügbar`}
        </p>

        <div className="space-y-3 pb-4">
          {events.map((event) => (
            <EventCard key={event.id} event={event} onUpdate={() => {
              getEvents({ source: activeSource || undefined, sport: activeSport || undefined, search: search || undefined })
                .then(setEvents);
            }} />
          ))}
          {!loading && events.length === 0 && (
            <div className="text-center py-12 text-gray-400 text-sm">
              Keine Events gefunden
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
