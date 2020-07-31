import db from "./db";
import dbInMemory from "./db.inMemory";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

describe("db connection - basic connection test", () => {
  var mongod: MongoMemoryServer;
  var uri: string;

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    uri = await mongod.getUri();
    delete process.env.MONGODB_URI;
  });
  afterAll(async () => {
    await mongod.stop();
  });

  it("should be able to correctly initialize in memory server", () => {
    expect(uri.startsWith("mongodb://127.0.0.1")).toBe(true);
  });

  it("should throw an error when URI could not be resolve", () => {
    expect.assertions(1);
    try {
      db.createServerConnection();
    } catch (ex) {
      expect(ex).toBe("createServer could not resolve URI.");
    }
  });

  it("should be able to connect to URI", async () => {
    expect.assertions(2);
    const server = db.createServerConnection(uri);
    await server.connect();
    expect(mongoose.connection.readyState).toBe(mongoose.STATES.connected);

    await server.close();
    expect(mongoose.connection.readyState).not.toBe(mongoose.STATES.connected);
  });

  it("should be able to connect to process.env.MONGODB_URI", async () => {
    expect.assertions(3);
    process.env.MONGODB_URI = uri;
    const server = db.createServerConnection();
    expect(server.getUri()).toBe(uri);

    await server.connect();
    expect(mongoose.connection.readyState).toBe(mongoose.STATES.connected);

    await server.close();
    expect(mongoose.connection.readyState).not.toBe(mongoose.STATES.connected);
  });

  it("should be able to create an InMemoryServer", async () => {
    expect.assertions(3);
    const server = await dbInMemory.createServerConnection();
    expect(server.getUri()).toMatch(/^mongodb:\/\/127.0.0.1:[0-9]+.*/i);

    await server.connect();
    expect(mongoose.connection.readyState).toBe(mongoose.STATES.connected);

    await server.close();
    expect(mongoose.connection.readyState).not.toBe(mongoose.STATES.connected);
  });
});
