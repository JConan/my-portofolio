import os from "os";
import cluster from "cluster";
import _ from "lodash";
import winston, { format } from "winston";

const { combine, timestamp, label, printf, prettyPrint } = format;

/**
 * Configuration
 */
const loggerLevel = process.env.LOGGER_LEVEL || "debug";
const isProd = process.env.NODE_ENV === "production";
const useNodeCluster = (process.env.USE_NODE_CLUSTER && true) || false;
const numberOfCpu = os.cpus().length;

/**
 * Logger
 */
export const logger = winston.createLogger({
  format: combine(
    format.colorize(),
    timestamp({ format: "YYYY-MM-DD hh:mm:ss" }),
    printf((i) => `${i.timestamp} ${i.level}: ${i.message}`)
  ),
  transports: [new winston.transports.Console({ level: loggerLevel })],
});

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
useNodeCluster && fork(numberOfCpu);

const isWorker = !(useNodeCluster && cluster.isMaster);

export default {
  loggerLevel,
  isProd,
  useNodeCluster,
  numberOfCpu,
  isWorker,
};
