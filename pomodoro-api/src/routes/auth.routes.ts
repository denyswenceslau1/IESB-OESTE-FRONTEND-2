import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { hashPassword, verifyPassword } from '../lib/crypto';
import { signToken, verifyToken } from '../lib/jwt';
import crypto from 'node:crypto';

export const authRouter = Router();

// ─── POST /auth/register ───────────────────────────────────────────────────
authRouter.post('/register', async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body as {
      name?: string;
      email?: string;
      password?: string;
    };

    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      return res.status(400).json({ message: 'Nome deve ter pelo menos 2 caracteres.' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      return res.status(400).json({ message: 'E-mail inválido.' });
    }

    if (!password || password.length < 6) {
      return res.status(400).json({ message: 'Senha deve ter pelo menos 6 caracteres.' });
    }

    const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (existing) {
      return res.status(409).json({ message: 'E-mail já cadastrado.' });
    }

    const passwordHash = await hashPassword(password);
    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: email.toLowerCase(),
        passwordHash,
      },
    });

    return res.status(201).json({
      message: 'Conta criada com sucesso.',
      user: { id: user.id, name: user.name, email: user.email },
    });
  } catch (error) {
    console.error('Erro ao registrar:', error);
    return res.status(500).json({ message: 'Erro interno do servidor.' });
  }
});

// ─── POST /auth/login ──────────────────────────────────────────────────────
authRouter.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body as {
      email?: string;
      password?: string;
    };

    if (!email || !password) {
      return res.status(400).json({ message: 'E-mail e senha são obrigatórios.' });
    }

    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (!user) {
      return res.status(401).json({ message: 'E-mail ou senha incorretos.' });
    }

    const valid = await verifyPassword(password, user.passwordHash);
    if (!valid) {
      return res.status(401).json({ message: 'E-mail ou senha incorretos.' });
    }

    const token = signToken({ userId: user.id, email: user.email, name: user.name });

    return res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email },
    });
  } catch (error) {
    console.error('Erro ao fazer login:', error);
    return res.status(500).json({ message: 'Erro interno do servidor.' });
  }
});

// ─── POST /auth/logout ─────────────────────────────────────────────────────
// JWT é stateless — o logout é feito pelo cliente descartando o token.
// Esta rota existe para compatibilidade e para confirmar o fluxo ao professor.
authRouter.post('/logout', (_req: Request, res: Response) => {
  return res.json({ message: 'Logout realizado. Descarte o token no cliente.' });
});

// ─── POST /auth/forgot-password ────────────────────────────────────────────
authRouter.post('/forgot-password', async (req: Request, res: Response) => {
  try {
    const { email } = req.body as { email?: string };

    if (!email) {
      return res.status(400).json({ message: 'E-mail é obrigatório.' });
    }

    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });

    // Responde o mesmo para não vazar se o e-mail existe ou não
    if (!user) {
      return res.json({
        message: 'Se o e-mail estiver cadastrado, você receberá instruções.',
      });
    }

    // Invalida tokens anteriores do usuário
    await prisma.passwordResetToken.updateMany({
      where: { userId: user.id, used: false },
      data: { used: true },
    });

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60); // 1 hora

    await prisma.passwordResetToken.create({
      data: { token, userId: user.id, expiresAt },
    });

    // Em produção, envie por e-mail real.
    // Em laboratório, o token é retornado na resposta para facilitar os testes.
    // Para reproduzir: use POST /auth/reset-password com o token abaixo.
    console.log(`[DEV] Token de redefinição para ${user.email}: ${token}`);
    console.log(`[DEV] Link: http://localhost:5173/reset-password?token=${token}`);

    return res.json({
      message: 'Se o e-mail estiver cadastrado, você receberá instruções.',
      // Remova a linha abaixo em produção:
      devToken: token,
    });
  } catch (error) {
    console.error('Erro em forgot-password:', error);
    return res.status(500).json({ message: 'Erro interno do servidor.' });
  }
});

// ─── POST /auth/reset-password ─────────────────────────────────────────────
authRouter.post('/reset-password', async (req: Request, res: Response) => {
  try {
    const { token, newPassword } = req.body as {
      token?: string;
      newPassword?: string;
    };

    if (!token || typeof token !== 'string') {
      return res.status(400).json({ message: 'Token é obrigatório.' });
    }

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ message: 'Nova senha deve ter pelo menos 6 caracteres.' });
    }

    const record = await prisma.passwordResetToken.findUnique({ where: { token } });

    if (!record || record.used) {
      return res.status(400).json({ message: 'Token inválido ou já utilizado.' });
    }

    if (record.expiresAt < new Date()) {
      return res.status(400).json({ message: 'Token expirado. Solicite um novo.' });
    }

    const passwordHash = await hashPassword(newPassword);

    await prisma.$transaction([
      prisma.user.update({
        where: { id: record.userId },
        data: { passwordHash },
      }),
      prisma.passwordResetToken.update({
        where: { id: record.id },
        data: { used: true },
      }),
    ]);

    return res.json({ message: 'Senha redefinida com sucesso. Faça login.' });
  } catch (error) {
    console.error('Erro em reset-password:', error);
    return res.status(500).json({ message: 'Erro interno do servidor.' });
  }
});

// ─── GET /auth/me ──────────────────────────────────────────────────────────
authRouter.get('/me', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Token não fornecido.' });
  }
  const token = authHeader.slice(7);
  const payload = verifyToken(token);
  if (!payload) {
    return res.status(401).json({ message: 'Token inválido ou expirado.' });
  }
  return res.json({ user: payload });
});
