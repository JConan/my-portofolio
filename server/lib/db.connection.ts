import mongoose from "mongoose";

type ConnectionSuccess = { connection?: mongoose.Connection };
type ConnectionFailure = { error?: string };
type ConnectionConfig = { uri: string; options?: mongoose.ConnectionOptions };
type Connection = ConnectionSuccess & ConnectionFailure;

export interface Config {
  globalOptions?: mongoose.ConnectionOptions;
  applications: {
    [name: string]: ConnectionConfig;
  };
}
export interface DbConnections {
  [name: string]: Connection;
}

export const defaultOption: mongoose.ConnectionOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
};

/**
 * Mongoose.createConnection Promise wrapper
 *
 * @param uri Mongodb URI
 * @param options Mongoose/Mongodb connections Options
 * @returns ConnectionSuccess
 * @error   ConnectionFailure
 */
export const createConnection = async (
  uri: string,
  options: mongoose.ConnectionOptions = defaultOption
) => {
  return new Promise<ConnectionSuccess>(async (resolve, reject) => {
    mongoose
      .createConnection(uri, options)
      .then((connection) => resolve({ connection }))
      .catch((error) => reject({ error: String(error) }));
  });
};

interface options {
  global?: mongoose.ConnectionOptions;
  app?: mongoose.ConnectionOptions;
}
export const resolveOptions = (extraOptions?: options) => {
  const { global, app } = extraOptions || {};
  return { ...defaultOption, ...global, ...app };
};

export class ConnectionBuilder {
  private _configs: Config = { applications: {} };
  private _compile?: Promise<DbConnections>;

  constructor(config?: Config) {
    this.load(config || { applications: {} });
  }

  private compile = async (): Promise<DbConnections> => {
    const compile = Object.entries(this._configs.applications)
      .map(([name, config]) => ({
        name,
        uri: config.uri,
        options: resolveOptions({
          global: this._configs.globalOptions,
          app: config.options,
        }),
      }))
      .map(
        async (appConfig): Promise<DbConnections> => ({
          [appConfig.name]: await createConnection(
            appConfig.uri,
            appConfig.options
          ),
        })
      )
      .reduce(
        async (acc, appConnection): Promise<DbConnections> => ({
          ...(await acc),
          ...(await appConnection),
        })
      );

    this._compile = compile;
    return compile;
  };

  addApplication = (name: string, connectionConfig: ConnectionConfig) => {
    this._configs.applications[name] = {
      ...this._configs.applications,
      ...connectionConfig,
    };
  };

  getConnections = async () => {
    return await this.compile();
  };

  load(config: Config) {
    this._configs = config;
    return this;
  }
}

const defaultBuilder = new ConnectionBuilder();

export default {
  load: (config: Config) => defaultBuilder.load(config),
  getConnections: async () => await defaultBuilder.getConnections(),
};
