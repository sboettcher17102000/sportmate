import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../db';
import { signToken } from '../middleware/auth';

const router = Router();

router.post('/register', async (req: Request, res: Response): Promise<void> => {
  const { name, email, password } = req.body as { name?: string; email?: string; password?: string };
  if (!name || !email || !password) {
    res.status(400).json({ message: 'Name, E-Mail und Passwort sind erforderlich' });
    return;
  }
  if (password.length < 6) {
    res.status(400).json({ message: 'Passwort muss mindestens 6 Zeichen haben' });
    return;
  }
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    res.status(409).json({ message: 'E-Mail bereits registriert' });
    return;
  }
  const hashed = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { name, email, password: hashed },
  });
  const token = signToken(user.id);
  res.status(201).json({
    token,
    user: { id: user.id, name: user.name, email: user.email, avatar: user.avatar, semester: user.semester, interests: [] },
  });
});

router.post('/login', async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body as { email?: string; password?: string };
  if (!email || !password) {
    res.status(400).json({ message: 'E-Mail und Passwort sind erforderlich' });
    return;
  }
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    res.status(401).json({ message: 'E-Mail oder Passwort falsch' });
    return;
  }
  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    res.status(401).json({ message: 'E-Mail oder Passwort falsch' });
    return;
  }
  const token = signToken(user.id);
  res.json({
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      semester: user.semester,
      interests: user.interests ? user.interests.split(',').filter(Boolean) : [],
    },
  });
});

export default router;
