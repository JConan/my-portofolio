import db from "@:lib/db.connection";
import { MongoMemoryServer } from "mongodb-memory-server";
import { isValidObjectId } from "mongoose";
import { logger } from "../../system";
logger.transports[0].silent = true;
//import Models from "./Models";

describe("Vidly models", () => {
  const server = MongoMemoryServer.create();

  beforeAll(async () => {
    db.load({
      applications: { vidly: { uri: await (await server).getUri() } },
    });
  });

  it("should be create data", async () => {
    const Models = require("./Models").default.movie;
    expect(Models).toBeDefined();
    const result = await Models.create({
      title: "Test Driven Design",
      genre: "documentary",
      rate: 5,
      stock: 1,
    });
    expect(result).toHaveProperty("_id");
    expect(isValidObjectId(result._id)).toBe(true);
  });
});
