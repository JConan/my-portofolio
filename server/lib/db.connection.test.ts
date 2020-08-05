import { connections, defaultOption } from "./db.connection";
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

  describe("create connection", () => {
    it("should be able open/close named connection", async () => {
      const builder = new db.ConnectionBuilder();
      expect.assertions(5);
      await builder.createConnection("test", dbUri, defaultOption);
      const { test, toto } = builder.getConnections();
      expect(test).toBeDefined();
      expect(toto).toBeUndefined();
      expect(test.readyState).toBe(mongoose.STATES.connected);

      await builder.closeConnection("test");
      expect(test.readyState).toBe(mongoose.STATES.disconnected);
      expect(connections.test).toBeUndefined();
    });

    it("should be able to failed properly", async () => {
      const builder = new db.ConnectionBuilder();
      expect.assertions(1);
      try {
        await builder.createConnection("test", dbUnreachable, defaultOption);
      } catch (ex) {
        expect(String(ex)).toContain("MongooseServerSelectionError");
      }
    });
  });

  describe("create with config", () => {
    it("should be able to create one connectiong", async () => {
      const builder = new db.ConnectionBuilder();
      expect.assertions(1);
      await builder.load({ applications: { fooApp: { uri: dbUri } } });
      expect(builder.getConnections().fooApp).toBeDefined();
    });

    it("should be able to create multiple connection", async () => {
      const builder = new db.ConnectionBuilder();
      expect.assertions(3);
      await builder.load({
        applications: {
          fooApp: { uri: dbUri },
          barApp: { uri: dbUri },
          testApp: { uri: dbUri },
        },
      });
      expect(builder.getConnections().fooApp).toBeDefined();
      expect(builder.getConnections().barApp).toBeDefined();
      expect(builder.getConnections().testApp).toBeDefined();
    });

    it("should be able to failed properly with config", async () => {
      const builder = new db.ConnectionBuilder();
      expect.assertions(1);
      try {
        await builder.load({
          applications: { fooApp: { uri: dbUnreachable } },
        });
      } catch (ex) {
        expect(JSON.stringify(ex)).toMatch(/ECONNREFUSED|connection timed out/);
      }
    });

    it("should be able to failed properly with multiple connection", async () => {
      const builder = new db.ConnectionBuilder();
      expect.assertions(1);
      try {
        await builder.load({
          applications: {
            fooApp: { uri: dbUri },
            barApp: { uri: dbUri },
            failedApp: { uri: dbUnreachable },
          },
        });
      } catch (ex) {
        expect(JSON.stringify(ex)).toMatch(/ECONNREFUSED|connection timed out/);
      }
    });
  });
});
