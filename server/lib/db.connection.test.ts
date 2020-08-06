import * as db from "./db.connection";
import { MongoMemoryServer } from "mongodb-memory-server";
import { logger } from "../system";
logger.transports[0].silent = true;

describe("database connection", () => {
  const dbUnreachable =
    "mongodb://127.0.0.2:1/?socketTimeoutMS=1&connectTimeoutMS=1&serverSelectionTimeoutMS=1";
  let dbServer: MongoMemoryServer;
  let dbUri: string;
  beforeAll(async () => {
    dbServer = await MongoMemoryServer.create();
    dbUri = await dbServer.getUri();
  });
  afterAll(async () => await dbServer.stop());

  describe("create connection with config", () => {
    it("should failed when no config is found", () => {
      expect.assertions(1);
      try {
        db.getConnection("failedApp");
      } catch (ex) {
        expect(ex.message).toBe(
          "no configuration found for application [failedApp]"
        );
      }
    });

    it("should be able to create connection from config", async () => {
      expect.assertions(1);
      db.load({ applications: { test: { uri: dbUri } } });
      const connection = db.getConnection("test");
      const { host, port } = connection;
      expect(dbUri).toMatch(new RegExp(`^mongodb://${host}:${port}/.*`));
      await connection.close();
    });

    it("should failed properly with invalid connection", async () => {
      db.load({ applications: { test: { uri: dbUnreachable } } });
      await db.getConnection("test").catch((ex) => {
        expect(ex.message).toMatch(
          /connection timed out|connect ECONNREFUSED/i
        );
      });
    });
  });
});
