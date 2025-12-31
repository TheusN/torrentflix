import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database.js';
import { User } from './User.js';
// RefreshToken model class
export class RefreshToken extends Model {
    id;
    userId;
    token;
    expiresAt;
    createdAt;
    // Check if token is expired
    isExpired() {
        return new Date() > this.expiresAt;
    }
}
// Initialize the model
RefreshToken.init({
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
    token: {
        type: DataTypes.STRING(500),
        allowNull: false,
    },
    expiresAt: {
        type: DataTypes.DATE,
        allowNull: false,
        field: 'expires_at',
    },
    createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        field: 'created_at',
    },
}, {
    sequelize,
    tableName: 'refresh_tokens',
    timestamps: false,
    underscored: true,
});
// Set up association
RefreshToken.belongsTo(User, { foreignKey: 'userId', as: 'user' });
User.hasMany(RefreshToken, { foreignKey: 'userId', as: 'refreshTokens' });
export default RefreshToken;
//# sourceMappingURL=RefreshToken.js.map