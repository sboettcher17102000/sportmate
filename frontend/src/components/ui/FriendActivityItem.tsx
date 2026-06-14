import type { FriendActivity } from '../../types';
import { initials, avatarBg, sportEmoji, sportBg, formatRelative } from './eventHelpers';

interface Props {
  activity: FriendActivity;
}

export default function FriendActivityItem({ activity }: Props) {
  const isJoin = activity.type === 'join';

  return (
    <div className="card-pop p-[15px] flex gap-3.5 items-start">
      <div className="relative flex-none">
        <div
          className="w-12 h-12 rounded-[15px] border-[2.5px] border-ink grid place-items-center font-display font-extrabold text-xl text-ink shadow-pop-sm"
          style={{ background: avatarBg(activity.friend.name) }}
        >
          {initials(activity.friend.name)}
        </div>
        <span
          className={`absolute -right-1.5 -bottom-1.5 w-6 h-6 rounded-full border-2 border-ink grid place-items-center shadow-pop-sm ${
            isJoin ? 'bg-mint' : 'bg-coral'
          }`}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.2" className="w-3.5 h-3.5 text-ink">
            {isJoin ? <path d="M12 5v14M5 12h14" /> : <path d="M5 12h14" />}
          </svg>
        </span>
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-[14.5px] font-semibold text-ink leading-snug">
          <span className="font-display font-extrabold">{activity.friend.name}</span>{' '}
          {isJoin ? (
            <span className="font-extrabold text-[#1ba06a]">ist beigetreten</span>
          ) : (
            <span className="font-extrabold text-coral">hat verlassen</span>
          )}
        </p>
        <span className="inline-flex items-center gap-1.5 mt-2.5 font-display font-bold text-[12.5px] bg-paper border-2 border-ink rounded-full pl-[7px] pr-3 py-[5px] shadow-pop-sm">
          <span
            className="w-[22px] h-[22px] rounded-[7px] border-2 border-ink grid place-items-center text-xs"
            style={{ background: sportBg(activity.event.sport) }}
          >
            {sportEmoji(activity.event.sport)}
          </span>
          {activity.event.title}
        </span>
      </div>

      <div className="font-display font-bold text-[11.5px] text-ink-2 whitespace-nowrap flex-none">
        {formatRelative(activity.createdAt)}
      </div>
    </div>
  );
}
