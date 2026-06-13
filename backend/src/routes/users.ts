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
    university: user.university ?? null,
    studiengang: user.studiengang ?? null,
    interests: user.interests ? user.interests.split(',').filter(Boolean) : [],
  };
}

router.patch('/me', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  const { name, university, studiengang, semester } = req.body as {
    name?: string; university?: string; studiengang?: string; semester?: number;
  };
  if (name !== undefined && !name.trim()) {
    res.status(400).json({ message: 'Name darf nicht leer sein' });
    return;
  }
  const user = await prisma.user.update({
    where: { id: req.userId! },
    data: {
      ...(name !== undefined ? { name: name.trim() } : {}),
      university: university !== undefined ? (university.trim() || null) : undefined,
      studiengang: studiengang !== undefined ? (studiengang.trim() || null) : undefined,
      semester: semester !== undefined ? (semester ? Number(semester) : null) : undefined,
    },
  });
  res.json(serializeUser(user));
});

router.get('/search', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  const q = (req.query.q as string | undefined) ?? '';
  if (q.trim().length < 2) { res.json([]); return; }
  const users = await prisma.user.findMany({
    where: {
      AND: [
        { id: { not: req.userId } },
        { OR: [{ name: { contains: q } }, { email: { contains: q } }] },
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
