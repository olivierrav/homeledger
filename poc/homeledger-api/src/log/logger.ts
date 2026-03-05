// FILENAME: src/log/logger.ts
import winston from "winston";

const { combine, timestamp, printf, json, colorize } = winston.format;

const isProd = process.env.NODE_ENV === "production";

const logFormat = printf(({ level, message, timestamp, ...meta }) => {
  const metaString = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : "";
  return `[${timestamp}] ${level}: ${message}${metaString}`;
});

const logger = winston.createLogger({
  level: isProd ? "info" : "debug",
  format: combine(timestamp(), isProd ? json() : colorize(), logFormat),
  transports: [new winston.transports.Console()]
});

export default logger;