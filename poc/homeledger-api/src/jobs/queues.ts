// FILENAME: src/jobs/queues.ts
import Bull from "bull";
import { env } from "@config";
import logger from "@log/logger";

export const exampleQueue = new Bull("example-queue", env.redisUrl);

exampleQueue.on("completed", (job) => {
  logger.info("Job completed", { jobId: job.id });
});

exampleQueue.on("failed", (job, err) => {
  logger.error("Job failed", { jobId: job?.id, err });
});