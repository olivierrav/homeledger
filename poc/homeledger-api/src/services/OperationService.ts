// FILENAME: src/services/OperationService.ts
import * as R from "ramda";
import createHttpError from "http-errors";
import { Account, Budget, Category, Operation, Tier, UserAccount } from "@db";
import { RequestContext } from "@middlewares/userContext";
import { Op, type Transaction } from "sequelize";
import { withTransaction } from "@helpers/withTransaction";
import { OperationType } from "@db/models/Operation";

interface CreateOperationPayload {
    tierId: string | null;
    dateTime: string; // ISO 8601 date/time
    amount: number; // >0 crédit, <0 débit
    description?: string;
    budgetId?: string | null;
    categoryId?: string | null;
    linkedAccountId?: string | null;
    type?: string | null; // 'card' | 'transfer' | ...
    imported?: boolean;
    status?: string;
    rawLabel?: string | null;
    normalizedLabel?: string | null;
    suggestedTierId?: string | null;
    suggestedBudgetId?: string | null;
    suggestionConfidence?: number | null;
    suggestionAccepted?: boolean | null;
}

interface UpdateOperationPayload {
    tierId?: string;
    dateTime?: string;
    amount?: number;
    description?: string;
    budgetId?: string | null;
    categoryId?: string | null;
    linkedAccountId?: string | null;
    type?: string | null;
    imported?: boolean;
    status?: string;
    rawLabel?: string | null;
    normalizedLabel?: string | null;
    suggestedTierId?: string | null;
    suggestedBudgetId?: string | null;
    suggestionConfidence?: number | null;
    suggestionAccepted?: boolean | null;
}

const wrapOperation = (dbOperation: Operation) =>
    R.pickAll(
        [
            "id",
            "tierId",
            "budgetId",
            "categoryId",
            "linkedAccountId",
            "type",
            "dateTime",
            "amount",
            "description",
            "status",
            "reconciliationId",
            "imported",
            "rawLabel",
            "normalizedLabel",
            "suggestedTierId",
            "suggestedBudgetId",
            "suggestionConfidence",
            "suggestionAccepted",
        ],
        dbOperation,
    );

export class OperationService {
    private readonly userId: string;

