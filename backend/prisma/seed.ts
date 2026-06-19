import 'dotenv/config';
import { PrismaClient } from '../src/generated/prisma/client';
import { PrismaLibSql } from '@prisma/adapter-libsql';
import bcrypt from 'bcryptjs';
import path from 'path';

function resolveDbUrl(): string {
  const raw = process.env.DATABASE_URL ?? 'file:./prisma/dev.db';
  if (raw.startsWith('file:')) {
    const filePath = raw.slice('file:'.length);
    return `file:${path.resolve(filePath)}`;
  }
  return raw;
}

const adapter = new PrismaLibSql({ url: resolveDbUrl() });
const prisma = new PrismaClient({ adapter });

async function main() {
  const password = await bcrypt.hash('password123', 10);

  const max = await prisma.user.upsert({
    where: { email: 'max@hs-heilbronn.de' },
    update: {},
    create: {
      name: 'Max Mustermann',
      email: 'max@hs-heilbronn.de',
      password,
      semester: 4,
      interests: 'Laufen,Volleyball',
    },
  });

  const anna = await prisma.user.upsert({
    where: { email: 'anna@hs-heilbronn.de' },
    update: {},
    create: {
      name: 'Anna Schmidt',
      email: 'anna@hs-heilbronn.de',
      password,
      semester: 5,
      interests: 'Volleyball,Yoga',
    },
  });

  const maxW = await prisma.user.upsert({
    where: { email: 'maxw@hs-heilbronn.de' },
    update: {},
    create: {
      name: 'Max Weber',
      email: 'maxw@hs-heilbronn.de',
      password,
      semester: 3,
      interests: 'Laufen',
    },
  });

  const sarah = await prisma.user.upsert({
    where: { email: 'sarah@hs-heilbronn.de' },
    update: {},
    create: {
      name: 'Sarah Klein',
      email: 'sarah@hs-heilbronn.de',
      password,
      semester: 2,
      interests: 'Yoga,Schwimmen',
    },
  });

  const lena = await prisma.user.upsert({
    where: { email: 'lena@hs-heilbronn.de' },
    update: {},
    create: {
      name: 'Lena Bergmann',
      email: 'lena@hs-heilbronn.de',
      password,
      semester: 4,
      interests: 'Volleyball,Tennis',
    },
  });

  const eventsData = [
    {
      title: 'Volleyball Mixed',
      sport: 'Volleyball',
      date: new Date('2026-05-08T18:00:00'),
      location: 'Sporthalle Campus Sontheim',
      latitude: 49.1232,
      longitude: 9.2118,
      description: 'Entspanntes Mixed-Volleyball für alle Levels',
      source: 'university',
      maxCapacity: 24,
      creatorId: anna.id,
    },
    {
      title: 'Yoga für Anfänger',
      sport: 'Yoga',
      date: new Date('2026-05-06T17:30:00'),
      location: 'Gymnastikhalle Bildungscampus',
      latitude: 49.1505,
      longitude: 9.2188,
      description: 'Einsteigerkurs – keine Vorkenntnisse nötig',
      source: 'university',
      maxCapacity: 15,
      creatorId: anna.id,
    },
    {
      title: 'Trollinger Marathon 2026',
      sport: 'Laufen',
      date: new Date('2026-06-15T09:00:00'),
      location: 'Heilbronn Innenstadt',
      latitude: 49.1427,
      longitude: 9.2109,
      description: 'Der traditionelle Trollinger Marathon durch die Weinberge',
      source: 'external',
      maxCapacity: 500,
      creatorId: maxW.id,
    },
    {
      title: 'Basketball 3-gegen-3',
      sport: 'Basketball',
      date: new Date('2026-06-20T16:00:00'),
      location: 'Außenplatz Campus Sontheim',
      latitude: 49.1240,
      longitude: 9.2135,
      description: 'Kleinfeld-Turnier, Teams werden vor Ort eingeteilt',
      source: 'user',
      maxCapacity: 12,
      creatorId: max.id,
    },
    {
      title: 'Fußball Kick',
      sport: 'Fußball',
      date: new Date('2026-06-18T18:00:00'),
      location: 'Sportplatz Sontheim',
      latitude: 49.1198,
      longitude: 9.2152,
      description: 'Freundschaftliches Kicken nach der Uni',
      source: 'user',
      maxCapacity: 22,
      creatorId: maxW.id,
    },
    {
      title: 'Klettern Einsteiger',
      sport: 'Klettern',
      date: new Date('2026-06-25T17:00:00'),
      location: 'Kletterhalle Heilbronn',
      latitude: 49.1370,
      longitude: 9.1935,
      description: 'Toprope-Einführung für Neulinge',
      source: 'university',
      maxCapacity: 8,
      creatorId: sarah.id,
    },
    {
      title: 'Schwimm-Training',
      sport: 'Schwimmen',
      date: new Date('2026-06-17T07:00:00'),
      location: 'Stadtbad Heilbronn',
      latitude: 49.1489,
      longitude: 9.2042,
      description: 'Gemeinsames Morgenschwimmen',
      source: 'university',
      maxCapacity: 20,
      creatorId: anna.id,
    },
    // Wiederkehrende Events: Anker bewusst in der Vergangenheit, damit im Feed der
    // berechnete *nächste* Termin erscheint (nicht der gespeicherte Anker).
    {
      title: 'Volleyball Ladies (wöchentlich)',
      sport: 'Volleyball',
      date: new Date('2026-05-05T18:30:00'),
      location: 'Sporthalle Campus Sontheim',
      latitude: 49.1232,
      longitude: 9.2118,
      description: 'Wöchentliches Training – einmal anmelden, jede Woche dabei',
      source: 'user',
      maxCapacity: 16,
      recurrence: 'weekly',
      creatorId: anna.id,
    },
    {
      title: 'Lauftreff am Neckar',
      sport: 'Laufen',
      date: new Date('2026-05-20T07:30:00'),
      location: 'Neckaruferpark Heilbronn',
      latitude: 49.1455,
      longitude: 9.218,
      description: 'Lockerer Dauerlauf, alle 2 Wochen',
      source: 'user',
      maxCapacity: 30,
      recurrence: 'biweekly',
      creatorId: maxW.id,
    },
  ];

  const createdEvents: { id: number; creatorId: number }[] = [];
  for (const e of eventsData) {
    const existing = await prisma.event.findFirst({ where: { title: e.title } });
    if (existing) {
      // Koordinaten an bestehenden Events nachtragen (z. B. nach Schema-Update),
      // ohne ID/Teilnahmen anzufassen -> Seed bleibt idempotent.
      if (existing.latitude == null || existing.longitude == null) {
        await prisma.event.update({
          where: { id: existing.id },
          data: { latitude: e.latitude, longitude: e.longitude },
        });
      }
      createdEvents.push({ id: existing.id, creatorId: existing.creatorId });
      continue;
    }
    const created = await prisma.event.create({ data: e });
    createdEvents.push({ id: created.id, creatorId: created.creatorId });
  }

  const participationData = [
    { userId: anna.id, eventId: createdEvents[0].id },
    { userId: max.id, eventId: createdEvents[0].id },
    { userId: anna.id, eventId: createdEvents[1].id },
    { userId: sarah.id, eventId: createdEvents[1].id },
    { userId: maxW.id, eventId: createdEvents[2].id },
    { userId: anna.id, eventId: createdEvents[2].id },
    { userId: max.id, eventId: createdEvents[2].id },
    { userId: max.id, eventId: createdEvents[3].id },
    { userId: maxW.id, eventId: createdEvents[4].id },
    { userId: sarah.id, eventId: createdEvents[5].id },
    { userId: anna.id, eventId: createdEvents[6].id },
    { userId: sarah.id, eventId: createdEvents[6].id },
    // Lena: nimmt nur an Events teil, in denen Max NICHT ist -> 0 gemeinsame Events
    { userId: lena.id, eventId: createdEvents[1].id },
    { userId: lena.id, eventId: createdEvents[5].id },
    // Wiederkehrende Events: Max + Freunde sind dauerhaft angemeldet (Serie läuft weiter)
    { userId: max.id, eventId: createdEvents[7].id },
    { userId: anna.id, eventId: createdEvents[7].id },
    { userId: max.id, eventId: createdEvents[8].id },
    { userId: maxW.id, eventId: createdEvents[8].id },
  ];

  for (const p of participationData) {
    await prisma.participation.upsert({
      where: { userId_eventId: { userId: p.userId, eventId: p.eventId } },
      update: {},
      create: { ...p, status: 'registered' },
    });
  }

  await prisma.friendship.upsert({
    where: { userAId_userBId: { userAId: max.id, userBId: anna.id } },
    update: {},
    create: { userAId: max.id, userBId: anna.id, status: 'accepted' },
  });
  await prisma.friendship.upsert({
    where: { userAId_userBId: { userAId: max.id, userBId: maxW.id } },
    update: {},
    create: { userAId: max.id, userBId: maxW.id, status: 'accepted' },
  });
  await prisma.friendship.upsert({
    where: { userAId_userBId: { userAId: sarah.id, userBId: max.id } },
    update: {},
    create: { userAId: sarah.id, userBId: max.id, status: 'pending' },
  });
  await prisma.friendship.upsert({
    where: { userAId_userBId: { userAId: max.id, userBId: lena.id } },
    update: {},
    create: { userAId: max.id, userBId: lena.id, status: 'accepted' },
  });

  // Aktivitäts-Feed: Beitreten/Verlassen von Max' Freunden mit zurückdatierten
  // Zeitstempeln, damit der Feed direkt befüllt ist. Erst leeren -> idempotent.
  const HOUR = 60 * 60 * 1000;
  await prisma.activity.deleteMany({});
  // join-Einträge zeigen auf BEVORSTEHENDE Events, in denen der Freund registriert ist,
  // damit das "beigetreten" auch unter "Nächste Events" des Profils sichtbar ist.
  const activityData = [
    { userId: anna.id, eventId: createdEvents[2].id, type: 'join', createdAt: new Date(Date.now() - 2 * HOUR) },
    { userId: maxW.id, eventId: createdEvents[6].id, type: 'leave', createdAt: new Date(Date.now() - 5 * HOUR) },
    { userId: lena.id, eventId: createdEvents[5].id, type: 'join', createdAt: new Date(Date.now() - 26 * HOUR) },
    { userId: anna.id, eventId: createdEvents[6].id, type: 'join', createdAt: new Date(Date.now() - 30 * HOUR) },
  ];
  for (const a of activityData) {
    await prisma.activity.create({ data: a });
  }

  console.log('Seed abgeschlossen ✓');
  console.log('Demo-Accounts:');
  console.log('  max@hs-heilbronn.de / password123');
  console.log('  anna@hs-heilbronn.de / password123');
  console.log('  maxw@hs-heilbronn.de / password123');
  console.log('  sarah@hs-heilbronn.de / password123');
  console.log('  lena@hs-heilbronn.de / password123');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
