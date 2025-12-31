import { Request, Response, NextFunction } from 'express';
import { User, SystemSettings, ActivityLog } from '../models/index.js';
import { BadRequestError, NotFoundError } from '../middleware/error.middleware.js';
import bcrypt from 'bcrypt';
import { Op } from 'sequelize';
import { qbittorrentService } from '../services/qbittorrent.service.js';
import { jackettService } from '../services/jackett.service.js';
import { sonarrService } from '../services/sonarr.service.js';
import { radarrService } from '../services/radarr.service.js';

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

      // Mapear chaves para o formato esperado pelo frontend
      const keyMapping: Record<string, string> = {
        'qbittorrent_url': 'url',
        'qbittorrent_username': 'username',
        'qbittorrent_password': 'password',
        'sonarr_enabled': 'enabled',
        'sonarr_url': 'url',
        'sonarr_api_key': 'api_key',
        'radarr_enabled': 'enabled',
        'radarr_url': 'url',
        'radarr_api_key': 'api_key',
        'jackett_enabled': 'enabled',
        'jackett_url': 'url',
        'jackett_api_key': 'api_key',
        'jackett_password': 'password',
        'tmdb_api_key': 'api_key',
        'path_mapping_enabled': 'enabled',
        'path_mapping_remote': 'remote',
        'path_mapping_local': 'local',
      };

      // Agrupar por categoria e mascarar valores secretos
      const grouped: Record<string, Record<string, string | boolean>> = {};
      for (const setting of settings) {
        if (!grouped[setting.category]) {
          grouped[setting.category] = {};
        }
        const shortKey = keyMapping[setting.key] || setting.key;
        let value: string | boolean = setting.isSecret ? '••••••••' : setting.value;

        // Converter 'enabled' para booleano
        if (shortKey === 'enabled') {
          value = setting.value === 'true';
        }

        grouped[setting.category][shortKey] = value;
      }

      res.json({
        success: true,
        data: { settings: grouped },
      });
    } catch (error) {
      next(error);
    }
  }

  updateSettings = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { settings } = req.body;

      if (!settings || typeof settings !== 'object') {
        throw new BadRequestError('Configurações inválidas');
      }

      const updatedKeys: string[] = [];

      for (const [key, value] of Object.entries(settings)) {
        // Não sobrescrever senhas mascaradas
        if (this.isSecretKey(key) && (value === '••••••••' || value === '********' || value === '')) {
          continue;
        }

        await SystemSettings.upsert({
          key,
          value: value as string,
          category: this.getCategoryFromKey(key),
          isSecret: this.isSecretKey(key),
        });
        updatedKeys.push(key);
      }

      // Limpar cache do settingsService para aplicar novas configurações
      const { settingsService } = await import('../services/settings.service.js');
      settingsService.clearCache();

      // Log da ação
      await ActivityLog.create({
        userId: req.user?.userId,
        action: 'admin.settings_update',
        details: { keys: updatedKeys },
        ipAddress: req.ip,
      });

      res.json({
        success: true,
        message: 'Configurações atualizadas com sucesso',
      });
    } catch (error) {
      next(error);
    }
  };

  async testConnection(req: Request, res: Response, next: NextFunction) {
    try {
      const { service } = req.params;

      // Limpar cache para usar configurações mais recentes
      const { settingsService } = await import('../services/settings.service.js');
      settingsService.clearCache();

      let result: { success: boolean; message: string };

      switch (service) {
        case 'qbittorrent':
          try {
            // Força re-autenticação com novas configurações
            await qbittorrentService.checkConnection();
            const version = await qbittorrentService.getVersion();
            result = { success: true, message: `Conexão com qBittorrent OK (v${version})` };
          } catch (error: any) {
            result = { success: false, message: error.message || 'Falha ao conectar com qBittorrent' };
          }
          break;

        case 'jackett':
          try {
            jackettService.clearCache();
            const connected = await jackettService.checkConnection();
            if (connected) {
              const indexers = await jackettService.getIndexers();
              const configured = indexers.filter(i => i.configured).length;
              result = { success: true, message: `Conexão com Jackett OK (${configured} indexadores configurados)` };
            } else {
              result = { success: false, message: 'Falha ao conectar com Jackett' };
            }
          } catch (error: any) {
            result = { success: false, message: error.message || 'Falha ao conectar com Jackett' };
          }
          break;

        case 'sonarr':
          try {
            sonarrService.clearCache();
            const connected = await sonarrService.checkConnection();
            if (connected) {
              const status = await sonarrService.getStatus();
              result = { success: true, message: `Conexão com Sonarr OK (v${status.version})` };
            } else {
              result = { success: false, message: 'Falha ao conectar com Sonarr' };
            }
          } catch (error: any) {
            result = { success: false, message: error.message || 'Falha ao conectar com Sonarr' };
          }
          break;

        case 'radarr':
          try {
            radarrService.clearCache();
            const connected = await radarrService.checkConnection();
            if (connected) {
              const status = await radarrService.getStatus();
              result = { success: true, message: `Conexão com Radarr OK (v${status.version})` };
            } else {
              result = { success: false, message: 'Falha ao conectar com Radarr' };
            }
          } catch (error: any) {
            result = { success: false, message: error.message || 'Falha ao conectar com Radarr' };
          }
          break;

        case 'tmdb':
          try {
            const tmdbApiKey = await settingsService.getTmdbApiKey();
            if (!tmdbApiKey) {
              result = { success: false, message: 'API Key do TMDB não configurada' };
            } else {
              const response = await fetch(`https://api.themoviedb.org/3/configuration?api_key=${tmdbApiKey}`);
              if (response.ok) {
                result = { success: true, message: 'Conexão com TMDB OK' };
              } else {
                result = { success: false, message: 'API Key do TMDB inválida' };
              }
            }
          } catch (error: any) {
            result = { success: false, message: error.message || 'Falha ao conectar com TMDB' };
          }
          break;

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

  // ==================== MAPEAMENTOS DE CAMINHO ====================

  async getRemotePathMappings(req: Request, res: Response, next: NextFunction) {
    try {
      const mappings: Array<{
        source: 'radarr' | 'sonarr';
        id: number;
        host: string;
        remotePath: string;
        localPath: string;
      }> = [];

      // Tentar obter mapeamentos do Radarr
      try {
        radarrService.clearCache();
        const radarrMappings = await radarrService.getRemotePathMappings();
        for (const m of radarrMappings) {
          mappings.push({
            source: 'radarr',
            id: m.id,
            host: m.host,
            remotePath: m.remotePath,
            localPath: m.localPath,
          });
        }
      } catch (error: any) {
        // Radarr não disponível ou não configurado
      }

      // Tentar obter mapeamentos do Sonarr
      try {
        sonarrService.clearCache();
        const sonarrMappings = await sonarrService.getRemotePathMappings();
        for (const m of sonarrMappings) {
          mappings.push({
            source: 'sonarr',
            id: m.id,
            host: m.host,
            remotePath: m.remotePath,
            localPath: m.localPath,
          });
        }
      } catch (error: any) {
        // Sonarr não disponível ou não configurado
      }

      // Também buscar root folders para referência
      const rootFolders: Array<{
        source: 'radarr' | 'sonarr';
        path: string;
        freeSpace: number;
      }> = [];

      try {
        const radarrRoots = await radarrService.getRootFolders();
        for (const r of radarrRoots) {
          rootFolders.push({
            source: 'radarr',
            path: r.path,
            freeSpace: r.freeSpace,
          });
        }
      } catch {}

      try {
        const sonarrRoots = await sonarrService.getRootFolders();
        for (const r of sonarrRoots) {
          rootFolders.push({
            source: 'sonarr',
            path: r.path,
            freeSpace: r.freeSpace,
          });
        }
      } catch {}

      res.json({
        success: true,
        data: {
          mappings,
          rootFolders,
          message: mappings.length > 0
            ? `Encontrados ${mappings.length} mapeamento(s) configurado(s)`
            : 'Nenhum mapeamento remoto configurado no Radarr/Sonarr',
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

  private getCategoryFromKey = (key: string): 'qbittorrent' | 'jackett' | 'sonarr' | 'radarr' | 'tmdb' | 'path_mapping' | 'general' => {
    if (key.startsWith('qbittorrent_')) return 'qbittorrent';
    if (key.startsWith('jackett_')) return 'jackett';
    if (key.startsWith('sonarr_')) return 'sonarr';
    if (key.startsWith('radarr_')) return 'radarr';
    if (key.startsWith('tmdb_')) return 'tmdb';
    if (key.startsWith('path_mapping_')) return 'path_mapping';
    return 'general';
  };

  private isSecretKey = (key: string): boolean => {
    return key.includes('password') || key.includes('api_key') || key.includes('secret');
  };
}

export default AdminController;
