// FILENAME: src/db/models/Account.ts
import {
    Model,
    DataTypes,
    Optional,
    Sequelize,
    Association,
    HasManyGetAssociationsMixin
} from "sequelize";
import { UserAccount } from "./UserAccount";

export interface AccountAttributes {
    id: string;
    name: string;
    bankName?: string | null;
    accountNumber?: string | null;
    type: "current" | "savings";
    interestRate?: number | null;
    initialBalance: number;
    createdAt: Date;
    updatedAt: Date;
}

export type AccountCreationAttributes = Optional<
    AccountAttributes,
    "id" | "bankName" | "accountNumber" | "interestRate" | "createdAt" | "updatedAt"
>;

export class Account
    extends Model<AccountAttributes, AccountCreationAttributes>
    implements AccountAttributes {
    public id!: string;
    public name!: string;
    public bankName!: string | null;
    public accountNumber!: string | null;
    public type!: "current" | "savings";
    public interestRate!: number | null;
    public initialBalance!: number;
    public createdAt!: Date;
    public updatedAt!: Date;

    public getUserAccounts!: HasManyGetAssociationsMixin<UserAccount>;

    public static associations: {
        userLinks: Association<Account, UserAccount>;
    };

    static initModel(sequelize: Sequelize): typeof Account {
        Account.init(
            {
                id: {
                    type: DataTypes.UUID,
                    primaryKey: true,
                    defaultValue: DataTypes.UUIDV4
                },
                name: {
                    type: DataTypes.TEXT,
                    allowNull: false
                },
                bankName: {
                    field: "bank_name",
                    type: DataTypes.TEXT,
                    allowNull: true
                },
                accountNumber: {
                    field: "account_number",
                    type: DataTypes.TEXT,
                    allowNull: true
                },
                type: {
                    type: DataTypes.ENUM("current", "savings"),
                    allowNull: false
                },
                interestRate: {
                    field: "interest_rate",
                    type: DataTypes.DECIMAL(5, 2),
                    allowNull: true
                },
                initialBalance: {
                    field: "initial_balance",
                    type: DataTypes.DECIMAL(14, 2),
                    allowNull: false
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
                tableName: "accounts",
                modelName: "Account"
            }
        );

        return Account;
    }
}