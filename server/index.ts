import system, { logger } from "./system";
import AppBuilder from "./app";
import config from "@:app.config";
import Db from "db";
import mongoose from "mongoose";

// Run application only in Worker Thread
if (system.isWorker) {
  const dbServer = Db.createServerConnection();
  dbServer.connect().then(() => {
    const { host, port, db } = mongoose.connection;
    logger.info(
      `Database connection created to host : 'mongodg://${host}:${port}/${db.databaseName}'`
    );
    AppBuilder().apply(config).listen();
  });

  // cleanup
  ["SIGINT", "SIGTERM"].forEach((signal) =>
    process.on(signal, async () => {
      logger.info(`receive signal ${signal}`);
      logger.info("closing database connection...");
      await dbServer.close();
      logger.info("application exit.");
      process.exit(0);
    })
  );
}

export {};
