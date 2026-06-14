import { Router, Response } from 'express';
import prisma from '../db';
import { authenticate, type AuthRequest } from '../middleware/auth';

const router = Router();

function serializeFriendship(f: any, currentUserId: number, commonEventsCount = 0) {
  const friend = f.userAId === currentUserId ? f.userB : f.userA;
  return {
    id: f.id,
    status: f.status,
    userAId: f.userAId,
    userBId: f.userBId,
    commonEventsCount,
    friend: friend
      ? {
          id: friend.id,
          name: friend.name,
          avatar: friend.avatar,
          semester: friend.semester,
          interests: friend.interests ? friend.interests.split(',').filter(Boolean) : [],
        }
      : undefined,
  };
}

const INCLUDE_USERS = {
  userA: true,
  userB: true,
} as const;

router.get('/', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  const friendships = await prisma.friendship.findMany({
    where: {
      status: 'accepted',
      OR: [{ userAId: req.userId }, { userBId: req.userId }],
    },
    include: INCLUDE_USERS,
  });

  // Gemeinsame Events je Freund ableiten: Schnittmenge der "registered"-Events
  // des aktuellen Nutzers mit denen der Freunde – ohne neue DB-Felder.
  const friendIds = friendships.map((f) =>
    f.userAId === req.userId ? f.userBId : f.userAId
  );
  const myEvents = await prisma.participation.findMany({
    where: { userId: req.userId!, status: 'registered' },
    select: { eventId: true },
  });
  const myEventIds = new Set(myEvents.map((p) => p.eventId));

  const friendParticipations = friendIds.length
    ? await prisma.participation.findMany({
        where: {
          userId: { in: friendIds },
          status: 'registered',
          eventId: { in: [...myEventIds] },
        },
        select: { userId: true },
      })
    : [];
  const commonCounts = new Map<number, number>();
  for (const p of friendParticipations) {
    commonCounts.set(p.userId, (commonCounts.get(p.userId) ?? 0) + 1);
  }

  res.json(
    friendships.map((f) => {
      const friendId = f.userAId === req.userId ? f.userBId : f.userAId;
      return serializeFriendship(f, req.userId!, commonCounts.get(friendId) ?? 0);
    })
  );
});

router.get('/activity', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  const friendships = await prisma.friendship.findMany({
    where: {
      status: 'accepted',
      OR: [{ userAId: req.userId }, { userBId: req.userId }],
    },
  });
  const friendIds = friendships.map((f) =>
    f.userAId === req.userId ? f.userBId : f.userAId
  );
  if (!friendIds.length) { res.json([]); return; }

  const activities = await prisma.activity.findMany({
    where: { userId: { in: friendIds } },
    include: { user: true, event: true },
    orderBy: { createdAt: 'desc' },
    take: 30,
  });

  res.json(
    activities.map((a) => ({
      id: a.id,
      type: a.type,
      createdAt: a.createdAt,
      friend: { id: a.user.id, name: a.user.name, avatar: a.user.avatar },
      event: { id: a.event.id, title: a.event.title, sport: a.event.sport },
    }))
  );
});

router.get('/pending', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  const requests = await prisma.friendship.findMany({
    where: { status: 'pending', userBId: req.userId },
    include: INCLUDE_USERS,
  });
  res.json(requests.map((f) => serializeFriendship(f, req.userId!)));
});

router.post('/request', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  const { targetUserId } = req.body as { targetUserId?: number };
  if (!targetUserId) { res.status(400).json({ message: 'targetUserId fehlt' }); return; }
  if (targetUserId === req.userId) { res.status(400).json({ message: 'Kann sich nicht selbst hinzufügen' }); return; }

  const existing = await prisma.friendship.findFirst({
    where: {
      OR: [
        { userAId: req.userId!, userBId: targetUserId },
        { userAId: targetUserId, userBId: req.userId! },
      ],
    },
  });
  if (existing) { res.status(409).json({ message: 'Freundschaft existiert bereits' }); return; }

  const friendship = await prisma.friendship.create({
    data: { userAId: req.userId!, userBId: targetUserId, status: 'pending' },
    include: INCLUDE_USERS,
  });
  res.status(201).json(serializeFriendship(friendship, req.userId!));
});

router.patch('/:id/accept', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  const id = parseInt(req.params.id as string);
  const friendship = await prisma.friendship.findUnique({ where: { id } });
  if (!friendship || friendship.userBId !== req.userId) {
    res.status(403).json({ message: 'Nicht erlaubt' }); return;
  }
  const updated = await prisma.friendship.update({
    where: { id },
    data: { status: 'accepted' },
    include: INCLUDE_USERS,
  });
  res.json(serializeFriendship(updated, req.userId!));
});

router.delete('/:id', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  const id = parseInt(req.params.id as string);
  const friendship = await prisma.friendship.findUnique({ where: { id } });
  if (!friendship || (friendship.userAId !== req.userId && friendship.userBId !== req.userId)) {
    res.status(403).json({ message: 'Nicht erlaubt' }); return;
  }
  await prisma.friendship.delete({ where: { id } });
  res.json({ message: 'Freundschaft entfernt' });
});

export default router;
