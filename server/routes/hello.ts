import { routeConfig } from "@:app.config";

export const Hello: routeConfig = (router) => {
  router.get("/hello", (req, res) => res.send("hi"));
};
