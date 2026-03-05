// FILENAME: src/db/models/Category.ts
import {
    Model,
    DataTypes,
    Optional,
    Sequelize,
    BelongsToGetAssociationMixin,
    HasManyGetAssociationsMixin
} from "sequelize";
import { User } from "./User";
import { Operation } from "./Operation";
import { Tier } from "./Tier";

export interface CategoryAttributes {
    id: string;
    userId: string;
    name: string;
    color: string;
    iconKey: string | null;
    createdAt: Date;
    updatedAt: Date;
}

export type CategoryCreationAttributes = Optional<
    CategoryAttributes,
    "id" | "color" | "iconKey" | "createdAt" | "updatedAt"
>;

export class Category
    extends Model<CategoryAttributes, CategoryCreationAttributes>
    implements CategoryAttributes {
    public id!: string;
    public userId!: string;
    public name!: string;
    public color!: string;
    public iconKey!: string | null;
    public createdAt!: Date;
    public updatedAt!: Date;

    public getUser!: BelongsToGetAssociationMixin<User>;
    public getOperations!: HasManyGetAssociationsMixin<Operation>;
    public getTiers!: HasManyGetAssociationsMixin<Tier>;

    static initModel(sequelize: Sequelize): typeof Category {
        Category.init(
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
                color: {
                    type: DataTypes.STRING(7),
                    allowNull: false,
                    defaultValue: "#1890ff"
                },
                iconKey: {
                    field: "icon_key",
                    type: DataTypes.STRING(50),
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
                tableName: "categories",
                modelName: "Category"
            }
        );

        return Category;
    }
}
