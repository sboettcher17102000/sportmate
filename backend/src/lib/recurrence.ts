// Wiederholungs-Logik für Events (Ansatz A: eine Event-Zeile + Regel).
// `date` ist der Anker/erste Termin; Wochentag + Uhrzeit werden daraus abgeleitet.
// Der "nächste Termin" wird zur Laufzeit berechnet – kein Cronjob, keine
// generierten Instanzen.

export const RECURRENCE_VALUES = ['weekly', 'biweekly', 'monthly'] as const;
export type Recurrence = (typeof RECURRENCE_VALUES)[number];

export function isValidRecurrence(value: unknown): value is Recurrence {
  return typeof value === 'string' && (RECURRENCE_VALUES as readonly string[]).includes(value);
}

// Minimaler Input – passt auf ein Prisma-Event und auf Test-Objekte.
export interface RecurringEventLike {
  date: Date;
  recurrence: string | null;
  recurrenceEndDate: Date | null;
}

const STEP_DAYS: Record<string, number> = { weekly: 7, biweekly: 14 };

// Einen Wiederholungsschritt vorwärts. Über die lokalen Date-Setter bleibt die
// Wanduhrzeit über Sommer-/Winterzeit-Wechsel hinweg erhalten.
function addStep(d: Date, recurrence: string): Date {
  const next = new Date(d);
  if (recurrence === 'monthly') {
    next.setMonth(next.getMonth() + 1);
  } else {
    next.setDate(next.getDate() + (STEP_DAYS[recurrence] ?? 7));
  }
  return next;
}

// Nächster Termin >= heute (Tagesgenau, damit ein Termin "heute" den ganzen Tag
// sichtbar bleibt). Gibt `null` zurück, wenn die Serie via Enddatum beendet ist.
// Für Einzel-Events (recurrence = null) wird einfach das Datum zurückgegeben.
export function nextOccurrence(event: RecurringEventLike, from: Date = new Date()): Date | null {
  if (!event.recurrence) return new Date(event.date);

  const cutoff = new Date(from);
  cutoff.setHours(0, 0, 0, 0);

  let occ = new Date(event.date);
  let guard = 0;
  while (occ < cutoff && guard < 1000) {
    occ = addStep(occ, event.recurrence);
    guard++;
  }

  if (event.recurrenceEndDate && occ > new Date(event.recurrenceEndDate)) {
    return null;
  }
  return occ;
}

// Letzter tatsächlicher Termin einer (beendeten) Serie – für die Anzeige als
// "vergangenes" Event. Ohne Enddatum gibt es keinen letzten Termin -> Anker.
export function lastOccurrence(event: RecurringEventLike): Date {
  if (!event.recurrence || !event.recurrenceEndDate) return new Date(event.date);

  const end = new Date(event.recurrenceEndDate);
  let occ = new Date(event.date);
  let guard = 0;
  while (guard < 1000) {
    const next = addStep(occ, event.recurrence);
    if (next > end) break;
    occ = next;
    guard++;
  }
  return occ;
}

// Das Datum, das in API-Responses ausgeliefert wird: nächster Termin, oder bei
// beendeter Serie der letzte Termin (fällt dann in "Vergangene Events").
export function displayDate(event: RecurringEventLike, from: Date = new Date()): Date {
  return nextOccurrence(event, from) ?? lastOccurrence(event);
}

const WEEKDAYS = [
  'Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag',
];

// Anzeige-Label für das UI-Badge, z. B. "jeden Dienstag" / "alle 2 Wochen".
export function recurrenceLabel(recurrence: string | null, anchorDate: Date): string | null {
  if (!recurrence) return null;
  const weekday = WEEKDAYS[new Date(anchorDate).getDay()];
  switch (recurrence) {
    case 'weekly':
      return `jeden ${weekday}`;
    case 'biweekly':
      return `alle 2 Wochen (${weekday})`;
    case 'monthly':
      return 'monatlich';
    default:
      return null;
  }
}
