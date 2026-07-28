import path from "node:path";
import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/shared/i18n/config.ts");

/**
 * Keep `dev` and `build` from clobbering each other's `.next` directory.
 *
 * When `npm run build` runs while a dev server is alive, the production
 * build overwrites `.next` and the dev server keeps serving chunks from a
 * module that no longer exists — manifesting as the dreaded
 * `__webpack_modules__[moduleId] is not a function` runtime error.
 *
 * Solution: when the production build is invoked, write its output to a
 * separate directory (`.next-build`) and write `next start` to use the
 * same. The dev server's `.next` is untouched.
 *
 * `BUILD_DIR` is opt-in via the environment so the dev server still uses
 * the default `.next`.
 */
const buildDir = process.env.BUILD_DIR
  ? path.resolve(process.cwd(), process.env.BUILD_DIR)
  : undefined;

const nextConfig: NextConfig = {
  reactStrictMode: true,
  typedRoutes: false,
  ...(buildDir ? { distDir: path.relative(process.cwd(), buildDir) } : {}),
  images: {
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
};

export default withNextIntl(nextConfig);
