import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
export declare const authMiddleware: (req: AuthRequest, res: Response, next: NextFunction) => void;
export declare const leaderOnly: (req: AuthRequest, res: Response, next: NextFunction) => void;
export declare const studentOnly: (req: AuthRequest, res: Response, next: NextFunction) => void;
//# sourceMappingURL=auth.d.ts.map