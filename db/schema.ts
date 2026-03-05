import { relations } from "drizzle-orm";
import {
  boolean,
  decimal,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

// ─── Enums ───────────────────────────────────────────────────────────────────

export const accountTypeEnum = pgEnum("account_type", ["current", "savings"]);

export const operationTypeEnum = pgEnum("operation_type", [
  "card",
  "transfer",
  "deposit",
  "cheque",
  "direct_debit",
  "other",
]);

export const operationStatusEnum = pgEnum("operation_status", [
  "pending",
  "posted",
  "pointed",
]);

// ─── Users ───────────────────────────────────────────────────────────────────

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  keycloakSub: text("keycloak_sub").notNull().unique(),
  email: text("email").notNull().unique(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  phone: text("phone"),
  addressLine1: text("address_line1"),
  addressLine2: text("address_line2"),
  postalCode: text("postal_code"),
  city: text("city"),
  country: text("country"),
  preferences: jsonb("preferences").$type<Record<string, unknown>>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ─── Accounts ────────────────────────────────────────────────────────────────

export const accounts = pgTable("accounts", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  bankName: text("bank_name"),
  accountNumber: text("account_number"),
  type: accountTypeEnum("type").notNull(),
  interestRate: decimal("interest_rate", { precision: 5, scale: 2 }),
  initialBalance: decimal("initial_balance", {
    precision: 14,
    scale: 2,
  }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ─── User Accounts (junction) ────────────────────────────────────────────────

export const userAccounts = pgTable("user_accounts", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id),
  accountId: uuid("account_id")
    .notNull()
    .references(() => accounts.id),
  role: text("role").notNull().default("owner"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ─── Categories ──────────────────────────────────────────────────────────────

export const categories = pgTable("categories", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id),
  name: text("name").notNull(),
  color: text("color").notNull().default("#1890ff"),
  iconKey: text("icon_key"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ─── Tiers ───────────────────────────────────────────────────────────────────

export const tiers = pgTable("tiers", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id),
  name: text("name").notNull(),
  description: text("description"),
  categoryId: uuid("category_id").references(() => categories.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ─── Budgets ─────────────────────────────────────────────────────────────────

export const budgets = pgTable("budgets", {
  id: uuid("id").primaryKey().defaultRandom(),
  accountId: uuid("account_id")
    .notNull()
    .references(() => accounts.id),
  label: text("label").notNull(),
  iconKey: text("icon_key").notNull(),
  color: text("color").notNull(),
  monthlyAmount: decimal("monthly_amount", {
    precision: 14,
    scale: 2,
  })
    .notNull()
    .default("0"),
  currentBalance: decimal("current_balance", {
    precision: 14,
    scale: 2,
  })
    .notNull()
    .default("0"),
  comment: text("comment"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ─── Reconciliations ─────────────────────────────────────────────────────────

export const reconciliations = pgTable("reconciliations", {
  id: uuid("id").primaryKey().defaultRandom(),
  accountId: uuid("account_id")
    .notNull()
    .references(() => accounts.id),
  date: timestamp("date", { mode: "date" }).notNull(),
  balance: decimal("balance", { precision: 14, scale: 2 }).notNull(),
  comment: text("comment"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ─── Operations ──────────────────────────────────────────────────────────────

export const operations = pgTable("operations", {
  id: uuid("id").primaryKey().defaultRandom(),
  accountId: uuid("account_id")
    .notNull()
    .references(() => accounts.id),
  tierId: uuid("tier_id").references(() => tiers.id),
  budgetId: uuid("budget_id").references(() => budgets.id),
  categoryId: uuid("category_id").references(() => categories.id),
  linkedAccountId: uuid("linked_account_id").references(() => accounts.id),
  type: operationTypeEnum("type"),
  dateTime: timestamp("date_time").notNull(),
  amount: decimal("amount", { precision: 14, scale: 2 }).notNull(),
  description: text("description"),
  status: operationStatusEnum("status").notNull().default("pending"),
  reconciliationId: uuid("reconciliation_id").references(
    () => reconciliations.id,
  ),
  imported: boolean("imported").notNull().default(false),
  rawLabel: text("raw_label"),
  normalizedLabel: text("normalized_label"),
  suggestedTierId: uuid("suggested_tier_id"),
  suggestedBudgetId: uuid("suggested_budget_id"),
  suggestionConfidence: decimal("suggestion_confidence", {
    precision: 3,
    scale: 2,
  }),
  suggestionAccepted: boolean("suggestion_accepted"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ─── Relations ───────────────────────────────────────────────────────────────

export const usersRelations = relations(users, ({ many }) => ({
  accountLinks: many(userAccounts),
  categories: many(categories),
  tiers: many(tiers),
}));

export const accountsRelations = relations(accounts, ({ many }) => ({
  userLinks: many(userAccounts),
  budgets: many(budgets),
  operations: many(operations),
  reconciliations: many(reconciliations),
}));

export const userAccountsRelations = relations(userAccounts, ({ one }) => ({
  user: one(users, {
    fields: [userAccounts.userId],
    references: [users.id],
  }),
  account: one(accounts, {
    fields: [userAccounts.accountId],
    references: [accounts.id],
  }),
}));

export const categoriesRelations = relations(categories, ({ one, many }) => ({
  user: one(users, {
    fields: [categories.userId],
    references: [users.id],
  }),
  tiers: many(tiers),
  operations: many(operations),
}));

export const tiersRelations = relations(tiers, ({ one, many }) => ({
  user: one(users, {
    fields: [tiers.userId],
    references: [users.id],
  }),
  category: one(categories, {
    fields: [tiers.categoryId],
    references: [categories.id],
  }),
  operations: many(operations),
}));

export const budgetsRelations = relations(budgets, ({ one, many }) => ({
  account: one(accounts, {
    fields: [budgets.accountId],
    references: [accounts.id],
  }),
  operations: many(operations),
}));

export const reconciliationsRelations = relations(
  reconciliations,
  ({ one, many }) => ({
    account: one(accounts, {
      fields: [reconciliations.accountId],
      references: [accounts.id],
    }),
    operations: many(operations),
  }),
);

export const operationsRelations = relations(operations, ({ one }) => ({
  account: one(accounts, {
    fields: [operations.accountId],
    references: [accounts.id],
  }),
  tier: one(tiers, {
    fields: [operations.tierId],
    references: [tiers.id],
  }),
  budget: one(budgets, {
    fields: [operations.budgetId],
    references: [budgets.id],
  }),
  category: one(categories, {
    fields: [operations.categoryId],
    references: [categories.id],
  }),
  linkedAccount: one(accounts, {
    fields: [operations.linkedAccountId],
    references: [accounts.id],
  }),
  reconciliation: one(reconciliations, {
    fields: [operations.reconciliationId],
    references: [reconciliations.id],
  }),
}));
