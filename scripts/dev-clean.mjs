#!/usr/bin/env node
/**
 * Wipe the .next cache so we never serve stale chunks after a stale dev
 * server. Safe to run while another dev is up — Next will rebuild.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

const targets = [".next", ".next-dev-port"];
for (const t of targets) {
  const p = path.join(ROOT, t);
  try {
    fs.rmSync(p, { recursive: true, force: true });
    process.stdout.write(`removed ${t}\n`);
  } catch {
    /* ignore */
  }
}