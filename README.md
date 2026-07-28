# OneAI Admin Dashboard

Single super-admin dashboard for the OneAI Hub platform. Next.js 15 (App
Router) + React 19 + TypeScript, with TanStack Query / Table / Virtual,
Recharts, next-intl, Radix UI primitives, Tailwind v4.

The visual reference lives on `origin/design`'s `design-review/` branch.
Tokens are generated from `design/admin-ui.md` §2 — they are the single
source of truth for the design language.

## Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 15 App Router + TypeScript |
| Styling | Tailwind v4 + CSS custom properties generated from §2 |
| Server state | TanStack Query |
| Tables | TanStack Table + Virtual |
| Charts | Recharts (wrapped in `ChartWrapper`) |
| i18n | `next-intl` (EN + AR, native RTL) |
| Forms | React Hook Form + Zod |
| Auth | Cookie session, mocked for the demo |

## Run

```bash
cd admin-dashboard
npm install
npm run dev
```

Then open http://localhost:3000/login (any value signs you in for the
demo build).

## Scripts

```bash
npm run dev         # next dev
npm run lint        # next lint (flat config + restricted-syntax)
npm run typecheck   # tsc --noEmit
npm test            # vitest (privacy, contrast, RTL)
npm run build       # next build
```

## Swap dummy data → live API

Every screen reads through `src/shared/api/client.ts`. Replace the
`load<T>(file)` body with `fetch(API_BASE_URL + path)` and you have a
live backend with no screen changes.

```ts
// before
async function load<T>(file: string): Promise<T> {
  const data = (await import(`@/data/${file}.json`)).default as T;
  return adminProjection(data);
}

// after
async function load<T>(file: string): Promise<T> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/${file}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return adminProjection(await res.json());
}
```

DTOs are locked to `src/shared/api/types.ts` — forbidden keys
(`content`, `messages`, `transcripts`, `body`, `text`) are stripped by
`adminProjection()` in `src/shared/lib/privacy.ts`. The privacy gate
test fails the build if any leaks.

## Add a screen

1. Create `src/features/<feature>/*` components.
2. Create `src/app/(admin)/admin/<feature>/page.tsx`.
3. Add a nav entry in `src/components/shell/Sidebar.tsx`.
4. Add strings to `src/shared/i18n/messages/{en,ar}.json`.

Pages stay thin — anything reusable goes in `components/` or `features/`.

## Add a token

1. Append the primitive to `src/styles/tokens.css` under `:root` (and a
   `data-theme="dark"` override if the value differs).
2. Re-export from `src/styles/tokens.ts` if it needs a TS mirror.
3. Re-run `npm test` — the contrast gate validates all `§2.2` semantic
   pairs at AA.

## Regenerate i18n catalogs

The two catalogs live in `src/shared/i18n/messages/`. Add keys in lockstep
in `en.json` and `ar.json`. There is no codegen step today — the Next
build will fail if a `useTranslations()` key is missing in either.

## Layout primitives

| | Mobile < 768 | Tablet 768–1279 | Desktop ≥ 1280 |
|---|---|---|---|
| Sidebar | Off-canvas drawer | 64px icon rail | 240px expanded |
| Tables | Card transform | Priority columns | All columns |
| Charts | Sparkline + value | Stacked, simplified | Side-by-side |

RTL is native — `dir` swaps on `<html>`, every spacing utility is logical
(`ps-*` / `pe-*` / `ms-*` / `me-*`), and physical-direction utilities
(`pl-*`, `pr-*`, `ml-*`, `mr-*`, `text-left`, `text-right`) fail lint.

## Tests

| Suite | Asserts |
|---|---|
| `tests/privacy.test.ts` | `adminProjection` strips forbidden keys; every `src/data/*.json` is clean |
| `tests/token-contrast.test.ts` | Every §2.2 text pair ≥ 4.5:1, every border pair ≥ 3:1 |
| `tests/rtl.test.tsx` | `Numeric` keeps `dir="ltr"`, `ChartWrapper` ships an SR table |
