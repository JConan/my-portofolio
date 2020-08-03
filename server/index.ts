import db from "@:lib/db.connection";
import dbConfig from "./db.conf";

import system, { logger } from "./system";
import AppBuilder from "./app";
import config from "@:app.config";

// Run application only in Worker Thread
logger.info(`sys started with PID=${process.pid}`);
if (system.isWorker) {
  const cleanUpTask: { (): void }[] = [];

  db.load(dbConfig)
    .getConnections()
    .then((connections) => {
      Object.entries(connections).forEach(([name, app]) => {
        if (app.connection !== undefined) {
          const { host, port, db: _db } = app.connection;
          logger.info(
            `db connected for application [${name}] to uri [mongodb://${host}:${port}/${_db.databaseName}]`
          );
        }

        const disconnectionTask = async () => {
          logger.info(`[${name}] database connection closing ...`);
          await app.connection
            ?.close()
            .then(() => logger.info(`[${name}] database connection closed`))
            .catch((ex) => logger.error(`[${name}] database error : ${ex}`));
        };
        cleanUpTask.push(disconnectionTask);
      });

      AppBuilder().apply(config).listen();
    })
    .catch((ex) => logger.error(ex.error));

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
