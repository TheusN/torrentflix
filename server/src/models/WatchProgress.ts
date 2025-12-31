import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database.js';

export interface WatchProgressAttributes {
  id: number;
  userId: number;
  mediaId: string;
  mediaType: 'movie' | 'series' | 'episode';
  progress: number;
  duration: number;
  episodeInfo?: {
    seasonNumber: number;
    episodeNumber: number;
    episodeTitle?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface WatchProgressCreationAttributes extends Optional<WatchProgressAttributes, 'id' | 'episodeInfo' | 'createdAt' | 'updatedAt'> {}

export class WatchProgress extends Model<WatchProgressAttributes, WatchProgressCreationAttributes> implements WatchProgressAttributes {
  declare id: number;
  declare userId: number;
  declare mediaId: string;
  declare mediaType: 'movie' | 'series' | 'episode';
  declare progress: number;
  declare duration: number;
  declare episodeInfo?: {
    seasonNumber: number;
    episodeNumber: number;
    episodeTitle?: string;
  };
  declare createdAt: Date;
  declare updatedAt: Date;

  // Calcula a porcentagem assistida
  get percentWatched(): number {
    if (this.duration === 0) return 0;
    return Math.round((this.progress / this.duration) * 100);
  }

  // Verifica se foi assistido (>90%)
  get isCompleted(): boolean {
    return this.percentWatched >= 90;
  }
}

WatchProgress.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'user_id',
      references: {
        model: 'users',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    mediaId: {
      type: DataTypes.STRING(100),
      allowNull: false,
      field: 'media_id',
    },
    mediaType: {
      type: DataTypes.ENUM('movie', 'series', 'episode'),
      allowNull: false,
      field: 'media_type',
    },
    progress: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: 'Progresso em segundos',
    },
    duration: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: 'Duração total em segundos',
    },
    episodeInfo: {
      type: DataTypes.JSONB,
      allowNull: true,
      field: 'episode_info',
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
    tableName: 'watch_progress',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        unique: true,
        fields: ['user_id', 'media_id', 'media_type'],
        name: 'watch_progress_unique',
      },
    ],
  }
);

export default WatchProgress;
