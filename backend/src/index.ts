import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import authRouter from './routes/auth';
import eventsRouter from './routes/events';
import usersRouter from './routes/users';
import friendshipsRouter from './routes/friendships';

const app = express();
const PORT = parseInt(process.env.PORT ?? '3001');

app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());

app.use('/api/auth', authRouter);
app.use('/api/events', eventsRouter);
app.use('/api/users', usersRouter);
app.use('/api/friendships', friendshipsRouter);

app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));

app.listen(PORT, () => {
  console.log(`Backend läuft auf http://localhost:${PORT}`);
});
