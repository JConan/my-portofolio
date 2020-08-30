import express from "express"
import helmet from "helmet"
import morgan from "morgan"
import system from "./lib/system"
import { Connection } from "mongoose"
import db from "./db.conf"
import path from "path"
import { RouteMovies } from "api/vidly/route"
import logger from "@:lib/logger"

class AppBuild {
  private app = express()
  private dbConnection: { [name: string]: Connection } = {}

  init() {
    this.setupMiddleWare()
    this.setupVidlyDatabase()
    this.setupVidlyApi()
    this.setupUIApp()
    return this
  }

  listen = () => {
    const port = process.env.PORT || "5000"
    this.app.listen(port, () => {
      logger.info(`application listening on port: ${port}`)
    })
    return this
  }

  cleanupOnProcessSignal = (...signals: string[]) => {
    signals.forEach((signal) => process.on(signal, this.cleanup))
  }

  private cleanup = async (signal: string) => {
    logger.info(`received signal ${signal}`)
    await Promise.all(
      Object.entries(this.dbConnection).map(async ([appname, connection]) => {
        await connection.close()
        logger.info(`[${appname}] database connection closed.`)
      })
    )
    logger.info("application exit")
    process.exit(0)
  }

  private setupVidlyApi() {
    this.app.use("/api/vidly", RouteMovies(this.dbConnection.vidly))
    logger.debug("Application: setupVidlyApi - done")
  }

  private setupUIApp() {
    const uiRootFolder = path.join(__dirname, "../react-ui/build")
    const uiIndexFile = path.join(uiRootFolder, "index.html")
    this.app.use("/", express.static(uiRootFolder))
    this.app.get("/*", (_, res) => res.sendFile(uiIndexFile))
    logger.debug("Application: setupUIApp - done")
  }

  private setupVidlyDatabase() {
    const connection = db.getAppConnection("vidly")
    connection.on("connected", () => {
      const { host, port, name } = connection
      logger.info(`[vidly] database connected to mongodb://${host}:${port}/${name}`)
    })
    this.dbConnection.vidly = connection
    logger.debug("Application: setupVidlyDatabase - done")
  }

  private setupMiddleWare() {
    this.app.use(
      helmet({
        contentSecurityPolicy: {
          directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: [
              "'self'",
              "data:",
              "localhost:5000",
              "https://joch-portofolio.herokuapp.com/",
              "https://octodex.github.com",
            ],
            fontSrc: ["'self'", "data:"],
            objectSrc: ["'none'"],
            upgradeInsecureRequests: [],
          },
          reportOnly: false,
        },
      })
    )
    this.app.use(morgan(system.env.isProd() ? "tiny" : "combined"))
    logger.debug("Application: setupMiddleWare - done")
  }
}

export default () => new AppBuild()
