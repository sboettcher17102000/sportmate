import BottomSheet from './BottomSheet';

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function QrScannerSheet({ open, onClose }: Props) {
  return (
    <BottomSheet open={open} onClose={onClose} title="QR-Code scannen">
      <div className="flex flex-col items-center text-center gap-4 py-3">
        <div className="relative w-56 h-56 rounded-[20px] border-[2.5px] border-ink bg-ink grid place-items-center overflow-hidden">
          {/* Scanner-Rahmen-Ecken */}
          <div className="absolute top-4 left-4 w-8 h-8 border-t-4 border-l-4 border-mint rounded-tl-lg" />
          <div className="absolute top-4 right-4 w-8 h-8 border-t-4 border-r-4 border-mint rounded-tr-lg" />
          <div className="absolute bottom-4 left-4 w-8 h-8 border-b-4 border-l-4 border-mint rounded-bl-lg" />
          <div className="absolute bottom-4 right-4 w-8 h-8 border-b-4 border-r-4 border-mint rounded-br-lg" />
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="w-20 h-20 text-white/40">
            <rect x="3" y="3" width="7" height="7" rx="1" />
            <rect x="14" y="3" width="7" height="7" rx="1" />
            <rect x="3" y="14" width="7" height="7" rx="1" />
            <path d="M14 14h3v3h-3zM20 14v7M14 20h3" />
          </svg>
        </div>
        <p className="text-sm font-semibold text-ink-2 max-w-[260px] leading-relaxed">
          Scanne den QR-Code eines Kommilitonen, um ihn als Freund hinzuzufügen.
          <br />
          <span className="text-xs">(Demo – Kamera ist im Prototyp deaktiviert.)</span>
        </p>
      </div>
    </BottomSheet>
  );
}
