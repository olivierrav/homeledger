-- FILENAME: env-local/postgres-init/01-create-homeledger-user.sql

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'homeledger') THEN
    CREATE ROLE homeledger WITH
      LOGIN
      PASSWORD 'homeledger'
      CREATEDB
      CREATEROLE;
  END IF;
END $$;

-- Le DB existe déjà car POSTGRES_DB=homeledger_db, mais on sécurise le cas.
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_database WHERE datname = 'homeledger_db') THEN
    CREATE DATABASE homeledger_db OWNER homeledger;
  END IF;
END $$;

ALTER DATABASE homeledger_db OWNER TO homeledger;

GRANT ALL PRIVILEGES ON DATABASE homeledger_db TO homeledger;

-- Pour que homeledger puisse gérer les objets créés dans le schéma public
\connect homeledger_db

GRANT ALL ON SCHEMA public TO homeledger;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO homeledger;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO homeledger;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON FUNCTIONS TO homeledger;