// FILENAME: src/services/health/healthServiceFactory.ts
export interface HealthStatus {
  status: "ok";
  uptime: number;
}

export function createHealthService() {
  function getStatus(): HealthStatus {
    return {
      status: "ok",
      uptime: process.uptime()
    };
  }

  return {
    getStatus
  };
}

export type HealthService = ReturnType<typeof createHealthService>;