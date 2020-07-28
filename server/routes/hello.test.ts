import express from "express";
import request from "supertest";
import { Hello } from "./hello";
import { createRoute } from "@:app.config";

describe("sample of testing", () => {
  const app = express();
  app.use(createRoute(Hello));

  it("should able to request /hello", async () => {
    const response = await request(app).get("/hello");
    expect(response.status).toBe(200);
    expect(response.text).toBe("hi");
  });
});
