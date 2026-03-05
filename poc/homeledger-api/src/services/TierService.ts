// FILENAME: src/services/TierService.ts
import createHttpError from "http-errors";
import { Tier, Category } from "@db";
import { RequestContext } from "@middlewares/userContext";
import type { Transaction } from "sequelize";
import { withTransaction } from "@helpers/withTransaction";

interface CreateTierPayload {
    name: string;
    description?: string;
    categoryId?: string | null;
}

interface UpdateTierPayload {
    name?: string;
    description?: string;
    categoryId?: string | null;
}

export class TierService {
    private readonly userId: string;

    constructor(private readonly context: RequestContext) {
        if (!context.appUser) {
            throw new Error("TierService requires an authenticated appUser");
        }
        this.userId = context.appUser.id;
    }

    async list(transaction?: Transaction) {
        return Tier.findAll({
            where: { userId: this.userId },
            order: [["name", "ASC"]],
            transaction
        });
    }

    async get(tierId: string, transaction?: Transaction) {
        const tier = await Tier.findOne({
            where: { id: tierId, userId: this.userId },
            transaction
        });

        if (!tier) {
            throw new createHttpError.NotFound("Tier not found");
        }

        return tier;
    }

    async create(payload: CreateTierPayload, transaction?: Transaction) {
        return withTransaction(async (tx) => {
            if (payload.categoryId) {
                const category = await Category.findOne({
                    where: { id: payload.categoryId, userId: this.userId },
                    transaction: tx
                });
                if (!category) {
                    throw new createHttpError.BadRequest("Invalid categoryId");
                }
            }

            const tier = await Tier.create(
                {
                    userId: this.userId,
                    name: payload.name,
                    description: payload.description ?? null,
                    categoryId: payload.categoryId ?? null
                },
                { transaction: tx }
            );

            return tier;
        }, transaction);
    }

    async update(
        tierId: string,
        payload: UpdateTierPayload,
        transaction?: Transaction
    ) {
        return withTransaction(async (tx) => {
            const tier = await this.get(tierId, tx);

            if (payload.categoryId) {
                const category = await Category.findOne({
                    where: { id: payload.categoryId, userId: this.userId },
                    transaction: tx
                });
                if (!category) {
                    throw new createHttpError.BadRequest("Invalid categoryId");
                }
            }

            await tier.update(
                {
                    name: payload.name ?? tier.name,
                    description: payload.description ?? tier.description,
                    categoryId:
                        payload.categoryId !== undefined ? payload.categoryId : tier.categoryId
                },
                { transaction: tx }
            );

            return tier;
        }, transaction);
    }

    async delete(tierId: string, transaction?: Transaction) {
        await withTransaction(async (tx) => {
            const tier = await this.get(tierId, tx);
            await tier.destroy({ transaction: tx });
        }, transaction);
    }
}