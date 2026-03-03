export declare const config: {
    database: {
        url: string;
    };
    jwt: {
        secret: string;
        accessExpiration: string;
        refreshExpiration: string;
    };
    server: {
        port: number;
        env: string;
    };
    cookie: {
        secure: boolean;
        sameSite: "strict" | "lax" | "none";
        domain: string | undefined;
    };
};
//# sourceMappingURL=config.d.ts.map