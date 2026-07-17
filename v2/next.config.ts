import type { NextConfig } from "next";
import { fileURLToPath } from "url";
import { dirname } from "path";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  // Produces a self-contained server bundle for a slim production container.
  output: "standalone",
  // v2 lives beside v1 in the same repo; pin the tracing root to this dir so the
  // standalone build doesn't infer the parent repo (v1's lockfile) as the root.
  outputFileTracingRoot: dirname(fileURLToPath(import.meta.url)),
  reactStrictMode: true,
};

export default withNextIntl(nextConfig);
