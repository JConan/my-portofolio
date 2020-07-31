import express from "express";
import request from "supertest";
import { configure } from "@:app.tools";
import { RouteMovies } from "./RouteMovies";
import dbInMemory from "../../db.inMemory";
import ModelMovies, { IMovie } from "./ModelMovies";

// start database
const dbServer = dbInMemory.createServerConnection();
(async () => (await dbServer).connect())();

// insert data
[
  {
    _id: "5f2494a56fb3683e9c7c5b16",
    title: "hello",
    genre: "test",
    rate: 3,
    stock: 3,
  },
].forEach((m) => ModelMovies.create(m));

// init express app with router
const app = configure(express(), {
  "/": {
    routerSettings: [RouteMovies],
  },
});

describe("Vidly Movie APIs", () => {
  afterAll(async () => (await dbServer).close());

  it("should be able access to get /movies", async () => {
    const response = await request(app).get("/movies");
    expect(response.status).toBe(200);
    expect(response.body instanceof Array).toBe(true);
    const data: Array<IMovie> = response.body;
    expect(data).toHaveLength(1);
    expect(data[0]).toHaveProperty("title", "hello");
  });
});
