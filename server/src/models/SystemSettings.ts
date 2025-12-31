import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database.js';

export type SettingsCategory = 'qbittorrent' | 'jackett' | 'sonarr' | 'radarr' | 'tmdb' | 'general';

export interface SystemSettingsAttributes {
  id: number;
  key: string;
  value: string;
  category: SettingsCategory;
  isSecret: boolean;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface SystemSettingsCreationAttributes extends Optional<SystemSettingsAttributes, 'id' | 'isSecret' | 'description' | 'createdAt' | 'updatedAt'> {}

export class SystemSettings extends Model<SystemSettingsAttributes, SystemSettingsCreationAttributes> implements SystemSettingsAttributes {
  declare id: number;
  declare key: string;
  declare value: string;
  declare category: SettingsCategory;
  declare isSecret: boolean;
  declare description?: string;
  declare createdAt: Date;
  declare updatedAt: Date;

  // Retorna valor mascarado se for secreto
  get displayValue(): string {
    if (this.isSecret && this.value) {
      return '••••••••';
    }
    return this.value;
  }
}

SystemSettings.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    key: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
    },
    value: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: '',
    },
    category: {
      type: DataTypes.ENUM('qbittorrent', 'jackett', 'sonarr', 'radarr', 'tmdb', 'general'),
      allowNull: false,
    },
    isSecret: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: 'is_secret',
    },
    description: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: 'created_at',
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: 'updated_at',
    },
  },
  {
    sequelize,
    tableName: 'system_settings',
    timestamps: true,
    underscored: true,
  }
);

export default SystemSettings;
