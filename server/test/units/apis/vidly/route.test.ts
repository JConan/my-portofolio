import express, { Express } from "express"
import request from "supertest"
import { MongoMemoryServer } from "mongodb-memory-server"
import { Model, Connection, createConnection } from "mongoose"
import Models, { MovieDoc, MovieModel } from "@:api.vidly/models"
import { RouteMovies } from "@:api.vidly/route"

describe("Vidly APIs", () => {
  const server = MongoMemoryServer.create()
  var connection: Connection
  var app: Express

  beforeAll(async () => {
    const uri = await (await server).getUri()
    connection = createConnection(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    Models(connection)
    app = express().use(RouteMovies(connection))
  })
  afterAll(async () => {
    await connection.close()
    await (await server).stop()
  })

  describe("API movie", () => {
    const _id = "5f2ac85849bf3c6fa2d91000"
    const _idUnknow = "4f2ac85849bf3c6fa2d91000"
    var Movie: any

    beforeEach(async () => {
      Movie = MovieModel()
      const base = {
        year: 2015,
        genres: ["5f2ac85849bf3c6fa2d91001"],
        averageRate: 1,
        stock: 1,
      }
      const data = [
        Movie.create({ ...base, title: "a", tconst: "tt0000001", _id }),
        Movie.create({ ...base, title: "b", tconst: "tt0000002" }),
        Movie.create({ ...base, title: "c", tconst: "tt0000003" }),
      ]
      await Promise.all(data)
    })
    afterEach(async () => await Movie.collection.drop())

    it("should be able get all /movies", async () => {
      const response = await request(app).get("/movies")
      expect(response.status).toBe(200)
      expect(response.body instanceof Array).toBe(true)
      expect(response.body).toHaveLength(3)
      expect(response.body[0]).toHaveProperty("id")
      expect(response.body[0]).toHaveProperty("title")
    })

    it("should be able to get a particular movies", async () => {
      const response = await request(app).get(`/movies/${_id}`)
      expect(response.status).toBe(200)
    })
    it("should not be able to get a particular movies", async () => {
      const response = await request(app).get(`/movies/${_idUnknow}`)
      expect(response.status).toBe(404)
    })
  })
})
