// FILENAME: vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@auth": resolve(__dirname, "src/auth"),
      "@layouts": resolve(__dirname, "src/layouts"),
      "@views": resolve(__dirname, "src/views"),
      "@helpers": resolve(__dirname, "src/helpers"),
      "@assets": resolve(__dirname, "src/assets"),
      "@components": resolve(__dirname, "src/components"),
      "@logger": resolve(__dirname, "src/utils/logger.js"),
      "@context": resolve(__dirname, "src/context"),
      "@hooks": resolve(__dirname, "src/hooks")
    }
  },
  server: {
    host: "0.0.0.0",
    port: 5173,
    strictPort: true,
    allowedHosts: ["front.mac-perso-ora.test"]
    // si un jour tu as d’autres hosts locaux:
    // allowedHosts: ["front.mac-perso-ora.test", "localhost"]
  }
});