import express from "express";
import request from "supertest";
import * as AppTools from "@:app.tools";

describe("app basic setup test", () => {
  it("should be able to load route config", async () => {
    const app = express();
    // preparing
    AppTools.createConfig()
      .addRouterSetting((router) => {
        router.get("/hello", (req, res) => res.send("Hello AppTools"));
      })
      .apply(app);

    // test
    const response = await request(app).get("/hello");
    expect(response.status).toBe(200);
    expect(response.text).toBe("Hello AppTools");
  });

  it("should be able to load route config with basepath", async () => {
    const app = express();
    // preparing
    AppTools.createConfig()
      .addRouterSetting((router) => {
        router.get("/hello", (req, res) =>
          res.send("Hello AppTools with basePath")
        );
      }, "/v1")
      .apply(app);

    const response = await request(app).get("/v1/hello");
    expect(response.status).toBe(200);
    expect(response.text).toBe("Hello AppTools with basePath");
  });

  it("should be able to add static folder routing", async () => {
    const app = express();
    AppTools.createConfig().addStaticFolder({ folderPath: "../" }).apply(app);
    const response = await request(app).get("/package.json");
    expect(response.status).toBe(200);
    expect(response.text).toContain('"name": "my-portofolio-server"');
  });

  it("should be able to add static folder routing with basePath", async () => {
    const app = express();
    AppTools.createConfig()
      .addStaticFolder({ folderPath: "../", basePath: "/project" })
      .apply(app);
    const response = await request(app).get("/project/package.json");
    expect(response.status).toBe(200);
    expect(response.text).toContain('"name": "my-portofolio-server"');
  });

  it("should be able to add static folder routing as a ReactApp", async () => {
    const app = express();
    AppTools.createConfig()
      .addStaticFolder({
        folderPath: "../",
        useClientSideRouting: true,
        defaultPage: "package.json",
      })
      .apply(app);
    const response = await request(app).get("/unknow/path");
    expect(response.status).toBe(200);
    expect(response.text).toContain('"name": "my-portofolio-server"');
  });

  it("should be able to add static folder routing as a ReactApp with basePath", async () => {
    const app = express();
    AppTools.createConfig()
      .addStaticFolder({
        folderPath: "../",
        useClientSideRouting: true,
        defaultPage: "tsconfig.json",
        basePath: "/app",
      })
      .apply(app);
    const response = await request(app).get("/app/unknow/path");
    expect(response.status).toBe(200);
    expect(response.text).toContain("compilerOptions");
  });

  it("should be able to use configure simple route", async () => {
    const app = express();
    AppTools.configure(app, {
      "/": {
        routerSettings: [
          (router) => router.get("/hello", (req, res) => res.send("Hello")),
        ],
      },
    });
    const response = await request(app).get("/hello");
    expect(response.status).toBe(200);
  });

  it("should be able to use configure simple route with basePath", async () => {
    const app = express();
    AppTools.configure(app, {
      "/v1": {
        routerSettings: [
          (router) => router.get("/hello", (req, res) => res.send("Hello")),
        ],
      },
    });
    request(app).get("/hello").expect(404);
    const response = await request(app).get("/v1/hello");
    expect(response.status).toBe(200);
  });

  it("should be able to use configure static folder", async () => {
    const app = express();
    AppTools.configure(app, {
      "/v1": {
        staticFolders: [
          {
            folderPath: "../",
          },
        ],
      },
    });
    const response = await request(app).get("/v1/package.json");
    expect(response.status).toBe(200);
  });

  it("should throw error if basepath do not start with '/'", async () => {
    const app = express();

    expect(() => {
      AppTools.configure(app, {
        v1: {
          routerSettings: [
            (router) => router.get("/hello", (req, res) => res.send("Hello")),
          ],
        },
      });
    }).toThrow();
  });
});
