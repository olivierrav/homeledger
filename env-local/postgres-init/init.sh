#!/bin/bash
set -e

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    -- Database is already created by POSTGRES_DB env var
    GRANT ALL PRIVILEGES ON DATABASE homeledger_db TO postgres;
EOSQL
