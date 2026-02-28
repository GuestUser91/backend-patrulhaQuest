import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import { JWTService } from '../services/jwt';

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction): void => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        error: 'Token não fornecido',
      });
      return;
    }

    const token = authHeader.slice(7); // Remove "Bearer "
    const decoded = JWTService.verifyAccessToken(token);

    if (!decoded) {
      res.status(401).json({
        success: false,
        error: 'Token inválido ou expirado',
      });
      return;
    }

    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      error: 'Erro ao validar token',
    });
  }
};

export const leaderOnly = (req: AuthRequest, res: Response, next: NextFunction): void => {
  if (req.user?.role !== 'LEADER') {
    res.status(403).json({
      success: false,
      error: 'Acesso permitido apenas para líderes',
    });
    return;
  }
  next();
};

export const studentOnly = (req: AuthRequest, res: Response, next: NextFunction): void => {
  if (req.user?.role !== 'STUDENT') {
    res.status(403).json({
      success: false,
      error: 'Acesso permitido apenas para alunos',
    });
    return;
  }
  next();
};
