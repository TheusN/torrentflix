import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types/index.js';
export declare function authenticate(req: AuthRequest, res: Response, next: NextFunction): void;
export declare function authorize(...allowedRoles: string[]): (req: AuthRequest, res: Response, next: NextFunction) => void;
export declare function optionalAuth(req: AuthRequest, res: Response, next: NextFunction): void;
declare const _default: {
    authenticate: typeof authenticate;
    authorize: typeof authorize;
    optionalAuth: typeof optionalAuth;
};
export default _default;
//# sourceMappingURL=auth.middleware.d.ts.map