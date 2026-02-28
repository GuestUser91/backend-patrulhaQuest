import { Router, Response } from 'express';
import { z } from 'zod';
import DynamicService from '../services/dynamic';
import { authMiddleware, leaderOnly } from '../middleware/auth';
import { AuthRequest } from '../types';

const router = Router();

const createSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  type: z.string().min(1),
  active: z.boolean().optional(),
  startAt: z.string().optional().nullable(),
  endAt: z.string().optional().nullable(),
  questions: z.any().optional(),
  words: z.any().optional(),
  memoryCards: z.any().optional(),
});

// List dynamics (accessible to authenticated users). Leaders may see all; students see only active/current.
router.get('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const role = req.user?.role || 'STUDENT';
    const all = await DynamicService.listDynamics();

    const now = new Date();

    const withStatus = all.map(d => {
      const start = d.startAt ? new Date(d.startAt) : null;
      const end = d.endAt ? new Date(d.endAt) : null;
      let status: 'scheduled' | 'active' | 'offline' = 'active';
      if (start && start > now) status = 'scheduled';
      else if (end && end < now) status = 'offline';
      else status = d.active ? 'active' : 'offline';

      return { ...d, status };
    });

    // If user is student, return only active
    if (role === 'STUDENT') {
      return res.status(200).json({ success: true, data: withStatus.filter(d => d.status === 'active') });
    }

    // Leaders see all
    res.status(200).json({ success: true, data: withStatus });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || 'Erro ao listar dinâmicas' });
  }
});

// POST / - create dynamic (leaders only)
router.post('/', authMiddleware, leaderOnly, async (req: AuthRequest, res: Response) => {
  try {
    const body = createSchema.parse(req.body);
    const dyn = await DynamicService.createDynamic(body as any);
    res.status(201).json({ success: true, data: dyn });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: 'Dados inválidos', details: error.errors });
    }
    res.status(400).json({ success: false, error: error.message || 'Erro ao criar dinâmica' });
  }
});

// GET /:id
router.get('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const dyn = await DynamicService.getDynamicById(req.params.id);
    res.status(200).json({ success: true, data: dyn });
  } catch (error: any) {
    if (error.message === 'Dinâmica não encontrada') return res.status(404).json({ success: false, error: error.message });
    res.status(500).json({ success: false, error: error.message || 'Erro ao obter dinâmica' });
  }
});

// DELETE /:id (leaders only)
router.delete('/:id', authMiddleware, leaderOnly, async (req: AuthRequest, res: Response) => {
  try {
    const result = await DynamicService.deleteDynamic(req.params.id);
    res.status(200).json({ success: true, message: result.message });
  } catch (error: any) {
    if (error.message === 'Dinâmica não encontrada') return res.status(404).json({ success: false, error: error.message });
    res.status(500).json({ success: false, error: error.message || 'Erro ao deletar dinâmica' });
  }
});

export default router;
