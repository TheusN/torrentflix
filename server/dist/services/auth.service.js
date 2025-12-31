import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { RefreshToken } from '../models/RefreshToken.js';
import { config } from '../config/index.js';
import { UnauthorizedError, ConflictError, BadRequestError } from '../middleware/error.middleware.js';
class AuthService {
    // Register new user
    async register(data) {
        // Check if email already exists
        const existingUser = await User.findOne({ where: { email: data.email } });
        if (existingUser) {
            throw new ConflictError('Email already registered');
        }
        // Validate password
        if (data.password.length < 6) {
            throw new BadRequestError('Password must be at least 6 characters');
        }
        // Create user (password will be hashed by model hook)
        const user = await User.create({
            email: data.email,
            passwordHash: data.password,
            name: data.name,
        });
        return user.toSafeObject();
    }
    // Login user
    async login(data) {
        // Find user by email
        const user = await User.findOne({ where: { email: data.email } });
        if (!user) {
            throw new UnauthorizedError('Invalid email or password');
        }
        // Check if user is active
        if (!user.isActive) {
            throw new UnauthorizedError('Account is disabled');
        }
        // Verify password
        const isValidPassword = await user.checkPassword(data.password);
        if (!isValidPassword) {
            throw new UnauthorizedError('Invalid email or password');
        }
        // Update last login
        await user.update({ lastLogin: new Date() });
        // Generate tokens
        const accessToken = this.generateAccessToken(user);
        const refreshToken = await this.generateRefreshToken(user);
        return {
            accessToken,
            refreshToken,
            user: user.toSafeObject(),
        };
    }
    // Refresh access token
    async refreshToken(token) {
        // Find refresh token in database
        const storedToken = await RefreshToken.findOne({
            where: { token },
            include: [{ model: User, as: 'user' }],
        });
        if (!storedToken) {
            throw new UnauthorizedError('Invalid refresh token');
        }
        // Check if token is expired
        if (storedToken.isExpired()) {
            await storedToken.destroy();
            throw new UnauthorizedError('Refresh token expired');
        }
        // Get user from the token
        const user = await User.findByPk(storedToken.userId);
        if (!user || !user.isActive) {
            await storedToken.destroy();
            throw new UnauthorizedError('User not found or inactive');
        }
        // Generate new access token
        const accessToken = this.generateAccessToken(user);
        return { accessToken };
    }
    // Logout - invalidate refresh token
    async logout(refreshToken) {
        await RefreshToken.destroy({ where: { token: refreshToken } });
    }
    // Logout from all devices
    async logoutAll(userId) {
        await RefreshToken.destroy({ where: { userId } });
    }
    // Get user by ID
    async getUserById(userId) {
        const user = await User.findByPk(userId);
        return user ? user.toSafeObject() : null;
    }
    // Generate access token (short-lived)
    generateAccessToken(user) {
        const payload = {
            userId: user.id,
            email: user.email,
            role: user.role,
        };
        return jwt.sign(payload, config.jwt.secret, {
            expiresIn: config.jwt.accessExpiry,
        });
    }
    // Generate refresh token (long-lived)
    async generateRefreshToken(user) {
        const payload = { userId: user.id, type: 'refresh' };
        const token = jwt.sign(payload, config.jwt.refreshSecret, {
            expiresIn: config.jwt.refreshExpiry,
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
    verifyAccessToken(token) {
        try {
            return jwt.verify(token, config.jwt.secret);
        }
        catch (error) {
            throw new UnauthorizedError('Invalid or expired token');
        }
    }
    // Create admin user if none exists
    async createAdminIfNotExists() {
        const adminExists = await User.findOne({ where: { role: 'admin' } });
        if (!adminExists) {
            await User.create({
                email: 'admin@torrentflix.local',
                passwordHash: 'admin123', // Will be hashed by hook
                name: 'Administrator',
                role: 'admin',
            });
            console.log('Default admin user created: admin@torrentflix.local / admin123');
        }
    }
}
export const authService = new AuthService();
export default authService;
//# sourceMappingURL=auth.service.js.map