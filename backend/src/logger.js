const { createLogger, format, transports } = require("winston");

const level = process.env.LOG_LEVEL || "info";
const isProd = process.env.NODE_ENV === "production";

const logger = createLogger({
  level,
  format: format.combine(
    format.timestamp(),
    isProd ? format.json() : format.colorize(),
    isProd
      ? format.printf((info) => JSON.stringify(info))
      : format.printf((info) => `${info.timestamp} ${info.level}: ${info.message}`)
  ),
  transports: [new transports.Console()],
});

module.exports = logger;
