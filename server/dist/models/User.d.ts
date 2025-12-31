import { Model, Optional } from 'sequelize';
export interface UserAttributes {
    id: number;
    email: string;
    passwordHash: string;
    name: string;
    role: 'admin' | 'user';
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    lastLogin: Date | null;
}
export interface UserCreationAttributes extends Optional<UserAttributes, 'id' | 'role' | 'isActive' | 'createdAt' | 'updatedAt' | 'lastLogin'> {
}
export declare class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
    id: number;
    email: string;
    passwordHash: string;
    name: string;
    role: 'admin' | 'user';
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    lastLogin: Date | null;
    checkPassword(password: string): Promise<boolean>;
    toSafeObject(): Omit<UserAttributes, 'passwordHash'>;
}
export default User;
//# sourceMappingURL=User.d.ts.map