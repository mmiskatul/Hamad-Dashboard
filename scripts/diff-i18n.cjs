const en = require("../src/shared/i18n/messages/en.json");
const ar = require("../src/shared/i18n/messages/ar.json");
function keys(o, p) {
  let r = [];
  for (const k of Object.keys(o)) {
    const np = p ? p + "." + k : k;
    if (typeof o[k] === "object" && o[k] !== null) r = r.concat(keys(o[k], np));
    else r.push(np);
  }
  return r;
}
const a = new Set(keys(en));
const b = new Set(keys(ar));
const missingAr = [...a].filter((k) => !b.has(k));
const missingEn = [...b].filter((k) => !a.has(k));
console.log("Missing in AR:", JSON.stringify(missingAr, null, 2));
console.log("Missing in EN:", JSON.stringify(missingEn, null, 2));
