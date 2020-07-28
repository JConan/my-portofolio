const morgan = require("morgan");
const { createProxyMiddleware } = require("http-proxy-middleware");
const isDev = process.env.NODE_ENV !== "production";

let setup = () => {};

if (isDev) {
  setup = function (app) {
    app.use(morgan("combined"));
    app.use(
      "/api",
      createProxyMiddleware({
        pathRewrite: (p) => p.replace(/^\/api\/(.*)/, "/api/$1"),
        target: "http://localhost:5000",
        changeOrigin: true,
      })
    );
    console.log("setupProxy : loaded DEV config");
  };
} else {
  setup = function (app) {
    const PORT = process.env.PORT;
    app.use(
      "/api",
      createProxyMiddleware({
        pathRewrite: (p) => p.replace(/^\/api\/(.*)/, "/api/$1"),
        target: "http://localhost:" + PORT,
        changeOrigin: true,
      })
    );
    console.log("setupProxy : loaded DEV config with port: " + PORT);
  };
}

module.exports = setup;
