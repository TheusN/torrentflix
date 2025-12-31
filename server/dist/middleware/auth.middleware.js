import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';
import { UnauthorizedError, ForbiddenError } from './error.middleware.js';
// Authenticate middleware - verify JWT token
export function authenticate(req, res, next) {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new UnauthorizedError('No token provided');
        }
        const token = authHeader.substring(7);
        try {
            const payload = jwt.verify(token, config.jwt.secret);
            req.user = payload;
            next();
        }
        catch (error) {
            if (error instanceof jwt.TokenExpiredError) {
                throw new UnauthorizedError('Token expired');
            }
            throw new UnauthorizedError('Invalid token');
        }
    }
    catch (error) {
        next(error);
    }
}
// Authorize middleware - check user role
export function authorize(...allowedRoles) {
    return (req, res, next) => {
        try {
            if (!req.user) {
                throw new UnauthorizedError('Not authenticated');
            }
            if (!allowedRoles.includes(req.user.role)) {
                throw new ForbiddenError('Insufficient permissions');
            }
            next();
        }
        catch (error) {
            next(error);
        }
    };
}
// Optional auth - attach user if token exists, but don't require it
export function optionalAuth(req, res, next) {
    try {
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.substring(7);
            try {
                const payload = jwt.verify(token, config.jwt.secret);
                req.user = payload;
            }
            catch {
                // Token invalid/expired, but that's okay for optional auth
            }
        }
        next();
    }
    catch (error) {
        next(error);
    }
}
export default { authenticate, authorize, optionalAuth };
//# sourceMappingURL=auth.middleware.js.map