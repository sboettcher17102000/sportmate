import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import AppShell from '../components/layout/AppShell';
import { useAuth } from '../context/AuthContext';
import { getMyEvents, getUserEvents } from '../api/events';
import { getUserProfile, updateMyProfile } from '../api/friendships';
import type { Event, User } from '../types';
import { formatDate, sportEmoji, sportBg } from '../components/ui/eventHelpers';

const ACHIEVEMENTS = [
  { emoji: '🌟', title: 'Early Bird', desc: '10 Events besucht', bg: '#FFF3D1' },
  { emoji: '🏃', title: 'Marathon Master', desc: 'Trollinger Marathon absolviert', bg: '#FFE0E8' },
  { emoji: '🦋', title: 'Social Butterfly', desc: '5 Freunde eingeladen', bg: '#EDE7FF' },
  { emoji: '🔥', title: 'Streak King', desc: '7 Tage in Folge aktiv', bg: '#FFE6D6' },
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
          setEvents(await getUserEvents(parseInt(id)));
        } else {
          setEvents(await getMyEvents());
        }
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
        <p className="text-center text-ink-2 font-bold text-sm py-12">Lade Profil…</p>
      </AppShell>
    );
  }

  return (
    <AppShell noHeader>
      <div className="app-header accent-violet px-4 pt-10 pb-6">
        <div className="flex items-start justify-between relative z-30">
          <div className="flex items-center gap-3">
            <div className="logo-mark">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-ink">
                <path d="M13 3L4 14h6l-1 7 9-11h-6z" />
              </svg>
            </div>
            <div className="text-white">
              <h1 className="font-display text-lg font-extrabold leading-none">SportMate</h1>
              <p className="text-xs font-bold opacity-90">Dein Hochschulsport-Begleiter</p>
            </div>
          </div>

          {isOwnProfile && (
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setMenuOpen((o) => !o)}
                className="w-11 h-11 rounded-[13px] bg-white border-[2.5px] border-ink grid place-items-center shadow-pop-sm"
                title="Einstellungen"
              >
                ⚙️
              </button>

              {menuOpen && (
                <div className="absolute right-0 top-13 mt-2 card-pop overflow-hidden z-20 min-w-[190px]">
                  <button
                    onClick={openEdit}
                    className="w-full text-left px-4 py-3 text-sm font-bold text-ink hover:bg-paper transition flex items-center gap-2"
                  >
                    ✏️ Profil bearbeiten
                  </button>
                  <div className="border-t-2 border-ink" />
                  <button
                    onClick={logout}
                    className="w-full text-left px-4 py-3 text-sm font-bold text-coral hover:bg-paper transition flex items-center gap-2"
                  >
                    🚪 Abmelden
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-4 mt-4 text-white">
          <div className="w-[68px] h-[68px] rounded-[22px] bg-yellow border-[2.5px] border-ink grid place-items-center font-display text-3xl font-extrabold text-ink shadow-pop -rotate-3">
            {profileUser?.name?.charAt(0) ?? '?'}
          </div>
          <div>
            <h2 className="font-display text-2xl font-extrabold leading-tight">{profileUser?.name ?? 'Unbekannt'}</h2>
            {profileUser?.university && <p className="text-sm font-bold opacity-90">{profileUser.university}</p>}
            {profileUser?.studiengang && <p className="text-sm font-bold opacity-90">{profileUser.studiengang}</p>}
            {profileUser?.semester && <p className="text-sm font-bold opacity-90">{profileUser.semester}. Semester</p>}
          </div>
        </div>

        <div className="flex gap-3 mt-5">
          <div className="flex-1 bg-white border-[2.5px] border-ink rounded-[20px] py-3 text-center shadow-pop-sm">
            <p className="font-display text-2xl font-extrabold text-ink leading-none">{events.length}</p>
            <p className="font-display text-[11.5px] font-bold text-ink-2 mt-1">Events</p>
          </div>
          <div className="flex-1 bg-white border-[2.5px] border-ink rounded-[20px] py-3 text-center shadow-pop-sm">
            <p className="font-display text-2xl font-extrabold text-ink leading-none">87%</p>
            <p className="font-display text-[11.5px] font-bold text-ink-2 mt-1">Anwesenheit</p>
          </div>
          <div className="flex-1 bg-white border-[2.5px] border-ink rounded-[20px] py-3 text-center shadow-pop-sm">
            <p className="font-display text-2xl font-extrabold text-ink leading-none">5🔥</p>
            <p className="font-display text-[11.5px] font-bold text-ink-2 mt-1">Tage Streak</p>
          </div>
        </div>
      </div>

      <div className="px-4 pt-4 space-y-4">
        <div className="card-pop p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="flex items-center gap-2 font-display font-extrabold text-base text-ink">🎯 Monatsziel</span>
            <span className="pill bg-violet text-white">5 / 8 Events</span>
          </div>
          <div className="progress-pop violet" style={{ height: 16 }}>
            <i style={{ width: '62.5%' }} />
          </div>
          <p className="text-[13px] font-bold text-ink-2 mt-3">Noch <span className="text-violet">3 Events</span> bis zum Ziel — fast geschafft!</p>
        </div>

        {isOwnProfile && (
          <div className="card-pop p-4">
            <div className="flex items-center gap-2 font-display font-extrabold text-base text-ink mb-4">🏆 Erfolge</div>
            <div className="grid grid-cols-2 gap-3">
              {ACHIEVEMENTS.map((a, i) => (
                <div key={a.title} className={`bg-paper border-[2.5px] border-ink rounded-[20px] p-3.5 shadow-pop-sm ${i % 2 === 0 ? '-rotate-1' : 'rotate-1'}`}>
                  <div className="w-10 h-10 rounded-[13px] border-[2.5px] border-ink grid place-items-center text-xl mb-2.5 shadow-pop-sm" style={{ background: a.bg }}>{a.emoji}</div>
                  <p className="font-display text-sm font-extrabold text-ink leading-tight">{a.title}</p>
                  <p className="text-[11.5px] font-bold text-ink-2 mt-0.5">{a.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="card-pop p-4">
          <div className="flex items-center gap-2 font-display font-extrabold text-base text-ink mb-4">📅 Nächste Events</div>
          {upcoming.length === 0 ? (
            <p className="text-sm font-bold text-ink-2">Keine bevorstehenden Events</p>
          ) : (
            <div className="space-y-3.5">
              {upcoming.slice(0, 3).map((event) => (
                <div key={event.id} className="flex items-center gap-3">
                  <span className="badge-pop w-11 h-11 text-xl" style={{ background: sportBg(event.sport) }}>{sportEmoji(event.sport)}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-display text-[15px] font-extrabold text-ink leading-tight truncate">{event.title}</p>
                    <p className="text-xs font-bold text-ink-2">{formatDate(event.date)} · {event.location}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Edit-Modal */}
      {editOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-4"
          onClick={() => setEditOpen(false)}
        >
          <div
            className="card-pop w-full max-w-sm"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-4 py-3 border-b-2 border-ink">
              <h3 className="font-display font-extrabold text-ink text-base">Profil bearbeiten</h3>
              <button
                onClick={() => setEditOpen(false)}
                className="text-ink-2 hover:text-ink text-lg leading-none"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleSave} className="px-4 py-4 space-y-3">
              <div>
                <label className="block font-display text-xs font-extrabold text-ink mb-1.5">Name *</label>
                <input type="text" required value={editName} onChange={(e) => setEditName(e.target.value)} className="input-pop" />
              </div>
              <div>
                <label className="block font-display text-xs font-extrabold text-ink mb-1.5">Universität / Hochschule</label>
                <input type="text" value={editUniversity} onChange={(e) => setEditUniversity(e.target.value)} className="input-pop" placeholder="z.B. Hochschule Heilbronn" />
              </div>
              <div>
                <label className="block font-display text-xs font-extrabold text-ink mb-1.5">Studiengang</label>
                <input type="text" value={editStudiengang} onChange={(e) => setEditStudiengang(e.target.value)} className="input-pop" placeholder="z.B. Wirtschaftsinformatik" />
              </div>
              <div>
                <label className="block font-display text-xs font-extrabold text-ink mb-1.5">Semester</label>
                <input type="number" min={1} max={20} value={editSemester} onChange={(e) => setEditSemester(e.target.value)} className="input-pop" placeholder="z.B. 3" />
              </div>
              {editError && <p className="text-coral font-bold text-xs">{editError}</p>}
              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setEditOpen(false)} className="btn-pop btn-white flex-1">
                  Abbrechen
                </button>
                <button type="submit" disabled={editLoading} className="btn-pop btn-violet flex-1">
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
