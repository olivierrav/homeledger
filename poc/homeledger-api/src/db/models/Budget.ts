// FILENAME: src/db/models/Budget.ts
import { Model, DataTypes, Optional, Sequelize, BelongsToGetAssociationMixin } from "sequelize";
import { Account } from "./Account";

export interface BudgetAttributes {
    id: string;
    accountId: string;
    label: string;
    iconKey: string;
    color: string;
    monthlyAmount: number;
    currentBalance: number;
    comment?: string | null;
    createdAt: Date;
    updatedAt: Date;
}

export type BudgetCreationAttributes = Optional<
    BudgetAttributes,
    "id" | "currentBalance" | "comment" | "createdAt" | "updatedAt"
>;

export class Budget
    extends Model<BudgetAttributes, BudgetCreationAttributes>
    implements BudgetAttributes {
    public id!: string;
    public accountId!: string;
    public label!: string;
    public iconKey!: string;
    public color!: string;
    public monthlyAmount!: number;
    public currentBalance!: number;
    public comment!: string | null;
    public createdAt!: Date;
    public updatedAt!: Date;

    public getAccount!: BelongsToGetAssociationMixin<Account>;

    static initModel(sequelize: Sequelize): typeof Budget {
        Budget.init(
            {
                id: {
                    type: DataTypes.UUID,
                    primaryKey: true,
                    defaultValue: DataTypes.UUIDV4
                },
                accountId: {
                    field: "account_id",
                    type: DataTypes.UUID,
                    allowNull: false
                },
                label: {
                    type: DataTypes.TEXT,
                    allowNull: false
                },
                iconKey: {
                    field: "icon_key",
                    type: DataTypes.TEXT,
                    allowNull: false
                },
                color: {
                    type: DataTypes.TEXT,
                    allowNull: false
                },
                monthlyAmount: {
                    field: "monthly_amount",
                    type: DataTypes.DECIMAL(14, 2),
                    allowNull: false,
                    defaultValue: 0,
                    get() {
                        const value = this.getDataValue('monthlyAmount');
                        return value ? parseFloat(value as any) : 0;
                    }
                },
                currentBalance: {
                    field: "current_balance",
                    type: DataTypes.DECIMAL(14, 2),
                    allowNull: false,
                    defaultValue: 0,
                    get() {
                        const value = this.getDataValue('currentBalance');
                        return value ? parseFloat(value as any) : 0;
                    }
                },
                comment: {
                    type: DataTypes.TEXT,
                    allowNull: true
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
                tableName: "budgets",
                modelName: "Budget"
            }
        );

        return Budget;
    }
}