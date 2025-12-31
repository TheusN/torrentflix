import { DataTypes, Model } from 'sequelize';
import bcrypt from 'bcrypt';
import { sequelize } from '../config/database.js';
// User model class
export class User extends Model {
    id;
    email;
    passwordHash;
    name;
    role;
    isActive;
    createdAt;
    updatedAt;
    lastLogin;
    // Instance method to check password
    async checkPassword(password) {
        return bcrypt.compare(password, this.passwordHash);
    }
    // Instance method to get safe user data (without password)
    toSafeObject() {
        const { passwordHash, ...safeUser } = this.toJSON();
        return safeUser;
    }
}
// Initialize the model
User.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    email: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true,
        },
    },
    passwordHash: {
        type: DataTypes.STRING(255),
        allowNull: false,
        field: 'password_hash',
    },
    name: {
        type: DataTypes.STRING(100),
        allowNull: false,
    },
    role: {
        type: DataTypes.ENUM('admin', 'user'),
        allowNull: false,
        defaultValue: 'user',
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        field: 'is_active',
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
    lastLogin: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'last_login',
    },
}, {
    sequelize,
    tableName: 'users',
    timestamps: true,
    underscored: true,
    hooks: {
        // Hash password before creating user
        beforeCreate: async (user) => {
            if (user.passwordHash) {
                user.passwordHash = await bcrypt.hash(user.passwordHash, 12);
            }
        },
        // Hash password before updating if changed
        beforeUpdate: async (user) => {
            if (user.changed('passwordHash')) {
                user.passwordHash = await bcrypt.hash(user.passwordHash, 12);
            }
        },
    },
});
export default User;
//# sourceMappingURL=User.js.map