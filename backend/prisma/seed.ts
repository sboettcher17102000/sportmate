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

  const eventsData = [
    {
      title: 'Volleyball Mixed',
      sport: 'Volleyball',
      date: new Date('2026-05-08T18:00:00'),
      location: 'Sporthalle Campus Sontheim',
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
      description: 'Gemeinsames Morgenschwimmen',
      source: 'university',
      maxCapacity: 20,
      creatorId: anna.id,
    },
  ];

  const createdEvents: { id: number; creatorId: number }[] = [];
  for (const e of eventsData) {
    const existing = await prisma.event.findFirst({ where: { title: e.title } });
    if (existing) {
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

  console.log('Seed abgeschlossen ✓');
  console.log('Demo-Accounts:');
  console.log('  max@hs-heilbronn.de / password123');
  console.log('  anna@hs-heilbronn.de / password123');
  console.log('  maxw@hs-heilbronn.de / password123');
  console.log('  sarah@hs-heilbronn.de / password123');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
