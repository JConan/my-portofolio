import * as db from "@:lib/db";
import { ConnectionOptions } from "mongoose";

describe("db helpers", () => {
  it("should be able to retrieve app config", () => {
    const configs: db.Configs = {
      test: {
        uri: "some_uri",
      },
    };
    const appConfig = db.getAppConfig("test", configs);
    expect(appConfig).toEqual(configs.test);
  });
  it("should be able to mix additional config", () => {
    const defaultOptions: ConnectionOptions = {
      useNewUrlParser: true,
      useFindAndModify: false,
    };
    const configs: db.Configs = {
      test: {
        uri: "some_uri",
        options: {
          useUnifiedTopology: true,
          useFindAndModify: true,
        },
      },
    };
    const appConfig = db.getAppConfig("test", configs, defaultOptions);
    expect(appConfig.uri).toEqual(configs.test.uri);
    expect(appConfig.options).toHaveProperty("useNewUrlParser", true);
    expect(appConfig.options).toHaveProperty("useUnifiedTopology", true);
    expect(appConfig.options).toHaveProperty("useFindAndModify", true);
  });
});
