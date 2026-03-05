// FILENAME: tests/money.test.ts
import { applyBudgetDebit } from "@helpers/money";

describe("applyBudgetDebit", () => {
    it("déduit un montant sans passer sous 0 si le solde est suffisant", () => {
        const result = applyBudgetDebit(100, 30);
        expect(result).toBe(70);
    });

    it("sature à 0 si le débit dépasse le solde", () => {
        const result = applyBudgetDebit(50, 80);
        expect(result).toBe(0);
    });

    it("lève une erreur si le montant est <= 0", () => {
        expect(() => applyBudgetDebit(100, 0)).toThrow("amount must be > 0");
        expect(() => applyBudgetDebit(100, -10)).toThrow("amount must be > 0");
    });
});