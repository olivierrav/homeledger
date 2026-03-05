// FILENAME: src/services/BudgetService.ts
import createHttpError from "http-errors";
import { Account, Budget, UserAccount } from "@db";
import { RequestContext } from "@middlewares/userContext";
import type { Transaction } from "sequelize";
import { withTransaction } from "@helpers/withTransaction";

interface CreateBudgetPayload {
    label: string;
    iconKey: string;
    color: string;
    monthlyAmount: number;
    comment?: string;
}

interface UpdateBudgetPayload {
    id?: string;
    accountId?: string; // optionnel, car on ne modifie pas le compte d'un budget
    currentBalance?: number; // ne doit pas être modifié directement
    label?: string;
    iconKey?: string;
    color?: string;
    monthlyAmount?: number;
    comment?: string;
    // currentBalance ne se modifie pas directement ici
}

interface WrappedBudget {
    id: string;
    accountId: string;
    label: string;
    color: string;
    iconKey: string;
    monthlyAmount: number;
    currentBalance: number;
    comment: string;
}

const wrapBudget: (budget: Budget) => WrappedBudget = (budget) => ({
    id: budget.id,
    accountId: budget.accountId,
    label: budget.label,
    color: budget.color,
    iconKey: budget.iconKey || "",
    monthlyAmount: budget.monthlyAmount,
    currentBalance: budget.currentBalance || 0,
    comment: budget.comment || "",
});

const wrapBudgets = (budgets: Budget[]): WrappedBudget[] => {
    return budgets.map(wrapBudget);
};

export class BudgetService {
    private readonly userId: string;

    constructor(private readonly context: RequestContext) {
        if (!context.appUser) {
            throw new Error("BudgetService requires an authenticated appUser");
        }
        this.userId = context.appUser.id;
    }

    private async assertAccountOwned(
        accountId: string,
        transaction?: Transaction,
    ): Promise<Account> {
        const link = (await UserAccount.findOne({
            where: { userId: this.userId, accountId },
            include: [{ model: Account, as: "account" }],
            transaction,
        })) as (UserAccount & { account?: Account }) | null;

        if (!link || !link.account) {
            throw new createHttpError.Forbidden("Account not accessible for this user");
        }

        return link.account;
    }

    async listForAccount(accountId: string, transaction?: Transaction) {
        await this.assertAccountOwned(accountId, transaction);
        return wrapBudgets(
            await Budget.findAll({
                where: { accountId },
                order: [["createdAt", "ASC"]],
                transaction,
            }),
        );
    }

    async getForAccount(accountId: string, budgetId: string, transaction?: Transaction) {
        await this.assertAccountOwned(accountId, transaction);

        const budget = await Budget.findOne({
            where: { id: budgetId, accountId },
            transaction,
        });

        if (!budget) {
            throw new createHttpError.NotFound("Budget not found");
        }

        return wrapBudget(budget);
    }

    async createForAccount(
        accountId: string,
        payload: CreateBudgetPayload,
        transaction?: Transaction,
    ) {
        return withTransaction(async (tx) => {
            await this.assertAccountOwned(accountId, tx);

            const budget = await Budget.create(
                {
                    accountId,
                    label: payload.label,
                    iconKey: payload.iconKey,
                    color: payload.color,
                    monthlyAmount: payload.monthlyAmount,
                    // currentBalance = 0 au départ, incrémenté ensuite par un job mensuel
                    comment: payload.comment,
                },
                { transaction: tx },
            );

            return wrapBudget(budget);
        }, transaction);
    }

    async updateForAccount(
        accountId: string,
        budgetId: string,
        payload: UpdateBudgetPayload,
        transaction?: Transaction,
    ) {
        return withTransaction(async (tx) => {
            const budget = await Budget.findOne({
                where: { id: budgetId, accountId },
                transaction,
            });

            if (!budget) {
                throw new createHttpError.NotFound("Budget not found");
            }

            // Vérifier que le compte appartient à l'utilisateur
            await this.assertAccountOwned(accountId, tx);

            // Ne mettre à jour que les champs définis (pas undefined)
            const allowedFields: (keyof UpdateBudgetPayload)[] = [
                "label",
                "iconKey",
                "color",
                "monthlyAmount",
                "comment",
                "currentBalance",
            ];

            const updates: Partial<UpdateBudgetPayload> = {};
            for (const field of allowedFields) {
                if (payload[field] !== undefined) {
                    (updates as Record<string, unknown>)[field] = payload[field];
                }
            }

            await budget.update(updates, { transaction: tx });

            return wrapBudget(budget);
        }, transaction);
    }

