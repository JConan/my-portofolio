import * as dbConnection from "./db.connection";
import db from "./db.connection";
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";

describe("database connection", () => {
  const dbUnreachable =
    "mongodb://127.0.0.2:12345/?appname=toFailed&socketTimeoutMS=1&connectTimeoutMS=1&serverSelectionTimeoutMS=1&reconnectTries=0";
  let dbServer: MongoMemoryServer;
  beforeAll(async () => (dbServer = await MongoMemoryServer.create()));
  afterAll(async () => await dbServer.stop());

  describe("config resolution", () => {
    it("should be able to resolve options - no args", () => {
      const options = dbConnection.resolveOptions();
      expect(options).toHaveProperty("useNewUrlParser", true);
      expect(options).toHaveProperty("useUnifiedTopology", true);
      expect(Object.keys(options)).toHaveLength(2);
    });
    it.each([
      ["undefined, undefined", undefined, undefined],
      ["defined, undefined", { appname: "globalApp" }, undefined],
      ["undefined, defined", undefined, { appname: "App" }],
      ["defined, defined", { appname: "globalApp" }, { appname: "App" }],
    ])("should be able to resolve options - %s", (_, global, app) => {
      const options = dbConnection.resolveOptions({ global, app });
      expect(options).toHaveProperty("useNewUrlParser", true);
      expect(options).toHaveProperty("useUnifiedTopology", true);

      if (global === undefined && app === undefined) {
        expect(Object.keys(options)).toHaveLength(2);
        expect(options).not.toHaveProperty("appname");
      } else {
        expect(options).toHaveProperty("appname");

        if (global !== undefined && app === undefined) {
          expect(options).toHaveProperty("appname", "globalApp");
        } else if (app !== undefined) {
          expect(options).toHaveProperty("appname", "App");
        }
      }
    });
  });

  describe("create connection with wrapper", () => {
    let dbUri: string;
    beforeAll(async () => (dbUri = await dbServer.getUri()));

    it("should successfully create a connection", async () => {
      expect.assertions(1);
      const result = await dbConnection.createConnection(dbUri);
      expect(result.connection?.readyState).toBe(mongoose.STATES.connected);
    });

    it("should failed the connection creation", async () => {
      expect.assertions(1);
      try {
        await dbConnection.createConnection(
          dbUnreachable,
          dbConnection.defaultOption
        );
      } catch (ex) {
        expect(ex.error).toContain("MongooseServerSelectionError");
      }
    });
  });

  describe("create connections with configBuilder", () => {
    let uri: string;
    beforeAll(async () => (uri = await dbServer.getUri()));

    it("should be able to create single connection", async () => {
      expect.assertions(4);
      const builder = new dbConnection.ConnectionBuilder();
      builder.addApplication("test", { uri });
      const connections = await builder.getConnections();
      expect(connections).toHaveProperty("test");

      const { test } = connections;
      expect(test).toHaveProperty("connection");
      expect(test.connection).toBeInstanceOf(mongoose.Connection);
      expect(test.connection?.readyState).toBe(mongoose.STATES.connected);
    });

    it("should be able to create multiple connection", async () => {
      const builder = new dbConnection.ConnectionBuilder();
      builder.addApplication("first", { uri });
      builder.addApplication("second", { uri });

      const connections = await builder.getConnections();
      expect(connections).toBeInstanceOf(Object);
      expect(connections).toHaveProperty("first");
      expect(connections).toHaveProperty("second");

      const { first, second } = connections;
      expect(first.connection?.readyState).toBe(mongoose.STATES.connected);
      expect(second.connection?.readyState).toBe(mongoose.STATES.connected);
    });

    it("should able to failed", async () => {
      expect.assertions(2);
      const builder = new dbConnection.ConnectionBuilder();
      builder.addApplication("failed", { uri: dbUnreachable });

      await builder.getConnections().catch((ex) => {
        expect(ex).toHaveProperty("error");
        expect(ex.error).toContain("MongooseServerSelectionError");
      });
    });
  });

  describe("create connection with builder and config", () => {
    let uri: string;
    beforeAll(async () => (uri = await dbServer.getUri()));

    it("should be able to connect", async () => {
      const config: dbConnection.Config = {
        applications: {
          test: { uri },
        },
      };

      const build = await new dbConnection.ConnectionBuilder(
        config
      ).getConnections();
      expect(build).toHaveProperty("test");
      expect(build.test.connection?.readyState).toBe(mongoose.STATES.connected);
    });

    it("should be able to failed", async () => {
      const config: dbConnection.Config = {
        globalOptions: {
          connectTimeoutMS: 1,
          serverSelectionTimeoutMS: 1,
          socketTimeoutMS: 1,
          reconnectTries: 0,
        },
        applications: {
          test: { uri: "mongodb://127.0.0.2:12345/?" },
        },
      };

      await new dbConnection.ConnectionBuilder(config)
        .getConnections()
        .catch((ex) => {
          expect(ex).toHaveProperty("error");
          expect(ex.error).toContain("MongooseServerSelectionError");
        });
    });
  });

  describe("create connection with default builder", () => {
    let uri: string;
    beforeAll(async () => (uri = await dbServer.getUri()));

    it("should be able to create a connection", async () => {
      const builder = db.load({ applications: { test: { uri } } });
      expect(builder).toBeInstanceOf(dbConnection.ConnectionBuilder);

      const connections = await db.getConnections();
      expect(connections).toHaveProperty("test");
      expect(connections.test.connection?.readyState).toBe(
        mongoose.STATES.connected
      );
    });

    it("should be able to create multiple connection", async () => {
      const builder = db.load({
        applications: {
          first: { uri },
          second: { uri },
        },
      });
      expect(builder).toBeInstanceOf(dbConnection.ConnectionBuilder);

      const connections = await db.getConnections();
      expect(connections).toHaveProperty("first");
      expect(connections).toHaveProperty("second");
    });
  });

  describe("test", () => {
    it("should connect", async () => {
      const server =
        "mongodb+srv://cluster0.nphmt.mongodb.net/portofolio?replicaSet=atlas-4rp68m-shard-0&w=majority&readPreference=primary&appname=MyPortofolio&retryWrites=true&ssl=true";
      const user = "dbUser";
      const password = "rPrgB1H8DP8SXbHd";

      db.load({
        applications: {
          cloud: {
            uri: server,
            options: {
              auth: {
                user,
                password,
              },
            },
          },
        },
      });

      const connection = await db.getConnections();

      expect(connection.cloud.connection?.readyState).toBe(
        mongoose.STATES.connected
      );
    });
  });
});
