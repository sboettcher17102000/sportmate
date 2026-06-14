import { useState, useEffect } from 'react';
import BottomSheet from './BottomSheet';
import { searchUsers, sendFriendRequest } from '../../api/friendships';
import type { User } from '../../types';
import { initials, avatarBg } from './eventHelpers';

interface Props {
  open: boolean;
  onClose: () => void;
}

// Demo-Einladungslink – im Prototyp kein echter Deep-Link
const INVITE_LINK = 'https://sportmate.app/einladung/max-2f9c';

export default function AddFriendSheet({ open, onClose }: Props) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<User[]>([]);
  const [requested, setRequested] = useState<number[]>([]);
  const [copied, setCopied] = useState(false);
  const [showQr, setShowQr] = useState(false);

  useEffect(() => {
    if (query.trim().length < 2) { setResults([]); return; }
    const t = setTimeout(() => {
      searchUsers(query).then(setResults);
    }, 300);
    return () => clearTimeout(t);
  }, [query]);

  // Beim Schließen Zustand zurücksetzen
  useEffect(() => {
    if (!open) {
      setQuery(''); setResults([]); setRequested([]); setCopied(false); setShowQr(false);
    }
  }, [open]);

  async function handleAdd(userId: number) {
    await sendFriendRequest(userId);
    setRequested((prev) => [...prev, userId]);
  }

  function copyLink() {
    navigator.clipboard?.writeText(INVITE_LINK).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <BottomSheet open={open} onClose={onClose} title="Freunde hinzufügen">
      {/* 1 · Suche per Name/Username */}
      <p className="font-display font-extrabold text-sm text-ink mb-[11px] ml-0.5">Per Name oder Username</p>
      <div className="card-pop flex items-center gap-3 px-4 py-3 mb-3">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" className="w-5 h-5 text-ink flex-none">
          <circle cx="11" cy="11" r="7" />
          <path d="M21 21l-4-4" />
        </svg>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Kommilitonen suchen…"
          className="w-full bg-transparent outline-none font-bold text-[14.5px] text-ink placeholder:text-ink-2"
        />
      </div>

      {results.length > 0 && (
        <div className="space-y-2.5 mb-5">
          {results.map((user) => (
            <div key={user.id} className="flex items-center gap-3">
              <div
                className="w-11 h-11 rounded-[14px] border-2 border-ink grid place-items-center font-display font-extrabold text-sm text-ink flex-none"
                style={{ background: avatarBg(user.name) }}
              >
                {initials(user.name)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-display font-extrabold text-sm text-ink truncate">{user.name}</p>
                {user.semester && <p className="text-xs font-bold text-ink-2">{user.semester}. Semester</p>}
              </div>
              {requested.includes(user.id) ? (
                <span className="pill">Angefragt ✓</span>
              ) : (
                <button
                  onClick={() => handleAdd(user.id)}
                  className="btn-pop btn-violet w-auto px-4 py-2 text-[13px]"
                >
                  Hinzufügen
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* 2 · Weitere Optionen */}
      <p className="font-display font-extrabold text-sm text-ink mb-[11px] ml-0.5 mt-2">Oder teilen</p>
      <div className="space-y-2.5">
        <button onClick={copyLink} className="card-pop w-full flex items-center gap-3 p-3.5 text-left">
          <span className="w-10 h-10 rounded-[13px] bg-teal border-2 border-ink grid place-items-center shadow-pop-sm flex-none">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="w-5 h-5 text-ink">
              <path d="M10 13a5 5 0 007 0l2-2a5 5 0 00-7-7l-1 1M14 11a5 5 0 00-7 0l-2 2a5 5 0 007 7l1-1" />
            </svg>
          </span>
          <span className="flex-1 font-display font-extrabold text-[15px] text-ink">
            {copied ? 'Link kopiert! ✓' : 'Einladungslink teilen'}
          </span>
        </button>

        <button onClick={() => setShowQr((v) => !v)} className="card-pop w-full flex items-center gap-3 p-3.5 text-left">
          <span className="w-10 h-10 rounded-[13px] bg-yellow border-2 border-ink grid place-items-center shadow-pop-sm flex-none">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="w-5 h-5 text-ink">
              <rect x="4" y="4" width="7" height="7" rx="1.5" />
              <rect x="13" y="4" width="7" height="7" rx="1.5" />
              <rect x="4" y="13" width="7" height="7" rx="1.5" />
              <path d="M14 17h6M17 14v6" />
            </svg>
          </span>
          <span className="flex-1 font-display font-extrabold text-[15px] text-ink">Meinen QR-Code zeigen</span>
        </button>

        {showQr && (
          <div className="card-pop flex flex-col items-center gap-2 p-5">
            <div className="w-40 h-40 rounded-[16px] border-[2.5px] border-ink bg-white grid place-items-center">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="w-28 h-28 text-ink">
                <rect x="3" y="3" width="7" height="7" rx="1" />
                <rect x="14" y="3" width="7" height="7" rx="1" />
                <rect x="3" y="14" width="7" height="7" rx="1" />
                <path d="M14 14h3v3h-3zM20 14v7M14 20h3M17 17h4" />
              </svg>
            </div>
            <p className="text-xs font-bold text-ink-2 text-center">QR-Code (Demo) – im Prototyp ohne Funktion</p>
          </div>
        )}
      </div>
    </BottomSheet>
  );
}
