// FILENAME: src/db/models/UserAccount.ts
import {
    Model,
    DataTypes,
    Optional,
    Sequelize,
    BelongsToGetAssociationMixin
} from "sequelize";
import { Account } from "./Account";
import { User } from "./User";

export interface UserAccountAttributes {
    id: string;
    userId: string;
    accountId: string;
    role: string; // 'owner' pour le moment
    createdAt: Date;
    updatedAt: Date;
}

export type UserAccountCreationAttributes = Optional<
    UserAccountAttributes,
    "id" | "role" | "createdAt" | "updatedAt"
>;

export class UserAccount
    extends Model<UserAccountAttributes, UserAccountCreationAttributes>
    implements UserAccountAttributes {
    public id!: string;
    public userId!: string;
    public accountId!: string;
    public role!: string;
    public createdAt!: Date;
    public updatedAt!: Date;

    public getUser!: BelongsToGetAssociationMixin<User>;
    public getAccount!: BelongsToGetAssociationMixin<Account>;

    static initModel(sequelize: Sequelize): typeof UserAccount {
        UserAccount.init(
            {
                id: {
                    type: DataTypes.UUID,
                    primaryKey: true,
                    defaultValue: DataTypes.UUIDV4
                },
                userId: {
                    field: "user_id",
                    type: DataTypes.UUID,
                    allowNull: false
                },
                accountId: {
                    field: "account_id",
                    type: DataTypes.UUID,
                    allowNull: false
                },
                role: {
                    type: DataTypes.TEXT,
                    allowNull: false,
                    defaultValue: "owner"
                },
                createdAt: {
                    field: "created_at",
                    type: DataTypes.DATE,
                    allowNull: false
                },
                updatedAt: {
                    field: "updated_at",
                    type: DataTypes.DATE,
                    allowNull: false
                }
            },
            {
                sequelize,
                tableName: "user_accounts",
                modelName: "UserAccount"
            }
        );

        return UserAccount;
    }
}