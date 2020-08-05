import dbConnection from "@:lib/db.connection";
import { MongoMemoryServer } from "mongodb-memory-server";
import { VidlyModels } from "./Models";
import { isValidObjectId } from "mongoose";

describe("Vidly models", () => {
  const server = MongoMemoryServer.create();
  var models: VidlyModels;

  beforeAll(async () => {
    await dbConnection.load({
      applications: { vidly: { uri: await (await server).getUri() } },
    });
    models = (await import("./Models")).default;
  });

  it("should be create data", async () => {
    expect(models.movie).toBeDefined();
    const result = await models.movie.create({
      title: "Test Driven Design",
      genre: "documentary",
      rate: 5,
      stock: 1,
    });
    expect(result).toHaveProperty("_id");
    expect(isValidObjectId(result._id)).toBe(true);
  });
});
