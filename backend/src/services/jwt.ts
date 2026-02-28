import jwt from 'jsonwebtoken';
import { randomBytes } from 'crypto';
import { config } from '../config';
import { JWTPayload } from '../types';

export class JWTService {
  /**
   * Generate an access token (short lived) with configured expiration.
   */
  static generateAccessToken(payload: Omit<JWTPayload, 'iat' | 'exp'>): string {
    // cast to any in order to satisfy TS overload resolution
    return jwt.sign(payload as any, config.jwt.secret as any, {
      expiresIn: config.jwt.accessExpiration,
      algorithm: 'HS256',
    } as any);
  }

  /**
   * Verify an access token and return the decoded payload or null if invalid.
   */
  static verifyAccessToken(token: string): JWTPayload | null {
    try {
      const decoded = jwt.verify(token, config.jwt.secret) as JWTPayload;
      return decoded;
    } catch (error) {
      return null;
    }
  }

  /**
   * Decode (without verifying) any token. Useful for inspection.
   */
  static decodeToken(token: string): JWTPayload | null {
    try {
      const decoded = jwt.decode(token) as JWTPayload;
      return decoded;
    } catch (error) {
      return null;
    }
  }

  /**
   * Check if a JWT (access token) is already expired based on "exp" claim.
   */
  static isTokenExpired(token: string): boolean {
    const decoded = JWTService.decodeToken(token);
    if (!decoded || !decoded.exp) return true;
    const now = Math.floor(Date.now() / 1000);
    return decoded.exp < now;
  }

  /**
   * Create a new cryptographically random string to be used as a refresh token.
   * Rotation logic is handled elsewhere.
   */
  static generateRefreshToken(): string {
    return randomBytes(64).toString('hex');
  }
}
