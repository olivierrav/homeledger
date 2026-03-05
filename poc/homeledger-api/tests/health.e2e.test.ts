// FILENAME: tests/health.e2e.test.ts
import request from "supertest";
import { createApp } from "@server/app";

describe("Health API", () => {
    it("GET /v1/health shoul d return status ok", async () => {
        const app = await createApp();

        const res = await request(app).get("/v1/health");

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty("status", "ok");
        expect(res.body).toHaveProperty("uptime");
    });
});