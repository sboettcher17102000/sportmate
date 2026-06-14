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

// Relative Zeitangabe für den Aktivitäts-Feed ("vor 2 Std", "gestern", …)
export function formatRelative(dateStr: string): string {
  const then = new Date(dateStr).getTime();
  const diffMin = Math.round((Date.now() - then) / 60000);
  if (diffMin < 1) return 'gerade eben';
  if (diffMin < 60) return `vor ${diffMin} Min`;
  const diffHours = Math.round(diffMin / 60);
  if (diffHours < 24) return `vor ${diffHours} Std`;
  const diffDays = Math.round(diffHours / 24);
  if (diffDays === 1) return 'gestern';
  if (diffDays < 7) return `vor ${diffDays} Tagen`;
  return formatDate(dateStr);
}

// Deterministische Pastellfarbe für farbige Initial-Avatare (Sticker-Pop-Look)
const AVATAR_BGS = ['#FFD7E4', '#CFE9FF', '#D9F7E6', '#FFE6D6', '#EDE7FF', '#FFF3D1', '#D6F5F0'];

export function avatarBg(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  return AVATAR_BGS[hash % AVATAR_BGS.length] as string;
}

export function initials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');
}
