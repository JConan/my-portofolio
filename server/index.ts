const morgan = require("morgan");
const express = require("express");
const { createProxyMiddleware } = require("http-proxy-middleware");

const path = require("path");
const cluster = require("cluster");
const numCPUs = require("os").cpus().length;

const isDev = process.env.NODE_ENV !== "production";
const PORT = process.env.PORT || 5000;

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
  const app = express();
  app.use(morgan("combined"));
  app.use(
    "/api/todos",
    createProxyMiddleware({
      pathRewrite: (p: string) => p.replace(/^\/api\/todos\/(.*)/, "/todos/$1"),
      target: "https://jsonplaceholder.typicode.com",
      changeOrigin: true,
    })
  );

  if (!isDev) {
    // security package
    app.use(require("helmet")());

    // PRODUCTION : serve 'react-ui'
    app.use(express.static(path.join(__dirname, "../react-ui/build")));
    app.get("/", function (_req: any, res: { sendFile: (arg0: any) => void }) {
      res.sendFile(path.join(__dirname, "../react-uibuild", "index.html"));
    });
  }

  app.listen(PORT, function () {
    console.error(
      `Node ${
        isDev ? "dev server" : "cluster worker " + process.pid
      }: listening on port ${PORT}`
    );
  });
}

export {};
