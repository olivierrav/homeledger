import {
  DataTypes,
  Model,
  Optional,
  Sequelize
} from "sequelize";

export interface UserAttributes {
  id: string;
  keycloakSub: string;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  phone?: string | null;
  addressLine1?: string | null;
  addressLine2?: string | null;
  postalCode?: string | null;
  city?: string | null;
  country?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
  preferences?: Record<string, unknown> | null;
}

export type UserCreationAttributes = Optional<
  UserAttributes,
  "id" | "createdAt" | "updatedAt" | "preferences"
>;

export class User
  extends Model<UserAttributes, UserCreationAttributes>
  implements UserAttributes {
  public id!: string;
  public keycloakSub!: string;
  public email!: string;
  public firstName!: string | null;
  public lastName!: string | null;
  public phone!: string | null;
  public addressLine1!: string | null;
  public addressLine2!: string | null;
  public postalCode!: string | null;
  public city!: string | null;
  public country!: string | null;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
  public preferences!: Record<string, unknown> | null;

  static initModel(sequelize: Sequelize): typeof User {
    User.init(
      {
        id: {
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
          primaryKey: true
        },
        keycloakSub: {
          field: "keycloak_sub",
          type: DataTypes.TEXT,
          allowNull: false,
          unique: true
        },
        email: {
          type: DataTypes.TEXT,
          allowNull: false,
          unique: true
        },
        firstName: {
          field: "first_name",
          type: DataTypes.TEXT,
          allowNull: true
        },
        lastName: {
          field: "last_name",
          type: DataTypes.TEXT,
          allowNull: true
        },
        phone: {
          type: DataTypes.TEXT,
          allowNull: true
        },
        addressLine1: {
          field: "address_line1",
          type: DataTypes.TEXT,
          allowNull: true
        },
        addressLine2: {
          field: "address_line2",
          type: DataTypes.TEXT,
          allowNull: true
        },
        postalCode: {
          field: "postal_code",
          type: DataTypes.TEXT,
          allowNull: true
        },
        city: {
          type: DataTypes.TEXT,
          allowNull: true
        },
        country: {
          type: DataTypes.TEXT,
          allowNull: true
        },
        preferences: {
          type: DataTypes.JSONB,
          allowNull: true,
          defaultValue: {}
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
        tableName: "users",
        modelName: "User",
        underscored: true
      }
    );

    return User;
  }
}