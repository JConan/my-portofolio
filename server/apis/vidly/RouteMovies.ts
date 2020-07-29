import { routerConfig } from "express.helpers";

export const Movies: routerConfig = (route) => {
  route.get("/movies", (req, res) => {
    res.send([]);
  });
};
