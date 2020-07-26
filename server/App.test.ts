import { Router } from "express";
import { App } from "./App";
import request from "supertest";

const pingRouter = () => {
  const router = Router();
  router.get("/ping", (req, res) => res.send("Pong!"));
  return router;
};

const app = App({
  port: 3000,
  isDev: true,
  isTest: true,
  httpProxies: {
    "proxy to local /ping with another path": {
      "/proxy/ping": {
        pathRewrite: () => "/ping",
        target: "http://localhost:3000",
      },
    },
  },
  useMiddleWares: {
    "Route Hello": [pingRouter()],
  },
  serverStaticDirectories: {
    "/root": "../",
  },
});
app.start();

describe("Express App", () => {
  it("should be able to make request to /ping", (done) => {
    request(app.server).get("/ping").expect(200, done);
  });
  it("should be able to call proxified path", (done) => {
    request(app.server).get("/proxy/ping").expect(200, done);
  });
  it("should be able to request static files", async () => {
    const response = await request(app.server).get("/root/README.md");
    expect(response.status).toBe(200);
    expect(response.text).toContain("This project was bootstrapped");
  });
});
