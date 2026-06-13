import 'dotenv/config';
import { PrismaClient } from './generated/prisma/client';
import { PrismaLibSql } from '@prisma/adapter-libsql';
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

export default prisma;
