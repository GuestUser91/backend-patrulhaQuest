import { Request } from 'express';

export interface JWTPayload {
  userId: string;
  email: string;
  role: 'LEADER' | 'STUDENT';
  iat?: number;
  exp?: number;
}

export interface AuthRequest extends Request {
  user?: JWTPayload;
  file?: Express.Multer.File;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  data?: any;
  error?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
  role: 'LEADER' | 'STUDENT';
}

export interface RegisterRequest {
  email: string;
  name: string;
  password: string;
  role: 'LEADER' | 'STUDENT';
}
