import { useState, useEffect } from 'react';
import AppShell from '../components/layout/AppShell';
import { getMyEvents, leaveEvent } from '../api/events';
import type { Event } from '../types';
import { Link } from 'react-router-dom';
import { formatDate, formatTime, sportEmoji } from '../components/ui/eventHelpers';
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

  const upcoming = events.filter((e) => new Date(e.date) >= new Date());
  const attendanceRate = events.length > 0 ? 100 : 0;

  return (
    <AppShell title="Meine Events">
      <div className="px-4 pt-4 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-purple-600 text-white rounded-2xl p-4">
            <p className="text-xs opacity-80">Anstehende Events</p>
            <p className="text-3xl font-bold mt-1">{upcoming.length}</p>
          </div>
          <div className="bg-green-500 text-white rounded-2xl p-4">
            <p className="text-xs opacity-80">Anwesenheit</p>
            <p className="text-3xl font-bold mt-1">{attendanceRate}%</p>
          </div>
        </div>

        <h3 className="font-semibold text-gray-800">Anstehende Events</h3>

        {loading ? (
          <p className="text-sm text-gray-400 text-center py-8">Lade Events…</p>
        ) : upcoming.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400 text-sm mb-3">Du bist noch bei keinem Event angemeldet.</p>
            <Link to="/" className="text-purple-600 font-medium text-sm">Events entdecken →</Link>
          </div>
        ) : (
          <div className="space-y-3">
            {upcoming.map((event) => (
              <div key={event.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{sportEmoji(event.sport)}</span>
                    <div>
                      <p className="font-semibold text-gray-800 text-sm">{event.title}</p>
                      <p className="text-xs text-gray-500">{event.sport}</p>
                    </div>
                  </div>
                  <span className="text-xs text-gray-400">🔔 An</span>
                </div>
                <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
                  <span>📅 {formatDate(event.date)}</span>
                  <span>🕐 {formatTime(event.date)}</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">📍 {event.location}</p>

                <div className="mt-3 flex items-center justify-between">
                  <FriendAvatars friends={event.friendParticipants ?? []} />
                  <button
                    onClick={() => setModalEventId(event.id)}
                    className="text-xs text-gray-600 hover:text-purple-600 font-medium"
                  >
                    👥 {event.participationCount ?? 0} Teilnehmer
                  </button>
                </div>

                <div className="mt-3 flex gap-2">
                  <Link
                    to={`/events/${event.id}`}
                    className="flex-1 bg-blue-600 text-white text-xs font-medium rounded-xl py-2 text-center hover:bg-blue-700 transition"
                  >
                    Details ansehen
                  </Link>
                  <button
                    onClick={() => handleLeave(event.id)}
                    className="px-4 py-2 border border-red-400 text-red-500 text-xs font-medium rounded-xl hover:bg-red-50 transition"
                  >
                    Abmelden
                  </button>
                </div>
              </div>
            ))}
          </div>
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
