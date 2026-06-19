/**
 * Import des Hochschulsport-Angebots der Hochschule Heilbronn.
 *
 * Hintergrund: Die Portalseite (https://portal.studi.hn/de/courses/sport-kurse/offers)
 * ist eine JavaScript-SPA von UniNow ("Campus365"). Die Kursliste steht NICHT im
 * statischen HTML und es gibt keine offene Katalog-API – ein einfacher HTTP-Fetch
 * reicht nicht. Für den Prototyp nutzen wir daher einen kuratierten Datensatz.
 *
 * AUSTAUSCHPUNKT: Nur `fetchCourses()` müsste später ersetzt werden – z. B. durch
 * einen Playwright-Headless-Crawler oder eine offizielle UniNow-API. Der Rest
 * (Mapping, Upsert, System-User) bleibt unverändert.
 */
import 'dotenv/config';
import { PrismaClient } from '../generated/prisma/client';
import { PrismaLibSql } from '@prisma/adapter-libsql';
import bcrypt from 'bcryptjs';
import path from 'path';
import { geocodeLocation } from '../lib/geocode';

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const PORTAL_URL = 'https://portal.studi.hn/de/courses/sport-kurse/offers';

export interface RawCourse {
  externalId: string;
  title: string;
  sport: string;
  date: Date;
  location: string;
  description?: string;
  externalUrl: string;
}

/**
 * Liefert die Hochschulsport-Kurse. Aktuell kuratierter Beispieldatensatz
 * (repräsentativ für das HN-Angebot). Später durch echten Crawler/API ersetzbar.
 */
export async function fetchCourses(): Promise<RawCourse[]> {
  const courses: Omit<RawCourse, 'externalUrl'>[] = [
    {
      externalId: 'hn-volleyball-mixed',
      title: 'Volleyball Mixed',
      sport: 'Volleyball',
      date: new Date('2026-06-22T18:00:00'),
      location: 'Sporthalle Campus Sontheim',
      description: 'Hochschulsport-Kurs: Mixed-Volleyball für alle Spielstärken.',
    },
    {
      externalId: 'hn-basketball',
      title: 'Basketball',
      sport: 'Basketball',
      date: new Date('2026-06-23T20:00:00'),
      location: 'Sporthalle Campus Sontheim',
      description: 'Hochschulsport-Kurs: Training und freies Spiel.',
    },
    {
      externalId: 'hn-bouldern',
      title: 'Bouldern für Einsteiger',
      sport: 'Klettern',
      date: new Date('2026-06-24T17:00:00'),
      location: 'Kletterzentrum Heilbronn',
      description: 'Hochschulsport-Kurs: Einführung ins Bouldern, Material gestellt.',
    },
    {
      externalId: 'hn-yoga',
      title: 'Yoga & Entspannung',
      sport: 'Yoga',
      date: new Date('2026-06-25T18:30:00'),
      location: 'Gymnastikraum Bildungscampus',
      description: 'Hochschulsport-Kurs: Hatha-Yoga, keine Vorkenntnisse nötig.',
    },
    {
      externalId: 'hn-lauftreff',
      title: 'Lauftreff am Neckar',
      sport: 'Laufen',
      date: new Date('2026-06-26T07:30:00'),
      location: 'Treffpunkt Neckarufer',
      description: 'Hochschulsport-Kurs: Gemeinsamer Dauerlauf, ca. 8 km.',
    },
    {
      externalId: 'hn-schwimmen',
      title: 'Schwimmtraining',
      sport: 'Schwimmen',
      date: new Date('2026-06-27T07:00:00'),
      location: 'Soleo Bad Heilbronn',
      description: 'Hochschulsport-Kurs: Techniktraining für alle Niveaus.',
    },
    {
      externalId: 'hn-tennis',
      title: 'Tennis Anfängerkurs',
      sport: 'Tennis',
      date: new Date('2026-06-28T16:00:00'),
      location: 'Tennisplätze Campus Sontheim',
      description: 'Hochschulsport-Kurs: Grundschläge für Einsteiger.',
    },
    {
      externalId: 'hn-fussball',
      title: 'Fußball Hochschulliga',
      sport: 'Fußball',
      date: new Date('2026-06-29T19:00:00'),
      location: 'Sportplatz Sontheim',
      description: 'Hochschulsport-Kurs: Wöchentliches Ligaspiel.',
    },
  ];

  return courses.map((c) => ({ ...c, externalUrl: PORTAL_URL }));
}

/**
 * Importiert die Kurse idempotent in die Datenbank. Wiederholte Läufe
 * aktualisieren bestehende Einträge (Upsert per externalId) statt zu duplizieren.
 */
export async function importHochschulsport(prisma: PrismaClient): Promise<number> {
  const password = await bcrypt.hash('hochschulsport-system', 10);

  // System-User als Ersteller der importierten Kurse (Event.creatorId ist non-null).
  const systemUser = await prisma.user.upsert({
    where: { email: 'hochschulsport@hs-heilbronn.de' },
    update: {},
    create: {
      name: 'Hochschulsport HN',
      email: 'hochschulsport@hs-heilbronn.de',
      password,
      university: 'Hochschule Heilbronn',
    },
  });

  const courses = await fetchCourses();

  for (const c of courses) {
    // Ort best-effort zu Koordinaten auflösen (für die Karten-Pins). Nominatim
    // erlaubt max. 1 Anfrage/Sekunde -> kurze Pause zwischen den Kursen.
    const coords = await geocodeLocation(c.location);
    await sleep(1100);
    await prisma.event.upsert({
      where: { externalId: c.externalId },
      update: {
        title: c.title,
        sport: c.sport,
        date: c.date,
        location: c.location,
        latitude: coords?.lat ?? null,
        longitude: coords?.lng ?? null,
        description: c.description ?? null,
        externalUrl: c.externalUrl,
      },
      create: {
        title: c.title,
        sport: c.sport,
        date: c.date,
        location: c.location,
        latitude: coords?.lat ?? null,
        longitude: coords?.lng ?? null,
        description: c.description ?? null,
        source: 'university',
        externalUrl: c.externalUrl,
        externalId: c.externalId,
        creatorId: systemUser.id,
      },
    });
  }

  return courses.length;
}

// Runner: `npm run import:hochschulsport`
function resolveDbUrl(): string {
  const raw = process.env.DATABASE_URL ?? 'file:./prisma/dev.db';
  if (raw.startsWith('file:')) {
    return `file:${path.resolve(raw.slice('file:'.length))}`;
  }
  return raw;
}

if (require.main === module) {
  const adapter = new PrismaLibSql({ url: resolveDbUrl() });
  const prisma = new PrismaClient({ adapter });
  importHochschulsport(prisma)
    .then((n) => console.log(`Hochschulsport-Import abgeschlossen ✓ – ${n} Kurse importiert/aktualisiert`))
    .catch(console.error)
    .finally(() => prisma.$disconnect());
}
