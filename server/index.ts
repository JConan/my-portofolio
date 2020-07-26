import { App } from "./App";
import cluster from "cluster";

const numCPUs = 2; //require("os").cpus().length;

const isDev = process.env.NODE_ENV !== "production";
const PORT = (process.env.PORT && Number.parseInt(process.env.PORT)) || 5000;
const INCLUDE_REACT_UI = process.env.INCLUDE_REACT_UI !== undefined;

// Multi-process to utilize all CPU cores.
if (!isDev && cluster.isMaster) {
  console.error(`Node cluster master ${process.pid} is running`);
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }
  cluster.on(
    "exit",
    (worker: { process: { pid: any } }, code: any, signal: any) => {
      console.error(
        `Node cluster worker ${worker.process.pid} exited: code ${code}, signal ${signal}`
      );
    }
  );
} else {
  const app = App({
    port: PORT,
    isDev,
    httpProxies: {
      "Proxy to JsonPlaceHolder Todos API": {
        "/api/todos": {
          pathRewrite: (p: string) =>
            p.replace(/^\/api\/todos\/(.*)/, "/todos/$1"),
          target: "https://jsonplaceholder.typicode.com",
          changeOrigin: true,
        },
      },
    },
    serverStaticDirectories: {
      "/": "../react-ui/build",
    },
  });
  app.start();
}

export {};
