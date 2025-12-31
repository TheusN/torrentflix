export declare const config: {
    nodeEnv: string;
    port: number;
    isProduction: boolean;
    database: {
        url: string | undefined;
        host: string;
        port: number;
        name: string;
        user: string;
        password: string;
    };
    jwt: {
        secret: string;
        refreshSecret: string;
        accessExpiry: string;
        refreshExpiry: string;
    };
    qbittorrent: {
        host: string;
        port: number;
        username: string;
        password: string;
        readonly baseUrl: string;
    };
    jackett: {
        host: string;
        port: number;
        apiKey: string;
        readonly baseUrl: string;
    };
    sonarr: {
        host: string;
        port: number;
        apiKey: string;
        readonly baseUrl: string;
    };
    radarr: {
        host: string;
        port: number;
        apiKey: string;
        readonly baseUrl: string;
    };
    paths: {
        downloads: string;
        media: string;
    };
    tmdb: {
        apiKey: string;
        baseUrl: string;
        imageBaseUrl: string;
    };
};
export default config;
//# sourceMappingURL=index.d.ts.map