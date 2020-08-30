import { Configs, getAppConfig } from "@:lib/db"
import mongoose, { ConnectionOptions } from "mongoose"

const defaultOptions: ConnectionOptions = {
  useCreateIndex: true,
  useFindAndModify: false,
  useNewUrlParser: true,
  useUnifiedTopology: true,
  keepAliveInitialDelay: 30000,
}

const configs: Configs = {
  portofolio: {
    uri: process.env.PORTOFOLIO_DB_URI || "",
    options: {
      auth: {
        user: process.env.PORTOFOLIO_DB_USER || "",
        password: process.env.PORTOFOLIO_DB_PASSWORD || "",
      },
    },
  },
  vidly: {
    uri: process.env.VIDLY_DB_URI || "",
    options: {
      auth: {
        user: process.env.VIDLY_DB_USER || "",
        password: process.env.VIDLY_DB_PASSWORD || "",
      },
    },
  },
  local: {
    uri: process.env.LOCAL_DB_URI || "",
  },
}

export const getAppConnection = (appname: string) => {
  const config = getAppConfig(appname, configs, defaultOptions)
  return mongoose.createConnection(config.uri, config.options)
}

export default {
  getAppConnection,
  configs,
}
