import { Router, Response } from 'express';
import prisma from '../db';
import { authenticate, type AuthRequest } from '../middleware/auth';

const router = Router();

function serializeUser(user: any) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    avatar: user.avatar,
    semester: user.semester,
    interests: user.interests ? user.interests.split(',').filter(Boolean) : [],
  };
}

router.get('/search', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  const q = (req.query.q as string | undefined) ?? '';
  if (q.trim().length < 2) { res.json([]); return; }
  const users = await prisma.user.findMany({
    where: {
      AND: [
        { name: { contains: q } },
        { id: { not: req.userId } },
      ],
    },
    take: 10,
  });
  res.json(users.map(serializeUser));
});

router.get('/:id', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  const id = parseInt(req.params.id as string);
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) { res.status(404).json({ message: 'Nutzer nicht gefunden' }); return; }
  res.json(serializeUser(user));
});

export default router;
