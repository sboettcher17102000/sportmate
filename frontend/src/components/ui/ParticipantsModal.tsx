import type { EventParticipant } from '../../types';
import { initials } from './eventHelpers';

interface ParticipantsModalProps {
  participants: EventParticipant[];
  open: boolean;
  onClose: () => void;
}

export default function ParticipantsModal({
  participants,
  open,
  onClose,
}: ParticipantsModalProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        className="card-pop w-full max-w-sm max-h-[70vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b-2 border-ink">
          <h3 className="font-display font-extrabold text-ink text-base">
            Teilnehmer ({participants.length})
          </h3>
          <button
            onClick={onClose}
            className="text-ink-2 hover:text-ink text-lg leading-none"
            aria-label="Schließen"
          >
            ✕
          </button>
        </div>

        <ul className="overflow-y-auto px-4 py-2 divide-y divide-[#F1EEFF]">
          {participants.map((p, i) => (
            <li key={i} className="flex items-center gap-3 py-2.5">
              <span
                className={`w-8 h-8 rounded-full text-[11px] font-extrabold font-display border-2 border-ink flex items-center justify-center ${
                  p.isSelf
                    ? 'bg-sky text-ink'
                    : p.isFriend
                    ? 'bg-violet text-white'
                    : 'bg-[#EDE7FF] text-ink-2'
                }`}
              >
                {p.isFriend || p.isSelf ? initials(p.name) : '👤'}
              </span>
              <span className="text-sm font-bold text-ink">{p.name}</span>
              {p.isFriend && (
                <span className="ml-auto pill text-violet" style={{ background: '#EDE7FF' }}>
                  Freund
                </span>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
