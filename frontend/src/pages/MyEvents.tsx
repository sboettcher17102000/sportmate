import { useState, useEffect } from 'react';
import AppShell from '../components/layout/AppShell';
import { getMyEvents, leaveEvent } from '../api/events';
import type { Event } from '../types';
import { Link } from 'react-router-dom';
import { formatDate, formatTime, sportEmoji, sportBg } from '../components/ui/eventHelpers';
import FriendAvatars from '../components/ui/FriendAvatars';
import ParticipantsModal from '../components/ui/ParticipantsModal';

export default function MyEvents() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalEventId, setModalEventId] = useState<number | null>(null);

  function load() {
    setLoading(true);
    getMyEvents()
      .then(setEvents)
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  async function handleLeave(id: number) {
    await leaveEvent(id);
    load();
  }

  const now = new Date();
  const upcoming = events.filter((e) => new Date(e.date) >= now);
  const past = events
    .filter((e) => new Date(e.date) < now)
    .sort((a, b) => +new Date(b.date) - +new Date(a.date)); // neueste zuerst
  const attendanceRate = events.length > 0 ? 100 : 0;

  function renderEvent(event: Event, { past }: { past: boolean }) {
    return (
      <div key={event.id} className="card-pop p-4">
        <div className="flex items-center gap-3">
          <span className="badge-pop" style={{ background: sportBg(event.sport) }}>{sportEmoji(event.sport)}</span>
          <div className="flex-1 min-w-0">
            <p className="font-display text-lg font-extrabold text-ink leading-tight">{event.title}</p>
            <p className="font-display text-xs font-bold text-ink-2">{event.sport}</p>
          </div>
          {past ? (
            <span className="pill bg-paper text-ink-2 flex items-center gap-1">✓ Vorbei</span>
          ) : (
            <span className="pill bg-mint flex items-center gap-1">🔔 An</span>
          )}
        </div>
        <div className="mt-3.5 flex flex-wrap gap-x-4 gap-y-1.5 text-[13px] font-bold text-ink">
          <span className="flex items-center gap-1.5">📅 {formatDate(event.date)}</span>
          <span className="flex items-center gap-1.5">🕐 {formatTime(event.date)}</span>
        </div>
        <p className="text-[13px] font-bold text-ink mt-1.5 flex items-center gap-1.5">📍 {event.location}</p>

        <div className="mt-3 flex items-center justify-between">
          <FriendAvatars friends={event.friendParticipants ?? []} />
          <button
            onClick={() => setModalEventId(event.id)}
            className="font-display text-[13px] font-bold text-ink hover:text-violet"
          >
            👥 {event.participationCount ?? 0} Teilnehmer
          </button>
        </div>

        <div className="mt-3.5 flex gap-3">
          <Link
            to={`/events/${event.id}`}
            className="btn-pop btn-violet flex-1"
          >
            Details
          </Link>
          {!past && (
            <button
              onClick={() => handleLeave(event.id)}
              className="btn-pop btn-coral flex-none w-auto px-5"
            >
              Abmelden
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <AppShell title="Meine Events" subtitle="Deine Anmeldungen auf einen Blick." accent="teal">
      <div className="px-4 pt-4 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="stat-pop bg-violet text-white">
            <span className="absolute right-2.5 top-2 text-2xl rotate-12">📅</span>
            <p className="font-display text-[13px] font-bold">Anstehende Events</p>
            <p className="font-display text-[38px] font-extrabold leading-none mt-1">{upcoming.length}</p>
          </div>
          <div className="stat-pop bg-yellow text-ink">
            <span className="absolute right-2.5 top-2 text-2xl rotate-12">💪</span>
            <p className="font-display text-[13px] font-bold">Anwesenheit</p>
            <p className="font-display text-[38px] font-extrabold leading-none mt-1">{attendanceRate}%</p>
          </div>
        </div>

        <h3 className="font-display text-xl font-extrabold text-ink px-1">Anstehende Events</h3>

        {loading ? (
          <p className="text-sm font-bold text-ink-2 text-center py-8">Lade Events…</p>
        ) : events.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-ink-2 font-bold text-sm mb-3">Du bist noch bei keinem Event angemeldet.</p>
            <Link to="/" className="text-violet font-display font-extrabold text-sm">Events entdecken →</Link>
          </div>
        ) : (
          <>
            {upcoming.length === 0 ? (
              <p className="text-sm font-bold text-ink-2 px-1 py-2">Keine anstehenden Events.</p>
            ) : (
              <div className="space-y-3.5">
                {upcoming.map((event) => renderEvent(event, { past: false }))}
              </div>
            )}

            {past.length > 0 && (
              <>
                <h3 className="font-display text-xl font-extrabold text-ink px-1 pt-2">Vergangene Events</h3>
                <div className="space-y-3.5">
                  {past.map((event) => renderEvent(event, { past: true }))}
                </div>
              </>
            )}
          </>
        )}
      </div>

      <ParticipantsModal
        open={modalEventId !== null}
        onClose={() => setModalEventId(null)}
        participants={
          events.find((e) => e.id === modalEventId)?.participants ?? []
        }
      />
    </AppShell>
  );
}
