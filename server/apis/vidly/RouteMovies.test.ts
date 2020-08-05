import express, { Express } from "express";
import request from "supertest";
import { MongoMemoryServer } from "mongodb-memory-server";
import { configure } from "@:app.tools";
import { VidlyModels } from "./Models";
import dbConnection from "@:lib/db.connection";

describe("Vidly APIs", () => {
  const server = MongoMemoryServer.create();
  var models: VidlyModels;
  var app: Express;

  beforeAll(async () => {
    // database
    await dbConnection.load({
      applications: { vidly: { uri: await (await server).getUri() } },
    });
    models = (await import("./Models")).default;
    // application
    app = configure(express(), {
      "/": {
        routerSettings: [(await import("./RouteMovies")).RouteMovies],
      },
    });
  });
  afterAll(async () => await (await server).stop());

  describe("API movie", () => {
    const _id = "5f2ac85849bf3c6fa2d91000";
    const _idUnknow = "4f2ac85849bf3c6fa2d91000";
    beforeEach(async () => {
      const data = [
        models.movie.create({ title: "a", genre: "a", rate: 1, stock: 1, _id }),
        models.movie.create({ title: "b", genre: "b", rate: 2, stock: 2 }),
        models.movie.create({ title: "c", genre: "c", rate: 3, stock: 3 }),
      ];
      await Promise.all(data);
    });
    afterEach(async () => await models.movie.collection.drop());

    it("should be able get all /movies", async () => {
      const response = await request(app).get("/movies");
      expect(response.status).toBe(200);
      expect(response.body instanceof Array).toBe(true);
      expect(response.body).toHaveLength(3);
      expect(response.body[0]).toHaveProperty("id");
      expect(response.body[0]).toHaveProperty("title");
    });

    it("should be able to get a particular movies", async () => {
      const response = await request(app).get(`/movies/${_id}`);
      expect(response.status).toBe(200);
    });
    it("should not be able to get a particular movies", async () => {
      const response = await request(app).get(`/movies/${_idUnknow}`);
      expect(response.status).toBe(404);
    });
  });
});
