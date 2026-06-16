import express from 'express';
import cors from 'cors';
import { settingsRouter } from './routes/settings.routes';
import { tasksRouter } from './routes/tasks.routes';
import { authRouter } from './routes/auth.routes';

export const app = express();

app.use(cors());
app.use(express.json());

// Rotas públicas (não exigem token)
app.use('/auth', authRouter);

// Rotas protegidas (exigem token JWT — o middleware é aplicado dentro de cada router)
app.use('/settings', settingsRouter);
app.use('/tasks', tasksRouter);

// Health check
app.get('/health', (_req, res) => {
  res.json({ ok: true, timestamp: new Date().toISOString() });
});

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ message: 'Rota não encontrada.' });
});
