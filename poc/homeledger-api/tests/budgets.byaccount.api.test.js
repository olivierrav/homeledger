"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const app_1 = require("@server/app");
// TODO adapter la logique d'user/token/compte
const _db_1 = require("@db");
let app;
let authToken;
let accountId;
let budgetId;
beforeAll(async () => {
    app = await (0, app_1.createApp)();
    // TODO: remplacer ceci par setup user/account avec auth et création budget (cf. utils)
    // const { token, account, budget } = await createUserWithBudget();
    // authToken = token;
    // accountId = account.id;
    // budgetId = budget.id;
});
afterAll(async () => {
    await _db_1.sequelize.close();
});
describe("Budget API - By Account", () => {
    describe("GET /v1/me/accounts/:accountId/budgets", () => {
        it("refuse sans authentification", async () => {
            await (0, supertest_1.default)(app)
                .get(`/v1/me/accounts/${accountId}/budgets`)
                .expect(401);
        });
        it.skip("liste les budgets pour un compte accessible", async () => {
            const res = await (0, supertest_1.default)(app)
                .get(`/v1/me/accounts/${accountId}/budgets`)
                .set("Authorization", `Bearer ${authToken}`);
            expect(res.status).toBe(200);
            expect(Array.isArray(res.body)).toBe(true);
        });
        it.skip("renvoie 403 pour un compte non accessible à l'utilisateur", async () => {
            const res = await (0, supertest_1.default)(app)
                .get(`/v1/me/accounts/NON_OWNED_ACCOUNT_ID/budgets`)
                .set("Authorization", `Bearer ${authToken}`);
            expect(res.status).toBe(403);
        });
    });
    // Ajoute ici les tests POST, PUT, DELETE selon les routes implémentées dans ton code
    // ...
});
