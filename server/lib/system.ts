import os from "os";
import cluster from "cluster";
import _ from "lodash";
import logger from "@:lib/logger";
/**
 * Configuration
 */
const nodeEnv = String(process.env.NODE_ENV || "development");
const useNodeCluster = (process.env.USE_NODE_CLUSTER && true) || false;
const numberOfThread = Number.parseInt(
  process.env.NUMBER_OF_THREAD || "" + os.cpus().length
);

/**
 * Node Cluster forking
 */
const fork = (nIntance: number) => {
  if (cluster.isMaster) {
    logger.info("creating fork... " + nIntance);
    _.range(nIntance).forEach(() => {
      cluster.fork();
    });
    cluster.on("exit", (worker, code, signal) => {
      logger.info(
        `Node cluster worker ${worker.process.pid} exited: code ${code}, signal ${signal}`
      );
    });
    logger.info(`Node cluster master ${process.pid} is running`);
  } else {
    logger.info(`Node cluster worker ${process.pid} is running`);
  }
};
useNodeCluster && fork(numberOfThread);

export const system = {
  isWorker: () => !(useNodeCluster && cluster.isMaster),
  env: {
    isProd: () => nodeEnv === "production",
    isDev: () => nodeEnv === "development",
    isTest: () => nodeEnv === "test",
  },
};

export default system;
