import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import AppShell from '../components/layout/AppShell';
import { getEvent, joinEvent, leaveEvent } from '../api/events';
import type { Event } from '../types';
import { formatDate, formatTime, sportEmoji } from '../components/ui/eventHelpers';
import FriendAvatars from '../components/ui/FriendAvatars';
import ParticipantsModal from '../components/ui/ParticipantsModal';

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
        <p className="text-center text-gray-400 py-12">Lade Event…</p>
      </AppShell>
    );
  }

  const isRegistered = event.myStatus === 'registered';
  const fillPercent = event.maxCapacity
    ? Math.min(100, ((event.participationCount ?? 0) / event.maxCapacity) * 100)
    : null;

  return (
    <AppShell>
      <div className="pb-6">
        <div className={`px-4 pt-10 pb-6 text-white ${event.source === 'university' ? 'bg-gradient-to-r from-purple-700 to-blue-600' : 'bg-gradient-to-r from-orange-500 to-red-500'}`}>
          <Link to="/" className="text-white/70 text-sm hover:text-white">← Zurück</Link>
          <div className="flex items-center gap-3 mt-3">
            <span className="text-4xl">{sportEmoji(event.sport)}</span>
            <div>
              <h2 className="text-xl font-bold leading-tight">{event.title}</h2>
              <span className="text-xs bg-white/20 rounded-full px-2 py-0.5">
                {event.source === 'university' ? 'Hochschulsport' : event.source === 'external' ? 'Lokales Event' : 'Community'}
              </span>
            </div>
          </div>
        </div>

        <div className="px-4 space-y-4 mt-4">
          {event.description && (
            <p className="text-gray-600 text-sm">{event.description}</p>
          )}

          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 space-y-2">
            <div className="flex gap-6 text-sm text-gray-600">
              <span>📅 {formatDate(event.date)}</span>
              <span>🕐 {formatTime(event.date)} Uhr</span>
            </div>
            <p className="text-sm text-gray-600">📍 {event.location}</p>
            <div>
              <button
                onClick={() => setModalOpen(true)}
                className="text-sm text-gray-600 hover:text-purple-600 font-medium"
              >
                👥 {event.participationCount ?? 0}
                {event.maxCapacity ? `/${event.maxCapacity}` : ''} Teilnehmer
              </button>
              {event.maxCapacity && fillPercent !== null && (
                <div className="w-full bg-gray-100 rounded-full h-1.5 mt-1">
                  <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${fillPercent}%` }} />
                </div>
              )}
            </div>
          </div>

          {event.friendParticipants && event.friendParticipants.length > 0 && (
            <div className="bg-green-50 rounded-2xl p-4 border border-green-100">
              <FriendAvatars friends={event.friendParticipants} />
            </div>
          )}

          <button
            onClick={handleJoin}
            disabled={actionLoading}
            className={`w-full font-semibold rounded-2xl py-4 text-sm transition disabled:opacity-50 ${
              isRegistered
                ? 'border-2 border-red-400 text-red-500 bg-white hover:bg-red-50'
                : 'bg-gradient-to-r from-purple-600 to-blue-500 text-white hover:opacity-90'
            }`}
          >
            {actionLoading ? '…' : isRegistered ? 'Abmelden' : 'Jetzt anmelden'}
          </button>
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
