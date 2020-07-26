import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import sysPath from "path";

import { createProxyMiddleware, Options } from "http-proxy-middleware";

export interface AppProps {
  port: number;
  isDev: boolean;
  isTest?: boolean;
  httpProxies?: {
    [description: string]: { [path: string]: string | string[] | Options };
  };
  useMiddleWares?: { [name: string]: any | Array<any> };
  serverStaticDirectories?: { [path: string]: string };
}

export const App = (props: AppProps) => {
  const app = express();

  /**
   * Application Security & Logging
   */
  !props.isTest && app.use(helmet());
  if (props.isDev) {
    !props.isTest && app.use(morgan("combined"));
  } else {
    app.use(morgan("tiny"));
  }

  /**
   * Proxy
   */
  props.httpProxies &&
    Object.entries(props.httpProxies).forEach(([descriptions, config]) => {
      const configEntries = Object.entries(config);
      !props.isTest && console.log(`http-proxy: ${descriptions}`);
      configEntries.forEach(([path, arg]) => {
        app.use(path, createProxyMiddleware(arg));
      });
      !props.isTest &&
        console.log(
          `http-proxy: number of configuration registered ${configEntries.length}`
        );
    });

  /**
   * Application APIs
   */
  props.useMiddleWares &&
    Object.entries(props.useMiddleWares).forEach(([name, middleWareArgs]) => {
      !props.isTest && console.log(`app using handler ${name}`);
      app.use(...middleWareArgs);
    });

  /**
   * Server Frontend UI apps
   */
  props.serverStaticDirectories &&
    Object.entries(props.serverStaticDirectories).forEach(([path, folder]) => {
      app.use(path, express.static(sysPath.join(__dirname, folder)));
      app.get(path, (req, res) => {
        res.sendFile(sysPath.join(__dirname, folder, "index.html"));
      });
      !props.isTest && console.log(`serve-static: ${path} -> ${folder}`);
    });

  return {
    server: app,
    start: () =>
      app.listen(props.port, () => {
        !props.isTest && console.log(`app listening in port: ${props.port}`);
      }),
  };
};
