import { JWTPayload } from '../types';
export declare class JWTService {
    /**
     * Generate an access token (short lived) with configured expiration.
     */
    static generateAccessToken(payload: Omit<JWTPayload, 'iat' | 'exp'>): string;
    /**
     * Verify an access token and return the decoded payload or null if invalid.
     */
    static verifyAccessToken(token: string): JWTPayload | null;
    /**
     * Decode (without verifying) any token. Useful for inspection.
     */
    static decodeToken(token: string): JWTPayload | null;
    /**
     * Check if a JWT (access token) is already expired based on "exp" claim.
     */
    static isTokenExpired(token: string): boolean;
    /**
     * Create a new cryptographically random string to be used as a refresh token.
     * Rotation logic is handled elsewhere.
     */
    static generateRefreshToken(): string;
}
//# sourceMappingURL=jwt.d.ts.map