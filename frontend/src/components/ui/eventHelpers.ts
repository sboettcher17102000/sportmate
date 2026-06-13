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
