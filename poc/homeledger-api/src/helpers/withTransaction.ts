// FILENAME: src/helpers/withTransaction.ts
import { sequelize } from "@db";
import type { Transaction } from "sequelize";

/**
 * Exécute fn dans une transaction Sequelize.
 * - Si une transaction est passée en paramètre, on la réutilise.
 * - Sinon, on en crée une nouvelle et on commit/rollback automatiquement.
 */
export async function withTransaction<T>(
    fn: (transaction: Transaction) => Promise<T>,
    existingTransaction?: Transaction
): Promise<T> {
    if (existingTransaction) {
        // On réutilise la transaction existante
        return fn(existingTransaction);
    }

    // On crée une nouvelle transaction
    return sequelize.transaction(async (transaction) => {
        return fn(transaction);
    });
}