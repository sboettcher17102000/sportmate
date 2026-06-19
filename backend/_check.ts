import prisma from './src/db';
(async () => {
  const u = await prisma.user.findMany({ select: { id: true, email: true } });
  const e = await prisma.event.findMany({ select: { id: true, title: true, source: true } });
  const p = await prisma.participation.findMany({ select: { userId: true, eventId: true, status: true } });
  console.log('USERS:', JSON.stringify(u));
  console.log('EVENTS:', e.length, 'ids=', e.map(x => x.id).join(','));
  console.log('PARTICIPATIONS:', JSON.stringify(p));
  process.exit(0);
})();
