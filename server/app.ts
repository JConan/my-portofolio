import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import system, { logger } from "./system";
import sysPath from "path";
import * as appConfig from "./app.config";

const port = process.env.PORT || "5000";
const app = express();

/**
 * Application Security & Logging
 */
app.use(helmet());
app.use(morgan(system.isProd ? "tiny" : "combined"));

/**
 * apply configuratoin
 */
appConfig.apply(app);

/**
 * serve static folders
 */
Object.entries(appConfig.staticDirectories).forEach(([path, folder]) => {
  app.use(path, express.static(sysPath.join(__dirname, folder)));
  logger.info(`serve-static: ${path} -> ${folder}`);
});

/**
 * Run express application on configured port
 * @param app: Express
 */
const listen = () => {
  app.listen(port, () => {
    logger.info(`application listening on port: ${port}`);
  });
};

export default {
  instance: app,
  listen,
};
