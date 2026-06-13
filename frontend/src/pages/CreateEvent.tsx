import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppShell from '../components/layout/AppShell';
import { createEvent } from '../api/events';
import type { SportCategory } from '../types';

const SPORT_OPTIONS: { label: string; emoji: string; value: SportCategory }[] = [
  { label: 'Volleyball', emoji: '🏐', value: 'Volleyball' },
  { label: 'Fußball', emoji: '⚽', value: 'Fußball' },
  { label: 'Basketball', emoji: '🏀', value: 'Basketball' },
  { label: 'Laufen', emoji: '🏃', value: 'Laufen' },
  { label: 'Yoga', emoji: '🧘', value: 'Yoga' },
  { label: 'Schwimmen', emoji: '🏊', value: 'Schwimmen' },
  { label: 'Klettern', emoji: '🧗', value: 'Klettern' },
  { label: 'Wassersport', emoji: '🚣', value: 'Wassersport' },
  { label: 'Tennis', emoji: '🎾', value: 'Tennis' },
  { label: 'Andere', emoji: '🎯', value: 'Andere' },
];

export default function CreateEvent() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [sport, setSport] = useState<SportCategory | ''>('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [maxCapacity, setMaxCapacity] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!sport) { setError('Bitte eine Kategorie auswählen.'); return; }
    setError('');
    setLoading(true);
    try {
      const dateTime = `${date}T${time || '00:00'}:00`;
      const event = await createEvent({
        title,
        sport,
        date: dateTime,
        location,
        description: description || undefined,
        source: 'user',
        maxCapacity: maxCapacity ? parseInt(maxCapacity) : undefined,
      });
      navigate(`/events/${event.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Event konnte nicht erstellt werden');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppShell title="Event erstellen" subtitle="Erstelle ein eigenes Sportevent für deine Kommilitonen">
      <div className="px-4 pt-4 pb-8 space-y-4">
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
            📋 Event-Titel
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="z.B. Volleyball Mixed am Campus"
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
          />
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
            🏷️ Kategorie
          </label>
          <div className="grid grid-cols-3 gap-2">
            {SPORT_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setSport(opt.value)}
                className={`flex flex-col items-center gap-1 p-3 rounded-xl border text-xs font-medium transition ${
                  sport === opt.value
                    ? 'border-purple-500 bg-purple-50 text-purple-700'
                    : 'border-gray-200 text-gray-600 hover:border-purple-200'
                }`}
              >
                <span className="text-2xl">{opt.emoji}</span>
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              📅 Datum
            </label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
            />
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              🕐 Uhrzeit
            </label>
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
            />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
            📍 Ort
          </label>
          <input
            type="text"
            required
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="z.B. Sporthalle Campus Sontheim"
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
          />
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
            📝 Beschreibung (optional)
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder="Kurze Beschreibung des Events…"
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 resize-none"
          />
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
            👥 Max. Teilnehmer (optional)
          </label>
          <input
            type="number"
            min="2"
            value={maxCapacity}
            onChange={(e) => setMaxCapacity(e.target.value)}
            placeholder="z.B. 20"
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
          />
        </div>

        {error && <p className="text-red-500 text-sm px-1">{error}</p>}

        <button
          onClick={handleSubmit}
          disabled={loading || !title || !sport || !date || !location}
          className="w-full bg-gradient-to-r from-purple-600 to-blue-500 text-white font-semibold rounded-2xl py-4 text-sm hover:opacity-90 transition disabled:opacity-40"
        >
          {loading ? 'Wird erstellt…' : 'Event erstellen'}
        </button>
      </div>
    </AppShell>
  );
}
