import express, { Express, Router } from "express";
import sysPath from "path";

export type applyRouterSetting = (router: Router) => void;

export interface AppConfig {
  [basePath: string]: {
    routerSettings?: Array<applyRouterSetting>;
    staticFolders?: Array<StaticFolderProps>;
  };
}

export interface StaticFolderProps {
  basePath?: string;
  folderPath: string;
  useClientSideRouting?: boolean;
  defaultPage?: string;
}

const setRouterBasePath = (basePath: string, router: Router): Router => {
  if (!basePath.startsWith("/"))
    throw `AppTools: basePath must start with '/' but received ${basePath}`;
  const basePathRouter = Router();
  basePathRouter.use(basePath, router);
  return basePathRouter;
};

class AppConfigBuilder {
  private _routers: Array<Router> = [];
  private _staticFolders: Array<Router> = [];

  addRouterSetting = (
    applyRouterSetting: applyRouterSetting,
    basePath?: string
  ): AppConfigBuilder => {
    const router = Router();
    applyRouterSetting(router);

    if (basePath) {
      this._routers.push(setRouterBasePath(basePath, router));
    } else {
      this._routers.push(router);
    }
    return this;
  };

  addStaticFolder = (props: StaticFolderProps): AppConfigBuilder => {
    const router = Router();
    const folderFullPath = sysPath.join(__dirname, props.folderPath);
    router.use("/", express.static(folderFullPath));
    if (props.useClientSideRouting) {
      const indexPage = props.defaultPage || "index.html";
      const indexPath = sysPath.join(folderFullPath, indexPage);
      router.get("/*", (req, res) => res.sendFile(indexPath));
    }
    if (props.basePath) {
      this._staticFolders.push(setRouterBasePath(props.basePath, router));
    } else {
      this._staticFolders.push(router);
    }
    return this;
  };

  apply = (app: Express): void => {
    const allRouters = [...this._routers, ...this._staticFolders];
    allRouters.forEach((router) => app.use(router));
  };
}

export const createConfig = (): AppConfigBuilder => new AppConfigBuilder();
export const configure = (app: Express, appConfig: AppConfig): void => {
  const builder = createConfig();

  Object.entries(appConfig).forEach(([basePath, config]) => {
    config.routerSettings &&
      config.routerSettings.forEach((setting) =>
        builder.addRouterSetting(setting, basePath)
      );

    config.staticFolders &&
      config.staticFolders.forEach((props) =>
        builder.addStaticFolder({
          ...props,
          basePath: basePath + (props.basePath || ""),
        })
      );
  });

  builder.apply(app);
};
export {};
