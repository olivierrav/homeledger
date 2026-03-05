// FILENAME: src/services/AccountService.ts
import { Account, UserAccount } from "@db";
import { Reconciliation } from "@db/models/Reconciliation";
import { RequestContext } from "@middlewares/userContext";
import createHttpError from "http-errors";
import type { Transaction } from "sequelize";
import { withTransaction } from "@helpers/withTransaction";

interface CreateAccountPayload {
    name: string;
    bankName?: string;
    accountNumber?: string;
    type: "current" | "savings";
    interestRate?: number | null;
    initialBalance: number;
}

interface UpdateAccountPayload {
    name?: string;
    bankName?: string;
    accountNumber?: string;
    type?: "current" | "savings";
    interestRate?: number | null;
}

export class AccountService {
    private readonly userId: string;

    constructor(private readonly context: RequestContext) {
        if (!context.appUser) {
            throw new Error("AccountService requires an authenticated appUser");
        }
        this.userId = context.appUser.id;
    }

    async listForCurrentUser() {
        const accounts = await Account.findAll({
            include: [
                {
                    model: UserAccount,
                    as: "userLinks",
                    where: { userId: this.userId },
                    attributes: []
                }
            ],
            order: [["createdAt", "ASC"]]
        });

        return accounts;
    }

    async getForCurrentUser(accountId: string, transaction?: Transaction) {
        const account = await Account.findOne({
            where: { id: accountId },
            include: [
                {
                    model: UserAccount,
                    as: "userLinks",
                    where: { userId: this.userId },
                    attributes: []
                }
            ],
            transaction
        });

        if (!account) {
            throw new createHttpError.NotFound("Account not found");
        }

        return account;
    }

    async createForCurrentUser(
        payload: CreateAccountPayload,
        transaction?: Transaction
    ) {
        if (payload.type === "current") {
            payload.interestRate = null;
        }

        return withTransaction(async (tx) => {
            // 1. Création du compte
            const acc = await Account.create(
                {
                    name: payload.name,
                    bankName: payload.bankName,
                    accountNumber: payload.accountNumber,
                    type: payload.type,
                    interestRate: payload.interestRate,
                    initialBalance: payload.initialBalance
                },
                { transaction: tx }
            );

            // 2. Lien utilisateur / compte
            await UserAccount.create(
                {
                    userId: this.userId,
                    accountId: acc.id,
                    role: "owner"
                },
                { transaction: tx }
            );

            // 3. Premier rapprochement avec le solde initial
            await Reconciliation.create(
                {
                    accountId: acc.id,
                    date: new Date(), // DATEONLY côté SQL → seule la date sera conservée
                    balance: payload.initialBalance,
                    comment: "Initial balance"
                },
                { transaction: tx }
            );

            return acc;
        }, transaction);
    }

    async updateForCurrentUser(
        accountId: string,
        payload: UpdateAccountPayload,
        transaction?: Transaction
    ) {
        // on interdit explicitement de modifier le solde initial
        if ((payload as any).initialBalance !== undefined) {
            throw new createHttpError.BadRequest(
                "initialBalance cannot be modified after creation"
            );
        }

        if (payload.type === "current") {
            payload.interestRate = null;
        }

        return withTransaction(async (tx) => {
            const account = await this.getForCurrentUser(accountId, tx);
            await account.update(payload, { transaction: tx });
            return account;
        }, transaction);
    }

    async deleteForCurrentUser(accountId: string, transaction?: Transaction) {
        await withTransaction(async (tx) => {
            const account = await this.getForCurrentUser(accountId, tx);

            await UserAccount.destroy({
                where: { userId: this.userId, accountId: account.id },
                transaction: tx
            });

            const remainingLinks = await UserAccount.count({
                where: { accountId: account.id },
                transaction: tx
            });

            if (remainingLinks === 0) {
                await account.destroy({ transaction: tx });
            }
        }, transaction);
    }
}