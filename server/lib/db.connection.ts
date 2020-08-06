import mongoose, { Connection, ConnectionOptions } from "mongoose";
import _ from "lodash";
import { logger } from "../system";
import util from "util";

export interface Config {
  globalOptions?: mongoose.ConnectionOptions;
  applications: {
    [name: string]: {
      uri: string;
      options?: mongoose.ConnectionOptions;
    };
  };
}

var _config: Config = { applications: {} };

export const load = (config: Config) => {
  _config = _.cloneDeep(config);
};

export const defaultOption: ConnectionOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
};

type mongooseConnection = Connection & {
  then: Promise<Connection>["then"];
  catch: Promise<Connection>["catch"];
};

export const getConnection = (appname: string): mongooseConnection => {
  if (_config.applications[appname] === undefined)
    throw new Error(`no configuration found for application [${appname}]`);
  const options = {
    ...defaultOption,
    ..._config.globalOptions,
    ..._config.applications[appname].options,
  };
  const connection = mongoose.createConnection(
    _config.applications[appname].uri,
    options
  );
  connection
    .then(() => {
      const { host, port, name } = connection;
      logger.info(`[${appname}] connected to mongod://${host}:${port}/${name}`);
    })
    .catch((ex) => {
      logger.error(JSON.stringify(ex, null, 4));
    });

  return connection;
};

export default {
  getConnection,
  load,
};
