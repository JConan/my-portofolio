import express from "express";
import request from "supertest";
import { configure } from "@:app.tools";

describe("Vidly Movie APIs", () => {
  const app = express();

  configure(app, {
    "/": {
      routerSettings: [
        (router) => router.get("/movies", (req, res) => res.send([])),
      ],
    },
  });

  it("should be able access to get /movies", async () => {
    const response = await request(app).get("/movies");
    expect(response.status).toBe(200);
    expect(response.body instanceof Array).toBeTruthy();
  });
});
