import { applyRouterSetting } from "@:app.tools";

export const Movies: applyRouterSetting = (route) => {
  route.get("/movies", (req, res) => {
    res.send([]);
  });
};
