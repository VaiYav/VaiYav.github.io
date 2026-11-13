import { expect, test } from '@playwright/test';

test.describe('résumé game on the home page', () => {
  test('lists every object as plain text', async ({ page }) => {
    await page.goto('/');
    const section = page.locator('[data-game]');
    await expect(section.getByRole('heading', { name: 'Walk through the work.' })).toBeVisible();
    await expect(section.locator('[data-object]')).toHaveCount(18);
    await expect(section.getByText('Soulwise AI · 2025 – Present')).toBeVisible();
  });

  test('starts the canvas on Start, paints it and moves focus to the stage', async ({ page }) => {
    await page.goto('/');
    const section = page.locator('[data-game]');
    await section.getByRole('button', { name: 'Start' }).click();
    await expect(section).toHaveAttribute('data-state', 'running');
    await expect(section.getByRole('button', { name: 'Start' })).toBeHidden();
    await expect(section.locator('[data-game-status]')).toHaveText('Game started.');
    await expect(section.locator('[data-game-stage]')).toBeFocused();
    const canvas = await section.locator('canvas').evaluate((node: HTMLCanvasElement) => {
      const pixel = node.getContext('2d')?.getImageData(2, 2, 1, 1).data;
      return { width: node.width, alpha: pixel ? pixel[3] : 0 };
    });
    expect(canvas.width).toBeGreaterThan(280);
    expect(canvas.alpha).toBe(255);
  });

  test('stops cleanly when the visitor navigates away and back', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await page.goto('/');
    await page.locator('[data-game]').getByRole('button', { name: 'Start' }).click();
    await expect(page.locator('[data-game]')).toHaveAttribute('data-state', 'running');
    await page.getByRole('link', { name: 'Notes' }).click();
    await expect(page).toHaveURL(/\/blog\/$/);
    await page.goBack();
    await expect(page.locator('[data-game]')).toHaveAttribute('data-state', 'idle');
    await expect(page.locator('[data-game]').getByRole('button', { name: 'Start' })).toBeEnabled();
    expect(errors).toEqual([]);
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
