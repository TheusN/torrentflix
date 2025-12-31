import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database.js';

export interface WatchlistAttributes {
  id: number;
  userId: number;
  mediaId: string;
  mediaType: 'movie' | 'series';
  title: string;
  poster?: string;
  year?: number;
  addedAt: Date;
}

export interface WatchlistCreationAttributes extends Optional<WatchlistAttributes, 'id' | 'poster' | 'year' | 'addedAt'> {}

export class Watchlist extends Model<WatchlistAttributes, WatchlistCreationAttributes> implements WatchlistAttributes {
  declare id: number;
  declare userId: number;
  declare mediaId: string;
  declare mediaType: 'movie' | 'series';
  declare title: string;
  declare poster?: string;
  declare year?: number;
  declare addedAt: Date;
}

Watchlist.init(
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
      type: DataTypes.ENUM('movie', 'series'),
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
    year: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    addedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: 'added_at',
    },
  },
  {
    sequelize,
    tableName: 'watchlist',
    timestamps: false,
    underscored: true,
    indexes: [
      {
        unique: true,
        fields: ['user_id', 'media_id', 'media_type'],
        name: 'watchlist_unique',
      },
    ],
  }
);

export default Watchlist;
