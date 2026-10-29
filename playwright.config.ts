import { defineConfig, devices } from '@playwright/test';

const commerceFlag = process.env.NEXT_PUBLIC_COMMERCE_ENABLED === 'false' ? 'false' : 'true';

export default defineConfig({
  testDir: './tests',
  timeout: 45_000,
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : 'list',
  use: {
    channel: process.env.PLAYWRIGHT_CHANNEL,
    baseURL: 'http://127.0.0.1:3301',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: process.env.PLAYWRIGHT_CHANNEL ? 'off' : 'retain-on-failure',
  },
  webServer: {
    // Commerce fails closed (lib/commerce.ts), so the suite opts in explicitly. Demo-mode specs
    // (demo-signup) run with NEXT_PUBLIC_COMMERCE_ENABLED=false. NEXT_PUBLIC_* values are inlined
    // at build time: for PLAYWRIGHT_BUILD, build with the same value.
    command: process.env.PLAYWRIGHT_BUILD
      ? `NEXT_PUBLIC_COMMERCE_ENABLED=${commerceFlag} ENABLE_SHOPIFY_FALLBACKS=true SITE_ORIGIN=http://127.0.0.1:3301 npm start -- --port 3301`
      : `NEXT_PUBLIC_COMMERCE_ENABLED=${commerceFlag} ENABLE_SHOPIFY_FALLBACKS=true SITE_ORIGIN=http://127.0.0.1:3301 npm run dev -- --port 3301`,
    url: 'http://127.0.0.1:3301',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
