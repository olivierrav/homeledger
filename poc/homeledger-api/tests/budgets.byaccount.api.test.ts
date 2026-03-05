import request from "supertest";
import { createApp } from "@server/app";
// TODO adapter la logique d'user/token/compte
import { sequelize } from "@db";

let app: any;
let authToken: string;
let accountId: string;
let budgetId: string;

beforeAll(async () => {
    app = await createApp();
    // TODO: remplacer ceci par setup user/account avec auth et création budget (cf. utils)
    // const { token, account, budget } = await createUserWithBudget();
    // authToken = token;
    // accountId = account.id;
    // budgetId = budget.id;
});

afterAll(async () => {
    await sequelize.close();
});

describe("Budget API - By Account", () => {
    describe("GET /v1/me/accounts/:accountId/budgets", () => {
        it("refuse sans authentification", async () => {
            await request(app)
                .get(`/v1/me/accounts/${accountId}/budgets`)
                .expect(401);
        });
        it.skip("liste les budgets pour un compte accessible", async () => {
            const res = await request(app)
                .get(`/v1/me/accounts/${accountId}/budgets`)
                .set("Authorization", `Bearer ${authToken}`);
            expect(res.status).toBe(200);
            expect(Array.isArray(res.body)).toBe(true);
        });
        it.skip("renvoie 403 pour un compte non accessible à l'utilisateur", async () => {
            const res = await request(app)
                .get(`/v1/me/accounts/NON_OWNED_ACCOUNT_ID/budgets`)
                .set("Authorization", `Bearer ${authToken}`);
            expect(res.status).toBe(403);
        });
    });

    // Ajoute ici les tests POST, PUT, DELETE selon les routes implémentées dans ton code
    // ...
});
