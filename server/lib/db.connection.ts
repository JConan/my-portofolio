import mongoose from "mongoose";
import _ from "lodash";

export interface DbConnection {
  [name: string]: mongoose.Connection;
}

export const connections: DbConnection = {};

export type ConnectionConfig = {
  uri: string;
  options?: mongoose.ConnectionOptions;
};

export const defaultOption: mongoose.ConnectionOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
};

export interface Config {
  globalOptions?: mongoose.ConnectionOptions;
  applications: {
    [name: string]: ConnectionConfig;
  };
}

export class ConnectionBuilder {
  private connections: DbConnection = {};
  private config?: Config;

  getConnections = () => {
    return { ...this.connections };
  };
  createConnection = (
    name: string,
    uri: string,
    options: mongoose.ConnectionOptions
  ): Promise<mongoose.Connection> => {
    const _connection = mongoose.createConnection(uri, options);
    this.connections[name] = _connection;
    return new Promise<mongoose.Connection>(async (resolve, reject) =>
      _connection.then(resolve).catch(reject)
    );
  };
  closeConnection = (name: string): Promise<void> => {
    const _connection = this.connections[name];
    delete this.connections[name];
    return _connection.close();
  };
  load = (config: Config) => {
    this.config = config;
    const connectionErrors: { [name: string]: any } = {};
    const baseOptions = { ...defaultOption, ...config.globalOptions };
    const appEntries = Object.entries(config.applications);
    const promises = appEntries.map(([name, appConnection]) =>
      this.createConnection(name, appConnection.uri, {
        ...baseOptions,
        ...appConnection.options,
      }).catch((ex) => {
        connectionErrors[name] = ex;
        return ex;
      })
    );

    return new Promise<DbConnection>((resolve, reject) =>
      Promise.allSettled(promises).then((results) => {
        if (_.isEmpty(connectionErrors)) {
          resolve(this.connections);
        } else {
          reject(connectionErrors);
        }
      })
    );
  };
}

const globalBuild = new ConnectionBuilder();

export default {
  getConnections: globalBuild.getConnections,
  load: globalBuild.load,
};
