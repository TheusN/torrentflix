import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database.js';

export interface PreferencesData {
  defaultQuality: '480p' | '720p' | '1080p' | '4k' | 'auto';
  defaultLanguage: string;
  defaultSubtitle: string;
  autoplay: boolean;
  autoplayNext: boolean;
  notifications: boolean;
  theme: 'dark' | 'light' | 'system';
}

export interface UserPreferencesAttributes {
  id: number;
  userId: number;
  preferences: PreferencesData;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserPreferencesCreationAttributes extends Optional<UserPreferencesAttributes, 'id' | 'preferences' | 'createdAt' | 'updatedAt'> {}

const defaultPreferences: PreferencesData = {
  defaultQuality: 'auto',
  defaultLanguage: 'pt-BR',
  defaultSubtitle: 'pt-BR',
  autoplay: true,
  autoplayNext: true,
  notifications: true,
  theme: 'dark',
};

export class UserPreferences extends Model<UserPreferencesAttributes, UserPreferencesCreationAttributes> implements UserPreferencesAttributes {
  declare id: number;
  declare userId: number;
  declare preferences: PreferencesData;
  declare createdAt: Date;
  declare updatedAt: Date;

  // Helper para obter preferência específica
  getPreference<K extends keyof PreferencesData>(key: K): PreferencesData[K] {
    return this.preferences?.[key] ?? defaultPreferences[key];
  }
}

UserPreferences.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
      field: 'user_id',
      references: {
        model: 'users',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    preferences: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: defaultPreferences,
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
    tableName: 'user_preferences',
    timestamps: true,
    underscored: true,
  }
);

export { defaultPreferences };
export default UserPreferences;
