import system from "@:lib/system";
import logger from "@:lib/logger";
import App from "./app";

// Cluster initialize with module system
// Run application only in Worker Thread
logger.info(`system started with PID=${process.pid}`);
if (system.isWorker()) {
  App().init().listen().cleanupOnProcessSignal("SIGINT", "SIGTERM");
}
