import express from 'express';
import cors from 'cors';
import { settingsRouter } from './routes/settings.routes';
import { tasksRouter } from './routes/tasks.routes';

export const app = express();

app.use(cors());
app.use(express.json());

// Rotas
app.use('/settings', settingsRouter);
app.use('/tasks', tasksRouter);

// Health check
app.get('/health', (_req, res) => {
  res.json({ ok: true });
});
