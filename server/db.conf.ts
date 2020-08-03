import { Config } from "@:lib/db.connection";

const config: Config = {
  applications: {
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
  },
};

export default config;
