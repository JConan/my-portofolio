import { Express, Router } from "express";
import { logger } from "./system";
import { createProxyMiddleware } from "http-proxy-middleware";
import { Hello } from "./routes/hello";

/**
 * configuration for static folder
 * path => folder
 */
export const staticDirectories = {
  "/": "../react-ui/build",
};

export type routeConfig = (router: Router) => void;
const createRoute = (config: routeConfig) => {
  const router = Router();
  config(router);
  return router;
};

export const apply = (app: Express) => {
  // proxy
  app.use(
    "/api/todos",
    createProxyMiddleware({
      pathRewrite: (p: string) => p.replace(/^\/api\/todos\/(.*)/, "/todos/$1"),
      target: "https://jsonplaceholder.typicode.com",
      changeOrigin: true,
      logProvider: () => logger,
    })
  );

  // list
  const routeConfigs: { [path: string]: Array<routeConfig> } = {
    "/v1": [Hello],
  };

  Object.entries(routeConfigs).forEach(([path, configs]) => {
    configs.forEach((routeConfig) => app.use(path, createRoute(routeConfig)));
  });
};
