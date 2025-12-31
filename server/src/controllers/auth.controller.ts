import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/auth.service.js';
import { AuthRequest } from '../types/index.js';
import { BadRequestError } from '../middleware/error.middleware.js';

class AuthController {
  // POST /api/auth/register
  async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password, name } = req.body;

      if (!email || !password || !name) {
        throw new BadRequestError('E-mail, senha e nome sao obrigatorios');
      }

      const user = await authService.register({ email, password, name });

      res.status(201).json({
        success: true,
        message: 'Usuario registrado com sucesso',
        data: { user },
      });
    } catch (error) {
      next(error);
    }
  }

  // POST /api/auth/login
  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        throw new BadRequestError('E-mail e senha sao obrigatorios');
      }

      const result = await authService.login({ email, password });

      res.json({
        success: true,
        message: 'Login realizado com sucesso',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  // POST /api/auth/refresh
  async refresh(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        throw new BadRequestError('Token de atualizacao obrigatorio');
      }

      const result = await authService.refreshToken(refreshToken);

      res.json({
        success: true,
        message: 'Token atualizado com sucesso',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  // POST /api/auth/logout
  async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { refreshToken } = req.body;

      if (refreshToken) {
        await authService.logout(refreshToken);
      }

      res.json({
        success: true,
        message: 'Sessao encerrada com sucesso',
      });
    } catch (error) {
      next(error);
    }
  }

  // POST /api/auth/logout-all
  async logoutAll(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new BadRequestError('Usuario nao autenticado');
      }

      await authService.logoutAll(req.user.userId);

      res.json({
        success: true,
        message: 'Sessao encerrada em todos os dispositivos',
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/auth/me
  async me(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new BadRequestError('Usuario nao autenticado');
      }

      const user = await authService.getUserById(req.user.userId);

      res.json({
        success: true,
        data: { user },
      });
    } catch (error) {
      next(error);
    }
  }
}

export const authController = new AuthController();
export default authController;
