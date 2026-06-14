import BottomSheet from './BottomSheet';
import { sportEmoji, sportBg } from './eventHelpers';

export const SOURCE_TABS = [
  { label: 'Alle', value: '' },
  { label: 'Hochschulsport', value: 'university' },
  { label: 'Lokales Event', value: 'external' },
];

export const SPORT_TAGS = [
  'Volleyball',
  'Fußball',
  'Basketball',
  'Laufen',
  'Yoga',
  'Schwimmen',
  'Klettern',
  'Wassersport',
  'Tennis',
];

interface EventFilterSheetProps {
  open: boolean;
  onClose: () => void;
  activeSource: string;
  setActiveSource: (value: string) => void;
  activeSports: string[];
  toggleSport: (sport: string) => void;
  setActiveSports: (sports: string[]) => void;
  resultCount: number;
}

export default function EventFilterSheet({
  open,
  onClose,
  activeSource,
  setActiveSource,
  activeSports,
  toggleSport,
  setActiveSports,
  resultCount,
}: EventFilterSheetProps) {
  const reset = () => {
    setActiveSource('');
    setActiveSports([]);
  };

  return (
    <BottomSheet open={open} onClose={onClose} title="Filter">
      <p className="font-display font-extrabold text-sm text-ink mb-[11px] ml-0.5">Art des Events</p>
      <div className="flex gap-2 mb-[22px]">
        {SOURCE_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveSource(tab.value)}
            className={`seg-btn ${activeSource === tab.value ? 'on' : ''}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <p className="font-display font-extrabold text-sm text-ink mb-[11px] ml-0.5">Sportart</p>
      <div className="grid grid-cols-3 gap-2.5 mb-6">
        {SPORT_TAGS.map((sport) => {
          const on = activeSports.includes(sport);
          return (
            <button
              key={sport}
              onClick={() => toggleSport(sport)}
              className={`sp ${on ? 'on' : ''}`}
            >
              <span className="ci" style={{ background: on ? undefined : sportBg(sport) }}>
                {sportEmoji(sport)}
              </span>
              {sport}
            </button>
          );
        })}
      </div>

      <div className="flex gap-[11px]">
        <button onClick={reset} className="btn-pop btn-white flex-none basis-[130px]">
          Zurücksetzen
        </button>
        <button onClick={onClose} className="btn-pop btn-violet">
          {resultCount} Events anzeigen
        </button>
      </div>
    </BottomSheet>
  );
}
