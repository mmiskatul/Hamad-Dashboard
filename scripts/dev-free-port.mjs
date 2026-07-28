#!/usr/bin/env node
/**
 * Find a free port. With no argument, let the OS assign one; with a start
 * port, find the first free port in the [start, start+19] range.
 */
import net from "node:net";

const start = process.argv[2] ? Number(process.argv[2]) : null;

function isFree(port) {
  return new Promise((resolve) => {
    const srv = net.createServer();
    srv.unref();
    srv.once("error", () => resolve(false));
    srv.once("listening", () => srv.close(() => resolve(true)));
    srv.listen(port, "0.0.0.0");
  });
}

const tried = [];
if (start === null) {
  const srv = net.createServer();
  srv.unref();
  srv.listen(0, "0.0.0.0", () => {
    const address = srv.address();
    const port = typeof address === "object" && address ? address.port : 0;
    process.stdout.write(String(port));
    srv.close(() => process.exit(0));
  });
} else {
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
}
