// FILENAME: src/db/models/Tier.ts
import {
    Model,
    DataTypes,
    Optional,
    Sequelize,
    BelongsToGetAssociationMixin,
    HasManyGetAssociationsMixin
} from "sequelize";
import { User } from "./User";
import { Category } from "./Category";
import { Operation } from "./Operation";

export interface TierAttributes {
    id: string;
    userId: string;
    name: string;
    description?: string | null;
    categoryId?: string | null;
    createdAt: Date;
    updatedAt: Date;
}

export type TierCreationAttributes = Optional<
    TierAttributes,
    "id" | "description" | "categoryId" | "createdAt" | "updatedAt"
>;

export class Tier
    extends Model<TierAttributes, TierCreationAttributes>
    implements TierAttributes {
    public id!: string;
    public userId!: string;
    public name!: string;
    public description!: string | null;
    public categoryId!: string | null;
    public createdAt!: Date;
    public updatedAt!: Date;

    public getUser!: BelongsToGetAssociationMixin<User>;
    public getCategory!: BelongsToGetAssociationMixin<Category>;
    public getOperations!: HasManyGetAssociationsMixin<Operation>;

    static initModel(sequelize: Sequelize): typeof Tier {
        Tier.init(
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
                name: {
                    type: DataTypes.TEXT,
                    allowNull: false
                },
                description: {
                    type: DataTypes.TEXT,
                    allowNull: true
                },
                categoryId: {
                    field: "category_id",
                    type: DataTypes.UUID,
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
                tableName: "tiers",
                modelName: "Tier"
            }
        );

        return Tier;
    }
}