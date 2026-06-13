import { Router, Response } from 'express';
import prisma from '../db';
import { authenticate, type AuthRequest } from '../middleware/auth';

const router = Router();

function serializeFriendship(f: any, currentUserId: number) {
  const friend = f.userAId === currentUserId ? f.userB : f.userA;
  return {
    id: f.id,
    status: f.status,
    userAId: f.userAId,
    userBId: f.userBId,
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
  res.json(friendships.map((f) => serializeFriendship(f, req.userId!)));
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
