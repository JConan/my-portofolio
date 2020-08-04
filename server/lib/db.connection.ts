import mongoose from "mongoose";
import _ from "lodash";

export interface DbConnection {
  [name: string]: mongoose.Connection;
}

export const mongooseConnections: DbConnection = {};

export const createConnection = (
  name: string,
  uri: string,
  options: mongoose.ConnectionOptions
): Promise<mongoose.Connection> => {
  const _connection = mongoose.createConnection(uri, options);
  mongooseConnections[name] = _connection;
  return new Promise<mongoose.Connection>(async (resolve, reject) =>
    _connection.then(resolve).catch(reject)
  );
};

export const closeConnection = (name: string): Promise<void> => {
  const _connection = mongooseConnections[name];
  delete mongooseConnections[name];
  return _connection.close();
};

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

export const load = (config: Config) => {
  const connectionErrors: { [name: string]: any } = {};
  const baseOptions = { ...defaultOption, ...config.globalOptions };
  const appEntries = Object.entries(config.applications);
  const promises = appEntries.map(([name, appConnection]) =>
    createConnection(name, appConnection.uri, {
      ...baseOptions,
      ...appConnection.options,
    }).catch((ex) => {
      connectionErrors[name] = ex;
      return ex;
    })
  );

  return new Promise<DbConnection>((resolve, reject) =>
    Promise.allSettled(promises).then((results) => {
      _.isEmpty(connectionErrors)
        ? resolve(mongooseConnections)
        : reject(connectionErrors);
    })
  );
};

export default {
  load,
};
