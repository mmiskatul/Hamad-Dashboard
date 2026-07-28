// One-off helper to enrich fixtures with mobile numbers.
import { readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const DATA_DIR = resolve(__dirname, "..", "src", "data");

// Realistic E.164 numbers covering several regions.
const PHONE_POOL = [
  "+15555550123",
  "+15555550189",
  "+15555550234",
  "+15555550377",
  "+15555550456",
  "+15555550598",
  "+15555550612",
  "+15555550701",
  "+15555550844",
  "+15555550967",
  "+442079460958",
  "+442079461002",
  "+442079462311",
  "+33145678901",
  "+33145678932",
  "+493012345678",
  "+493012349911",
  "+61298765432",
  "+61298765501",
  "+819012345678",
  "+819012349876",
  "+919812345678",
  "+919812349911",
  "+971501234567",
  "+971501239998",
  "+5511998765432",
  "+5511998765012",
  "+8613800138000",
  "+8613800138013",
  "+14155550101",
  "+14155550199",
  "+14155550288",
];

function hash(input) {
  let h = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

async function enrich(path, getUserId) {
  const raw = await readFile(resolve(DATA_DIR, path), "utf8");
  const data = JSON.parse(raw);
  const arr = Array.isArray(data) ? data : [data];
  for (const u of arr) {
    const id = getUserId(u);
    const idx = hash(id) % PHONE_POOL.length;
    u.mobile = PHONE_POOL[idx];
  }
  const out = Array.isArray(data) ? arr : arr[0];
  await writeFile(resolve(DATA_DIR, path), JSON.stringify(out, null, 2) + "\n", "utf8");
  console.log(`enriched ${path} (${arr.length} record${arr.length === 1 ? "" : "s"})`);
}

await enrich("users.json", (u) => u.id);
await enrich("user-detail.json", (u) => u.id);

const detailsRaw = await readFile(resolve(DATA_DIR, "user-details.json"), "utf8");
const details = JSON.parse(detailsRaw);
for (const u of details) {
  const idx = hash(u.id) % PHONE_POOL.length;
  u.mobile = PHONE_POOL[idx];
}
await writeFile(
  resolve(DATA_DIR, "user-details.json"),
  JSON.stringify(details, null, 2) + "\n",
  "utf8",
);
console.log(`enriched user-details.json (${details.length} records)`);
