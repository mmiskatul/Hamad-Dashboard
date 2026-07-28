#!/usr/bin/env node
/**
 * Cross-platform dev launcher. Finds the first free port in [start, start+19]
 * and spawns `next dev --port <port>` directly.
 *
 * Usage: node scripts/dev.mjs [startPort] [--clean] [--no-clean-stale]
 *   --clean            Wipe .next and dev marker files before launching.
 *   --no-clean-stale   Keep an existing .next even if no live dev PID owns it.
 */
import { spawn } from "node:child_process";
import fs from "node:fs";
import net from "node:net";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

const rawArgs = process.argv.slice(2);
const clean = rawArgs.includes("--clean");
const noCleanStale = rawArgs.includes("--no-clean-stale");
// Pull the optional start port (first non-flag arg).
const positional = rawArgs.filter((a) => !a.startsWith("--"));
const requestedStart = Number(positional[0] ?? 3000);
// Extra args we want to forward to `next dev` (e.g. user-supplied flags).
const passthrough = rawArgs.filter(
  (a) => !a.startsWith("--") || a === String(start),
);

function rm(target) {
  try {
    fs.rmSync(path.join(ROOT, target), { recursive: true, force: true });
    process.stdout.write(`[dev] removed ${target}\n`);
  } catch {
    /* ignore */
  }
}

if (clean) {
  for (const t of [".next", ".next-dev-port", ".next-dev-pid"]) {
    rm(t);
  }
}

/**
 * Detect a stale `.next` from a previous dev run (crashed, force-killed,
 * or replaced by a `next build` while the dev server was alive). The dev
 * server reads `.next/server/*` on every request, so a directory containing
 * files from a different process leads to the runtime error
 *   `TypeError: __webpack_modules__[moduleId] is not a function`.
 *
 * If `.next-dev-pid` points to a process that's still alive, leave the
 * directory alone — another dev server is using it. Otherwise wipe.
 */
function isPidAlive(pid) {
  if (!pid || !Number.isFinite(pid) || pid <= 0) return false;
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}

if (!noCleanStale) {
  const pidFile = path.join(ROOT, ".next-dev-pid");
  let pidAlive = false;
  try {
    const pid = Number(fs.readFileSync(pidFile, "utf8").trim());
    pidAlive = isPidAlive(pid);
  } catch {
    /* no pid file */
  }
  const nextDir = path.join(ROOT, ".next");
  const nextExists = fs.existsSync(nextDir);
  if (nextExists && !pidAlive) {
    process.stdout.write(
      "[dev] stale .next detected (no live dev server) — wiping\n",
    );
    rm(".next");
  }
}

function isFree(port) {
  return new Promise((resolve) => {
    const srv = net.createServer();
    srv.unref();
    srv.once("error", () => resolve(false));
    srv.once("listening", () => srv.close(() => resolve(true)));
    // Next binds to IPv6/dual-stack on Windows, so probe the same family.
    srv.listen(port, "::");
  });
}

const tried = [];
let port = null;
for (let p = requestedStart; p < requestedStart + 20; p++) {
  tried.push(p);
  // eslint-disable-next-line no-await-in-loop
  if (await isFree(p)) {
    port = p;
    break;
  }
}
if (port === null) {
  process.stderr.write(`[dev] no free port in ${tried.join(", ")}\n`);
  process.exit(1);
}

try {
  fs.writeFileSync(path.join(ROOT, ".next-dev-port"), String(port));
} catch {
  /* ignore */
}

process.stdout.write(`[dev] starting next on port ${port}\n`);

// Spawn next with a clean arg list. On Windows, npm resolves `next` to the
// bin path of `next/dist/bin/next`. Using the locally-installed binary
// avoids PATH issues entirely.
const nextBin = path.join(
  ROOT,
  "node_modules",
  "next",
  "dist",
  "bin",
  "next",
);
const nextArgs = ["dev", "--port", String(port), ...passthrough.filter((a) => a !== String(requestedStart))];
const child = spawn(
  process.execPath, // node
  [nextBin, ...nextArgs],
  {
    stdio: "inherit",
    shell: false,
    cwd: ROOT,
    windowsHide: true,
    env: { ...process.env, PORT: String(port) },
  },
);

// Record the child's PID so a future launcher can detect a still-live dev
// server before clobbering `.next`.
const pidFile = path.join(ROOT, ".next-dev-pid");
try {
  if (child.pid) {
    fs.writeFileSync(pidFile, String(child.pid));
  }
} catch {
  /* ignore */
}

// Pass through signals so Ctrl-C stops Next.
const forward = (sig) => () => {
  if (!child.killed) child.kill(sig);
};
process.on("SIGINT", forward("SIGINT"));
process.on("SIGTERM", forward("SIGTERM"));
process.on("SIGHUP", forward("SIGHUP"));

child.on("exit", (code, signal) => {
  try {
    fs.rmSync(pidFile, { force: true });
  } catch {
    /* ignore */
  }
  if (signal) {
    process.stdout.write(`[dev] next exited via ${signal}\n`);
    process.exit(1);
  }
  process.exit(code ?? 0);
});
