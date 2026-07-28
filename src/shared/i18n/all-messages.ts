// Static imports of both message bundles so the client can swap them
// synchronously without a network round-trip. The server config still uses
// a dynamic import (a) to keep cold start small and (b) because Next will
// tree-shake the dynamic loader to the active locale.
import en from "./messages/en.json";
import ar from "./messages/ar.json";

export const messages = {
  en: en as Record<string, unknown>,
  ar: ar as Record<string, unknown>,
} as const;