    async deleteForAccount(accountId: string, budgetId: string, transaction?: Transaction) {
        await withTransaction(async (tx) => {
            const budget = await Budget.findOne({
                where: { id: budgetId, accountId },
                transaction: tx,
            });
            if (!budget) {
                throw new createHttpError.NotFound("Budget not found");
            }

            await budget.destroy({ transaction: tx });
        }, transaction);
    }

    /**
     * Appelée quand une transaction est affectée à ce budget.
     * amount est un montant positif, en valeur absolue.
     * La règle métier: le budget ne descend jamais sous 0, on sature à 0.
     */
    async applyTransaction(
        accountId: string,
        budgetId: string,
        amount: number,
        transaction?: Transaction,
    ) {
        if (amount <= 0) {
            throw new createHttpError.BadRequest("amount must be > 0");
        }

        return withTransaction(async (tx) => {
            const budget = await Budget.findOne({
                where: { id: budgetId, accountId },
                transaction: tx,
            });

            if (!budget) {
                throw new createHttpError.NotFound("Budget not found");
            }

            // Vérifier que le compte appartient à l'utilisateur
            await this.assertAccountOwned(accountId, tx);

            // Ne pas permettre de descendre sous 0
            const current = Number(budget.currentBalance);
            const newBalance = current - amount;

            budget.currentBalance = newBalance < 0 ? 0 : newBalance;
            await budget.save({ transaction: tx });

            return budget;
        }, transaction);
    }

    /**
     * Liste tous les budgets associés aux comptes de l'utilisateur courant.
     */
    async listForCurrentUser() {
        // Trouver tous les comptes de l'utilisateur courant
        const userAccountLinks = await UserAccount.findAll({
            where: { userId: this.userId },
            attributes: ["accountId"],
        });

        const accountIds = userAccountLinks.map((link) => link.accountId);

        if (accountIds.length === 0) {
            return [];
        }

        // Retourner les budgets de ces comptes
        return wrapBudgets(
            await Budget.findAll({
                where: { accountId: accountIds },
                order: [["createdAt", "ASC"]],
            }),
        );
    }

    /**
     * Crée un budget pour un des comptes de l'utilisateur courant.
     */
    async createForCurrentUser(
        accountId: string,
        payload: CreateBudgetPayload,
        transaction?: Transaction,
    ) {
        // Vérifier que le compte appartient bien à l'utilisateur
        await this.assertAccountOwned(accountId, transaction);
        // Créer le budget
        return this.createForAccount(accountId, payload, transaction);
    }

    /**
     * Met à jour la liste complète des budgets pour l'utilisateur courant.
     * - Les budgets dont l'id n'est pas dans le tableau sont supprimés
     * - Les budgets avec un id sont mis à jour
     * - Les budgets sans id sont créés
     */
    async updateBudgetList(budgets: UpdateBudgetPayload[], transaction?: Transaction) {
        await withTransaction(async (tx) => {
            // 1. Récupérer tous les comptes de l'utilisateur
            const userAccountLinks = await UserAccount.findAll({
                where: { userId: this.userId },
                attributes: ["accountId"],
                transaction: tx,
            });

            const accountIds = userAccountLinks.map((link) => link.accountId);

            if (accountIds.length === 0) {
                return [];
            }

            // 2. Récupérer tous les budgets existants pour ces comptes
            const existingBudgets = await Budget.findAll({
                where: { accountId: accountIds },
                transaction: tx,
            });

            // 3. Extraire les IDs des budgets reçus
            const receivedBudgetIds = budgets.filter((b) => b.id).map((b) => b.id as string);

            // 4. Supprimer les budgets qui ne sont pas dans la liste reçue
            const budgetsToDelete = existingBudgets.filter(
                (b) => !receivedBudgetIds.includes(b.id),
            );

            for (const budget of budgetsToDelete) {
                await budget.destroy({ transaction: tx });
            }

            // 5. Traiter les budgets reçus (update ou create)
            const results: Budget[] = [];

            for (const budgetPayload of budgets) {
                if (budgetPayload.id) {
                    // Budget existant : mise à jour
                    const existingBudget = existingBudgets.find((b) => b.id === budgetPayload.id);

                    if (existingBudget) {
                        // Vérifier que le compte appartient à l'utilisateur
                        if (!accountIds.includes(existingBudget.accountId)) {
                            throw new createHttpError.Forbidden(
                                `Budget ${budgetPayload.id} does not belong to this user`,
                            );
                        }

                        // Ne pas permettre la modification du currentBalance
                        if (budgetPayload.currentBalance !== undefined) {
                            throw new createHttpError.BadRequest(
                                "currentBalance cannot be updated directly",
                            );
                        }

                        // Mettre à jour le budget
                        await existingBudget.update(budgetPayload, { transaction: tx });
                        results.push(existingBudget);
                    }
                } else {
                    // Nouveau budget : création
                    if (!budgetPayload.accountId) {
                        throw new createHttpError.BadRequest(
                            "accountId is required for new budgets",
                        );
                    }

                    // Vérifier que le compte appartient à l'utilisateur
                    if (!accountIds.includes(budgetPayload.accountId)) {
                        throw new createHttpError.Forbidden(
                            `Account ${budgetPayload.accountId} does not belong to this user`,
                        );
                    }

                    // Vérifier que les champs requis sont présents
                    if (!budgetPayload.label || budgetPayload.monthlyAmount === undefined) {
                        throw new createHttpError.BadRequest(
                            "label, iconKey, color, and monthlyAmount are required for new budgets",
                        );
                    }

                    const newBudget = await Budget.create(
                        {
                            accountId: budgetPayload.accountId,
                            label: budgetPayload.label,
                            iconKey: budgetPayload.iconKey || "",
                            color: budgetPayload.color || "",
                            monthlyAmount: budgetPayload.monthlyAmount,
                            currentBalance: 0,
                            comment: budgetPayload.comment,
                        },
                        { transaction: tx },
                    );
                }
            }
        }, transaction);

        return await this.listForCurrentUser();
    }

