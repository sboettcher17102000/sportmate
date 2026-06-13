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
      action={
        <button className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30 transition">
          👥
        </button>
      }
    >
      <div className="px-4 pt-4 space-y-4">
        {pending.length > 0 && (
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <h3 className="font-semibold text-gray-800 text-sm mb-3">Freundschaftsanfragen</h3>
            {pending.map((req) => (
              <div key={req.id} className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-purple-200 flex items-center justify-center text-purple-700 font-bold text-sm">
                  {req.friend?.name?.charAt(0) ?? '?'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-gray-800">{req.friend?.name}</p>
                  <p className="text-xs text-gray-400">3 gemeinsame Freunde</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleAccept(req.id)}
                    className="bg-blue-600 text-white text-xs font-medium rounded-xl px-3 py-2 hover:bg-blue-700 transition"
                  >
                    Akzeptieren
                  </button>
                  <button
                    onClick={() => handleDecline(req.id)}
                    className="border border-gray-300 text-gray-600 text-xs font-medium rounded-xl px-3 py-2 hover:bg-gray-50 transition"
                  >
                    Ablehnen
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Freunde durchsuchen..."
            className="w-full bg-white border border-gray-200 rounded-xl pl-9 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
          />
        </div>

        {searchResults.length > 0 && (
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 space-y-3">
            <p className="text-xs font-medium text-gray-500">Suchergebnisse</p>
            {searchResults.map((user) => (
              <div key={user.id} className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-200 flex items-center justify-center text-blue-700 font-bold text-sm">
                  {user.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-gray-800">{user.name}</p>
                  {user.semester && <p className="text-xs text-gray-500">{user.semester}. Semester</p>}
                </div>
                <button
                  onClick={() => handleAddFriend(user.id)}
                  className="bg-purple-600 text-white text-xs font-medium rounded-xl px-3 py-2 hover:bg-purple-700 transition"
                >
                  Hinzufügen
                </button>
              </div>
            ))}
          </div>
        )}

        {loading ? (
          <p className="text-sm text-gray-400 text-center py-8">Lade Freunde…</p>
        ) : (
          <div className="space-y-3">
            {friends.map((f) => (
              <div key={f.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-blue-400 flex items-center justify-center text-white font-bold">
                    {f.friend?.name?.charAt(0) ?? '?'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-800">{f.friend?.name}</p>
                    {f.friend?.semester && (
                      <p className="text-xs text-gray-500">{f.friend.semester}. Semester</p>
                    )}
                  </div>
                </div>
                <div className="mt-3 flex gap-2">
                  <Link
                    to={`/profile/${f.friend?.id}`}
                    className="flex-1 bg-blue-600 text-white text-xs font-medium rounded-xl py-2 text-center hover:bg-blue-700 transition"
                  >
                    Profil ansehen
                  </Link>
                  <button className="flex-1 border border-gray-200 text-gray-600 text-xs font-medium rounded-xl py-2 hover:bg-gray-50 transition">
                    Zu Event einladen
                  </button>
                </div>
              </div>
            ))}
            {friends.length === 0 && (
              <p className="text-center text-gray-400 text-sm py-8">
                Noch keine Freunde hinzugefügt.
              </p>
            )}
          </div>
        )}
      </div>
    </AppShell>
  );
}
