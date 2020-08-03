import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";

class InMemoryServerDbConnection {
  private mongod?: MongoMemoryServer;
  private dbUri?: string;
  private connection?: typeof mongoose

  private init() {
    return new Promise<string>(async (resolve, reject) => {
      this.mongod = await MongoMemoryServer.create();
      this.dbUri = await this.mongod.getUri();
      resolve(this.dbUri)
    })
  }

  getUri = () => this.dbUri || false

  connect = async () => {
    const uri = await this.init()
    this.connection = await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    return this;
  }

  disconnect = async () => {
    if (this.connection && this.mongod) {
      await this.connection.disconnect()
      await this.mongod.stop();
      this.mongod = undefined
      this.connection = undefined
      this.dbUri = undefined
    } else {
      throw 'InMemoryServerDbConnection - nothing to close'
    }
  }
}

export default {
  createServerConnection: () => {
    return new InMemoryServerDbConnection();
  },
};
