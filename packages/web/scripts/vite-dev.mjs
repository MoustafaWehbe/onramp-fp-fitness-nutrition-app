import { resolve } from "node:path";
import { createServer, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

const root = resolve(import.meta.dirname, "..");
const repoRoot = resolve(root, "../..");
process.chdir(root);

const env = loadEnv("development", repoRoot, "");
const apiProxyTarget =
  env.API_PROXY_TARGET ?? `http://localhost:${env.PORT ?? "3000"}`;

const server = await createServer({
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
    host: "127.0.0.1",
    port: 5173,
    strictPort: false,
    proxy: {
      "/api": {
        target: apiProxyTarget,
        changeOrigin: true,
      },
    },
  },
});

await server.listen();
server.printUrls();
