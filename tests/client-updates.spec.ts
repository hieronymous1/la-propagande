import { expect, test } from '@playwright/test';

for (const viewport of [{ width: 1440, height: 1000 }, { width: 390, height: 844 }]) {
  test.describe(`client updates ${viewport.width}px`, () => {
    test.use({ viewport });

    test('demo notice closes, remembers dismissal and reopens', async ({ page }, testInfo) => {
      await page.goto('/products');
      const notice = page.getByRole('dialog', { name: 'The website is still in the works.' });
      await expect(notice).toBeVisible();
      await expect(notice.getByText('This is a demo version. You can’t order yet.')).toBeVisible();
      await expect(notice.getByRole('textbox', { name: 'Email' })).toBeVisible();
      await page.screenshot({ path: testInfo.outputPath('demo-notice.png') });
      await notice.getByRole('button', { name: 'Close demo notice' }).click();
      await expect(notice).toBeHidden();
      await page.reload();
      await expect(notice).toBeHidden();
      const opener = page.getByRole('button', { name: 'Demo · Notify me at launch' });
      await opener.click();
      await expect(notice).toBeVisible();
      await page.keyboard.press('Escape');
      await expect(notice).toBeHidden();
      await expect(opener).toBeFocused();
      await page.screenshot({ path: testInfo.outputPath('demo-opener.png') });
    });

    test('catalog cards fill their frame; detail gallery stays uncropped; both have manual controls', async ({ page }, testInfo) => {
      await page.addInitScript(() => sessionStorage.setItem('lp-demo-notice-dismissed', 'true'));
      await page.goto('/products');
      const card = page.locator('article').filter({ has: page.getByRole('button', { name: /^Next photo of / }) }).first();
      await expect(card).toBeVisible();
      const image = card.locator('img').first();
      await expect(image).toHaveCSS('object-fit', 'cover');
      const initial = await image.getAttribute('src');
      await card.getByRole('button', { name: /^Next photo of / }).click();
      await expect(image).not.toHaveAttribute('src', initial!);
      await card.getByRole('button', { name: /^Previous photo of / }).click();
      await expect(image).toHaveAttribute('src', initial!);
      await expect(page.getByRole('button', { name: 'QUICK ADD', exact: true })).toHaveCount(0);
      await page.screenshot({ path: testInfo.outputPath('catalog.png') });
      await card.getByRole('link').first().click();
      // first visit compiles the detail route in dev, so allow longer than the default expect timeout
      await page.waitForURL(/\/products\/[^/?]+$/, { timeout: 30_000 });
      const gallery = page.getByRole('region', { name: / images$/ });
      await expect(gallery.locator('img')).toHaveCSS('object-fit', 'contain');
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
      const mainImage = gallery.locator('img');
      const first = await mainImage.getAttribute('src');
      await gallery.getByRole('button', { name: 'Next image' }).click();
      await expect(mainImage).not.toHaveAttribute('src', first!);
      await gallery.getByRole('button', { name: 'Previous image' }).click();
      await expect(mainImage).toHaveAttribute('src', first!);
      await gallery.focus();
      await page.keyboard.press('ArrowRight');
      await expect(mainImage).not.toHaveAttribute('src', first!);
      await page.keyboard.press('ArrowLeft');
      await expect(mainImage).toHaveAttribute('src', first!);
      const sizeGroup = page.locator('fieldset').filter({ has: page.locator('legend', { hasText: /SIZE/i }) });
      const sizeOptions = sizeGroup.getByRole('button');
      if (await sizeOptions.count() > 1) {
        const originalChoice = sizeGroup.locator('button[aria-pressed="true"]');
        const originalLabel = await originalChoice.getAttribute('aria-label');
        const newChoice = sizeOptions.last();
        await newChoice.click();
        await expect(newChoice).toHaveAttribute('aria-pressed', 'true');
        if (originalLabel !== await newChoice.getAttribute('aria-label')) {
          await expect(page.getByRole('button', { name: originalLabel!, exact: true })).toHaveAttribute('aria-pressed', 'false');
        }
      }
      await expect(page.getByRole('button', { name: 'DEMO · ORDERING COMING SOON' }).first()).toBeDisabled();
      await expect(page.getByRole('link', { name: /GO TO CHECKOUT/ })).toHaveCount(0);
      await expect(page.getByRole('button', { name: /^ADD ·/ })).toHaveCount(0);
      await gallery.blur();
      await page.screenshot({ path: testInfo.outputPath('product-detail.png'), fullPage: true });
    });

    test('locations show requested retail shop and online platforms', async ({ page }, testInfo) => {
      await page.addInitScript(() => sessionStorage.setItem('lp-demo-notice-dismissed', 'true'));
      await page.goto('/locations');
      await expect(page.getByText('Fearlove Vintage Shop', { exact: true })).toBeVisible();
      await expect(page.getByText(/St Lois street, Beirut, Lebanon/i)).toBeVisible();
      for (const name of ['Doora app', 'Sookit.co', 'BuyBuy lb', 'Xhawi']) {
        await expect(page.getByText(name, { exact: true })).toBeVisible();
      }
      await expect(page.getByRole('link', { name: /VISIT PLATFORM/ })).toHaveAttribute('href', 'https://sookit.co');
      await page.screenshot({ path: testInfo.outputPath('locations.png'), fullPage: true });
    });
  });
}

test('demo cart API rejects creation, reads and mutations', async ({ request }) => {
  for (const response of [
    await request.post('/api/cart'),
    await request.get('/api/cart?id=gid%3A%2F%2Fshopify%2FCart%2Fdemo'),
    await request.post('/api/cart/lines', { data: { action: 'add', cartId: 'demo', lines: [] } }),
  ]) {
    expect(response.status()).toBe(403);
    expect((await response.json()).error).toContain('ordering is not available');
  }
});

test('client document artwork appears on each requested page without cropping', async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.addInitScript(() => sessionStorage.setItem('lp-demo-notice-dismissed', 'true'));
  // natural sizes of the client artwork; the rendered box must keep the same aspect ratio (no cropping)
  const ARTWORK = [
    { route: '/about', filename: 'manifesto', width: 1200, height: 1821 },
    { route: '/contact', filename: 'connect-no-qr', width: 994, height: 1600 },
    { route: '/custom-jackets', filename: 'born-from-revolt', width: 1995, height: 1200 },
  ];
  for (const { route, filename, width, height } of ARTWORK) {
    await page.goto(route);
    const artwork = page.locator(`img[src*="${filename}"]`).first();
    await artwork.scrollIntoViewIfNeeded();
    await expect(artwork).toBeVisible();
    await expect(artwork).toHaveAttribute('width', String(width));
    await expect(artwork).toHaveAttribute('height', String(height));
    await expect.poll(async () => {
      const box = await artwork.boundingBox();
      return box ? Math.abs(box.width / box.height - width / height) < 0.02 : false;
    }, { message: `${filename} on ${route} should render at its natural aspect ratio` }).toBe(true);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    await page.screenshot({ path: testInfo.outputPath(`${route.replaceAll('/', '') || 'intro'}-artwork-mobile.png`) });
  }
  await page.goto('/blog');
  await expect(page.getByRole('link', { name: 'FOLLOW @_LAPROPAGANDE ↗' })).toHaveAttribute('href', /instagram\.com\/_lapropagande/);
});
