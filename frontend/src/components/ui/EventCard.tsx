import { Link } from 'react-router-dom';
import type { Event } from '../../types';
import { formatDate, formatTime, sportEmoji } from './eventHelpers';
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

  return (
    <>
    <Link to={`/events/${event.id}`} className="block">
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition">
        <div className="flex items-start gap-3">
          <span className="text-3xl">{sportEmoji(event.sport)}</span>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-semibold text-gray-800 text-sm leading-tight">{event.title}</h3>
              <span className="flex-shrink-0 text-xs bg-purple-100 text-purple-700 rounded-full px-2 py-0.5">
                {event.sport}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">{sourceLabel}</p>
          </div>
        </div>

        {event.description && (
          <p className="text-xs text-gray-500 mt-2 line-clamp-2">{event.description}</p>
        )}

        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
          <span>📅 {formatDate(event.date)}</span>
          <span>🕐 {formatTime(event.date)} Uhr</span>
        </div>
        <p className="text-xs text-gray-500 mt-1">📍 {event.location}</p>

        {event.maxCapacity && fillPercent !== null && (
          <div className="mt-2 w-full bg-gray-100 rounded-full h-1.5">
            <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${fillPercent}%` }} />
          </div>
        )}

        <div className="mt-2 flex items-center justify-between">
          <FriendAvatars friends={event.friendParticipants ?? []} />
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setModalOpen(true);
            }}
            className="text-xs text-gray-600 hover:text-purple-600 font-medium"
          >
            👥 {event.participationCount ?? 0}
            {event.maxCapacity ? `/${event.maxCapacity}` : ''} Teilnehmer
          </button>
        </div>

        <button
          onClick={handleToggle}
          disabled={loading}
          className={`mt-3 w-full py-2.5 rounded-xl text-sm font-semibold transition disabled:opacity-50 ${
            isRegistered
              ? 'border border-gray-300 text-gray-600 hover:bg-gray-50'
              : 'bg-gradient-to-r from-purple-600 to-blue-500 text-white hover:opacity-90'
          }`}
        >
          {loading ? '…' : isRegistered ? 'Abgemeldet' : 'Jetzt anmelden'}
        </button>
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
