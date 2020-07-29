import { AppConfig, applyRouterSetting } from "@:app.tools";

const Hello: applyRouterSetting = (router) => {
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
