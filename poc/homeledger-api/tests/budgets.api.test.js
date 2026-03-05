"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const app_1 = require("@server/app");
// TODO adapter selon ton système d'auth:
// import { loginAndGetToken, createUserAndAccount } from "../tests/utils/auth-utils";
const _db_1 = require("@db");
let app;
let authToken;
let accountId;
beforeAll(async () => {
    app = await (0, app_1.createApp)();
    // TODO: remplacer ceci par ton vrai système de setup utilisateur
    // const { token, account } = await createUserAndAccount();
    // authToken = token;
    // accountId = account.id;
});
afterAll(async () => {
    await _db_1.sequelize.close();
});
describe("Budget API", () => {
    describe("GET /v1/me/budgets", () => {
        it("refuse sans authentification", async () => {
            await (0, supertest_1.default)(app).get("/v1/me/budgets").expect(401);
        });
        // Il faudra mocker un user authentifié pour le test suivant !
        it.skip("liste les budgets de l’utilisateur courant", async () => {
            const res = await (0, supertest_1.default)(app)
                .get("/v1/me/budgets")
                .set("Authorization", `Bearer ${authToken}`);
            expect(res.status).toBe(200);
            expect(Array.isArray(res.body)).toBe(true);
        });
    });
    describe("POST /v1/me/budgets", () => {
        it("refuse sans auth", async () => {
            await (0, supertest_1.default)(app)
                .post("/v1/me/budgets")
                .send({ label: "test" })
                .expect(401);
        });
        it.skip("rejette payload incomplet", async () => {
            await (0, supertest_1.default)(app)
                .post("/v1/me/budgets")
                .set("Authorization", `Bearer ${authToken}`)
                .send({ label: "test" }) // manque accountId
                .expect(400);
        });
        it.skip("crée un budget pour un compte possédé", async () => {
            const res = await (0, supertest_1.default)(app)
                .post("/v1/me/budgets")
                .set("Authorization", `Bearer ${authToken}`)
                .send({
                label: "Vacances",
                accountId: accountId,
                color: "#00cabb",
                iconKey: "beach",
                monthlyAmount: 500
            });
            expect(res.status).toBe(201);
            expect(res.body).toHaveProperty("id");
            expect(res.body.label).toBe("Vacances");
        });
    });
});
