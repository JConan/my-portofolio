import { AppConfig, configRouter } from "@:app.tools";

const Hello: configRouter = (router) => {
  router.get("/hello", (req, res) => res.send("hello"));
};

const config: AppConfig = {
  "/": {
    routerSettings: [Hello],
    staticFolders: [
      {
        folderPath: "../react-ui/build",
        useClientSideRouting: true,
      },
    ],
  },
};
export default config;
