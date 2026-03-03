import jwt from 'jsonwebtoken';
import { randomBytes } from 'crypto';
import { config } from '../config';
export class JWTService {
    /**
     * Generate an access token (short lived) with configured expiration.
     */
    static generateAccessToken(payload) {
        // cast to any in order to satisfy TS overload resolution
        return jwt.sign(payload, config.jwt.secret, {
            expiresIn: config.jwt.accessExpiration,
            algorithm: 'HS256',
        });
    }
    /**
     * Verify an access token and return the decoded payload or null if invalid.
     */
    static verifyAccessToken(token) {
        try {
            const decoded = jwt.verify(token, config.jwt.secret);
            return decoded;
        }
        catch (error) {
            return null;
        }
    }
    /**
     * Decode (without verifying) any token. Useful for inspection.
     */
    static decodeToken(token) {
        try {
            const decoded = jwt.decode(token);
            return decoded;
        }
        catch (error) {
            return null;
        }
    }
    /**
     * Check if a JWT (access token) is already expired based on "exp" claim.
     */
    static isTokenExpired(token) {
        const decoded = JWTService.decodeToken(token);
        if (!decoded || !decoded.exp)
            return true;
        const now = Math.floor(Date.now() / 1000);
        return decoded.exp < now;
    }
    /**
     * Create a new cryptographically random string to be used as a refresh token.
     * Rotation logic is handled elsewhere.
     */
    static generateRefreshToken() {
        return randomBytes(64).toString('hex');
    }
}
//# sourceMappingURL=jwt.js.map