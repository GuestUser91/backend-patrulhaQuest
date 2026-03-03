import dotenv from 'dotenv';
dotenv.config();
export const config = {
    database: {
        url: process.env.DATABASE_URL || '',
    },
    jwt: {
        secret: process.env.JWT_SECRET || 'dev-secret-key-change-in-production',
        // token lifetimes for access and refresh tokens
        accessExpiration: process.env.JWT_ACCESS_EXPIRATION || '15m',
        refreshExpiration: process.env.JWT_REFRESH_EXPIRATION || '30d',
    },
    server: {
        port: parseInt(process.env.PORT || '3000', 10),
        env: process.env.NODE_ENV || 'development',
    },
    // cookie configuration used for storing refresh tokens
    cookie: {
        secure: process.env.COOKIE_SECURE === 'true' || process.env.NODE_ENV === 'production',
        sameSite: process.env.COOKIE_SAMESITE || 'lax',
        // optional domain, useful when frontend is on a different subdomain
        domain: process.env.COOKIE_DOMAIN || undefined,
    },
};
// Validação de variáveis obrigatórias
if (!config.database.url && config.server.env !== 'development') {
    throw new Error('DATABASE_URL is required');
}
//# sourceMappingURL=config.js.map