import { Router } from 'express';
import { z } from 'zod';
import { PatrolService } from '../services/patrol';
import { authMiddleware, leaderOnly } from '../middleware/auth';
const router = Router();
// Schemas de validação
const createPatrolSchema = z.object({
    name: z.string().min(1, 'Nome da patrulha é obrigatório'),
    color: z.string().min(1, 'Cor é obrigatória'),
    icon: z.string().min(1, 'Ícone é obrigatório'),
});
const addMemberSchema = z.object({
    studentId: z.string().min(1, 'ID do aluno é obrigatório'),
});
const addPointsSchema = z.object({
    points: z.number().int().positive('Ponais deve ser positivo'),
    reason: z.string().min(1, 'Motivo é obrigatório'),
});
// GET /patrols - Listar todas as patrulhas
router.get('/', authMiddleware, async (req, res) => {
    try {
        const patrols = await PatrolService.listPatrols();
        res.status(200).json({
            success: true,
            data: patrols,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: error.message || 'Erro ao listar patrulhas',
        });
    }
});
// GET /patrols/:patrolId - Obter detalhes de uma patrulha
router.get('/:patrolId', authMiddleware, async (req, res) => {
    try {
        const { patrolId } = req.params;
        const patrol = await PatrolService.getPatrolById(patrolId);
        res.status(200).json({
            success: true,
            data: patrol,
        });
    }
    catch (error) {
        if (error.message === 'Patrulha não encontrada') {
            res.status(404).json({
                success: false,
                error: error.message,
            });
            return;
        }
        res.status(500).json({
            success: false,
            error: error.message || 'Erro ao obter patrulha',
        });
    }
});
// POST /patrols - Criar nova patrulha (apenas líderes)
router.post('/', authMiddleware, leaderOnly, async (req, res) => {
    try {
        const body = createPatrolSchema.parse(req.body);
        const patrol = await PatrolService.createPatrol(body);
        res.status(201).json({
            success: true,
            message: 'Patrulha criada com sucesso',
            data: patrol,
        });
    }
    catch (error) {
        if (error instanceof z.ZodError) {
            res.status(400).json({
                success: false,
                error: 'Dados inválidos',
                details: error.errors,
            });
            return;
        }
        res.status(400).json({
            success: false,
            error: error.message || 'Erro ao criar patrulha',
        });
    }
});
// POST /patrols/:patrolId/members - Adicionar aluno à patrulha (apenas líderes)
router.post('/:patrolId/members', authMiddleware, leaderOnly, async (req, res) => {
    try {
        const { patrolId } = req.params;
        const body = addMemberSchema.parse(req.body);
        const member = await PatrolService.addMemberToPatrol(patrolId, body.studentId);
        res.status(200).json({
            success: true,
            message: 'Aluno adicionado à patrulha com sucesso',
            data: member,
        });
    }
    catch (error) {
        if (error instanceof z.ZodError) {
            res.status(400).json({
                success: false,
                error: 'Dados inválidos',
                details: error.errors,
            });
            return;
        }
        if (error.message === 'Patrulha não encontrada' ||
            error.message === 'Aluno não encontrado') {
            res.status(404).json({
                success: false,
                error: error.message,
            });
            return;
        }
        res.status(400).json({
            success: false,
            error: error.message || 'Erro ao adicionar aluno à patrulha',
        });
    }
});
// DELETE /patrols/:patrolId/members/:studentId - Remover aluno da patrulha (apenas líderes)
router.delete('/:patrolId/members/:studentId', authMiddleware, leaderOnly, async (req, res) => {
    try {
        const { patrolId, studentId } = req.params;
        const member = await PatrolService.removeMemberFromPatrol(patrolId, studentId);
        res.status(200).json({
            success: true,
            message: 'Aluno removido da patrulha com sucesso',
            data: member,
        });
    }
    catch (error) {
        if (error.message === 'Patrulha não encontrada') {
            res.status(404).json({
                success: false,
                error: error.message,
            });
            return;
        }
        res.status(500).json({
            success: false,
            error: error.message || 'Erro ao remover aluno da patrulha',
        });
    }
});
// POST /patrols/:patrolId/points - Adicionar pontos à patrulha (apenas líderes)
router.post('/:patrolId/points', authMiddleware, leaderOnly, async (req, res) => {
    try {
        const { patrolId } = req.params;
        const body = addPointsSchema.parse(req.body);
        const patrol = await PatrolService.addPointsToPatrol(patrolId, body);
        res.status(200).json({
            success: true,
            message: 'Pontos adicionados com sucesso',
            data: patrol,
        });
    }
    catch (error) {
        if (error instanceof z.ZodError) {
            res.status(400).json({
                success: false,
                error: 'Dados inválidos',
                details: error.errors,
            });
            return;
        }
        if (error.message === 'Patrulha não encontrada') {
            res.status(404).json({
                success: false,
                error: error.message,
            });
            return;
        }
        res.status(500).json({
            success: false,
            error: error.message || 'Erro ao adicionar pontos',
        });
    }
});
// DELETE /patrols/:patrolId - Deletar patrulha (apenas líderes)
router.delete('/:patrolId', authMiddleware, leaderOnly, async (req, res) => {
    try {
        const { patrolId } = req.params;
        const result = await PatrolService.deletePatrol(patrolId);
        res.status(200).json({
            success: true,
            message: result.message,
        });
    }
    catch (error) {
        if (error.message === 'Patrulha não encontrada') {
            res.status(404).json({
                success: false,
                error: error.message,
            });
            return;
        }
        res.status(500).json({
            success: false,
            error: error.message || 'Erro ao deletar patrulha',
        });
    }
});
// GET /patrols/students/available - Listar alunos disponíveis (sem patrulha)
router.get('/students/available', authMiddleware, leaderOnly, async (req, res) => {
    try {
        const students = await PatrolService.getAvailableStudents();
        res.status(200).json({
            success: true,
            data: students,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: error.message || 'Erro ao listar alunos',
        });
    }
});
// GET /patrols/students/all - Listar todos os alunos
router.get('/students/all', authMiddleware, leaderOnly, async (req, res) => {
    try {
        const students = await PatrolService.listAllStudents();
        res.status(200).json({
            success: true,
            data: students,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: error.message || 'Erro ao listar alunos',
        });
    }
});
// GET /patrols/:patrolId/members - Obter membros de uma patrulha
router.get('/:patrolId/members', authMiddleware, async (req, res) => {
    try {
        const { patrolId } = req.params;
        const members = await PatrolService.getPatrolMembers(patrolId);
        res.status(200).json({
            success: true,
            data: members,
        });
    }
    catch (error) {
        if (error.message === 'Patrulha não encontrada') {
            res.status(404).json({
                success: false,
                error: error.message,
            });
            return;
        }
        res.status(500).json({
            success: false,
            error: error.message || 'Erro ao listar membros',
        });
    }
});
export default router;
//# sourceMappingURL=patrol.js.map