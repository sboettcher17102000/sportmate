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
        className="bg-white rounded-2xl w-full max-w-sm max-h-[70vh] flex flex-col shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <h3 className="font-semibold text-gray-800 text-sm">
            Teilnehmer ({participants.length})
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-lg leading-none"
            aria-label="Schließen"
          >
            ✕
          </button>
        </div>

        <ul className="overflow-y-auto px-4 py-2 divide-y divide-gray-50">
          {participants.map((p, i) => (
            <li key={i} className="flex items-center gap-3 py-2">
              <span
                className={`w-8 h-8 rounded-full text-[11px] font-semibold flex items-center justify-center ${
                  p.isSelf
                    ? 'bg-blue-600 text-white'
                    : p.isFriend
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-200 text-gray-500'
                }`}
              >
                {p.isFriend || p.isSelf ? initials(p.name) : '👤'}
              </span>
              <span className="text-sm text-gray-700">{p.name}</span>
              {p.isFriend && (
                <span className="ml-auto text-[10px] text-purple-600 bg-purple-50 rounded-full px-2 py-0.5">
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
