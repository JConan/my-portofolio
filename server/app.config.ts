import { AppConfig, configRouter } from "@:app.tools";
import { RouteMovies } from "@:app.vidly/RouteMovies";

const Hello: configRouter = (router) => {
  router.get("/hello", (req, res) => res.send("hello"));
};

const config: AppConfig = {
  "/": {
    staticFolders: [
      {
        folderPath: "../react-ui/build",
        useClientSideRouting: true,
      },
    ],
  },
  "/api/vidly": {
    routerSettings: [RouteMovies],
  },
};
export default config;
