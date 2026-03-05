// FILENAME: src/helpers/money.ts
/**
 * Applique un débit sur un budget, en s’assurant qu’il ne descend jamais sous 0.
 */
export function applyBudgetDebit(currentBalance: number, amount: number): number {
    if (amount <= 0) {
        throw new Error("amount must be > 0");
    }

    const next = currentBalance - amount;
    return next < 0 ? 0 : next;
}