import winston, { format } from "winston";
import system from "@:lib/system";

const { combine, timestamp, printf } = format;
const loggerLevel =
  process.env.LOGGER_LEVEL ||
  (String(process.env.NODE_ENV) === "test"
    ? "error"
    : String(process.env.NODE_ENV) === "development"
    ? "debug"
    : "info");

const logger = winston.createLogger({
  format: combine(
    format.colorize(),
    timestamp({ format: "YYYY-MM-DD hh:mm:ss" }),
    printf((i) => `${i.timestamp} ${i.level}: ${i.message}`)
  ),
  transports: [new winston.transports.Console({ level: loggerLevel })],
});

export default logger;
