import { mongooseConnections, defaultOption } from "./db.connection";
import * as db from "./db.connection";
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";

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

  describe("create named connection", () => {
    it("should be able open/close named connection", async () => {
      expect.assertions(5);
      await db.createConnection("test", dbUri, defaultOption);
      const { test, toto } = mongooseConnections;
      expect(test).toBeDefined();
      expect(toto).toBeUndefined();
      expect(test.readyState).toBe(mongoose.STATES.connected);

      await db.closeConnection("test");
      expect(test.readyState).toBe(mongoose.STATES.disconnected);
      expect(mongooseConnections.test).toBeUndefined();
    });

    it("should be able to failed properly", async () => {
      expect.assertions(1);
      try {
        await db.createConnection("test", dbUnreachable, defaultOption);
      } catch (ex) {
        expect(String(ex)).toContain("MongooseServerSelectionError");
      }
    });
  });

  describe("create with config", () => {
    it("should be able to create connection with config", async () => {
      expect.assertions(1);
      await db.load({ applications: { fooApp: { uri: dbUri } } });
      expect(mongooseConnections.fooApp).toBeDefined();
    });

    it("should be able to failed properly with config", async () => {
      expect.assertions(1);
      try {
        await db.load({
          applications: { fooApp: { uri: dbUnreachable } },
        });
      } catch (ex) {
        expect(JSON.stringify(ex)).toMatch(/ECONNREFUSED|connection timed out/);
      }
    });
  });
});
