import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => sessionStorage.setItem('lp_booted', '1'));
});

test('failed signup retains email, offers direct email, and can retry successfully', async ({ page }) => {
  let calls = 0;
  await page.route('**/api/launch-signup', async route => {
    const data = route.request().postDataJSON();
    expect(data.email).toBe('visitor@example.org');
    expect(data.consent).toBe(true);
    calls++;
    await route.fulfill({ status: calls === 1 ? 502 : 200, contentType: 'application/json', body: JSON.stringify({ message: calls === 1 ? 'Please try again.' : 'Thank you.' }) });
  });
  await page.goto('/');
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  await dialog.getByRole('textbox', { name: 'Email', exact: true }).fill('visitor@example.org');
  await dialog.getByRole('checkbox').check();
  await dialog.getByRole('button', { name: 'Notify me', exact: true }).click();
  await expect(dialog.getByRole('alert')).toBeVisible();
  await expect(dialog.getByRole('textbox')).toHaveValue('visitor@example.org');
  await expect(dialog.getByRole('link', { name: 'Email us to join the launch list' })).toHaveAttribute('href', /^mailto:lapropagandeparisbey@outlook.com\?/);
  await dialog.getByRole('button', { name: 'Notify me', exact: true }).click();
  await expect(dialog.getByRole('status')).toContainText('We will email you when ordering opens.');
  await dialog.getByRole('button', { name: 'Close and explore' }).click();
  await expect(dialog).not.toBeVisible();
  await page.getByRole('button', { name: 'Demo · Notify me at launch', exact: true }).click();
  await expect(dialog).toBeVisible();
});
