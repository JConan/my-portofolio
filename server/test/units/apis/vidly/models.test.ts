import { MongoMemoryServer } from "mongodb-memory-server";
import { isValidObjectId, Connection, createConnection } from "mongoose";
import Models from "@:api.vidly/models";

describe("Vidly models", () => {
  const server = MongoMemoryServer.create();
  var connection: Connection;
  beforeAll(async () => {
    const uri = await (await server).getUri();
    connection = createConnection(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  });
  afterAll(async () => {
    await connection.close();
    await (await server).stop();
  });

  it("should be create data", async () => {
    const { movie } = Models(connection);
    expect(movie).toBeDefined();
    const result = await movie.create({
      title: "Test Driven Design",
      genre: "documentary",
      rate: 5,
      stock: 1,
    });
    expect(result).toHaveProperty("_id");
    expect(isValidObjectId(result._id)).toBe(true);
  });
});
