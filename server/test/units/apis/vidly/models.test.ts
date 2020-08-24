import { MongoMemoryServer } from "mongodb-memory-server"
import { isValidObjectId, Connection, createConnection } from "mongoose"
import Models, { MovieModel, GenreModel } from "@:api.vidly/models"

describe("Vidly models", () => {
  const server = MongoMemoryServer.create()
  var connection: Connection
  beforeAll(async () => {
    const uri = await (await server).getUri()
    connection = createConnection(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
    })
    Models(connection)
  })
  afterAll(async () => {
    await connection.close()
    await (await server).stop()
  })

  it("should be create Movie Data", async () => {
    const Movie = MovieModel()
    expect(Movie).toBeDefined()
    const result = await Movie.create({
      tconst: "tt0000001",
      title: "Unknow Title",
      year: 2015,
      duration: 96,
      genres: [],
    })
    expect(result).toHaveProperty("_id")
    expect(isValidObjectId(result._id)).toBe(true)
  })

  it("should be create Genre Data", async () => {
    const Genre = GenreModel()
    expect(Genre).toBeDefined()
    const result = await Genre.create({
      name: "Test",
    })
    expect(result).toHaveProperty("_id")
    expect(isValidObjectId(result._id)).toBe(true)
  })
})
