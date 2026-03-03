import { LoginRequest, RegisterRequest } from '../types';
export declare class AuthService {
    private static createTokenPair;
    static register(data: RegisterRequest): Promise<{
        user: {
            id: string;
            email: string;
            name: string;
            role: import(".prisma/client").$Enums.UserRole;
            avatar: string | null;
            patrolId: string | null;
        };
        accessToken: string;
        refreshToken: string;
    }>;
    static login(data: LoginRequest): Promise<{
        user: {
            id: string;
            email: string;
            name: string;
            role: import(".prisma/client").$Enums.UserRole;
            avatar: string | null;
            patrolId: string | null;
        };
        accessToken: string;
        refreshToken: string;
    }>;
    static findUserByRefreshToken(token: string): Promise<{
        email: string;
        role: import(".prisma/client").$Enums.UserRole;
        id: string;
        name: string;
        password: string;
        avatar: string | null;
        patrolId: string | null;
        refreshToken: string | null;
        refreshTokenExpiresAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
    } | null>;
    static rotateRefreshToken(oldToken: string): Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
    static revokeRefreshToken(userId: string): Promise<void>;
    static getUserById(userId: string): Promise<{
        patrol: {
            id: string;
            name: string;
            color: string;
            icon: string;
            points: number;
        } | null;
        email: string;
        role: import(".prisma/client").$Enums.UserRole;
        id: string;
        name: string;
        avatar: string | null;
        patrolId: string | null;
    } | null>;
    static updateUserProfile(userId: string, data: {
        name?: string;
        avatar?: string | null;
    }): Promise<{
        email: string;
        role: import(".prisma/client").$Enums.UserRole;
        id: string;
        name: string;
        avatar: string | null;
        patrolId: string | null;
    }>;
}
//# sourceMappingURL=auth.d.ts.map