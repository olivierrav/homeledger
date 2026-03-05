"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// FILENAME: tests/health.e2e.test.ts
const supertest_1 = __importDefault(require("supertest"));
const app_1 = require("@server/app");
describe("Health API", () => {
    it("GET /v1/health shoul d return status ok", async () => {
        const app = await (0, app_1.createApp)();
        const res = await (0, supertest_1.default)(app).get("/v1/health");
        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty("status", "ok");
        expect(res.body).toHaveProperty("uptime");
    });
});
