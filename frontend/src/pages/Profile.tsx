import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import AppShell from '../components/layout/AppShell';
import { useAuth } from '../context/AuthContext';
import { getMyEvents } from '../api/events';
import { getUserProfile } from '../api/friendships';
import type { Event, User } from '../types';
import { formatDate, sportEmoji } from '../components/ui/eventHelpers';

const ACHIEVEMENTS = [
  { emoji: '🌟', title: 'Early Bird', desc: '10 Events besucht' },
  { emoji: '🏃', title: 'Marathon Master', desc: 'Trollinger Marathon absolviert' },
  { emoji: '🦋', title: 'Social Butterfly', desc: '5 Freunde eingeladen' },
  { emoji: '🔥', title: 'Streak King', desc: '7 Tage in Folge aktiv' },
];

export default function Profile() {
  const { id } = useParams<{ id?: string }>();
  const { user: currentUser, logout } = useAuth();
  const isOwnProfile = !id;

  const [profileUser, setProfileUser] = useState<User | null>(isOwnProfile ? currentUser : null);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        if (!isOwnProfile && id) {
          const u = await getUserProfile(parseInt(id));
          setProfileUser(u);
        }
        const myEvents = await getMyEvents();
        setEvents(myEvents);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, isOwnProfile]);

  const upcoming = events.filter((e) => new Date(e.date) >= new Date());

  if (loading) {
    return (
      <AppShell title="Profil">
        <p className="text-center text-gray-400 text-sm py-12">Lade Profil…</p>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="space-y-4 pb-6">
        <div className="bg-gradient-to-r from-purple-700 to-blue-600 px-4 pt-10 pb-6 text-white">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-2xl font-bold">
                {profileUser?.name?.charAt(0) ?? '?'}
              </div>
              <div>
                <h2 className="text-xl font-bold">{profileUser?.name ?? 'Unbekannt'}</h2>
                {profileUser?.university && (
                  <p className="text-sm text-purple-200">{profileUser.university}</p>
                )}
                {profileUser?.studiengang && (
                  <p className="text-sm text-purple-200">{profileUser.studiengang}</p>
                )}
                {profileUser?.semester && (
                  <p className="text-sm text-purple-200">{profileUser.semester}. Semester</p>
                )}
              </div>
            </div>
            {isOwnProfile && (
              <button
                onClick={logout}
                className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition"
                title="Abmelden"
              >
                ⚙️
              </button>
            )}
          </div>
          <div className="grid grid-cols-3 gap-3 mt-5 text-center">
            <div>
              <p className="text-2xl font-bold">{events.length}</p>
              <p className="text-xs text-purple-200">Events</p>
            </div>
            <div>
              <p className="text-2xl font-bold">87%</p>
              <p className="text-xs text-purple-200">Anwesenheit</p>
            </div>
            <div>
              <p className="text-2xl font-bold">5</p>
              <p className="text-xs text-purple-200">Tage Streak</p>
            </div>
          </div>
        </div>

        <div className="px-4 space-y-4">
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span>🎯</span>
                <span className="font-semibold text-gray-800 text-sm">Monatsziel</span>
              </div>
              <span className="text-xs text-gray-500">5/8 Events</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2">
              <div className="bg-purple-600 h-2 rounded-full" style={{ width: '62.5%' }} />
            </div>
            <p className="text-xs text-gray-500 mt-1">Noch 3 Events bis zum Ziel!</p>
          </div>

          {isOwnProfile && (
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-center gap-2 mb-3">
                <span>🏆</span>
                <h3 className="font-semibold text-gray-800 text-sm">Erfolge</h3>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {ACHIEVEMENTS.map((a) => (
                  <div key={a.title} className="bg-yellow-50 rounded-xl p-3">
                    <span className="text-xl">{a.emoji}</span>
                    <p className="font-medium text-xs text-gray-800 mt-1">{a.title}</p>
                    <p className="text-xs text-gray-500">{a.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-3">
              <span>📅</span>
              <h3 className="font-semibold text-gray-800 text-sm">Nächste Events</h3>
            </div>
            {upcoming.length === 0 ? (
              <p className="text-xs text-gray-400">Keine bevorstehenden Events</p>
            ) : (
              <div className="space-y-3">
                {upcoming.slice(0, 3).map((event) => (
                  <div key={event.id} className="flex items-center gap-3">
                    <span className="text-xl">{sportEmoji(event.sport)}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-gray-800 truncate">{event.title}</p>
                      <p className="text-xs text-gray-500">{formatDate(event.date)} · {event.location}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
