import { test, expect } from './fixtures';

test('broadcast keeps playing under the pointer and pauses only on request', async ({ page }) => {
  await page.goto('/');
  const broadcast = page.getByRole('region', { name: 'La Propagande manifesto' });
  await broadcast.scrollIntoViewIfNeeded();
  const screen = broadcast.locator('.lp-broadcast__tv');
  await screen.hover();
  const clock = broadcast.locator('.lp-broadcast__osd--bl');
  const initial = await clock.textContent();
  await expect.poll(() => clock.textContent()).not.toBe(initial);
  await broadcast.getByRole('button', { name: 'Pause broadcast' }).click();
  await expect(broadcast.getByRole('button', { name: 'Play broadcast' })).toHaveAttribute('aria-pressed', 'true');
  const paused = (await clock.textContent()) ?? '';
  await page.mouse.wheel(0, 100);
  await page.evaluate(() => new Promise<void>((resolve) => {
    let count = 0;
    const tick = () => { if (++count === 8) resolve(); else requestAnimationFrame(tick); };
    requestAnimationFrame(tick);
  }));
  await expect(clock).toHaveText(paused);
  await broadcast.getByRole('button', { name: 'Play broadcast' }).click();
  await expect.poll(() => clock.textContent()).not.toBe(paused);
});

test('native hero video advances while scrolling through the hero', async ({ page }) => {
  await page.goto('/');
  const video = page.locator('.lp-home-stage video');
  await expect.poll(() => video.evaluate((node: HTMLVideoElement) => node.readyState)).toBeGreaterThanOrEqual(2);
  const before = await video.evaluate((node: HTMLVideoElement) => node.currentTime);
  await page.mouse.move(500, 400);
  await page.mouse.wheel(0, 240);
  await expect.poll(() => video.evaluate((node: HTMLVideoElement) => node.currentTime)).toBeGreaterThan(before + 0.2);
  await expect(video).toHaveJSProperty('paused', false);
});


test('offscreen broadcast does not keep repainting the canvas', async ({ page }) => {
  await page.addInitScript(() => {
    const state = window as unknown as Window & { lpBroadcastDraws: number };
    state.lpBroadcastDraws = 0;
    const draw = CanvasRenderingContext2D.prototype.drawImage;
    CanvasRenderingContext2D.prototype.drawImage = function (this: CanvasRenderingContext2D, ...args: unknown[]) {
      if (this.canvas.classList.contains('lp-broadcast__canvas')) state.lpBroadcastDraws++;
      return Reflect.apply(draw, this, args);
    };
  });
  await page.goto('/');
  const screen = page.locator('.lp-broadcast__tv');
  await screen.scrollIntoViewIfNeeded();
  await expect.poll(() => page.evaluate(() => (window as unknown as Window & { lpBroadcastDraws: number }).lpBroadcastDraws)).toBeGreaterThan(0);
  await page.evaluate(() => window.scrollTo(0, 0));
  await expect(screen).not.toBeInViewport();
  const paints = await page.evaluate(() => new Promise<number>((resolve) => {
    requestAnimationFrame(() => requestAnimationFrame(() => {
      const state = window as unknown as Window & { lpBroadcastDraws: number };
      const before = state.lpBroadcastDraws;
      let count = 0;
      const tick = () => { if (++count === 8) resolve(state.lpBroadcastDraws - before); else requestAnimationFrame(tick); };
      requestAnimationFrame(tick);
    }));
  }));
  expect(paints).toBe(0);
});
