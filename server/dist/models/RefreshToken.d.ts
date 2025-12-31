import { Model, Optional } from 'sequelize';
export interface RefreshTokenAttributes {
    id: number;
    userId: number;
    token: string;
    expiresAt: Date;
    createdAt: Date;
}
export interface RefreshTokenCreationAttributes extends Optional<RefreshTokenAttributes, 'id' | 'createdAt'> {
}
export declare class RefreshToken extends Model<RefreshTokenAttributes, RefreshTokenCreationAttributes> implements RefreshTokenAttributes {
    id: number;
    userId: number;
    token: string;
    expiresAt: Date;
    createdAt: Date;
    isExpired(): boolean;
}
export default RefreshToken;
//# sourceMappingURL=RefreshToken.d.ts.map