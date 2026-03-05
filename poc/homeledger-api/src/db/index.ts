import { Sequelize } from "sequelize";
import { env } from "@config";
import { User } from "./models/User";
import { Account } from "./models/Account";
import { UserAccount } from "./models/UserAccount";
import { Budget } from "./models/Budget";
import { Category } from "./models/Category";
import { Tier } from "./models/Tier";
import { Operation } from "./models/Operation";
import { Reconciliation } from "./models/Reconciliation";

const sequelize = new Sequelize(env.dbUrl, {
  logging: false
});

export async function initDatabase() {
  await sequelize.authenticate();
  User.initModel(sequelize);
  Account.initModel(sequelize);
  UserAccount.initModel(sequelize);
  Budget.initModel(sequelize);
  Category.initModel(sequelize);
  Tier.initModel(sequelize);
  Operation.initModel(sequelize);
  Reconciliation.initModel(sequelize);

  // Associations
  UserAccount.belongsTo(User, { foreignKey: "userId", as: "user" });
  UserAccount.belongsTo(Account, { foreignKey: "accountId", as: "account" });

  User.hasMany(UserAccount, { foreignKey: "userId", as: "accountLinks" });
  Account.hasMany(UserAccount, { foreignKey: "accountId", as: "userLinks" });

  // Budgets <-> Accounts
  Budget.belongsTo(Account, { foreignKey: "accountId", as: "account" });
  Account.hasMany(Budget, { foreignKey: "accountId", as: "budgets" });

  // Categories
  Category.belongsTo(User, { foreignKey: "userId", as: "user" });
  Category.hasMany(Operation, { foreignKey: "categoryId", as: "operations" });
  Category.hasMany(Tier, { foreignKey: "categoryId", as: "tiers" });

  // Tiers
  Tier.belongsTo(User, { foreignKey: "userId", as: "user" });
  Tier.belongsTo(Category, { foreignKey: "categoryId", as: "category" });
  Tier.hasMany(Operation, { foreignKey: "tierId", as: "operations" });

  // Operations
  Operation.belongsTo(Account, { foreignKey: "accountId" });
  Operation.belongsTo(Tier, { foreignKey: "tierId" });
  Operation.belongsTo(Budget, { foreignKey: "budgetId" });
  Operation.belongsTo(Category, { foreignKey: "categoryId", as: "category" });
  Operation.belongsTo(Account, {
    foreignKey: "linkedAccountId",
    as: "linkedAccount"
  });
  Operation.belongsTo(Reconciliation, {
    foreignKey: "reconciliationId",
    as: "reconciliation"
  });
}

export { sequelize, Account, UserAccount, User, Budget, Category, Tier, Operation, Reconciliation };