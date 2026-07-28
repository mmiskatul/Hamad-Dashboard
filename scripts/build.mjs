#!/usr/bin/env node
/**
 * Cross-platform production build wrapper.
 *
 * Writes the build output to `.next-build` (instead of the default `.next`)
 * so a running `next dev` server keeps its own `.next` directory intact.
 * Without this, a `npm run build` mid-dev overwrites the dev server's chunks
 * and the live page throws
 *   `TypeError: __webpack_modules__[moduleId] is not a function`
 * because the served RSC payload references modules that no longer exist.
 *
 * `next start` reads the same env to find the build output.
 */
import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

const nextBin = path.join(ROOT, "node_modules", "next", "dist", "bin", "next");
const subcommand = process.argv[2] ?? "build";

const env = { ...process.env, BUILD_DIR: ".next-build" };

const child = spawn(
  process.execPath,
  [nextBin, subcommand, ...process.argv.slice(3)],
  {
    stdio: "inherit",
    shell: false,
    cwd: ROOT,
    windowsHide: true,
    env,
  },
);

const forward = (sig) => () => {
  if (!child.killed) child.kill(sig);
};
process.on("SIGINT", forward("SIGINT"));
process.on("SIGTERM", forward("SIGTERM"));
process.on("SIGHUP", forward("SIGHUP"));

child.on("exit", (code, signal) => {
  if (signal) {
    process.stdout.write(`[next] exited via ${signal}\n`);
    process.exit(1);
  }
  process.exit(code ?? 0);
});
