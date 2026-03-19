import request from "supertest";
import app from "../api/index";

describe("Indonesia Holiday API", () => {
    it("GET /api should return array of holidays", async () => {
        const res = await request(app).get("/api");
        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
        if (res.body.length > 0) {
            expect(res.body[0]).toHaveProperty("holiday_date");
            expect(res.body[0]).toHaveProperty("holiday_name");
        }
    });

    it("GET /api/2026 should return holidays for 2026", async () => {
        const res = await request(app).get("/api/2026");
        expect(res.status).toBe(200);
        expect(res.body.every((h: any) => h.holiday_date.startsWith("2026"))).toBe(true);
    });

    it("GET /api?format=csv should return CSV format", async () => {
        const res = await request(app).get("/api/2026?format=csv");
        expect(res.status).toBe(200);
        expect(res.headers["content-type"]).toMatch(/text\/csv/);
        expect(res.text).toContain("holiday_date,holiday_name,is_national_holiday,is_joint_holiday");
    });

    it("GET /api?lang=en should return translated holidays", async () => {
        const res = await request(app).get("/api/2026");
        const resEn = await request(app).get("/api/2026?lang=en");
        expect(res.status).toBe(200);
        expect(resEn.status).toBe(200);
        expect(res.body.length).toEqual(resEn.body.length);
    });

    it("GET /api/info should return info from Wikipedia", async () => {
        const res = await request(app).get("/api/info");
        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty("info");
        expect(typeof res.body.info).toBe("string");
    });

    it("GET /api/og should return an SVG image", async () => {
        const res = await request(app).get("/api/og");
        expect(res.status).toBe(200);
        expect(res.headers["content-type"]).toContain("image/svg+xml");
    });
});
