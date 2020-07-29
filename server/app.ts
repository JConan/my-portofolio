import express, { Express } from "express";
import helmet from "helmet";
import morgan from "morgan";
import system, { logger } from "./system";
import { AppConfig, configure } from "@:app.tools";

class AppBuild {
  private app: Express;

  constructor() {
    this.app = express();
    this.app.use(helmet());
    this.app.use(morgan(system.isProd ? "tiny" : "combined"));
  }

  apply = (config: AppConfig) => {
    configure(this.app, config);
    return this;
  };

  listen = () => {
    const port = process.env.PORT || "5000";
    this.app.listen(port, () => {
      logger.info(`application listening on port: ${port}`);
    });
  };
}

export default () => new AppBuild();
