import prisma from '../prisma';
import { JWTService } from './jwt';
import { PasswordService } from './password';
import { LoginRequest, RegisterRequest } from '../types';
import { config } from '../config';

 


// helper to convert a duration string like "15m" "30d" into milliseconds
function parseDuration(duration: string): number {
  const match = /^([0-9]+)(s|m|h|d)$/.exec(duration);
  if (!match) {
    // default to milliseconds number if parse fails
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

interface TokenPair {
  accessToken: string;
  refreshToken: string;
  refreshExpiresAt: Date;
}

export class AuthService {
  // create access + refresh tokens and persist refresh token in database
  private static async createTokenPair(user: { id: string; email: string; role: string }): Promise<TokenPair> {
    const accessToken = JWTService.generateAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role as 'LEADER' | 'STUDENT',
    });

    const refreshToken = JWTService.generateRefreshToken();
    const expiresAt = new Date(Date.now() + parseDuration(config.jwt.refreshExpiration));

    await prisma.user.update({
      where: { id: user.id },
      data: {
        refreshToken,
        refreshTokenExpiresAt: expiresAt,
      },
    });

    return { accessToken, refreshToken, refreshExpiresAt: expiresAt };
  }

  static async register(data: RegisterRequest) {
    // Verificar se usuário já existe
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new Error('Email já cadastrado');
    }

    // Hash da senha
    const hashedPassword = await PasswordService.hash(data.password);

    // Criar usuário - SEMPRE como STUDENT (não como LEADER)
    // Líderes são criados manualmente no banco de dados
    const user = await prisma.user.create({
      data: {
        email: data.email,
        name: data.name,
        password: hashedPassword,
        role: 'STUDENT', // Force STUDENT role always
        avatar: null,
      },
    });

    const sanitizedUser = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      avatar: user.avatar,
      patrolId: user.patrolId,
    };

    const tokens = await AuthService.createTokenPair({ id: user.id, email: user.email, role: user.role });

    return {
      user: sanitizedUser,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken, // route will use this to set cookie
    };
  }

  static async login(data: LoginRequest) {
    // Buscar usuário
    const user = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (!user) {
      throw new Error('Email ou senha incorretos');
    }

    // Verificar papel
    if (user.role !== data.role) {
      throw new Error(`Este email está registrado como ${user.role.toLowerCase()}, não como ${data.role.toLowerCase()}`);
    }

    // Verificar senha
    const passwordMatch = await PasswordService.compare(data.password, user.password);

    if (!passwordMatch) {
      throw new Error('Email ou senha incorretos');
    }

    const sanitizedUser = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      avatar: user.avatar,
      patrolId: user.patrolId,
    };

    const tokens = await AuthService.createTokenPair({ id: user.id, email: user.email, role: user.role });

    return {
      user: sanitizedUser,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }

  // Find a user by a valid refresh token
  static async findUserByRefreshToken(token: string) {
    if (!token) return null;
    const user = await prisma.user.findFirst({
      where: {
        refreshToken: token,
        refreshTokenExpiresAt: {
          gt: new Date(),
        },
      },
    });
    return user;
  }

  // Rotate a refresh token and return new pair
  static async rotateRefreshToken(oldToken: string): Promise<{ accessToken: string; refreshToken: string }> {
    const user = await AuthService.findUserByRefreshToken(oldToken);
    if (!user) {
      throw new Error('Refresh token inválido ou expirado');
    }

    const tokens = await AuthService.createTokenPair({ id: user.id, email: user.email, role: user.role });
    return { accessToken: tokens.accessToken, refreshToken: tokens.refreshToken };
  }

  static async revokeRefreshToken(userId: string) {
    await prisma.user.update({
      where: { id: userId },
      data: { refreshToken: null, refreshTokenExpiresAt: null },
    });
  }

  static async getUserById(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatar: true,
        patrolId: true,
        patrol: {
          select: {
            id: true,
            name: true,
            color: true,
            icon: true,
            points: true,
          },
        },
      },
    });

    return user;
  }

  static async updateUserProfile(userId: string, data: { name?: string; avatar?: string | null }) {
    const updateData: any = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.avatar !== undefined) updateData.avatar = data.avatar;

    const updated = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatar: true,
        patrolId: true,
      },
    });

    return updated;
  }
}
