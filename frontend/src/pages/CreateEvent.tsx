import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppShell from '../components/layout/AppShell';
import { createEvent } from '../api/events';
import type { SportCategory } from '../types';
import { sportBg } from '../components/ui/eventHelpers';

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

type RecurrenceValue = '' | 'weekly' | 'biweekly' | 'monthly';

const RECURRENCE_OPTIONS: { label: string; value: RecurrenceValue }[] = [
  { label: 'Einmalig', value: '' },
  { label: '🔁 Wöchentlich', value: 'weekly' },
  { label: '🔁 Alle 2 Wochen', value: 'biweekly' },
  { label: '🔁 Monatlich', value: 'monthly' },
];

function weekdayLabel(date: string): string {
  if (!date) return '';
  return new Date(`${date}T00:00:00`).toLocaleDateString('de-DE', { weekday: 'long' });
}

function recurrenceText(recurrence: RecurrenceValue, date: string): string {
  switch (recurrence) {
    case 'weekly':
      return `wöchentlich (jeden ${weekdayLabel(date)})`;
    case 'biweekly':
      return `alle 2 Wochen`;
    case 'monthly':
      return `monatlich`;
    default:
      return '';
  }
}

export default function CreateEvent() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [sport, setSport] = useState<SportCategory | ''>('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [maxCapacity, setMaxCapacity] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [recurrence, setRecurrence] = useState<RecurrenceValue>('');
  const [recurrenceEnd, setRecurrenceEnd] = useState('');
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
        isPrivate,
        maxCapacity: maxCapacity ? parseInt(maxCapacity) : undefined,
        recurrence: recurrence || undefined,
        // Enddatum inklusiv: bis zum Ende des gewählten Tages
        recurrenceEndDate:
          recurrence && recurrenceEnd ? `${recurrenceEnd}T23:59:59` : undefined,
      });
      navigate(`/events/${event.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Event konnte nicht erstellt werden');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppShell title="Event erstellen" subtitle="Bring deine Kommilitonen in Bewegung!" accent="coral">
      <div className="px-4 pt-4 pb-8 space-y-4">
        <div className="field-pop">
          <label className="flex items-center gap-2 font-display text-[15px] font-extrabold text-ink mb-3">
            📋 Event-Titel
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="z.B. Volleyball Mixed am Campus"
            className="input-pop"
          />
        </div>

        <div className="field-pop">
          <label className="flex items-center gap-2 font-display text-[15px] font-extrabold text-ink mb-3">
            🏷️ Kategorie
          </label>
          <div className="grid grid-cols-3 gap-2.5">
            {SPORT_OPTIONS.map((opt) => {
              const on = sport === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setSport(opt.value)}
                  className={`flex flex-col items-center gap-2 p-3 rounded-[20px] border-[2.5px] border-ink font-display text-[12.5px] font-bold shadow-pop-sm transition ${
                    on ? 'bg-violet text-white' : 'bg-white text-ink'
                  }`}
                >
                  <span
                    className="w-9 h-9 rounded-[11px] border-2 border-ink grid place-items-center text-lg"
                    style={{ background: on ? 'rgba(255,255,255,.15)' : sportBg(opt.value) }}
                  >
                    {opt.emoji}
                  </span>
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="field-pop">
            <label className="flex items-center gap-2 font-display text-[15px] font-extrabold text-ink mb-3">
              📅 Datum
            </label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="input-pop"
            />
          </div>
          <div className="field-pop">
            <label className="flex items-center gap-2 font-display text-[15px] font-extrabold text-ink mb-3">
              🕐 Uhrzeit
            </label>
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="input-pop"
            />
          </div>
        </div>

        <div className="field-pop">
          <label className="flex items-center gap-2 font-display text-[15px] font-extrabold text-ink mb-3">
            🔁 Wiederholung
          </label>
          <div className="grid grid-cols-2 gap-2.5">
            {RECURRENCE_OPTIONS.map((opt) => {
              const on = recurrence === opt.value;
              return (
                <button
                  key={opt.value || 'once'}
                  type="button"
                  onClick={() => setRecurrence(opt.value)}
                  className={`p-3 rounded-[16px] border-[2.5px] border-ink font-display text-[13px] font-bold shadow-pop-sm transition ${
                    on ? 'bg-violet text-white' : 'bg-white text-ink'
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>

          {recurrence && (
            <div className="mt-3 space-y-3">
              {date && (
                <p className="text-xs font-bold text-ink-2 leading-snug">
                  Erster Termin: {weekdayLabel(date)},{' '}
                  {new Date(`${date}T00:00:00`).toLocaleDateString('de-DE')} – wiederholt sich{' '}
                  {recurrenceText(recurrence, date)}. Im Feed erscheint immer nur der nächste Termin.
                </p>
              )}
              <div>
                <label className="flex items-center gap-2 font-display text-[13px] font-extrabold text-ink mb-2">
                  🏁 Enddatum (optional)
                </label>
                <input
                  type="date"
                  value={recurrenceEnd}
                  min={date || undefined}
                  onChange={(e) => setRecurrenceEnd(e.target.value)}
                  className="input-pop"
                />
              </div>
            </div>
          )}
        </div>

        <div className="field-pop">
          <label className="flex items-center gap-2 font-display text-[15px] font-extrabold text-ink mb-3">
            📍 Ort
          </label>
          <input
            type="text"
            required
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="z.B. Sporthalle Campus Sontheim"
            className="input-pop"
          />
        </div>

        <div className="field-pop">
          <label className="flex items-center gap-2 font-display text-[15px] font-extrabold text-ink mb-3">
            📝 Beschreibung (optional)
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder="Kurze Beschreibung des Events…"
            className="input-pop resize-none"
          />
        </div>

        <div className="field-pop">
          <label className="flex items-center gap-2 font-display text-[15px] font-extrabold text-ink mb-3">
            👥 Max. Teilnehmer (optional)
          </label>
          <input
            type="number"
            min="2"
            value={maxCapacity}
            onChange={(e) => setMaxCapacity(e.target.value)}
            placeholder="z.B. 20"
            className="input-pop"
          />
        </div>

        <button
          type="button"
          onClick={() => setIsPrivate((v) => !v)}
          className="field-pop w-full flex items-center justify-between text-left"
        >
          <span className="flex flex-col">
            <span className="font-display text-[15px] font-extrabold text-ink">🔒 Privates Event</span>
            <span className="text-xs font-bold text-ink-2">
              Nur für meine Freunde sichtbar
            </span>
          </span>
          <span
            className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full border-2 border-ink transition ${
              isPrivate ? 'bg-violet' : 'bg-white'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-ink transition ${
                isPrivate ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </span>
        </button>

        {error && <p className="text-coral font-bold text-sm px-1">{error}</p>}

        <button
          onClick={handleSubmit}
          disabled={loading || !title || !sport || !date || !location}
          className="btn-pop btn-yellow"
          style={{ padding: '16px' }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" className="w-[18px] h-[18px]"><path d="M5 13l4 4L19 7" /></svg>
          {loading ? 'Wird erstellt…' : 'Event veröffentlichen'}
        </button>
      </div>
    </AppShell>
  );
}
