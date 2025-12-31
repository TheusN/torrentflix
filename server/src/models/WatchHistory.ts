import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database.js';

export interface WatchHistoryAttributes {
  id: number;
  userId: number;
  mediaId: string;
  mediaType: 'movie' | 'series' | 'episode';
  title: string;
  poster?: string;
  episodeInfo?: {
    seasonNumber: number;
    episodeNumber: number;
    episodeTitle?: string;
  };
  watchedAt: Date;
  watchDuration: number;
}

export interface WatchHistoryCreationAttributes extends Optional<WatchHistoryAttributes, 'id' | 'poster' | 'episodeInfo' | 'watchedAt'> {}

export class WatchHistory extends Model<WatchHistoryAttributes, WatchHistoryCreationAttributes> implements WatchHistoryAttributes {
  declare id: number;
  declare userId: number;
  declare mediaId: string;
  declare mediaType: 'movie' | 'series' | 'episode';
  declare title: string;
  declare poster?: string;
  declare episodeInfo?: {
    seasonNumber: number;
    episodeNumber: number;
    episodeTitle?: string;
  };
  declare watchedAt: Date;
  declare watchDuration: number;
}

WatchHistory.init(
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
    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    poster: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    episodeInfo: {
      type: DataTypes.JSONB,
      allowNull: true,
      field: 'episode_info',
    },
    watchedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: 'watched_at',
    },
    watchDuration: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      field: 'watch_duration',
      comment: 'Tempo assistido nesta sessão em segundos',
    },
  },
  {
    sequelize,
    tableName: 'watch_history',
    timestamps: false,
    underscored: true,
    indexes: [
      {
        fields: ['user_id', 'watched_at'],
        name: 'watch_history_user_date',
      },
    ],
  }
);

export default WatchHistory;
