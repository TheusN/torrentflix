import { Request, Response, NextFunction } from 'express';
import { User, SystemSettings, ActivityLog } from '../models/index.js';
import { BadRequestError, NotFoundError } from '../middleware/error.middleware.js';
import bcrypt from 'bcrypt';
import { Op } from 'sequelize';
import { qbittorrentService } from '../services/qbittorrent.service.js';

export class AdminController {
  // ==================== DASHBOARD ====================

  async getDashboardStats(req: Request, res: Response, next: NextFunction) {
    try {
      const [totalUsers, activeUsers, recentLogs] = await Promise.all([
        User.count(),
        User.count({ where: { isActive: true } }),
        ActivityLog.count({
          where: {
            createdAt: {
              [Op.gte]: new Date(Date.now() - 24 * 60 * 60 * 1000), // últimas 24h
            },
          },
        }),
      ]);

      // Tentar obter stats do qBittorrent
      let downloadStats = null;
      try {
        downloadStats = await qbittorrentService.getTransferInfo();
      } catch {
        // qBittorrent não disponível
      }

      res.json({
        success: true,
        data: {
          users: {
            total: totalUsers,
            active: activeUsers,
          },
          activity: {
            last24h: recentLogs,
          },
          downloads: downloadStats,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  // ==================== USUÁRIOS ====================

  async listUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const search = req.query.search as string;

      const where: Record<string, unknown> = {};
      if (search) {
        where[Op.or as unknown as string] = [
          { name: { [Op.iLike]: `%${search}%` } },
          { email: { [Op.iLike]: `%${search}%` } },
        ];
      }

      const { count, rows } = await User.findAndCountAll({
        where,
        attributes: { exclude: ['passwordHash'] },
        order: [['createdAt', 'DESC']],
        limit,
        offset: (page - 1) * limit,
      });

      res.json({
        success: true,
        data: {
          users: rows,
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

  async getUser(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      const user = await User.findByPk(id, {
        attributes: { exclude: ['passwordHash'] },
      });

      if (!user) {
        throw new NotFoundError('Usuário não encontrado');
      }

      res.json({
        success: true,
        data: { user },
      });
    } catch (error) {
      next(error);
    }
  }

  async createUser(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password, name, role } = req.body;

      if (!email || !password || !name) {
        throw new BadRequestError('Email, senha e nome são obrigatórios');
      }

      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        throw new BadRequestError('Email já está em uso');
      }

      const user = await User.create({
        email,
        passwordHash: password,
        name,
        role: role || 'user',
      });

      // Log da ação
      await ActivityLog.create({
        userId: req.user?.userId,
        action: 'admin.user_create',
        details: { createdUserId: user.id, email },
        ipAddress: req.ip,
      });

      res.status(201).json({
        success: true,
        message: 'Usuário criado com sucesso',
        data: { user: user.toSafeObject() },
      });
    } catch (error) {
      next(error);
    }
  }

  async updateUser(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { name, email, role, isActive } = req.body;

      const user = await User.findByPk(id);
      if (!user) {
        throw new NotFoundError('Usuário não encontrado');
      }

      // Não permitir desativar próprio usuário admin
      if (user.id === req.user?.userId && isActive === false) {
        throw new BadRequestError('Você não pode desativar sua própria conta');
      }

      await user.update({
        ...(name && { name }),
        ...(email && { email }),
        ...(role && { role }),
        ...(typeof isActive === 'boolean' && { isActive }),
      });

      // Log da ação
      await ActivityLog.create({
        userId: req.user?.userId,
        action: 'admin.user_update',
        details: { updatedUserId: user.id, changes: { name, email, role, isActive } },
        ipAddress: req.ip,
      });

      res.json({
        success: true,
        message: 'Usuário atualizado com sucesso',
        data: { user: user.toSafeObject() },
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteUser(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      const user = await User.findByPk(id);
      if (!user) {
        throw new NotFoundError('Usuário não encontrado');
      }

      // Não permitir deletar próprio usuário
      if (user.id === req.user?.userId) {
        throw new BadRequestError('Você não pode excluir sua própria conta');
      }

      const userEmail = user.email;
      await user.destroy();

      // Log da ação
      await ActivityLog.create({
        userId: req.user?.userId,
        action: 'admin.user_delete',
        details: { deletedUserId: parseInt(id), email: userEmail },
        ipAddress: req.ip,
      });

      res.json({
        success: true,
        message: 'Usuário excluído com sucesso',
      });
    } catch (error) {
      next(error);
    }
  }

  // ==================== CONFIGURAÇÕES ====================

  async getSettings(req: Request, res: Response, next: NextFunction) {
    try {
      const settings = await SystemSettings.findAll({
        order: [['category', 'ASC'], ['key', 'ASC']],
      });

      // Agrupar por categoria e mascarar valores secretos
      const grouped: Record<string, Record<string, string>> = {};
      for (const setting of settings) {
        if (!grouped[setting.category]) {
          grouped[setting.category] = {};
        }
        grouped[setting.category][setting.key] = setting.isSecret ? '••••••••' : setting.value;
      }

      res.json({
        success: true,
        data: { settings: grouped },
      });
    } catch (error) {
      next(error);
    }
  }

  async updateSettings(req: Request, res: Response, next: NextFunction) {
    try {
      const { settings } = req.body;

      if (!settings || typeof settings !== 'object') {
        throw new BadRequestError('Configurações inválidas');
      }

      for (const [key, value] of Object.entries(settings)) {
        await SystemSettings.upsert({
          key,
          value: value as string,
          category: this.getCategoryFromKey(key),
          isSecret: this.isSecretKey(key),
        });
      }

      // Log da ação
      await ActivityLog.create({
        userId: req.user?.userId,
        action: 'admin.settings_update',
        details: { keys: Object.keys(settings) },
        ipAddress: req.ip,
      });

      res.json({
        success: true,
        message: 'Configurações atualizadas com sucesso',
      });
    } catch (error) {
      next(error);
    }
  }

  async testConnection(req: Request, res: Response, next: NextFunction) {
    try {
      const { service } = req.params;

      let result: { success: boolean; message: string };

      switch (service) {
        case 'qbittorrent':
          try {
            await qbittorrentService.getTransferInfo();
            result = { success: true, message: 'Conexão com qBittorrent OK' };
          } catch {
            result = { success: false, message: 'Falha ao conectar com qBittorrent' };
          }
          break;

        // TODO: Adicionar testes para outros serviços (Jackett, Sonarr, Radarr, TMDB)

        default:
          result = { success: false, message: 'Serviço desconhecido' };
      }

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  // ==================== LOGS ====================

  async getLogs(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 50;
      const action = req.query.action as string;
      const userId = req.query.userId as string;

      const where: Record<string, unknown> = {};
      if (action) where.action = action;
      if (userId) where.userId = parseInt(userId);

      const { count, rows } = await ActivityLog.findAndCountAll({
        where,
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'name', 'email'],
          },
        ],
        order: [['createdAt', 'DESC']],
        limit,
        offset: (page - 1) * limit,
      });

      res.json({
        success: true,
        data: {
          logs: rows,
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

  // ==================== ESTATÍSTICAS ====================

  async getSystemStats(req: Request, res: Response, next: NextFunction) {
    try {
      const stats = {
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        nodeVersion: process.version,
      };

      res.json({
        success: true,
        data: { stats },
      });
    } catch (error) {
      next(error);
    }
  }

  async getDownloadStats(req: Request, res: Response, next: NextFunction) {
    try {
      // TODO: Implementar estatísticas de downloads ao longo do tempo
      res.json({
        success: true,
        data: {
          stats: [],
          message: 'Estatísticas em desenvolvimento',
        },
      });
    } catch (error) {
      next(error);
    }
  }

  // ==================== HELPERS ====================

  private getCategoryFromKey(key: string): 'qbittorrent' | 'jackett' | 'sonarr' | 'radarr' | 'tmdb' | 'general' {
    if (key.startsWith('qbittorrent_')) return 'qbittorrent';
    if (key.startsWith('jackett_')) return 'jackett';
    if (key.startsWith('sonarr_')) return 'sonarr';
    if (key.startsWith('radarr_')) return 'radarr';
    if (key.startsWith('tmdb_')) return 'tmdb';
    return 'general';
  }

  private isSecretKey(key: string): boolean {
    return key.includes('password') || key.includes('api_key') || key.includes('secret');
  }
}

export default AdminController;
