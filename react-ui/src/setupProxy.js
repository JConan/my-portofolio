const isDev = process.env.NODE_ENV !== "production";
if (isDev) {
  const morgan = require("morgan");
  const { createProxyMiddleware } = require("http-proxy-middleware");
  module.exports = function (app) {
    app.use(morgan("combined"));
    app.use(
      "/api",
      createProxyMiddleware({
        pathRewrite: (p) => p.replace(/^\/api\/(.*)/, "/api/$1"),
        target: "http://localhost:5000",
        changeOrigin: true,
      })
    );
  };
}
