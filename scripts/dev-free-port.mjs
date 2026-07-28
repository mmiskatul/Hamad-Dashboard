#!/usr/bin/env node
/**
 * Find the first free port in the [start, start+19] range.
 */
import net from "node:net";

const start = Number(process.argv[2] ?? 3000);

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
for (let p = start; p < start + 20; p++) {
  tried.push(p);
  // eslint-disable-next-line no-await-in-loop
  if (await isFree(p)) {
    process.stdout.write(String(p));
    process.exit(0);
  }
}
process.stderr.write(`No free port in ${tried.join(", ")}\n`);
process.exit(1);
