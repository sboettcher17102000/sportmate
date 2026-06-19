import { Link } from 'react-router-dom';
import type { Event } from '../../types';
import { formatDate, formatTime, sportEmoji, sportBg } from './eventHelpers';
import { joinEvent, leaveEvent } from '../../api/events';
import { useState } from 'react';
import FriendAvatars from './FriendAvatars';
import ParticipantsModal from './ParticipantsModal';

interface EventCardProps {
  event: Event;
  onUpdate: () => void;
}

export default function EventCard({ event, onUpdate }: EventCardProps) {
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  const isRegistered = event.myStatus === 'registered';
  const fillPercent = event.maxCapacity
    ? Math.min(100, ((event.participationCount ?? 0) / event.maxCapacity) * 100)
    : null;

  async function handleToggle(e: React.MouseEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      if (isRegistered) {
        await leaveEvent(event.id);
      } else {
        await joinEvent(event.id);
      }
      onUpdate();
    } finally {
      setLoading(false);
    }
  }

  const sourceLabel =
    event.source === 'university' ? 'Hochschulsport' :
    event.source === 'external' ? 'Lokales Event' : 'Community';

  const isUniversity = event.source === 'university';
  const toggleLabel = isUniversity
    ? (isRegistered ? 'Teilnahme zurückziehen' : 'Ich nehme teil')
    : (isRegistered ? 'Abgemeldet' : 'Jetzt anmelden');

  return (
    <>
    <Link to={`/events/${event.id}`} className="block">
      <div className="card-pop p-4">
        <div className="flex items-start gap-3">
          <span className="badge-pop" style={{ background: sportBg(event.sport) }}>{sportEmoji(event.sport)}</span>
          <div className="flex-1 min-w-0 pt-0.5">
            <div className="flex items-start justify-between gap-2">
              <h4 className="font-display text-lg font-extrabold leading-tight text-ink">{event.title}</h4>
              <span className="pill flex-shrink-0" style={{ background: sportBg(event.sport) }}>
                {event.sport}
              </span>
            </div>
            <p className="font-display text-xs font-bold text-ink-2 mt-0.5">
              {sourceLabel}
              {event.isPrivate && <span className="ml-1.5 text-violet">· 🔒 Privat</span>}
              {event.recurrenceLabel && <span className="ml-1.5 text-violet">· 🔁 {event.recurrenceLabel}</span>}
            </p>
          </div>
        </div>

        {event.description && (
          <p className="text-sm font-semibold text-ink-2 mt-3 line-clamp-2 leading-snug">{event.description}</p>
        )}

        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-[13px] font-bold text-ink">
          <span className="flex items-center gap-1.5">📅 {formatDate(event.date)}</span>
          <span className="flex items-center gap-1.5">🕐 {formatTime(event.date)} Uhr</span>
        </div>
        <p className="text-[13px] font-bold text-ink mt-1.5 flex items-center gap-1.5">📍 {event.location}</p>

        {event.maxCapacity && fillPercent !== null && (
          <div className="progress-pop mt-3">
            <i style={{ width: `${fillPercent}%` }} />
          </div>
        )}

        <div className="mt-3 flex items-center justify-between">
          <FriendAvatars friends={event.friendParticipants ?? []} />
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setModalOpen(true);
            }}
            className="font-display text-[13px] font-bold text-ink hover:text-violet"
          >
            👥 {event.participationCount ?? 0}
            {event.maxCapacity ? `/${event.maxCapacity}` : ''} Teilnehmer
          </button>
        </div>

        {isRegistered ? (
          <button onClick={handleToggle} disabled={loading} className="btn-joined mt-3 w-full disabled:opacity-55">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" className="w-[18px] h-[18px]"><path d="M5 13l4 4L19 7" /></svg>
            {loading ? '…' : 'Du bist dabei!'}
          </button>
        ) : (
          <button onClick={handleToggle} disabled={loading} className="btn-pop btn-violet mt-3">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" className="w-[18px] h-[18px]"><path d="M12 5v14M5 12h14" /></svg>
            {loading ? '…' : toggleLabel}
          </button>
        )}

        {isUniversity && event.externalUrl && (
          <a
            href={event.externalUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="btn-pop btn-white mt-2"
          >
            Beim Hochschulsport anmelden →
          </a>
        )}
      </div>
    </Link>
    <ParticipantsModal
      open={modalOpen}
      onClose={() => setModalOpen(false)}
      participants={event.participants ?? []}
    />
    </>
  );
}
