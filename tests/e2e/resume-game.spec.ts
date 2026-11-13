import { expect, test } from '@playwright/test';

test.describe('résumé game on the home page', () => {
  test('lists every object as plain text', async ({ page }) => {
    await page.goto('/');
    const section = page.locator('[data-game]');
    await expect(section.getByRole('heading', { name: 'Walk through the work.' })).toBeVisible();
    await expect(section.locator('[data-object]')).toHaveCount(18);
    await expect(section.getByText('Soulwise AI · 2025 – Present')).toBeVisible();
  });

  test('starts the canvas on Start and hides the cover', async ({ page }) => {
    await page.goto('/');
    const section = page.locator('[data-game]');
    await section.getByRole('button', { name: 'Start' }).click();
    await expect(section).toHaveAttribute('data-state', 'running');
    await expect(section.getByRole('button', { name: 'Start' })).toBeHidden();
    const width = await section.locator('canvas').evaluate((canvas: HTMLCanvasElement) => canvas.width);
    expect(width % 280).toBe(0);
  });

  test('keeps the recruiter CV one click away', async ({ page }) => {
    await page.goto('/');
    const cover = page.locator('[data-game] .game-cover');
    await expect(cover.getByRole('link', { name: 'Recruiter CV' })).toHaveAttribute('href', '/valentyn-yakovliev-recruiter-resume.html');
  });

  test.describe('without JavaScript', () => {
    test.use({ javaScriptEnabled: false });

    test('hides the stage and still shows the text version', async ({ page }) => {
      await page.goto('/');
      const section = page.locator('[data-game]');
      await expect(section.locator('[data-game-stage]')).toBeHidden();
      await expect(section.locator('[data-object]')).toHaveCount(18);
    });
  });
});
