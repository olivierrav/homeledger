// FILENAME: src/services/ReconciliationService.ts
import { Budget, Operation, UserAccount } from "@db";
import { Reconciliation } from "@db/models/Reconciliation";
import { withTransaction } from "@helpers/withTransaction";
import { RequestContext } from "@middlewares/userContext";
import createHttpError from "http-errors";
import { Op } from "sequelize";

export interface ReconciliationStatus {
    lastReconciliationDate: Date | null;
    lastReconciliationBalance: number;
    theoreticalBalance: number;
    budgetBalance: number;
}

export interface ReconciliationOperationInput {
    operationId: string;
}

export class ReconciliationService {
    private readonly userId: string;

    constructor(private readonly context: RequestContext) {
        if (!context.appUser) {
            throw new Error("ReconciliationService requires an authenticated appUser");
        }
        this.userId = context.appUser.id;
    }

    private async assertAccountOwned(accountId: string): Promise<void> {
        const link = await UserAccount.findOne({
            where: { userId: this.userId, accountId },
        });
        if (!link) {
            throw new createHttpError.Forbidden("Account not accessible");
        }
    }

    async getStatusForAccount(accountId: string): Promise<ReconciliationStatus> {
        await this.assertAccountOwned(accountId);

        // 1. Récupérer le dernier rapprochement
        const lastReconciliation = await Reconciliation.findOne({
            where: { accountId },
            order: [["date", "DESC"]],
        });

        if (!lastReconciliation) {
            throw new createHttpError.NotFound("No reconciliation found for this account");
        }

        // 2. Calculer la somme des opérations non pointées
        const unpointedOperationsSum =
            (await Operation.sum("amount", {
                where: {
                    accountId,
                    status: { [Op.ne]: "pointed" },
                },
            })) || 0;

        // 3. Calculer la somme des soldes des budgets du compte
        const budgetBalancesSum =
            (await Budget.sum("currentBalance", {
                where: { accountId },
            })) || 0;

        // 4. Calculer le solde théorique
        // solde théorique = solde dernière reconciliation + opérations non pointées - soldes budgets
        const theoreticalBalance =
            parseFloat(lastReconciliation.balance as any) +
            parseFloat(unpointedOperationsSum as any) -
            parseFloat(budgetBalancesSum as any);

        return {
            lastReconciliationDate: lastReconciliation.date,
            lastReconciliationBalance: lastReconciliation.balance,
            theoreticalBalance: Math.round(theoreticalBalance * 100) / 100,
            budgetBalance: Math.round(parseFloat(budgetBalancesSum as any) * 100) / 100,
        };
    }

    async createForAccount(
        accountId: string,
        date: Date,
        balance: number,
        operationIds: string[],
    ): Promise<Reconciliation> {
        return withTransaction(async (transaction) => {
            await this.assertAccountOwned(accountId);

            // get last reconciliation to get previous balance
            const lastReconciliation = await Reconciliation.findOne({
                where: { accountId },
                order: [["date", "DESC"]],
            });

            const previousBalance = lastReconciliation ? lastReconciliation.balance : 0;

            // get all operations to reconcile
            const ops = await Operation.findAll({
                where: {
                    id: { [Op.in]: operationIds },
                    accountId,
                },
                attributes: ["id", "amount", "status"],
            });

            const totalOperationsAmount = ops.reduce(
                (sum, op) => sum + parseFloat(op.amount as any),
                0,
            );
            // we check that the balance difference matches the sum of operations amounts
            if (previousBalance + totalOperationsAmount !== balance) {
                throw new createHttpError.BadRequest(
                    "The balance difference does not match the sum of operations amounts",
                );
            }
            const reconciliation = await Reconciliation.create(
                {
                    accountId,
                    date,
                    balance,
                },
                { transaction },
            );

            // update operations to set their reconciliationId and status to "pointed"
            await Promise.all(
                ops.map((op) => {
                    op.reconciliationId = reconciliation.id;
                    op.status = "pointed";
                    return op.save({ transaction });
                }),
            );

            return reconciliation;
        });
    }
}
