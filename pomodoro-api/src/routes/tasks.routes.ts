import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { authenticate } from '../middleware/authenticate';

export const tasksRouter = Router();

// Todas as rotas de tasks exigem autenticação
tasksRouter.use(authenticate);

// Helper: serializa BigInt para número no JSON
function serializeTask(task: Record<string, unknown>) {
  return {
    ...task,
    startDate:
      task.startDate !== null && task.startDate !== undefined
        ? Number(task.startDate)
        : null,
    completeDate:
      task.completeDate !== null && task.completeDate !== undefined
        ? Number(task.completeDate)
        : null,
    interruptDate:
      task.interruptDate !== null && task.interruptDate !== undefined
        ? Number(task.interruptDate)
        : null,
  };
}

// GET /tasks — lista tasks do usuário logado
tasksRouter.get('/', async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const tasks = await prisma.task.findMany({
      where: { userId },
      orderBy: { startDate: 'desc' },
    });
    return res.json(tasks.map(t => serializeTask(t as unknown as Record<string, unknown>)));
  } catch (error) {
    console.error('Erro ao buscar tasks:', error);
    return res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// POST /tasks — cria task para o usuário logado
tasksRouter.post('/', async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { id, name, duration, type, startDate } = req.body as {
      id: string;
      name: string;
      duration: number;
      type: string;
      startDate: number;
    };

    if (!id || typeof id !== 'string')
      return res.status(400).json({ message: 'Campo id é obrigatório e deve ser string.' });
    if (!name || typeof name !== 'string')
      return res.status(400).json({ message: 'Campo name é obrigatório e deve ser string.' });
    if (!Number.isInteger(duration) || duration < 1)
      return res.status(400).json({ message: 'Campo duration deve ser inteiro positivo.' });
    if (!type || typeof type !== 'string')
      return res.status(400).json({ message: 'Campo type é obrigatório e deve ser string.' });
    if (typeof startDate !== 'number')
      return res.status(400).json({ message: 'Campo startDate é obrigatório e deve ser número.' });

    const task = await prisma.task.create({
      data: { id, userId, name, duration, type, startDate: BigInt(startDate) },
    });

    return res.status(201).json(serializeTask(task as unknown as Record<string, unknown>));
  } catch (error: unknown) {
    if (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      (error as { code: string }).code === 'P2002'
    ) {
      return res.status(409).json({ message: 'Task com esse id já existe.' });
    }
    console.error('Erro ao criar task:', error);
    return res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// PATCH /tasks/:id/complete
tasksRouter.patch('/:id/complete', async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;
    const { completeDate } = req.body as { completeDate: number };

    if (typeof completeDate !== 'number')
      return res.status(400).json({ message: 'Campo completeDate é obrigatório e deve ser número.' });

    const existing = await prisma.task.findFirst({ where: { id, userId } });
    if (!existing) return res.status(404).json({ message: 'Task não encontrada.' });

    const task = await prisma.task.update({
      where: { id },
      data: { completeDate: BigInt(completeDate) },
    });
    return res.json(serializeTask(task as unknown as Record<string, unknown>));
  } catch (error) {
    console.error('Erro ao completar task:', error);
    return res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// PATCH /tasks/:id/interrupt
tasksRouter.patch('/:id/interrupt', async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;
    const { interruptDate } = req.body as { interruptDate: number };

    if (typeof interruptDate !== 'number')
      return res.status(400).json({ message: 'Campo interruptDate é obrigatório e deve ser número.' });

    const existing = await prisma.task.findFirst({ where: { id, userId } });
    if (!existing) return res.status(404).json({ message: 'Task não encontrada.' });

    const task = await prisma.task.update({
      where: { id },
      data: { interruptDate: BigInt(interruptDate) },
    });
    return res.json(serializeTask(task as unknown as Record<string, unknown>));
  } catch (error) {
    console.error('Erro ao interromper task:', error);
    return res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// DELETE /tasks — limpa histórico do usuário logado
tasksRouter.delete('/', async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    await prisma.task.deleteMany({ where: { userId } });
    return res.status(204).send();
  } catch (error) {
    console.error('Erro ao deletar tasks:', error);
    return res.status(500).json({ message: 'Erro interno do servidor' });
  }
});
