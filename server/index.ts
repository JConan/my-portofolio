import util from "util";
import db from "@:lib/db.connection";
import dbConfig from "./db.conf";

import system, { logger } from "./system";
import AppBuilder from "./app";

// Run application only in Worker Thread
logger.info(`system started with PID=${process.pid}`);
if (system.isWorker) {
  const cleanUpTask: { (): void }[] = [];

  db.load(dbConfig)
    .then(async (connections) => {
      Object.entries(connections).forEach(([name, connection]) => {
        const { host, port, db: _db } = connection;
        logger.info(
          `db connected for application [${name}] to uri [mongodb://${host}:${port}/${_db.databaseName}]`
        );

        const disconnectionTask = async () => {
          logger.info(`[${name}] database connection closing ...`);
          await connection
            .close()
            .then(() => logger.info(`[${name}] database connection closed`))
            .catch((ex) => logger.error(`[${name}] database error : ${ex}`));
        };
        cleanUpTask.push(disconnectionTask);
      });

      const config = (await import("@:app.config")).default;
      AppBuilder().apply(config).listen();
    })
    .catch((ex) => logger.error(util.inspect(ex)));

  ["SIGINT", "SIGTERM"].forEach((signal) =>
    process.on(signal, async () => {
      logger.info(`signal ${signal} received`);
      logger.info(`trigger cleanup task : ${cleanUpTask.length} `);
      await Promise.allSettled(
        cleanUpTask.map(
          (cleanUp) =>
            new Promise<void>((resolve, reject) => {
              try {
                resolve(cleanUp());
              } catch (ex) {
                reject(ex);
              }
            })
        )
      )
        .then(() => {
          logger.info("application exiting ...");
          process.exit(0);
        })
        .catch((ex) => {
          logger.error(ex);
          process.exit(999);
        });
    })
  );
}
