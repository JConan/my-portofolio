import { Express, Router } from "express";
import { Hello } from "@:app.routes/hello";

/**
 * configuration for static folder
 * path => folder
 */
export const staticDirectories = {
  "/": "../react-ui/build",
};

export type routeConfig = (router: Router) => void;

// Helpers to create route and config
export const createRoute = (config: routeConfig) => {
  const router = Router();
  config(router);
  return router;
};

export const apply = (app: Express) => {
  // list of route components
  const routeConfigs: { [path: string]: Array<routeConfig> } = {
    "/v1": [Hello],
  };

  // load routes
  Object.entries(routeConfigs).forEach(([path, configs]) => {
    configs.forEach((routeConfig) => app.use(path, createRoute(routeConfig)));
  });
};
