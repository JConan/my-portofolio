import { DbConnection } from "./db";
import { MongoMemoryServer } from "mongodb-memory-server";

class InMemoryServerDbConnection extends DbConnection {
  private _mongod: MongoMemoryServer;

  constructor(mongod: MongoMemoryServer, uri: string) {
    super(uri);
    this._mongod = mongod;
  }

  close() {
    this._mongod.stop();
    return super.close();
  }
}

export default {
  createServerConnection: async () => {
    const mongod = await MongoMemoryServer.create();
    const dbUri = await mongod.getUri();
    return new InMemoryServerDbConnection(mongod, dbUri);
  },
};
