import db from "@:lib/db.connection";
import dbConfig from "./db.conf";

import system, { logger } from "./system";
import AppBuilder from "./app";

// Run application only in Worker Thread
logger.info(`system started with PID=${process.pid}`);
if (system.isWorker) {
  db.load(dbConfig);
  AppBuilder().apply(require("@:app.config").default).listen();

  ["SIGINT", "SIGTERM"].forEach((signal) =>
    process.on(signal, async () => {
      logger.info("application exiting ...");
      process.exit(0);
    })
  );
}
