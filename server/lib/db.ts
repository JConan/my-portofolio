import _ from "lodash";
import { ConnectionOptions } from "mongoose";

interface Config {
  uri: string;
  options?: ConnectionOptions;
}

export interface Configs {
  [appname: string]: Config;
}

export const getAppConfig = (
  appname: string,
  configs: Configs,
  defaultOptions?: ConnectionOptions
): Config => {
  const _options = { ...defaultOptions, ...configs[appname].options };
  const config: Config = {
    uri: configs[appname].uri,
    options: _.isEmpty(_options) ? undefined : _options,
  };
  return config;
};
