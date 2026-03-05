// FILENAME: migrations/20251201090000-init-schema
"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface /*, Sequelize */) {
    // On exécute ton SQL tel quel
    await queryInterface.sequelize.query(`
-- Extension pour les UUID si ce n'est pas déjà fait
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Table users
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  keycloak_sub TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL UNIQUE,
  first_name TEXT,
  last_name TEXT,
  phone TEXT,
  address_line1 TEXT,
  address_line2 TEXT,
  postal_code TEXT,
  city TEXT,
  country TEXT,
  preferences JSONB DEFAULT '{}'::JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index
CREATE INDEX IF NOT EXISTS idx_users_keycloak_sub ON users (keycloak_sub);
CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);

-- Table des comptes bancaires
CREATE TABLE IF NOT EXISTS accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  bank_name TEXT,
  account_number TEXT,
  type TEXT NOT NULL CHECK (type IN ('current', 'savings')),
  interest_rate NUMERIC(5,2), -- en %, uniquement pour savings
  initial_balance NUMERIC(14,2) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index pour les recherches par type / banque
CREATE INDEX IF NOT EXISTS idx_accounts_type ON accounts (type);
CREATE INDEX IF NOT EXISTS idx_accounts_bank_name ON accounts (bank_name);

-- Table d'association utilisateur <-> compte
CREATE TABLE IF NOT EXISTS user_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  account_id UUID NOT NULL,
  role TEXT NOT NULL DEFAULT 'owner',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT fk_user_accounts_user
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_user_accounts_account
    FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE,
  CONSTRAINT user_accounts_user_account_key UNIQUE (user_id, account_id)
);

CREATE INDEX IF NOT EXISTS idx_user_accounts_user_id ON user_accounts (user_id);
CREATE INDEX IF NOT EXISTS idx_user_accounts_account_id ON user_accounts (account_id);

-- Table des budgets par compte
CREATE TABLE IF NOT EXISTS budgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL,
  label TEXT NOT NULL,
  icon_key TEXT NOT NULL,
  color TEXT NOT NULL,
  monthly_amount NUMERIC(14,2) NOT NULL DEFAULT 0, -- montant ajouté chaque mois
  current_balance NUMERIC(14,2) NOT NULL DEFAULT 0, -- solde disponible (>= 0)
  comment TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT fk_budgets_account
    FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_budgets_account_id ON budgets (account_id);


-- Table tiers (personne, magasin, organisme, etc.)
CREATE TABLE IF NOT EXISTS tiers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  budget_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT fk_tiers_user
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_tiers_budget
    FOREIGN KEY (budget_id) REFERENCES budgets(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_tiers_user_id ON tiers(user_id);
CREATE INDEX IF NOT EXISTS idx_tiers_budget_id ON tiers(budget_id);

-- Table reconciliations (rapprochements bancaires)
CREATE TABLE IF NOT EXISTS reconciliations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL,
  date DATE NOT NULL,
  balance NUMERIC(14,2) NOT NULL,
  comment TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT fk_reconciliations_account
    FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_reconciliations_account_id
  ON reconciliations(account_id);

CREATE INDEX IF NOT EXISTS idx_reconciliations_date
  ON reconciliations(date);

CREATE INDEX IF NOT EXISTS idx_reconciliations_date_account_id
  ON reconciliations(date, account_id);

-- Table operations (opérations bancaires)
CREATE TABLE IF NOT EXISTS operations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL,
  tier_id UUID,
  budget_id UUID,
  linked_account_id UUID,
  type TEXT CHECK (type IN ('card','transfer','deposit','cheque','direct_debit','other')),
  booking_date DATE NOT NULL,
  amount NUMERIC(14,2) NOT NULL,
  description TEXT,
  status TEXT CHECK (status IN ('pending','posted','pointed')) DEFAULT 'pending',
  reconciliation_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT fk_operations_account
    FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE,
  CONSTRAINT fk_operations_tier
    FOREIGN KEY (tier_id) REFERENCES tiers(id) ON DELETE RESTRICT,
  CONSTRAINT fk_operations_budget
    FOREIGN KEY (budget_id) REFERENCES budgets(id) ON DELETE SET NULL,
  CONSTRAINT fk_operations_linked_account
    FOREIGN KEY (linked_account_id) REFERENCES accounts(id) ON DELETE SET NULL,
  CONSTRAINT fk_operations_reconciliation
    FOREIGN KEY (reconciliation_id) REFERENCES reconciliations(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_operations_account_id
  ON operations(account_id);

CREATE INDEX IF NOT EXISTS idx_operations_tier_id
  ON operations(tier_id);

CREATE INDEX IF NOT EXISTS idx_operations_booking_date
  ON operations(booking_date);

CREATE INDEX IF NOT EXISTS idx_operations_status
  ON operations(status);

CREATE INDEX IF NOT EXISTS idx_operations_reconciliation_id
  ON operations(reconciliation_id);
        `);
  },

  async down(queryInterface /*, Sequelize */) {
    // On drop les tables dans l'ordre inverse des dépendances
    await queryInterface.sequelize.query(`
DROP TABLE IF EXISTS operations CASCADE;
DROP TABLE IF EXISTS reconciliations CASCADE;
DROP TABLE IF EXISTS tiers CASCADE;
DROP TABLE IF EXISTS budgets CASCADE;
DROP TABLE IF EXISTS user_accounts CASCADE;
DROP TABLE IF EXISTS accounts CASCADE;
DROP TABLE IF EXISTS users CASCADE;
        `);

    // En général je ne touche pas à l'extension pgcrypto dans down
    // (tu peux ajouter un DROP EXTENSION si tu veux vraiment nettoyer)
  }
};