import { User } from './User.js';
import { RefreshToken } from './RefreshToken.js';
import { WatchProgress } from './WatchProgress.js';
import { Watchlist } from './Watchlist.js';
import { WatchHistory } from './WatchHistory.js';
import { UserPreferences } from './UserPreferences.js';
import { SystemSettings } from './SystemSettings.js';
import { ActivityLog } from './ActivityLog.js';

// Associações User -> WatchProgress
User.hasMany(WatchProgress, { foreignKey: 'userId', as: 'watchProgress' });
WatchProgress.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Associações User -> Watchlist
User.hasMany(Watchlist, { foreignKey: 'userId', as: 'watchlist' });
Watchlist.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Associações User -> WatchHistory
User.hasMany(WatchHistory, { foreignKey: 'userId', as: 'watchHistory' });
WatchHistory.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Associações User -> UserPreferences (1:1)
User.hasOne(UserPreferences, { foreignKey: 'userId', as: 'preferences' });
UserPreferences.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Associações User -> ActivityLog
User.hasMany(ActivityLog, { foreignKey: 'userId', as: 'activityLogs' });
ActivityLog.belongsTo(User, { foreignKey: 'userId', as: 'user' });

export {
  User,
  RefreshToken,
  WatchProgress,
  Watchlist,
  WatchHistory,
  UserPreferences,
  SystemSettings,
  ActivityLog,
};

export default {
  User,
  RefreshToken,
  WatchProgress,
  Watchlist,
  WatchHistory,
  UserPreferences,
  SystemSettings,
  ActivityLog,
};
