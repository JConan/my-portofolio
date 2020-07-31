import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";

const mongooseOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
};

export interface IDbConnection {
  getUri: () => string;
  connect: () => Promise<typeof mongoose>;
}

class DbConnection implements IDbConnection {
  private _uri: string;

  constructor(uri: string) {
    this._uri = uri;
  }

  getUri() {
    return this._uri;
  }
  connect() {
    return mongoose.connect(this._uri, mongooseOptions);
  }
  close() {
    return mongoose.connection.close();
  }
}

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
  createServerConnection: (uri?: string) => {
    const _uri = uri || process.env.MONGODB_URI;
    if (_uri !== undefined) {
      return new DbConnection(_uri);
    } else {
      throw "createServer could not resolve URI.";
    }
  },
  createInMemoryServerConnection: async () => {
    const mongod = await MongoMemoryServer.create();
    const dbUri = await mongod.getUri();
    return new InMemoryServerDbConnection(mongod, dbUri);
  },
};
