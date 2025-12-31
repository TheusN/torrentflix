import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database.js';

export type ActivityAction =
  | 'user.login'
  | 'user.logout'
  | 'user.register'
  | 'user.password_change'
  | 'admin.user_create'
  | 'admin.user_update'
  | 'admin.user_delete'
  | 'admin.settings_update'
  | 'download.start'
  | 'download.complete'
  | 'download.delete'
  | 'media.add'
  | 'media.delete'
  | 'media.watch'
  | 'system.error'
  | 'system.startup';

export interface ActivityLogAttributes {
  id: number;
  userId: number | null;
  action: ActivityAction;
  details: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
}

export interface ActivityLogCreationAttributes extends Optional<ActivityLogAttributes, 'id' | 'userId' | 'details' | 'ipAddress' | 'userAgent' | 'createdAt'> {}

export class ActivityLog extends Model<ActivityLogAttributes, ActivityLogCreationAttributes> implements ActivityLogAttributes {
  declare id: number;
  declare userId: number | null;
  declare action: ActivityAction;
  declare details: Record<string, unknown>;
  declare ipAddress?: string;
  declare userAgent?: string;
  declare createdAt: Date;

  // Helper para descrição legível da ação
  get actionDescription(): string {
    const descriptions: Record<ActivityAction, string> = {
      'user.login': 'Usuário fez login',
      'user.logout': 'Usuário fez logout',
      'user.register': 'Novo usuário registrado',
      'user.password_change': 'Senha alterada',
      'admin.user_create': 'Admin criou usuário',
      'admin.user_update': 'Admin atualizou usuário',
      'admin.user_delete': 'Admin excluiu usuário',
      'admin.settings_update': 'Configurações atualizadas',
      'download.start': 'Download iniciado',
      'download.complete': 'Download concluído',
      'download.delete': 'Download removido',
      'media.add': 'Mídia adicionada',
      'media.delete': 'Mídia removida',
      'media.watch': 'Mídia assistida',
      'system.error': 'Erro do sistema',
      'system.startup': 'Sistema iniciado',
    };
    return descriptions[this.action] || this.action;
  }
}

ActivityLog.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'user_id',
      references: {
        model: 'users',
        key: 'id',
      },
      onDelete: 'SET NULL',
    },
    action: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    details: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: {},
    },
    ipAddress: {
      type: DataTypes.STRING(45),
      allowNull: true,
      field: 'ip_address',
    },
    userAgent: {
      type: DataTypes.STRING(500),
      allowNull: true,
      field: 'user_agent',
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: 'created_at',
    },
  },
  {
    sequelize,
    tableName: 'activity_logs',
    timestamps: false,
    underscored: true,
    indexes: [
      {
        fields: ['user_id'],
        name: 'activity_logs_user',
      },
      {
        fields: ['action'],
        name: 'activity_logs_action',
      },
      {
        fields: ['created_at'],
        name: 'activity_logs_date',
      },
    ],
  }
);

export default ActivityLog;
