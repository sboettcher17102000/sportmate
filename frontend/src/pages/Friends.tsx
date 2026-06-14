import { useState, useEffect } from 'react';
import AppShell from '../components/layout/AppShell';
import {
  getFriends,
  getPendingRequests,
  getFriendActivity,
  acceptFriendRequest,
  declineFriendRequest,
} from '../api/friendships';
import type { Friendship, FriendActivity } from '../types';
import { initials } from '../components/ui/eventHelpers';
import AddFriendSheet from '../components/ui/AddFriendSheet';
import QrScannerSheet from '../components/ui/QrScannerSheet';
import FriendActivityItem from '../components/ui/FriendActivityItem';
import FriendListRow from '../components/ui/FriendListRow';

type Tab = 'activity' | 'list';

export default function Friends() {
  const [friends, setFriends] = useState<Friendship[]>([]);
  const [pending, setPending] = useState<Friendship[]>([]);
  const [activity, setActivity] = useState<FriendActivity[]>([]);
  const [loading, setLoading] = useState(true);

  const [tab, setTab] = useState<Tab>('activity');
  const [search, setSearch] = useState('');
  const [addOpen, setAddOpen] = useState(false);
  const [scanOpen, setScanOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  function loadAll() {
    Promise.all([getFriends(), getPendingRequests(), getFriendActivity()])
      .then(([f, p, a]) => { setFriends(f); setPending(p); setActivity(a); })
      .finally(() => setLoading(false));
  }

  useEffect(loadAll, []);

  function notify(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 2000);
  }

  async function handleAccept(id: number) {
    await acceptFriendRequest(id);
    loadAll();
  }

  async function handleDecline(id: number) {
    await declineFriendRequest(id);
    loadAll();
  }

  const q = search.trim().toLowerCase();
  const filteredFriends = q
    ? friends.filter((f) => f.friend?.name.toLowerCase().includes(q))
    : friends;
  const filteredActivity = q
    ? activity.filter((a) => a.friend.name.toLowerCase().includes(q))
    : activity;

  return (
    <AppShell
      title="Freunde"
      subtitle={`${friends.length} ${friends.length === 1 ? 'Freund' : 'Freunde'}`}
      accent="sky"
      action={
        <button
          onClick={() => setScanOpen(true)}
          className="w-11 h-11 rounded-[13px] bg-white border-[2.5px] border-ink grid place-items-center shadow-pop-sm"
          aria-label="QR-Code scannen"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="w-5 h-5 text-ink">
            <rect x="4" y="4" width="7" height="7" rx="1.5" />
            <rect x="13" y="4" width="7" height="7" rx="1.5" />
            <rect x="4" y="13" width="7" height="7" rx="1.5" />
            <path d="M14 17h6M17 14v6" />
          </svg>
        </button>
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
                    <p className="text-xs font-bold text-ink-2">möchte dich hinzufügen</p>
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

        {/* Suche (filtert Freunde / Aktivität) */}
        <div className="card-pop flex items-center gap-3 px-4 py-3">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" className="w-5 h-5 text-ink flex-none"><circle cx="11" cy="11" r="7" /><path d="M21 21l-4-4" /></svg>
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Freunde durchsuchen…"
            className="w-full bg-transparent outline-none font-bold text-[14.5px] text-ink placeholder:text-ink-2"
          />
        </div>

        {/* Primär-Button – in jedem Zustand sichtbar */}
        <button onClick={() => setAddOpen(true)} className="btn-pop btn-violet">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" className="w-[19px] h-[19px]">
            <path d="M19 4v6M16 7h6" /><circle cx="9" cy="8" r="3" /><path d="M3 20a6 6 0 0112 0" />
          </svg>
          Freunde hinzufügen
        </button>

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
          <>
            <div className="flex gap-2">
              <button onClick={() => setTab('activity')} className={`seg-btn ${tab === 'activity' ? 'on' : ''}`}>
                Aktivität
              </button>
              <button
                onClick={() => setTab('list')}
                className={`seg-btn flex items-center justify-center gap-1.5 ${tab === 'list' ? 'on' : ''}`}
              >
                Freunde
                <span className="text-[11px] bg-yellow text-ink border-2 border-ink rounded-full px-1.5 min-w-[20px]">
                  {friends.length}
                </span>
              </button>
            </div>

            {tab === 'activity' ? (
              filteredActivity.length === 0 ? (
                <div className="flex flex-col items-center text-center gap-2 py-10 px-6">
                  <div className="w-20 h-20 rounded-[24px] bg-mint border-[2.5px] border-ink grid place-items-center shadow-pop-lg -rotate-3 mb-2 text-4xl">
                    🌱
                  </div>
                  <h4 className="font-display text-lg font-extrabold text-ink">Noch ruhig hier</h4>
                  <p className="text-sm font-semibold text-ink-2 max-w-[260px] leading-relaxed">
                    Sei der Erste und tritt einem Event bei!
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredActivity.map((a) => (
                    <FriendActivityItem key={a.id} activity={a} />
                  ))}
                </div>
              )
            ) : (
              <div className="space-y-3.5">
                {filteredFriends.map((f) => (
                  <FriendListRow
                    key={f.id}
                    friendship={f}
                    onInvite={(fr) => notify(`Einladung an ${fr.friend?.name ?? 'Freund'} gesendet (Demo)`)}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>

      <AddFriendSheet open={addOpen} onClose={() => setAddOpen(false)} />
      <QrScannerSheet open={scanOpen} onClose={() => setScanOpen(false)} />

      {toast && (
        <div className="fixed bottom-28 left-1/2 -translate-x-1/2 z-[70] bg-ink text-white font-display font-bold text-sm px-4 py-2.5 rounded-full shadow-pop-sm">
          {toast}
        </div>
      )}
    </AppShell>
  );
}
