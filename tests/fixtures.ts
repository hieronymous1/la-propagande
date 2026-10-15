import { test as base, expect } from '@playwright/test';

/* Pre-dismiss the session-scoped overlays (demo notice, boot sequence) so tests
   reach the page underneath. Tests that cover the overlays themselves can clear
   these keys before navigating. */
export const test = base.extend({
  page: async ({ page }, use) => {
    await page.addInitScript(() => {
      try {
        window.sessionStorage.setItem('lp-demo-notice-dismissed', 'true');
        window.sessionStorage.setItem('lp_booted', '1');
      } catch {
        /* storage disabled: overlays stay up */
      }
    });
    await use(page);
  },
});

export { expect };
