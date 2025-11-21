import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: [
    'axe-core',
    '@axe-core/puppeteer',
    'puppeteer-core',
    '@sparticuz/chromium-min',
  ],
};

export default nextConfig;
