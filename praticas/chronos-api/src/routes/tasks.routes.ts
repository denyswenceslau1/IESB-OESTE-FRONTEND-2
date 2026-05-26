import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';

export const tasksRouter = Router();

// Serializa BigInt para JSON (JSON.stringify não suporta BigInt nativamente)
function serializeTask(task: Record<string, unknown>) {
  return {
    ...task,
    startDate: task.startDate?.toString(),
    completeDate: task.completeDate != null ? task.completeDate.toString() : null,
    interruptDate: task.interruptDate != null ? task.interruptDate.toString() : null,
  };
}

// GET /tasks — lista todas as tasks, mais recentes primeiro
tasksRouter.get('/', async (_req: Request, res: Response) => {
  try {
    const tasks = await prisma.task.findMany({
      orderBy: { startDate: 'desc' },
    });

    return res.json(tasks.map((t) => serializeTask(t as unknown as Record<string, unknown>)));
  } catch (error) {
    console.error('[GET /tasks]', error);
    return res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// POST /tasks — cria uma nova task
tasksRouter.post('/', async (req: Request, res: Response) => {
  const { id, name, duration, type, startDate } = req.body as {
    id: string;
    name: string;
    duration: number;
    type: string;
    startDate: number;
  };

  if (!id || !name || !duration || !type || !startDate) {
    return res.status(400).json({ message: 'Campos obrigatórios: id, name, duration, type, startDate' });
  }

  try {
    const task = await prisma.task.create({
      data: { id, name, duration, type, startDate: BigInt(startDate) },
    });

    return res.status(201).json(serializeTask(task as unknown as Record<string, unknown>));
  } catch (error: unknown) {
    const err = error as { code?: string };
    if (err.code === 'P2002') {
      return res.status(409).json({ message: 'Task com este id já existe' });
    }
    console.error('[POST /tasks]', error);
    return res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// PATCH /tasks/:id/complete — marca task como concluída
tasksRouter.patch('/:id/complete', async (req: Request, res: Response) => {
  const { id } = req.params;
  const { completeDate } = req.body as { completeDate: number };

  if (!completeDate) {
    return res.status(400).json({ message: 'Campo obrigatório: completeDate' });
  }

  try {
    const task = await prisma.task.update({
      where: { id },
      data: { completeDate: BigInt(completeDate) },
    });

    return res.json(serializeTask(task as unknown as Record<string, unknown>));
  } catch (error: unknown) {
    const err = error as { code?: string };
    if (err.code === 'P2025') {
      return res.status(404).json({ message: 'Task não encontrada' });
    }
    console.error('[PATCH /tasks/:id/complete]', error);
    return res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// PATCH /tasks/:id/interrupt — marca task como interrompida
tasksRouter.patch('/:id/interrupt', async (req: Request, res: Response) => {
  const { id } = req.params;
  const { interruptDate } = req.body as { interruptDate: number };

  if (!interruptDate) {
    return res.status(400).json({ message: 'Campo obrigatório: interruptDate' });
  }

  try {
    const task = await prisma.task.update({
      where: { id },
      data: { interruptDate: BigInt(interruptDate) },
    });

    return res.json(serializeTask(task as unknown as Record<string, unknown>));
  } catch (error: unknown) {
    const err = error as { code?: string };
    if (err.code === 'P2025') {
      return res.status(404).json({ message: 'Task não encontrada' });
    }
    console.error('[PATCH /tasks/:id/interrupt]', error);
    return res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// DELETE /tasks — apaga todo o histórico de tasks
tasksRouter.delete('/', async (_req: Request, res: Response) => {
  try {
    await prisma.task.deleteMany();
    return res.status(204).send();
  } catch (error) {
    console.error('[DELETE /tasks]', error);
    return res.status(500).json({ message: 'Erro interno do servidor' });
  }
});
