import dbInMemory from "./db.inMemory";
import mongoose from "mongoose";
const {
  connection,
  STATES,
  Schema,
  Types: { ObjectId },
} = mongoose;

describe("in mememory db - for unit testing purpose", () => {
  const dbServer = dbInMemory.createServerConnection();

  describe("connect & disconnect mutiple times", () => {
    beforeEach(async () => {
      expect.assertions(5);
      expect(dbServer.getUri()).toBe(false);
      try {
        await dbServer.disconnect();
      } catch (ex) {
        expect(ex).toBe("InMemoryServerDbConnection - nothing to close");
      }
      await dbServer.connect();
    });

    afterEach(async () => {
      await dbServer.disconnect();
      expect(connection.readyState).not.toBe(STATES.connected);
    });

    it.each([1, 2, 3])("should able to check connection state", () => {
      expect(dbServer.getUri()).toMatch(/^mongodb:\/\/127.0.0.1:[0-9]+.*/i);
      expect(connection.readyState).toBe(STATES.connected);
    });
  });

  describe("test insert/remove data from a connection", () => {
    const model = mongoose.model("test", new Schema({}, { strict: false }));
    beforeAll(async () => await dbServer.connect());
    afterAll(async () => await dbServer.disconnect());

    beforeEach(async () => {
      expect.assertions(3);
      const result = await model.collection.insertMany([
        { _id: ObjectId("5f258b1eb04cac066446b960"), test: "inMemory" },
        {},
        {},
      ]);
      expect(result.insertedCount).toBe(3);
    });
    afterEach(async () => await model.collection.drop());

    it.each([1, 2, 3])("should be able to retrieve data", async () => {
      const allDatas = await model.find().exec();
      expect(allDatas).toHaveLength(3);

      const oneData = await model.findById("5f258b1eb04cac066446b960").exec();
      expect(oneData?.toJSON()).toHaveProperty("test", "inMemory");
    });
  });
});
