import type { User } from '../../types';
import { initials } from './eventHelpers';

interface FriendAvatarsProps {
  friends: User[];
  max?: number;
}

export default function FriendAvatars({ friends, max = 3 }: FriendAvatarsProps) {
  if (friends.length === 0) return null;

  const shown = friends.slice(0, max);
  const overflow = friends.length - shown.length;

  return (
    <div className="flex items-center">
      <div className="flex -space-x-2">
        {shown.map((f) => (
          <span
            key={f.id}
            title={f.name}
            className="w-7 h-7 rounded-full bg-purple-600 text-white text-[10px] font-semibold flex items-center justify-center ring-2 ring-white"
          >
            {initials(f.name)}
          </span>
        ))}
        {overflow > 0 && (
          <span
            title={`${overflow} weitere`}
            className="w-7 h-7 rounded-full bg-gray-300 text-gray-700 text-[10px] font-semibold flex items-center justify-center ring-2 ring-white"
          >
            …
          </span>
        )}
      </div>
      <span className="ml-2 text-xs text-green-700">
        {friends.length === 1 ? 'nimmt teil' : 'nehmen teil'}
      </span>
    </div>
  );
}
