import system from "./system";
import AppBuilder from "./app";
import config from "@:app.config";

// Run application only in Worker Thread
if (system.isWorker) {
  AppBuilder().apply(config).listen();
}

export {};
