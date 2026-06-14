import { useState, useEffect } from 'react';
import AppShell from '../components/layout/AppShell';
import {
  getFriends,
  getPendingRequests,
  acceptFriendRequest,
  declineFriendRequest,
  searchUsers,
  sendFriendRequest,
} from '../api/friendships';
import type { Friendship, User } from '../types';
import { Link } from 'react-router-dom';
import { initials } from '../components/ui/eventHelpers';

export default function Friends() {
  const [friends, setFriends] = useState<Friendship[]>([]);
  const [pending, setPending] = useState<Friendship[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  function loadAll() {
    Promise.all([getFriends(), getPendingRequests()])
      .then(([f, p]) => { setFriends(f); setPending(p); })
      .finally(() => setLoading(false));
  }

  useEffect(loadAll, []);

  useEffect(() => {
    if (searchQuery.trim().length < 2) { setSearchResults([]); return; }
    const t = setTimeout(() => {
      searchUsers(searchQuery).then(setSearchResults);
    }, 300);
    return () => clearTimeout(t);
  }, [searchQuery]);

  async function handleAccept(id: number) {
    await acceptFriendRequest(id);
    loadAll();
  }

  async function handleDecline(id: number) {
    await declineFriendRequest(id);
    loadAll();
  }

  async function handleAddFriend(userId: number) {
    await sendFriendRequest(userId);
    setSearchResults((prev) => prev.filter((u) => u.id !== userId));
  }

  return (
    <AppShell
      title="Freunde"
      subtitle={`${friends.length} Freunde`}
      accent="sky"
      action={
        <div className="ic-btn w-11 h-11 rounded-[13px] bg-white border-[2.5px] border-ink grid place-items-center shadow-pop-sm">
          <span className="text-lg">👥</span>
        </div>
      }
    >
      <div className="px-4 pt-4 space-y-4">
        {pending.length > 0 && (
          <div className="card-pop p-4">
            <h3 className="font-display font-extrabold text-ink text-base mb-3">Freundschaftsanfragen</h3>
            <div className="space-y-3">
              {pending.map((req) => (
                <div key={req.id} className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-violet text-white border-2 border-ink flex items-center justify-center font-display font-extrabold text-sm">
                    {initials(req.friend?.name ?? '?')}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-display font-extrabold text-sm text-ink">{req.friend?.name}</p>
                    <p className="text-xs font-bold text-ink-2">3 gemeinsame Freunde</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleAccept(req.id)}
                      className="btn-pop btn-violet w-auto px-3 py-2 text-[13px]"
                    >
                      ✓
                    </button>
                    <button
                      onClick={() => handleDecline(req.id)}
                      className="btn-pop btn-white w-auto px-3 py-2 text-[13px]"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="card-pop flex items-center gap-3 px-4 py-3">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" className="w-5 h-5 text-ink flex-none"><circle cx="11" cy="11" r="7" /><path d="M21 21l-4-4" /></svg>
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Freunde durchsuchen…"
            className="w-full bg-transparent outline-none font-bold text-[14.5px] text-ink placeholder:text-ink-2"
          />
        </div>

        {searchResults.length > 0 && (
          <div className="card-pop p-4 space-y-3">
            <p className="font-display text-xs font-extrabold text-ink-2 uppercase tracking-wide">Suchergebnisse</p>
            {searchResults.map((user) => (
              <div key={user.id} className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-sky text-ink border-2 border-ink flex items-center justify-center font-display font-extrabold text-sm">
                  {initials(user.name)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-display font-extrabold text-sm text-ink">{user.name}</p>
                  {user.semester && <p className="text-xs font-bold text-ink-2">{user.semester}. Semester</p>}
                </div>
                <button
                  onClick={() => handleAddFriend(user.id)}
                  className="btn-pop btn-violet w-auto px-4 py-2 text-[13px]"
                >
                  Hinzufügen
                </button>
              </div>
            ))}
          </div>
        )}

        {loading ? (
          <p className="text-sm font-bold text-ink-2 text-center py-8">Lade Freunde…</p>
        ) : friends.length === 0 ? (
          <div className="flex flex-col items-center text-center gap-2 py-8 px-6">
            <div className="w-24 h-24 rounded-[28px] bg-sky border-[2.5px] border-ink grid place-items-center shadow-pop-lg -rotate-3 mb-3">
              <span className="text-5xl">🤝</span>
            </div>
            <h4 className="font-display text-xl font-extrabold text-ink">Trainiere nie allein!</h4>
            <p className="text-sm font-semibold text-ink-2 max-w-[250px] leading-relaxed">
              Füge Kommilitonen hinzu und seht, an welchen Events ihr gemeinsam teilnehmt.
            </p>
          </div>
        ) : (
          <div className="space-y-3.5">
            {friends.map((f) => (
              <div key={f.id} className="card-pop p-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-[16px] bg-yellow text-ink border-[2.5px] border-ink flex items-center justify-center font-display font-extrabold shadow-pop-sm -rotate-3">
                    {initials(f.friend?.name ?? '?')}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-display font-extrabold text-lg text-ink leading-tight">{f.friend?.name}</p>
                    {f.friend?.semester && (
                      <p className="text-xs font-bold text-ink-2">{f.friend.semester}. Semester</p>
                    )}
                  </div>
                </div>
                <div className="mt-3.5 flex gap-3">
                  <Link
                    to={`/profile/${f.friend?.id}`}
                    className="btn-pop btn-violet flex-1"
                  >
                    Profil ansehen
                  </Link>
                  <button className="btn-pop btn-white flex-1">
                    Einladen
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
