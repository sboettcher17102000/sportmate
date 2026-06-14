import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import AppShell from '../components/layout/AppShell';
import { getEvent, joinEvent, leaveEvent } from '../api/events';
import type { Event } from '../types';
import { formatDate, formatTime, sportEmoji, sportBg } from '../components/ui/eventHelpers';
import FriendAvatars from '../components/ui/FriendAvatars';
import ParticipantsModal from '../components/ui/ParticipantsModal';
import LocationMap from '../components/ui/LocationMap';

export default function EventDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  function load() {
    if (!id) return;
    setLoading(true);
    getEvent(parseInt(id))
      .then(setEvent)
      .catch(() => navigate('/'))
      .finally(() => setLoading(false));
  }

  useEffect(load, [id]);

  async function handleJoin() {
    if (!event) return;
    setActionLoading(true);
    try {
      if (event.myStatus === 'registered') {
        await leaveEvent(event.id);
      } else {
        await joinEvent(event.id);
      }
      load();
    } finally {
      setActionLoading(false);
    }
  }

  if (loading || !event) {
    return (
      <AppShell title="Event">
        <p className="text-center text-ink-2 font-bold py-12">Lade Event…</p>
      </AppShell>
    );
  }

  const isRegistered = event.myStatus === 'registered';
  const fillPercent = event.maxCapacity
    ? Math.min(100, ((event.participationCount ?? 0) / event.maxCapacity) * 100)
    : null;
  const isUniversity = event.source === 'university';
  const toggleLabel = isUniversity
    ? (isRegistered ? 'Teilnahme zurückziehen' : 'Ich nehme teil')
    : (isRegistered ? 'Abmelden' : 'Jetzt anmelden');

  return (
    <AppShell noHeader>
      <div className="pb-6">
        <div className={`app-header px-4 pt-10 pb-6 text-white ${isUniversity ? 'accent-violet' : 'accent-coral'}`}>
          <Link to="/" className="font-display text-sm font-bold text-white/80 hover:text-white">← Zurück</Link>
          <div className="flex items-center gap-3 mt-3">
            <span className="badge-pop text-2xl" style={{ background: sportBg(event.sport) }}>{sportEmoji(event.sport)}</span>
            <div>
              <h2 className="font-display text-2xl font-extrabold leading-tight">{event.title}</h2>
              <div className="flex items-center gap-2 mt-1.5">
                <span className="pill bg-white/20 text-white border-white/40">
                  {event.source === 'university' ? 'Hochschulsport' : event.source === 'external' ? 'Lokales Event' : 'Community'}
                </span>
                {event.isPrivate && (
                  <span className="pill bg-white/20 text-white border-white/40">🔒 Privat</span>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="px-4 space-y-4 mt-4">
          {event.description && (
            <p className="text-ink-2 font-semibold text-sm leading-relaxed">{event.description}</p>
          )}

          <div className="card-pop p-4 space-y-2.5">
            <div className="flex flex-wrap gap-x-5 gap-y-1.5 text-sm font-bold text-ink">
              <span className="flex items-center gap-1.5">📅 {formatDate(event.date)}</span>
              <span className="flex items-center gap-1.5">🕐 {formatTime(event.date)} Uhr</span>
            </div>
            <p className="text-sm font-bold text-ink flex items-center gap-1.5">📍 {event.location}</p>
            <div>
              <button
                onClick={() => setModalOpen(true)}
                className="font-display text-sm font-bold text-ink hover:text-violet"
              >
                👥 {event.participationCount ?? 0}
                {event.maxCapacity ? `/${event.maxCapacity}` : ''} Teilnehmer
              </button>
              {event.maxCapacity && fillPercent !== null && (
                <div className="progress-pop mt-2">
                  <i style={{ width: `${fillPercent}%` }} />
                </div>
              )}
            </div>
          </div>

          <LocationMap location={event.location} />

          <a
            href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(event.location)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-pop btn-white"
          >
            📍 Route mit Google Maps
          </a>

          {event.friendParticipants && event.friendParticipants.length > 0 && (
            <div className="card-pop p-4" style={{ background: '#EAFBF3' }}>
              <FriendAvatars friends={event.friendParticipants} />
            </div>
          )}

          {isRegistered ? (
            <>
              <div className="btn-joined w-full">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" className="w-[18px] h-[18px]"><path d="M5 13l4 4L19 7" /></svg>
                Du bist dabei!
              </div>
              <button onClick={handleJoin} disabled={actionLoading} className="btn-pop btn-coral">
                {actionLoading ? '…' : toggleLabel}
              </button>
            </>
          ) : (
            <button onClick={handleJoin} disabled={actionLoading} className="btn-pop btn-violet">
              {actionLoading ? '…' : toggleLabel}
            </button>
          )}

          {isUniversity && event.externalUrl && (
            <a
              href={event.externalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-pop btn-white"
            >
              Beim Hochschulsport anmelden →
            </a>
          )}
        </div>
      </div>

      <ParticipantsModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        participants={event.participants ?? []}
      />
    </AppShell>
  );
}
