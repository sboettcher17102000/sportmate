import { Router, Response } from 'express';
import prisma from '../db';
import { authenticate, type AuthRequest } from '../middleware/auth';

const router = Router();

function serializeEvent(event: any, currentUserId?: number, friendIds?: number[]) {
  const participationCount = event.participations?.filter(
    (p: any) => p.status === 'registered'
  ).length ?? 0;

  const myStatus = currentUserId
    ? event.participations?.find((p: any) => p.userId === currentUserId)?.status ?? null
    : null;

  const friendParticipants = friendIds
    ? event.participations
        ?.filter((p: any) => friendIds.includes(p.userId) && p.status === 'registered')
        .map((p: any) => ({
          id: p.user.id,
          name: p.user.name,
          avatar: p.user.avatar,
        }))
    : [];

  return {
    id: event.id,
    title: event.title,
    sport: event.sport,
    date: event.date,
    location: event.location,
    description: event.description,
    source: event.source,
    maxCapacity: event.maxCapacity,
    creatorId: event.creatorId,
    creator: event.creator
      ? { id: event.creator.id, name: event.creator.name }
      : undefined,
    participationCount,
    myStatus,
    friendParticipants,
  };
}

async function getFriendIds(userId: number): Promise<number[]> {
  const friendships = await prisma.friendship.findMany({
    where: {
      status: 'accepted',
      OR: [{ userAId: userId }, { userBId: userId }],
    },
  });
  return friendships.map((f) => (f.userAId === userId ? f.userBId : f.userAId));
}

router.get('/', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  const { source, sport, search } = req.query as Record<string, string | undefined>;
  const friendIds = await getFriendIds(req.userId!);

  const events = await prisma.event.findMany({
    where: {
      ...(source ? { source } : {}),
      ...(sport ? { sport: { contains: sport } } : {}),
      ...(search ? { title: { contains: search } } : {}),
    },
    include: {
      creator: true,
      participations: { include: { user: true } },
    },
    orderBy: { date: 'asc' },
  });

  res.json(events.map((e) => serializeEvent(e, req.userId, friendIds)));
});

router.get('/mine', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  const participations = await prisma.participation.findMany({
    where: { userId: req.userId!, status: { not: 'cancelled' } },
    include: {
      event: {
        include: { creator: true, participations: { include: { user: true } } },
      },
    },
    orderBy: { event: { date: 'asc' } },
  });

  const friendIds = await getFriendIds(req.userId!);
  res.json(participations.map((p) => serializeEvent(p.event, req.userId, friendIds)));
});

router.get('/:id', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  const id = parseInt(req.params.id as string);
  const event = await prisma.event.findUnique({
    where: { id },
    include: { creator: true, participations: { include: { user: true } } },
  });
  if (!event) { res.status(404).json({ message: 'Event nicht gefunden' }); return; }
  const friendIds = await getFriendIds(req.userId!);
  res.json(serializeEvent(event, req.userId, friendIds));
});

router.post('/', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  const { title, sport, date, location, description, source, maxCapacity } =
    req.body as {
      title?: string; sport?: string; date?: string; location?: string;
      description?: string; source?: string; maxCapacity?: number;
    };
  if (!title || !sport || !date || !location) {
    res.status(400).json({ message: 'Titel, Sportart, Datum und Ort sind erforderlich' });
    return;
  }
  const event = await prisma.event.create({
    data: {
      title, sport, date: new Date(date), location,
      description, source: source ?? 'user',
      maxCapacity: maxCapacity ?? null,
      creatorId: req.userId!,
    },
    include: { creator: true, participations: { include: { user: true } } },
  });
  await prisma.participation.create({
    data: { userId: req.userId!, eventId: event.id, status: 'registered' },
  });
  res.status(201).json(serializeEvent(event, req.userId, []));
});

router.post('/:id/join', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  const eventId = parseInt(req.params.id as string);
  const existing = await prisma.participation.findUnique({
    where: { userId_eventId: { userId: req.userId!, eventId } },
  });
  if (existing) {
    const updated = await prisma.participation.update({
      where: { userId_eventId: { userId: req.userId!, eventId } },
      data: { status: 'registered' },
    });
    res.json(updated);
    return;
  }
  const participation = await prisma.participation.create({
    data: { userId: req.userId!, eventId, status: 'registered' },
  });
  res.status(201).json(participation);
});

router.delete('/:id/join', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  const eventId = parseInt(req.params.id as string);
  await prisma.participation.updateMany({
    where: { userId: req.userId!, eventId },
    data: { status: 'cancelled' },
  });
  res.json({ message: 'Abgemeldet' });
});

export default router;
