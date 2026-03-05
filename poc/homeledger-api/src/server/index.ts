// FILENAME: src/server/index.ts
import { env } from "@config";
import logger from "@log/logger";
import { createApp } from "./app";

async function bootstrap() {
  const app = await createApp();

  app.listen(env.port, () => {
    logger.info(`Server listening on port ${env.port}`);
  });
}

bootstrap().catch((err) => {
  logger.error("Fatal error during bootstrap", { err });
  process.exit(1);
});