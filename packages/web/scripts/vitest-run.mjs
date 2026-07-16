import { resolve } from "node:path";
import { startVitest } from "vitest/node";
import react from "@vitejs/plugin-react";

const root = resolve(import.meta.dirname, "..");
process.chdir(root);

const ctx = await startVitest(
  "test",
  [],
  {
    run: true,
    config: false,
    globals: true,
    environment: "jsdom",
    setupFiles: [resolve(root, "src/test/setup.ts")],
    coverage: {
      enabled: true,
      provider: "v8",
      reporter: ["text", "lcov"],
    },
  },
  {
    root,
    configFile: false,
    plugins: [react()],
    resolve: {
      alias: {
        "@": resolve(root, "src"),
      },
    },
  },
);

const failed = ctx?.state.getCountOfFailedTests?.() ?? 0;
await ctx?.close?.();

if (failed > 0) {
  process.exitCode = 1;
}
