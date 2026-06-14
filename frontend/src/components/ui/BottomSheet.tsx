import type { ReactNode } from 'react';

interface BottomSheetProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

export default function BottomSheet({ open, onClose, title, children }: BottomSheetProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40"
      onClick={onClose}
    >
      <div
        className="sheet w-full max-w-md px-[18px] pt-3.5 pb-6 max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="grab" />
        <div className="flex items-center justify-between mb-[18px]">
          <h3 className="font-display font-extrabold text-ink text-[23px]">{title}</h3>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl border-2 border-ink bg-white grid place-items-center shadow-pop-sm"
            aria-label="Schließen"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" className="w-[18px] h-[18px] text-ink">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