    /**
     * Met à jour la liste complète des budgets pour un compte donné.
     * - Les budgets dont l'id n'est pas dans le tableau sont supprimés
     * - Les budgets avec un id sont mis à jour
     * - Les budgets sans id sont créés
     */
    async updateBudgetListForAccount(
        accountId: string,
        budgets: UpdateBudgetPayload[],
        transaction?: Transaction,
    ) {
        await this.assertAccountOwned(accountId, transaction);

        await withTransaction(async (tx) => {
            // 1. Récupérer tous les budgets existants pour ce compte
            const existingBudgets = await Budget.findAll({
                where: { accountId },
                transaction: tx,
            });

            // 2. Extraire les IDs des budgets reçus
            const receivedBudgetIds = budgets.filter((b) => b.id).map((b) => b.id as string);

            // 3. Supprimer les budgets qui ne sont pas dans la liste reçue
            const budgetsToDelete = existingBudgets.filter(
                (b) => !receivedBudgetIds.includes(b.id),
            );

            for (const budget of budgetsToDelete) {
                await budget.destroy({ transaction: tx });
            }

            // 4. Traiter les budgets reçus (update ou create)
            for (const budgetPayload of budgets) {
                if (budgetPayload.id) {
                    // Budget existant : mise à jour
                    const existingBudget = existingBudgets.find((b) => b.id === budgetPayload.id);

                    if (existingBudget) {
                        // Vérifier que le budget appartient bien à ce compte
                        if (existingBudget.accountId !== accountId) {
                            throw new createHttpError.Forbidden(
                                `Budget ${budgetPayload.id} does not belong to account ${accountId}`,
                            );
                        }

                        // Ne pas permettre la modification du currentBalance
                        if (budgetPayload.currentBalance !== undefined) {
                            throw new createHttpError.BadRequest(
                                "currentBalance cannot be updated directly",
                            );
                        }

                        // Mettre à jour le budget
                        await existingBudget.update(budgetPayload, { transaction: tx });
                    }
                } else {
                    // Nouveau budget : création
                    // Vérifier que les champs requis sont présents
                    if (!budgetPayload.label || budgetPayload.monthlyAmount === undefined) {
                        throw new createHttpError.BadRequest(
                            "label and monthlyAmount are required for new budgets",
                        );
                    }

                    await Budget.create(
                        {
                            accountId,
                            label: budgetPayload.label,
                            iconKey: budgetPayload.iconKey || "",
                            color: budgetPayload.color || "",
                            monthlyAmount: budgetPayload.monthlyAmount,
                            currentBalance: 0,
                            comment: budgetPayload.comment,
                        },
                        { transaction: tx },
                    );
                }
            }
        }, transaction);

        return await this.listForAccount(accountId);
    }
}