    constructor(private readonly context: RequestContext) {
        if (!context.appUser) {
            throw new Error("OperationService requires an authenticated appUser");
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
        })) as (UserAccount & { account: Account }) | null;

        if (!link || !link.account) {
            throw new createHttpError.Forbidden("Account not accessible for this user");
        }

        return link.account;
    }

    private async assertTierOwned(tierId: string, transaction?: Transaction): Promise<Tier> {
        const tier = await Tier.findOne({
            where: { id: tierId, userId: this.userId },
            transaction,
        });

        if (!tier) {
            throw new createHttpError.BadRequest("Tier not accessible for this user");
        }

        return tier;
    }

    private async assertBudgetCompatible(
        accountId: string,
        budgetId: string,
        transaction?: Transaction,
    ): Promise<Budget> {
        const budget = await Budget.findOne({
            where: { id: budgetId, accountId },
            transaction,
        });

        if (!budget) {
            throw new createHttpError.BadRequest("Budget does not belong to the given account");
        }

        return budget;
    }

    private async assertCategoryOwned(
        categoryId: string,
        transaction?: Transaction,
    ): Promise<Category> {
        const category = await Category.findOne({
            where: { id: categoryId, userId: this.userId },
            transaction,
        });

        if (!category) {
            throw new createHttpError.BadRequest("Category not accessible for this user");
        }

        return category;
    }

    async listForAccount(
        accountId: string,
        options: { pointed?: boolean } = {},
        transaction?: Transaction,
    ) {
        await this.assertAccountOwned(accountId, transaction);

        const where: any = { accountId };
        if (options.pointed === true) {
            where.status = { [Op.in]: ["pointed", "posted", "pending"] };
        } else if (options.pointed === false) {
            where.status = { [Op.in]: ["posted", "pending"] };
        }

        const result = await Operation.findAll({
            where,
            order: [["dateTime", "DESC"]],
            transaction,
        });

        return result.map(wrapOperation);
    }

    async getForAccount(accountId: string, operationId: string, transaction?: Transaction) {
        await this.assertAccountOwned(accountId, transaction);

        const op = await Operation.findOne({
            where: { id: operationId, accountId },
            transaction,
        });

        if (!op) {
            throw new createHttpError.NotFound("Operation not found");
        }

        return op;
    }

    async createForAccount(
        accountId: string,
        payload: CreateOperationPayload,
        transaction?: Transaction,
    ) {
        return withTransaction(async (tx) => {
            await this.assertAccountOwned(accountId, tx);
            if (payload.tierId) await this.assertTierOwned(payload.tierId, tx);

            if (payload.budgetId) {
                await this.assertBudgetCompatible(accountId, payload.budgetId, tx);
            }

            if (payload.categoryId) {
                await this.assertCategoryOwned(payload.categoryId, tx);
            }

            if (payload.linkedAccountId) {
                await this.assertAccountOwned(payload.linkedAccountId, tx);
            }

            const dateTime = new Date(payload.dateTime);
            if (Number.isNaN(dateTime.getTime())) {
                throw new createHttpError.BadRequest("Invalid dateTime");
            }

            const validTypes: OperationType[] = [
                "card",
                "transfer",
                "deposit",
                "cheque",
                "direct_debit",
                "other",
            ];
            const operationType: OperationType =
                payload.type && validTypes.includes(payload.type as OperationType)
                    ? (payload.type as OperationType)
                    : "other";

            const op = await Operation.create(
                {
                    accountId,
                    tierId: payload.tierId ?? null,
                    budgetId: payload.budgetId ?? null,
                    categoryId: payload.categoryId ?? null,
                    linkedAccountId: payload.linkedAccountId ?? null,
                    type: operationType,
                    dateTime,
                    amount: payload.amount,
                    description: payload.description ?? null,
                    status: "pending",
                    reconciliationId: null,
                    imported: payload.imported ?? false,
                    rawLabel: payload.rawLabel ?? null,
                    normalizedLabel: payload.normalizedLabel ?? null,
                    suggestedTierId: payload.suggestedTierId ?? null,
                    suggestedBudgetId: payload.suggestedBudgetId ?? null,
                    suggestionConfidence: payload.suggestionConfidence ?? null,
                    suggestionAccepted: payload.suggestionAccepted ?? null,
                },
                { transaction: tx },
            );

            return op;
        }, transaction);
    }

    async updateForAccount(
        accountId: string,
        operationId: string,
        payload: UpdateOperationPayload,
        transaction?: Transaction,
    ) {
        return withTransaction(async (tx) => {
            const op = await this.getForAccount(accountId, operationId, tx);

            if (op.status === "pointed") {
                throw new createHttpError.BadRequest("Cannot modify a pointed operation");
            }

            if (payload.tierId) {
                await this.assertTierOwned(payload.tierId, tx);
            }

            if (payload.budgetId) {
                await this.assertBudgetCompatible(accountId, payload.budgetId, tx);
            }

            if (payload.categoryId) {
                await this.assertCategoryOwned(payload.categoryId, tx);
            }

            if (payload.linkedAccountId) {
                await this.assertAccountOwned(payload.linkedAccountId, tx);
            }

            let dateTime = op.dateTime;
            if (payload.dateTime) {
                const d = new Date(payload.dateTime);
                if (Number.isNaN(d.getTime())) {
                    throw new createHttpError.BadRequest("Invalid dateTime");
                }
                dateTime = d;
            }

            // Handle status change (only pending <-> posted allowed, not pointed)
            let newStatus = op.status;
            if (payload.status !== undefined && payload.status !== op.status) {
                if (payload.status === "pending" || payload.status === "posted") {
                    newStatus = payload.status;
                }
                // Cannot set status to "pointed" via update - only via reconciliation
            }

            await op.update(
                {
                    tierId: payload.tierId !== undefined ? payload.tierId : op.tierId,
                    dateTime,
                    amount: payload.amount ?? op.amount,
                    description: payload.description ?? op.description,
                    budgetId: payload.budgetId !== undefined ? payload.budgetId : op.budgetId,
                    categoryId:
                        payload.categoryId !== undefined ? payload.categoryId : op.categoryId,
                    linkedAccountId:
                        payload.linkedAccountId !== undefined
                            ? payload.linkedAccountId
                            : op.linkedAccountId,
                    type: payload.type !== undefined ? (payload.type as any) : op.type,
                    imported: payload.imported !== undefined ? payload.imported : op.imported,
                    status: newStatus,
                    rawLabel: payload.rawLabel !== undefined ? payload.rawLabel : op.rawLabel,
                    normalizedLabel:
                        payload.normalizedLabel !== undefined
                            ? payload.normalizedLabel
                            : op.normalizedLabel,
                    suggestedTierId:
                        payload.suggestedTierId !== undefined
                            ? payload.suggestedTierId
                            : op.suggestedTierId,
                    suggestedBudgetId:
                        payload.suggestedBudgetId !== undefined
                            ? payload.suggestedBudgetId
                            : op.suggestedBudgetId,
                    suggestionConfidence:
                        payload.suggestionConfidence !== undefined
                            ? payload.suggestionConfidence
                            : op.suggestionConfidence,
                    suggestionAccepted:
                        payload.suggestionAccepted !== undefined
                            ? payload.suggestionAccepted
                            : op.suggestionAccepted,
                },
                { transaction: tx },
            );

            return op;
        }, transaction);
    }

    async deleteForAccount(accountId: string, operationId: string, transaction?: Transaction) {
        await withTransaction(async (tx) => {
            const op = await this.getForAccount(accountId, operationId, tx);

            if (op.status === "pointed") {
                throw new createHttpError.BadRequest("Cannot delete a pointed operation");
            }

            await op.destroy({ transaction: tx });
        }, transaction);
    }

    async createBulkForAccount(
        accountId: string,
        operations: CreateOperationPayload[],
        transaction?: Transaction,
    ) {
        return withTransaction(async (tx) => {
            await this.assertAccountOwned(accountId, tx);

            // Collect unique tierIds, budgetIds, and categoryIds to validate them once
            const tierIds = [
                ...new Set(operations.map((op) => op.tierId).filter(Boolean)),
            ] as string[];
            const budgetIds = [
                ...new Set(operations.map((op) => op.budgetId).filter(Boolean)),
            ] as string[];
            const categoryIds = [
                ...new Set(operations.map((op) => op.categoryId).filter(Boolean)),
            ] as string[];
            const linkedAccountIds = [
                ...new Set(operations.map((op) => op.linkedAccountId).filter(Boolean)),
            ] as string[];

            // Validate all tiers
            for (const tierId of tierIds) {
                await this.assertTierOwned(tierId, tx);
            }

            // Validate all budgets
            for (const budgetId of budgetIds) {
                await this.assertBudgetCompatible(accountId, budgetId, tx);
            }

            // Validate all categories
            for (const categoryId of categoryIds) {
                await this.assertCategoryOwned(categoryId, tx);
            }

            // Validate all linked accounts
            for (const linkedAccountId of linkedAccountIds) {
                await this.assertAccountOwned(linkedAccountId, tx);
            }

            const validTypes: OperationType[] = [
                "card",
                "transfer",
                "deposit",
                "cheque",
                "direct_debit",
                "other",
            ];

            const operationsToCreate = operations.map((payload, index) => {
                const dateTime = new Date(payload.dateTime);
                if (Number.isNaN(dateTime.getTime())) {
                    throw new createHttpError.BadRequest(`Invalid dateTime at index ${index}`);
                }

                const operationType: OperationType =
                    payload.type && validTypes.includes(payload.type as OperationType)
                        ? (payload.type as OperationType)
                        : "other";

                const validStatuses = ["pending", "posted", "pointed"];
                const operationStatus =
                    payload.status && validStatuses.includes(payload.status)
                        ? (payload.status as "pending" | "posted" | "pointed")
                        : "pending";

                return {
                    accountId,
                    tierId: payload.tierId ?? null,
                    budgetId: payload.budgetId ?? null,
                    categoryId: payload.categoryId ?? null,
                    linkedAccountId: payload.linkedAccountId ?? null,
                    type: operationType,
                    dateTime,
                    amount: payload.amount,
                    description: payload.description ?? null,
                    status: operationStatus,
                    reconciliationId: null,
                    imported: payload.imported ?? false,
                    rawLabel: payload.rawLabel ?? null,
                    normalizedLabel: payload.normalizedLabel ?? null,
                    suggestedTierId: payload.suggestedTierId ?? null,
                    suggestedBudgetId: payload.suggestedBudgetId ?? null,
                    suggestionConfidence: payload.suggestionConfidence ?? null,
                    suggestionAccepted: payload.suggestionAccepted ?? null,
                };
            });

            const createdOps = await Operation.bulkCreate(operationsToCreate, {
                transaction: tx,
            });

            return createdOps.map(wrapOperation);
        }, transaction);
    }
}
