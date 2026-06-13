import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET ?? 'sportmate-dev-secret';

export interface AuthRequest extends Request {
  userId?: number;
}

export function authenticate(req: AuthRequest, res: Response, next: NextFunction): void {
  const auth = req.headers.authorization;
  if (!auth?.startsWith('Bearer ')) {
    res.status(401).json({ message: 'Nicht autorisiert' });
    return;
  }
  const token = auth.slice(7);
  try {
    const payload = jwt.verify(token, JWT_SECRET) as { userId: number };
    req.userId = payload.userId;
    next();
  } catch {
    res.status(401).json({ message: 'Token ungültig' });
  }
}

export function signToken(userId: number): string {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
}
