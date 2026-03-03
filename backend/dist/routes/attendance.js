import { Router } from 'express';
import { z } from 'zod';
import { AttendanceService } from '../services/attendance';
import { authMiddleware, leaderOnly } from '../middleware/auth';
const router = Router();
const attendanceSchema = z.object({
    date: z.string().optional(),
    records: z.array(z.object({ studentId: z.string(), present: z.boolean() })),
});
// POST /attendance - registrar chamada (apenas líderes)
router.post('/', authMiddleware, leaderOnly, async (req, res) => {
    try {
        const body = attendanceSchema.parse(req.body);
        const created = await AttendanceService.recordAttendance(body.date, body.records);
        res.status(201).json({ success: true, data: created });
    }
    catch (error) {
        if (error instanceof z.ZodError) {
            res.status(400).json({ success: false, error: 'Dados inválidos', details: error.errors });
            return;
        }
        res.status(500).json({ success: false, error: error.message || 'Erro ao registrar chamada' });
    }
});
// GET /attendance/stats - obter contagens por aluno (apenas líderes)
router.get('/stats', authMiddleware, leaderOnly, async (req, res) => {
    try {
        const stats = await AttendanceService.getStats();
        res.status(200).json({ success: true, data: stats });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message || 'Erro ao obter estatísticas' });
    }
});
export default router;
//# sourceMappingURL=attendance.js.map