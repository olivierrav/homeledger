// FILENAME: src/db/models/Operation.ts
import { Model, DataTypes, Optional, Sequelize, BelongsToGetAssociationMixin } from "sequelize";
import { Account } from "./Account";
import { Tier } from "./Tier";
import { Budget } from "./Budget";
import { Category } from "./Category";
import { Reconciliation } from "./Reconciliation";

export type OperationType = "card" | "transfer" | "deposit" | "cheque" | "direct_debit" | "other";

export type OperationStatus = "pending" | "posted" | "pointed";

export interface OperationAttributes {
    id: string;
    accountId: string;
    tierId: string | null;
    budgetId: string | null;
    categoryId: string | null;
    linkedAccountId: string | null;
    type: OperationType | null;
    dateTime: Date;
    amount: number;
    description: string | null;
    status: OperationStatus;
    reconciliationId: string | null;
    imported: boolean;
    suggestedTierId: string | null;
    suggestedBudgetId: string | null;
    suggestionConfidence: number | null;
    suggestionAccepted: boolean | null;
    rawLabel: string | null;
    normalizedLabel: string | null;
    createdAt: Date;
    updatedAt: Date;
}

export type OperationCreationAttributes = Optional<
    OperationAttributes,
    | "id"
    | "tierId"
    | "budgetId"
    | "categoryId"
    | "linkedAccountId"
    | "type"
    | "description"
    | "status"
    | "reconciliationId"
    | "imported"
    | "suggestedTierId"
    | "suggestedBudgetId"
    | "suggestionConfidence"
    | "suggestionAccepted"
    | "rawLabel"
    | "normalizedLabel"
    | "createdAt"
    | "updatedAt"
>;

export class Operation
    extends Model<OperationAttributes, OperationCreationAttributes>
    implements OperationAttributes
{
    public id!: string;
    public accountId!: string;
    public tierId!: string | null;
    public budgetId!: string | null;
    public categoryId!: string | null;
    public linkedAccountId!: string | null;
    public type!: OperationType;
    public dateTime!: Date;
    public amount!: number;
    public description!: string | null;
    public status!: OperationStatus;
    public reconciliationId!: string | null;
    public imported!: boolean;
    public suggestedTierId!: string | null;
    public suggestedBudgetId!: string | null;
    public suggestionConfidence!: number | null;
    public suggestionAccepted!: boolean | null;
    public rawLabel!: string | null;
    public normalizedLabel!: string | null;
    public createdAt!: Date;
    public updatedAt!: Date;

    public getAccount!: BelongsToGetAssociationMixin<Account>;
    public getTier!: BelongsToGetAssociationMixin<Tier>;
    public getBudget!: BelongsToGetAssociationMixin<Budget>;
    public getCategory!: BelongsToGetAssociationMixin<Category>;
    public getLinkedAccount!: BelongsToGetAssociationMixin<Account>;
    public getReconciliation!: BelongsToGetAssociationMixin<Reconciliation>;

    static initModel(sequelize: Sequelize): typeof Operation {
        Operation.init(
            {
                id: {
                    type: DataTypes.UUID,
                    primaryKey: true,
                    defaultValue: DataTypes.UUIDV4,
                },
                accountId: {
                    field: "account_id",
                    type: DataTypes.UUID,
                    allowNull: false,
                },
                tierId: {
                    field: "tier_id",
                    type: DataTypes.UUID,
                    allowNull: true,
                },
                budgetId: {
                    field: "budget_id",
                    type: DataTypes.UUID,
                    allowNull: true,
                },
                categoryId: {
                    field: "category_id",
                    type: DataTypes.UUID,
                    allowNull: true,
                },
                linkedAccountId: {
                    field: "linked_account_id",
                    type: DataTypes.UUID,
                    allowNull: true,
                },
                type: {
                    type: DataTypes.ENUM(
                        "card",
                        "transfer",
                        "deposit",
                        "cheque",
                        "direct_debit",
                        "other",
                    ),
                    allowNull: true,
                },
                dateTime: {
                    field: "date_time",
                    type: DataTypes.DATE,
                    allowNull: false,
                },
                amount: {
                    type: DataTypes.DECIMAL(14, 2),
                    allowNull: false,
                    get() {
                        const value = this.getDataValue("amount");
                        return value ? parseFloat(value as any) : 0;
                    },
                },
                description: {
                    type: DataTypes.TEXT,
                    allowNull: true,
                },
                status: {
                    type: DataTypes.ENUM("pending", "posted", "pointed"),
                    allowNull: false,
                    defaultValue: "pending",
                },
                reconciliationId: {
                    field: "reconciliation_id",
                    type: DataTypes.UUID,
                    allowNull: true,
                },
                imported: {
                    type: DataTypes.BOOLEAN,
                    allowNull: false,
                    defaultValue: false,
                },
                suggestedTierId: {
                    field: "suggested_tier_id",
                    type: DataTypes.UUID,
                    allowNull: true,
                },
                suggestedBudgetId: {
                    field: "suggested_budget_id",
                    type: DataTypes.UUID,
                    allowNull: true,
                },
                suggestionConfidence: {
                    field: "suggestion_confidence",
                    type: DataTypes.DECIMAL(3, 2),
                    allowNull: true,
                    get() {
                        const value = this.getDataValue("suggestionConfidence");
                        return value != null ? parseFloat(value as any) : null;
                    },
                },
                suggestionAccepted: {
                    field: "suggestion_accepted",
                    type: DataTypes.BOOLEAN,
                    allowNull: true,
                },
                rawLabel: {
                    field: "raw_label",
                    type: DataTypes.TEXT,
                    allowNull: true,
                },
                normalizedLabel: {
                    field: "normalized_label",
                    type: DataTypes.TEXT,
                    allowNull: true,
                },
                createdAt: {
                    field: "created_at",
                    type: DataTypes.DATE,
                    allowNull: false,
                },
                updatedAt: {
                    field: "updated_at",
                    type: DataTypes.DATE,
                    allowNull: false,
                },
            },
            {
                sequelize,
                tableName: "operations",
                modelName: "Operation",
                timestamps: true,
            },
        );

        return Operation;
    }
}
