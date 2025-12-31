import { JwtPayload } from '../types/index.js';
export interface SafeUser {
    id: number;
    email: string;
    name: string;
    role: 'admin' | 'user';
    isActive: boolean;
    createdAt: Date;
    lastLogin: Date | null;
}
export interface RegisterDto {
    email: string;
    password: string;
    name: string;
}
export interface LoginDto {
    email: string;
    password: string;
}
export interface AuthResponse {
    accessToken: string;
    refreshToken: string;
    user: SafeUser;
}
export interface TokenPayload {
    userId: number;
    email: string;
    role: 'admin' | 'user';
}
declare class AuthService {
    register(data: RegisterDto): Promise<SafeUser>;
    login(data: LoginDto): Promise<AuthResponse>;
    refreshToken(token: string): Promise<{
        accessToken: string;
    }>;
    logout(refreshToken: string): Promise<void>;
    logoutAll(userId: number): Promise<void>;
    getUserById(userId: number): Promise<SafeUser | null>;
    private generateAccessToken;
    private generateRefreshToken;
    verifyAccessToken(token: string): JwtPayload;
    createAdminIfNotExists(): Promise<void>;
}
export declare const authService: AuthService;
export default authService;
//# sourceMappingURL=auth.service.d.ts.map