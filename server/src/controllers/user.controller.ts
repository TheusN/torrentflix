import { Request, Response, NextFunction } from 'express';
import { User, WatchProgress, Watchlist, WatchHistory, UserPreferences, ActivityLog } from '../models/index.js';
import { BadRequestError, NotFoundError, UnauthorizedError } from '../middleware/error.middleware.js';
import bcrypt from 'bcrypt';
import { defaultPreferences } from '../models/UserPreferences.js';

export class UserController {
  // ==================== PERFIL ====================

  async getProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;

      const user = await User.findByPk(userId, {
        attributes: { exclude: ['passwordHash'] },
      });

      if (!user) {
        throw new NotFoundError('Usuário não encontrado');
      }

      res.json({
        success: true,
        data: { user: user.toSafeObject() },
      });
    } catch (error) {
      next(error);
    }
  }

  async updateProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      const { name } = req.body;

      const user = await User.findByPk(userId);
      if (!user) {
        throw new NotFoundError('Usuário não encontrado');
      }

      if (name) {
        await user.update({ name });
      }

      res.json({
        success: true,
        message: 'Perfil atualizado com sucesso',
        data: { user: user.toSafeObject() },
      });
    } catch (error) {
      next(error);
    }
  }

  async changePassword(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      const { currentPassword, newPassword } = req.body;

      if (!currentPassword || !newPassword) {
        throw new BadRequestError('Senha atual e nova senha são obrigatórias');
      }

      if (newPassword.length < 6) {
        throw new BadRequestError('Nova senha deve ter pelo menos 6 caracteres');
      }

      const user = await User.findByPk(userId);
      if (!user) {
        throw new NotFoundError('Usuário não encontrado');
      }

      const isValid = await user.checkPassword(currentPassword);
      if (!isValid) {
        throw new UnauthorizedError('Senha atual incorreta');
      }

      user.passwordHash = newPassword;
      await user.save();

      // Log da ação
      await ActivityLog.create({
        userId,
        action: 'user.password_change',
        details: {},
        ipAddress: req.ip,
      });

      res.json({
        success: true,
        message: 'Senha alterada com sucesso',
      });
    } catch (error) {
      next(error);
    }
  }

  // ==================== PROGRESSO (CONTINUAR ASSISTINDO) ====================

  async getProgress(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;

      const progress = await WatchProgress.findAll({
        where: { userId },
        order: [['updatedAt', 'DESC']],
      });

      res.json({
        success: true,
        data: { progress },
      });
    } catch (error) {
      next(error);
    }
  }

  async saveProgress(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      const { mediaId, mediaType, progress, duration, episodeInfo } = req.body;

      if (!mediaId || !mediaType || progress === undefined || duration === undefined) {
        throw new BadRequestError('mediaId, mediaType, progress e duration são obrigatórios');
      }

      const [watchProgress, created] = await WatchProgress.upsert({
        userId: userId!,
        mediaId,
        mediaType,
        progress,
        duration,
        episodeInfo,
      });

      // Se assistiu mais de 90%, adicionar ao histórico
      if (progress / duration >= 0.9) {
        await WatchHistory.create({
          userId: userId!,
          mediaId,
          mediaType,
          title: req.body.title || mediaId,
          poster: req.body.poster,
          episodeInfo,
          watchDuration: duration,
        });
      }

      res.json({
        success: true,
        message: created ? 'Progresso salvo' : 'Progresso atualizado',
        data: { progress: watchProgress },
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteProgress(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      const { id } = req.params;

      const progress = await WatchProgress.findOne({
        where: { id, userId },
      });

      if (!progress) {
        throw new NotFoundError('Progresso não encontrado');
      }

      await progress.destroy();

      res.json({
        success: true,
        message: 'Progresso removido',
      });
    } catch (error) {
      next(error);
    }
  }

  // ==================== MINHA LISTA (WATCHLIST) ====================

  async getWatchlist(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;

      const watchlist = await Watchlist.findAll({
        where: { userId },
        order: [['addedAt', 'DESC']],
      });

      res.json({
        success: true,
        data: { watchlist },
      });
    } catch (error) {
      next(error);
    }
  }

  async addToWatchlist(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      const { mediaId, mediaType, title, poster, year } = req.body;

      if (!mediaId || !mediaType || !title) {
        throw new BadRequestError('mediaId, mediaType e title são obrigatórios');
      }

      // Verificar se já existe
      const existing = await Watchlist.findOne({
        where: { userId, mediaId, mediaType },
      });

      if (existing) {
        throw new BadRequestError('Item já está na sua lista');
      }

      const item = await Watchlist.create({
        userId: userId!,
        mediaId,
        mediaType,
        title,
        poster,
        year,
      });

      res.status(201).json({
        success: true,
        message: 'Adicionado à sua lista',
        data: { item },
      });
    } catch (error) {
      next(error);
    }
  }

  async removeFromWatchlist(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      const { id } = req.params;

      const item = await Watchlist.findOne({
        where: { id, userId },
      });

      if (!item) {
        throw new NotFoundError('Item não encontrado');
      }

      await item.destroy();

      res.json({
        success: true,
        message: 'Removido da sua lista',
      });
    } catch (error) {
      next(error);
    }
  }

  // ==================== HISTÓRICO ====================

  async getHistory(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      const { count, rows } = await WatchHistory.findAndCountAll({
        where: { userId },
        order: [['watchedAt', 'DESC']],
        limit,
        offset: (page - 1) * limit,
      });

      res.json({
        success: true,
        data: {
          history: rows,
          pagination: {
            page,
            limit,
            total: count,
            pages: Math.ceil(count / limit),
          },
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async clearHistory(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;

      await WatchHistory.destroy({
        where: { userId },
      });

      res.json({
        success: true,
        message: 'Histórico limpo',
      });
    } catch (error) {
      next(error);
    }
  }

  async removeHistoryItem(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      const { id } = req.params;

      const item = await WatchHistory.findOne({
        where: { id, userId },
      });

      if (!item) {
        throw new NotFoundError('Item não encontrado');
      }

      await item.destroy();

      res.json({
        success: true,
        message: 'Item removido do histórico',
      });
    } catch (error) {
      next(error);
    }
  }

  // ==================== PREFERÊNCIAS ====================

  async getPreferences(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;

      let prefs = await UserPreferences.findOne({
        where: { userId },
      });

      if (!prefs) {
        // Criar preferências padrão se não existir
        prefs = await UserPreferences.create({
          userId: userId!,
          preferences: defaultPreferences,
        });
      }

      res.json({
        success: true,
        data: { preferences: prefs.preferences },
      });
    } catch (error) {
      next(error);
    }
  }

  async updatePreferences(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      const { preferences } = req.body;

      if (!preferences || typeof preferences !== 'object') {
        throw new BadRequestError('Preferências inválidas');
      }

      const [prefs] = await UserPreferences.upsert({
        userId: userId!,
        preferences: { ...defaultPreferences, ...preferences },
      });

      res.json({
        success: true,
        message: 'Preferências atualizadas',
        data: { preferences: prefs.preferences },
      });
    } catch (error) {
      next(error);
    }
  }
}

export default UserController;
