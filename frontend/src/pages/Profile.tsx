import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import AppShell from '../components/layout/AppShell';
import { useAuth } from '../context/AuthContext';
import { getMyEvents } from '../api/events';
import { getUserProfile, updateMyProfile } from '../api/friendships';
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
  const { user: currentUser, logout, updateUser } = useAuth();
  const isOwnProfile = !id;

  const [profileUser, setProfileUser] = useState<User | null>(isOwnProfile ? currentUser : null);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  // Settings-Menü
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Edit-Modal
  const [editOpen, setEditOpen] = useState(false);
  const [editName, setEditName] = useState('');
  const [editUniversity, setEditUniversity] = useState('');
  const [editStudiengang, setEditStudiengang] = useState('');
  const [editSemester, setEditSemester] = useState('');
  const [editError, setEditError] = useState('');
  const [editLoading, setEditLoading] = useState(false);

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

  // Menü bei Klick außerhalb schließen
  useEffect(() => {
    if (!menuOpen) return;
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuOpen]);

  function openEdit() {
    setMenuOpen(false);
    setEditName(profileUser?.name ?? '');
    setEditUniversity(profileUser?.university ?? '');
    setEditStudiengang(profileUser?.studiengang ?? '');
    setEditSemester(profileUser?.semester?.toString() ?? '');
    setEditError('');
    setEditOpen(true);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setEditError('');
    setEditLoading(true);
    try {
      const updated = await updateMyProfile({
        name: editName,
        university: editUniversity,
        studiengang: editStudiengang,
        semester: editSemester ? Number(editSemester) : undefined,
      });
      updateUser(updated);
      setProfileUser(updated);
      setEditOpen(false);
    } catch (err) {
      setEditError(err instanceof Error ? err.message : 'Speichern fehlgeschlagen');
    } finally {
      setEditLoading(false);
    }
  }

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
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setMenuOpen((o) => !o)}
                  className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition"
                  title="Einstellungen"
                >
                  ⚙️
                </button>

                {menuOpen && (
                  <div className="absolute right-0 top-11 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden z-10 min-w-[180px]">
                    <button
                      onClick={openEdit}
                      className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition flex items-center gap-2"
                    >
                      ✏️ Profil bearbeiten
                    </button>
                    <div className="border-t border-gray-100" />
                    <button
                      onClick={logout}
                      className="w-full text-left px-4 py-3 text-sm text-red-500 hover:bg-red-50 transition flex items-center gap-2"
                    >
                      🚪 Abmelden
                    </button>
                  </div>
                )}
              </div>
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

      {/* Edit-Modal */}
      {editOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-4"
          onClick={() => setEditOpen(false)}
        >
          <div
            className="bg-white rounded-2xl w-full max-w-sm shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <h3 className="font-semibold text-gray-800 text-sm">Profil bearbeiten</h3>
              <button
                onClick={() => setEditOpen(false)}
                className="text-gray-400 hover:text-gray-600 text-lg leading-none"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleSave} className="px-4 py-4 space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Name *</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Universität / Hochschule</label>
                <input
                  type="text"
                  value={editUniversity}
                  onChange={(e) => setEditUniversity(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="z.B. Hochschule Heilbronn"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Studiengang</label>
                <input
                  type="text"
                  value={editStudiengang}
                  onChange={(e) => setEditStudiengang(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="z.B. Wirtschaftsinformatik"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Semester</label>
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={editSemester}
                  onChange={(e) => setEditSemester(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="z.B. 3"
                />
              </div>
              {editError && <p className="text-red-500 text-xs">{editError}</p>}
              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setEditOpen(false)}
                  className="flex-1 border border-gray-300 text-gray-600 rounded-xl py-2.5 text-sm hover:bg-gray-50 transition"
                >
                  Abbrechen
                </button>
                <button
                  type="submit"
                  disabled={editLoading}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-blue-500 text-white font-semibold rounded-xl py-2.5 text-sm hover:opacity-90 transition disabled:opacity-50"
                >
                  {editLoading ? '…' : 'Speichern'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppShell>
  );
}
