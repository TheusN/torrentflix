import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { RefreshToken } from '../models/RefreshToken.js';
import { config } from '../config/index.js';
import { UnauthorizedError, ConflictError, BadRequestError } from '../middleware/error.middleware.js';
import { JwtPayload } from '../types/index.js';

// Safe user type (without sensitive fields)
export interface SafeUser {
  id: number;
  email: string;
  name: string;
  role: 'admin' | 'user';
  isActive: boolean;
  createdAt: Date;
  lastLogin: Date | null;
}

// Types
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

class AuthService {
  // Register new user
  async register(data: RegisterDto): Promise<SafeUser> {
    // Check if email already exists
    const existingUser = await User.findOne({ where: { email: data.email } });
    if (existingUser) {
      throw new ConflictError('E-mail ja cadastrado');
    }

    // Validate password
    if (data.password.length < 6) {
      throw new BadRequestError('A senha deve ter pelo menos 6 caracteres');
    }

    // Create user (password will be hashed by model hook)
    const user = await User.create({
      email: data.email,
      passwordHash: data.password,
      name: data.name,
    });

    return user.toSafeObject() as SafeUser;
  }

  // Login user
  async login(data: LoginDto): Promise<AuthResponse> {
    // Find user by email
    const user = await User.findOne({ where: { email: data.email } });
    if (!user) {
      throw new UnauthorizedError('E-mail ou senha invalidos');
    }

    // Check if user is active
    if (!user.isActive) {
      throw new UnauthorizedError('Conta desativada');
    }

    // Verify password
    const isValidPassword = await user.checkPassword(data.password);
    if (!isValidPassword) {
      throw new UnauthorizedError('E-mail ou senha invalidos');
    }

    // Update last login
    await user.update({ lastLogin: new Date() });

    // Generate tokens
    const accessToken = this.generateAccessToken(user);
    const refreshToken = await this.generateRefreshToken(user);

    return {
      accessToken,
      refreshToken,
      user: user.toSafeObject() as SafeUser,
    };
  }

  // Refresh access token
  async refreshToken(token: string): Promise<{ accessToken: string }> {
    // Find refresh token in database
    const storedToken = await RefreshToken.findOne({
      where: { token },
      include: [{ model: User, as: 'user' }],
    });

    if (!storedToken) {
      throw new UnauthorizedError('Token de atualizacao invalido');
    }

    // Check if token is expired
    if (storedToken.isExpired()) {
      await storedToken.destroy();
      throw new UnauthorizedError('Token de atualizacao expirado');
    }

    // Get user from the token
    const user = await User.findByPk(storedToken.userId);
    if (!user || !user.isActive) {
      await storedToken.destroy();
      throw new UnauthorizedError('Usuario nao encontrado ou inativo');
    }

    // Generate new access token
    const accessToken = this.generateAccessToken(user);

    return { accessToken };
  }

  // Logout - invalidate refresh token
  async logout(refreshToken: string): Promise<void> {
    await RefreshToken.destroy({ where: { token: refreshToken } });
  }

  // Logout from all devices
  async logoutAll(userId: number): Promise<void> {
    await RefreshToken.destroy({ where: { userId } });
  }

  // Get user by ID
  async getUserById(userId: number): Promise<SafeUser | null> {
    const user = await User.findByPk(userId);
    return user ? user.toSafeObject() as SafeUser : null;
  }

  // Generate access token (short-lived)
  private generateAccessToken(user: User): string {
    const payload: TokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    return jwt.sign(payload, config.jwt.secret, {
      expiresIn: config.jwt.accessExpiry as jwt.SignOptions['expiresIn'],
    });
  }

  // Generate refresh token (long-lived)
  private async generateRefreshToken(user: User): Promise<string> {
    const payload = { userId: user.id, type: 'refresh' };

    const token = jwt.sign(payload, config.jwt.refreshSecret, {
      expiresIn: config.jwt.refreshExpiry as jwt.SignOptions['expiresIn'],
    });

    // Calculate expiry date
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

    // Store in database
    await RefreshToken.create({
      userId: user.id,
      token,
      expiresAt,
    });

    return token;
  }

  // Verify access token
  verifyAccessToken(token: string): JwtPayload {
    try {
      return jwt.verify(token, config.jwt.secret) as JwtPayload;
    } catch (error) {
      throw new UnauthorizedError('Token invalido ou expirado');
    }
  }

  // Create admin user if none exists
  async createAdminIfNotExists(): Promise<void> {
    const adminExists = await User.findOne({ where: { role: 'admin' } });
    if (!adminExists) {
      await User.create({
        email: 'admin@torrentflix.local',
        passwordHash: 'admin123', // Will be hashed by hook
        name: 'Administrator',
        role: 'admin',
      });
      console.log('Usuario admin padrao criado: admin@torrentflix.local / admin123');
    }
  }
}

export const authService = new AuthService();
export default authService;
