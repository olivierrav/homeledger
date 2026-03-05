import request from "supertest";
import { createApp } from "@server/app";
// TODO adapter selon ton système d'auth:
// import { loginAndGetToken, createUserAndAccount } from "../tests/utils/auth-utils";
import { sequelize } from "@db";

let app: any;
let authToken: string;
let accountId: string;

beforeAll(async () => {
    app = await createApp();
    // TODO: remplacer ceci par ton vrai système de setup utilisateur
    // const { token, account } = await createUserAndAccount();
    // authToken = token;
    // accountId = account.id;
});

afterAll(async () => {
    await sequelize.close();
});

describe("Budget API", () => {
    describe("GET /v1/me/budgets", () => {
        it("refuse sans authentification", async () => {
            await request(app).get("/v1/me/budgets").expect(401);
        });
        // Il faudra mocker un user authentifié pour le test suivant !
        it.skip("liste les budgets de l’utilisateur courant", async () => {
            const res = await request(app)
                .get("/v1/me/budgets")
                .set("Authorization", `Bearer ${authToken}`);
            expect(res.status).toBe(200);
            expect(Array.isArray(res.body)).toBe(true);
        });
    });

    describe("POST /v1/me/budgets", () => {
        it("refuse sans auth", async () => {
            await request(app)
                .post("/v1/me/budgets")
                .send({ label: "test" })
                .expect(401);
        });
        it.skip("rejette payload incomplet", async () => {
            await request(app)
                .post("/v1/me/budgets")
                .set("Authorization", `Bearer ${authToken}`)
                .send({ label: "test" }) // manque accountId
                .expect(400);
        });
        it.skip("crée un budget pour un compte possédé", async () => {
            const res = await request(app)
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
