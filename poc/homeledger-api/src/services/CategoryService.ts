// FILENAME: src/services/CategoryService.ts
import createHttpError from "http-errors";
import { Category } from "@db";
import { RequestContext } from "@middlewares/userContext";
import type { Transaction } from "sequelize";
import { withTransaction } from "@helpers/withTransaction";

interface CreateCategoryPayload {
    name: string;
    color?: string;
    iconKey?: string | null;
}

interface UpdateCategoryPayload {
    name?: string;
    color?: string;
    iconKey?: string | null;
}

export class CategoryService {
    private readonly userId: string;

    constructor(private readonly context: RequestContext) {
        if (!context.appUser) {
            throw new Error("CategoryService requires an authenticated appUser");
        }
        this.userId = context.appUser.id;
    }

    async list(transaction?: Transaction) {
        return Category.findAll({
            where: { userId: this.userId },
            order: [["name", "ASC"]],
            transaction
        });
    }

    async get(categoryId: string, transaction?: Transaction) {
        const category = await Category.findOne({
            where: { id: categoryId, userId: this.userId },
            transaction
        });

        if (!category) {
            throw new createHttpError.NotFound("Category not found");
        }

        return category;
    }

    async create(payload: CreateCategoryPayload, transaction?: Transaction) {
        return withTransaction(async (tx) => {
            const category = await Category.create(
                {
                    userId: this.userId,
                    name: payload.name,
                    color: payload.color ?? "#1890ff",
                    iconKey: payload.iconKey ?? null
                },
                { transaction: tx }
            );

            return category;
        }, transaction);
    }

    async update(
        categoryId: string,
        payload: UpdateCategoryPayload,
        transaction?: Transaction
    ) {
        return withTransaction(async (tx) => {
            const category = await this.get(categoryId, tx);

            await category.update(
                {
                    name: payload.name ?? category.name,
                    color: payload.color ?? category.color,
                    iconKey: payload.iconKey !== undefined ? payload.iconKey : category.iconKey
                },
                { transaction: tx }
            );

            return category;
        }, transaction);
    }

    async delete(categoryId: string, transaction?: Transaction) {
        await withTransaction(async (tx) => {
            const category = await this.get(categoryId, tx);
            await category.destroy({ transaction: tx });
        }, transaction);
    }
}
