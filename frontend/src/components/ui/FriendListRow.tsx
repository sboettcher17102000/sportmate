import { Link } from 'react-router-dom';
import type { Friendship } from '../../types';
import { initials, avatarBg } from './eventHelpers';

interface Props {
  friendship: Friendship;
  onInvite: (friendship: Friendship) => void;
}

function commonLabel(count: number): string {
  if (count <= 0) return 'noch kein Match';
  if (count === 1) return '1 gemeinsames Event';
  return `${count} gemeinsame Events`;
}

export default function FriendListRow({ friendship, onInvite }: Props) {
  const friend = friendship.friend;
  const common = friendship.commonEventsCount ?? 0;

  return (
    <div className="card-pop p-3.5 flex items-center gap-3.5">
      <div
        className="w-12 h-12 rounded-[15px] border-[2.5px] border-ink grid place-items-center font-display font-extrabold text-xl text-ink shadow-pop-sm flex-none"
        style={{ background: avatarBg(friend?.name ?? '?') }}
      >
        {initials(friend?.name ?? '?')}
      </div>

      <div className="flex-1 min-w-0">
        <Link
          to={`/profile/${friend?.id}`}
          className="font-display font-extrabold text-base text-ink leading-tight block truncate"
        >
          {friend?.name}
        </Link>
        <p className="text-[12.5px] font-bold text-ink-2 truncate">
          {friend?.semester ? `${friend.semester}. Semester · ` : ''}
          {commonLabel(common)}
        </p>
      </div>

      {common > 0 ? (
        <span className="flex-none font-display font-extrabold text-[13px] bg-yellow text-ink border-2 border-ink rounded-full px-[11px] py-1.5 shadow-pop-sm">
          🔥 {common}
        </span>
      ) : (
        <button
          onClick={() => onInvite(friendship)}
          className="flex-none font-display font-bold text-[13px] bg-violet text-white border-2 border-ink rounded-full px-3.5 py-2 shadow-pop-sm flex items-center gap-1.5"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" className="w-3.5 h-3.5">
            <path d="M12 5v14M5 12h14" />
          </svg>
          Einladen
        </button>
      )}
    </div>
  );
}
