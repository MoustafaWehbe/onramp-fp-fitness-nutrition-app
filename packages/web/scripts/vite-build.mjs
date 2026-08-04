import { resolve } from "node:path";
import { build, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

const root = resolve(import.meta.dirname, "..");
const repoRoot = resolve(root, "../..");
process.chdir(root);

const env = loadEnv("production", repoRoot, "");
const apiProxyTarget =
  env.API_PROXY_TARGET ?? `http://localhost:${env.PORT ?? "3000"}`;

await build({
  root,
  configFile: false,
  // configFile:false skips vite.config.ts, so envDir must be repeated here.
  envDir: repoRoot,
  plugins: [react()],
  resolve: {
    alias: {
      "@": resolve(root, "src"),
    },
  },
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: apiProxyTarget,
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: "dist",
    sourcemap: true,
  },
});
