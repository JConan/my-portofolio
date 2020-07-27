import system from "./system";
import app from "./app";

// Run application only in Worker Thread
if (system.isWorker) {
  app.listen();
}

export {};
