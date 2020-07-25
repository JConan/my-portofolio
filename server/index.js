const morgan = require("morgan");
const express = require("express");
const { createProxyMiddleware } = require("http-proxy-middleware");

const path = require("path");
const cluster = require("cluster");
const numCPUs = require("os").cpus().length;

const isDev = process.env.NODE_ENV !== "production";
const PORT = process.env.PORT || 3000;

// Multi-process to utilize all CPU cores.
if (!isDev && cluster.isMaster) {
  console.error(`Node cluster master ${process.pid} is running`);

  // Fork workers.
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on("exit", (worker, code, signal) => {
    console.error(
      `Node cluster worker ${worker.process.pid} exited: code ${code}, signal ${signal}`
    );
  });
} else {
  const app = express();

  // Priority serve any static files.
  app.use(morgan("combined"));
  // Proxy Todos API from JsonPlaceHolder
  app.use(
    "/api/todos",
    createProxyMiddleware({
      pathRewrite: (p) => p.replace(/^\/api\/todos\/(.*)/, "/todos/$1"),
      target: "https://jsonplaceholder.typicode.com",
      changeOrigin: true,
    })
  );

  app.get("/api/hello", (_, res) => res.send("Hello :)"));

  //app.use(express.static(path.resolve(__dirname, "../react-ui/build")));
  app.use(express.static(path.join(__dirname, "../react-ui/build")));
  app.get("/", function (req, res) {
    res.sendFile(path.join(__dirname, "build", "index.html"));
  });

  // Answer API requests.
  // app.get("/api", function (req, res) {
  //   res.set("Content-Type", "application/json");
  //   res.send('{"message":"Hello from the custom server!"}');
  // });

  // // All remaining requests return the React app, so it can handle routing.
  // app.get("*", function (request, response) {
  //   response.sendFile(
  //     path.resolve(__dirname, "../react-ui/build", "index.html")
  //   );
  // });

  app.listen(PORT, function () {
    console.error(
      `Node ${
        isDev ? "dev server" : "cluster worker " + process.pid
      }: listening on port ${PORT}`
    );
  });
}
