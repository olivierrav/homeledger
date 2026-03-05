// FILENAME: src/db/models/Reconciliation.ts
import {
  Model,
  DataTypes,
  Optional,
  Sequelize,
  BelongsToGetAssociationMixin,
  HasManyGetAssociationsMixin
} from "sequelize";
import { Account } from "./Account";
import { Operation } from "./Operation";

export interface ReconciliationAttributes {
  id: string;
  accountId: string;
  date: Date;
  balance: number;
  comment: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export type ReconciliationCreationAttributes = Optional<
  ReconciliationAttributes,
  "id" | "comment" | "createdAt" | "updatedAt"
>;

export class Reconciliation
  extends Model<ReconciliationAttributes, ReconciliationCreationAttributes>
  implements ReconciliationAttributes {
  public id!: string;
  public accountId!: string;
  public date!: Date;
  public balance!: number;
  public comment!: string | null;
  public createdAt!: Date;
  public updatedAt!: Date;

  // associations helpers
  public getAccount!: BelongsToGetAssociationMixin<Account>;
  public getOperations!: HasManyGetAssociationsMixin<Operation>;

  static initModel(sequelize: Sequelize): typeof Reconciliation {
    Reconciliation.init(
      {
        id: {
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
          primaryKey: true
        },
        accountId: {
          field: "account_id",
          type: DataTypes.UUID,
          allowNull: false
        },
        date: {
          type: DataTypes.DATEONLY,
          allowNull: false
        },
        balance: {
          type: DataTypes.DECIMAL(14, 2),
          allowNull: false,
          get() {
            const rawValue = this.getDataValue("balance");
            return rawValue === null ? null : parseFloat(rawValue as any);
          }
        },
        comment: {
          type: DataTypes.TEXT,
          allowNull: true
        },
        createdAt: {
          field: "created_at",
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: DataTypes.NOW
        },
        updatedAt: {
          field: "updated_at",
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: DataTypes.NOW
        }
      },
      {
        sequelize,
        tableName: "reconciliations",
        modelName: "Reconciliation",
        timestamps: true
      }
    );

    return Reconciliation;
  }
}