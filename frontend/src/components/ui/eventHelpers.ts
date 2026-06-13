export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('de-DE', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}

export function formatTime(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString('de-DE', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

const EMOJI_MAP: Record<string, string> = {
  Volleyball: '🏐',
  Fußball: '⚽',
  Basketball: '🏀',
  Laufen: '🏃',
  Yoga: '🧘',
  Schwimmen: '🏊',
  Klettern: '🧗',
  Wassersport: '🚣',
  Tennis: '🎾',
  Andere: '🎯',
};

export function sportEmoji(sport: string): string {
  return EMOJI_MAP[sport] ?? '🏅';
}

// Pastell-Hintergrundfarbe je Sportart für die Emoji-Badges (Sticker-Pop-Look)
const SPORT_BG_MAP: Record<string, string> = {
  Volleyball: '#EDE7FF',
  Fußball: '#D9F7E6',
  Basketball: '#FFE6D6',
  Laufen: '#FFE0E8',
  Yoga: '#FFF3D1',
  Schwimmen: '#DCF1FF',
  Klettern: '#E8EFD9',
  Wassersport: '#D6F5F0',
  Tennis: '#FFE0E8',
  Andere: '#EDE7FF',
};

export function sportBg(sport: string): string {
  return SPORT_BG_MAP[sport] ?? '#EDE7FF';
}

export function initials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');
}
