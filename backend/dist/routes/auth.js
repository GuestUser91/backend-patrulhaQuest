import { Router } from 'express';
import { z } from 'zod';
import { AuthService } from '../services/auth';
import { authMiddleware } from '../middleware/auth';
import { config } from '../config';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
function parseDuration(duration) {
    const match = /^([0-9]+)(s|m|h|d)$/.exec(duration);
    if (!match) {
        const asNum = parseInt(duration, 10);
        return isNaN(asNum) ? 0 : asNum;
    }
    const value = parseInt(match[1], 10);
    switch (match[2]) {
        case 's':
            return value * 1000;
        case 'm':
            return value * 60 * 1000;
        case 'h':
            return value * 60 * 60 * 1000;
        case 'd':
            return value * 24 * 60 * 60 * 1000;
    }
    return 0;
}
const router = Router();
const uploadsDir = path.join(process.cwd(), 'uploads', 'avatars');
if (!fs.existsSync(uploadsDir))
    fs.mkdirSync(uploadsDir, { recursive: true });
const storage = multer.diskStorage({
    destination: function (_req, _file, cb) { cb(null, uploadsDir); },
    filename: function (_req, file, cb) {
        const ext = path.extname(file.originalname) || '.png';
        const name = Date.now() + '-' + Math.random().toString(36).slice(2, 8) + ext;
        cb(null, name);
    }
});
const upload = multer({
    storage,
    limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
    fileFilter: (_req, file, cb) => {
        const allowed = /jpeg|jpg|png|webp/;
        const ok = allowed.test(file.mimetype) || allowed.test(path.extname(file.originalname).toLowerCase());
        cb(null, ok);
    }
});
const registerSchema = z.object({
    email: z.string().email('Email inválido'),
    name: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres'),
    password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
    role: z.literal('STUDENT').or(z.literal('student')),
});
const loginSchema = z.object({
    email: z.string().email('Email inválido'),
    password: z.string().min(1, 'Senha é obrigatória'),
    role: z.enum(['LEADER', 'STUDENT']),
});
router.post('/register', async (req, res) => {
    try {
        if (req.body && req.body.role) {
            req.body.role = String(req.body.role).toUpperCase();
        }
        console.log('[auth/register] body:', req.body);
        const body = registerSchema.parse(req.body);
        const data = body;
        const result = await AuthService.register(data);
        const { user, accessToken, refreshToken } = result;
        const cookieOptions = {
            httpOnly: true,
            secure: config.cookie.secure,
            sameSite: config.cookie.sameSite,
            maxAge: parseDuration(config.jwt.refreshExpiration),
            domain: config.cookie.domain,
            path: '/api',
        };
        res.cookie('refreshToken', refreshToken, cookieOptions);
        res.status(201).json({
            success: true,
            message: 'Usuário registrado com sucesso',
            data: {
                user,
                accessToken,
            },
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
            error: error.message || 'Erro ao registrar usuário',
        });
    }
});
router.post('/login', async (req, res) => {
    try {
        if (req.body && req.body.role) {
            req.body.role = String(req.body.role).toUpperCase();
        }
        console.log('[auth/login] body:', req.body);
        const body = loginSchema.parse(req.body);
        const data = body;
        const result = await AuthService.login(data);
        const { user, accessToken, refreshToken } = result;
        const cookieOptions = {
            httpOnly: true,
            secure: config.cookie.secure,
            sameSite: config.cookie.sameSite,
            maxAge: parseDuration(config.jwt.refreshExpiration),
            domain: config.cookie.domain,
            path: '/api',
        };
        res.cookie('refreshToken', refreshToken, cookieOptions);
        res.status(200).json({
            success: true,
            message: 'Login realizado com sucesso',
            data: {
                user,
                accessToken,
            },
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
        res.status(401).json({
            success: false,
            error: error.message || 'Erro ao fazer login',
        });
    }
});
router.get('/me', authMiddleware, async (req, res) => {
    try {
        if (!req.user) {
            res.status(401).json({
                success: false,
                error: 'Usuário não autenticado',
            });
            return;
        }
        const user = await AuthService.getUserById(req.user.userId);
        if (!user) {
            res.status(404).json({
                success: false,
                error: 'Usuário não encontrado',
            });
            return;
        }
        res.status(200).json({
            success: true,
            data: user,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: error.message || 'Erro ao buscar dados do usuário',
        });
    }
});
// PATCH /auth/me - atualizar perfil (nome, avatar)
router.patch('/me', authMiddleware, async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ success: false, error: 'Usuário não autenticado' });
        }
        const body = req.body;
        const updated = await AuthService.updateUserProfile(req.user.userId, body);
        res.status(200).json({ success: true, data: updated });
    }
    catch (error) {
        res.status(400).json({ success: false, error: error.message || 'Erro ao atualizar perfil' });
    }
});
// POST /auth/me/avatar - upload avatar (multipart/form-data)
router.post('/me/avatar', authMiddleware, upload.single('avatar'), async (req, res) => {
    try {
        if (!req.user)
            return res.status(401).json({ success: false, error: 'Usuário não autenticado' });
        if (!req.file)
            return res.status(400).json({ success: false, error: 'Arquivo não enviado' });
        // build public url for avatar (absolute)
        const host = req.get('host');
        const protocol = req.protocol;
        const avatarUrl = `/uploads/avatars/${req.file.filename}`;
        const avatarFull = host ? `${protocol}://${host}${avatarUrl}` : avatarUrl;
        const updated = await AuthService.updateUserProfile(req.user.userId, { avatar: avatarFull });
        res.status(200).json({ success: true, data: updated });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message || 'Erro ao enviar avatar' });
    }
});
// POST /auth/refresh
router.post('/refresh', async (req, res) => {
    try {
        const { refreshToken } = req.cookies || {};
        if (!refreshToken) {
            res.status(401).json({ success: false, error: 'Refresh token não fornecido' });
            return;
        }
        try {
            const { accessToken, refreshToken: newRefresh } = await AuthService.rotateRefreshToken(refreshToken);
            const cookieOptions = {
                httpOnly: true,
                secure: config.cookie.secure,
                sameSite: config.cookie.sameSite,
                maxAge: parseDuration(config.jwt.refreshExpiration),
                domain: config.cookie.domain,
                path: '/api',
            };
            res.cookie('refreshToken', newRefresh, cookieOptions);
            res.status(200).json({ success: true, data: { accessToken } });
        }
        catch (rotationError) {
            // invalid or expired refresh token -> clear cookie and optionally revoke
            // if the token still belonged to some user we will wipe it to prevent reuse
            try {
                const victim = await AuthService.findUserByRefreshToken(refreshToken);
                if (victim) {
                    await AuthService.revokeRefreshToken(victim.id);
                }
            }
            catch (_) {
                // ignore
            }
            res.clearCookie('refreshToken', { path: '/api' });
            res.status(401).json({ success: false, error: 'Refresh token inválido' });
        }
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
// POST /auth/logout
router.post('/logout', async (req, res) => {
    try {
        const { refreshToken } = req.cookies || {};
        if (refreshToken) {
            const user = await AuthService.findUserByRefreshToken(refreshToken);
            if (user) {
                await AuthService.revokeRefreshToken(user.id);
            }
        }
        res.clearCookie('refreshToken', { path: '/api' });
        res.status(200).json({ success: true, message: 'Logout realizado' });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
export default router;
//# sourceMappingURL=auth.js.map