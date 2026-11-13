import { expect, test, type Page } from '@playwright/test';

test.describe('résumé game on the home page', () => {
  test('lists every object as plain text', async ({ page }) => {
    await page.goto('/');
    const section = page.locator('[data-game]');
    await expect(section.getByRole('heading', { name: 'Walk through the work.' })).toBeVisible();
    await expect(section.locator('[data-object]')).toHaveCount(18);
    await expect(section.locator('.game-text').getByText('Soulwise AI · 2025 – Present')).toBeVisible();
  });

  test('starts the canvas on Start, paints it and moves focus to the stage', async ({ page }) => {
    await page.goto('/');
    const section = page.locator('[data-game]');
    await section.getByRole('button', { name: 'Start' }).click();
    await expect(section).toHaveAttribute('data-state', 'running');
    await expect(section.getByRole('button', { name: 'Start' })).toBeHidden();
    await expect(section.locator('[data-game-status]')).toContainText('Game started.');
    await expect(section.locator('[data-game-stage]')).toBeFocused();
    const canvas = await section.locator('[data-game-canvas]').evaluate((node: HTMLCanvasElement) => {
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
    await page.locator('[data-game]').getByRole('button', { name: 'Exit full screen' }).click();
    await expect.poll(() => page.evaluate(() => document.fullscreenElement === null)).toBe(true);
    await page.getByRole('link', { name: 'Notes' }).click();
    await expect(page).toHaveURL(/\/blog\/$/);
    expect(await page.evaluate(() => '__resumeGame' in window)).toBe(false);
    await page.goBack();
    await expect(page.locator('[data-game]')).toHaveAttribute('data-state', 'idle');
    await expect(page.locator('[data-game]').getByRole('button', { name: 'Start' })).toBeEnabled();
    expect(errors).toEqual([]);
  });

  test.describe('walking', () => {
    type Probe = { hero(): { x: number; y: number; moving: boolean }; toClient(world: { x: number; y: number }): { x: number; y: number } };
    const hero = (page: Page) => page.evaluate(() => {
      const state = (window as unknown as { __resumeGame: Probe }).__resumeGame.hero();
      return { x: state.x, y: state.y, moving: state.moving };
    });

    test.beforeEach(async ({ page }) => {
      await page.goto('/');
      await page.locator('[data-game]').getByRole('button', { name: 'Start' }).click();
      await expect(page.locator('[data-game]')).toHaveAttribute('data-state', 'running');
      await page.waitForFunction(() => '__resumeGame' in window);
    });

    test('moves the hero with the keyboard and stops when the key is released', async ({ page }) => {
      const before = await hero(page);
      await page.keyboard.down('KeyD');
      await page.waitForTimeout(400);
      await page.keyboard.up('KeyD');
      const after = await hero(page);
      expect(after.x).toBeGreaterThan(before.x + 10);
      expect(after.y).toBeCloseTo(before.y, 1);
      await page.waitForTimeout(150);
      expect((await hero(page)).x).toBeCloseTo(after.x, 1);
    });

    test('does not let the hero walk through the outer wall', async ({ page }) => {
      await page.keyboard.down('ArrowDown');
      await page.waitForTimeout(1500);
      await page.keyboard.up('ArrowDown');
      const after = await hero(page);
      expect(after.y).toBeLessThanOrEqual(169);
      expect(after.y).toBeGreaterThan(160);
    });

    test('walks to a tapped spot on the floor', async ({ page }) => {
      const goal = { x: 110, y: 155 };
      const point = await page.evaluate((world) => (window as unknown as { __resumeGame: Probe }).__resumeGame.toClient(world), goal);
      await page.mouse.click(point.x, point.y);
      await expect.poll(async () => (await hero(page)).x, { timeout: 4000 }).toBeGreaterThan(100);
      await expect.poll(async () => (await hero(page)).moving, { timeout: 4000 }).toBe(false);
      const after = await hero(page);
      expect(Math.hypot(after.x - goal.x, after.y - goal.y)).toBeLessThan(6);
    });

    test('does not scroll the page while walking', async ({ page }) => {
      // Focusing the stage scrolls it into view smoothly; let that settle first.
      await page.waitForTimeout(1200);
      const before = await page.evaluate(() => window.scrollY);
      await page.keyboard.down('ArrowDown');
      await page.waitForTimeout(300);
      await page.keyboard.up('ArrowDown');
      expect(await page.evaluate(() => window.scrollY)).toBe(before);
    });
  });

  test.describe('opening objects', () => {
    type Probe = { open(): string | null; found(): number; toClient(world: { x: number; y: number }): { x: number; y: number } };
    const probe = <T>(page: Page, read: (game: Probe) => T) => page.evaluate(`(${read})(window.__resumeGame)`) as Promise<T>;

    test.beforeEach(async ({ page }) => {
      await page.goto('/');
      await page.locator('[data-game]').getByRole('button', { name: 'Start' }).click();
      await expect(page.locator('[data-game]')).toHaveAttribute('data-state', 'running');
      await page.waitForFunction(() => '__resumeGame' in window);
    });

    test('opens the object next to the hero with E, shows its text and counts it', async ({ page }) => {
      const stage = page.locator('[data-game-stage]');
      const dialog = stage.locator('[data-game-dialog]');
      await expect(stage.locator('[data-game-hud]')).toHaveText('0 / 18 found');
      await page.keyboard.down('KeyS');
      await expect(stage.locator('[data-game-hint]')).toContainText('Recruiter CV');
      await page.keyboard.up('KeyS');
      await page.keyboard.press('KeyE');
      await expect(dialog).toBeVisible();
      await expect(dialog.getByRole('heading')).toHaveText('Recruiter CV');
      await expect(dialog.getByRole('link', { name: 'Open the recruiter CV' })).toHaveAttribute('href', /recruiter-resume/);
      await expect(stage.locator('[data-game-hud]')).toHaveText('1 / 18 found');
      const painted = await dialog.locator('canvas').evaluate((node: HTMLCanvasElement) => {
        const data = node.getContext('2d')?.getImageData(0, 0, node.width, node.height).data ?? [];
        let solid = 0;
        for (let i = 3; i < data.length; i += 4) if (data[i] === 255) solid += 1;
        return solid;
      });
      expect(painted).toBeGreaterThan(800);
      // The hero stays put while the dialogue is open, and E closes it again.
      const before = await page.evaluate(() => (window as unknown as { __resumeGame: { hero(): { x: number } } }).__resumeGame.hero().x);
      await page.keyboard.down('KeyD');
      await page.waitForTimeout(250);
      await page.keyboard.up('KeyD');
      expect(await page.evaluate(() => (window as unknown as { __resumeGame: { hero(): { x: number } } }).__resumeGame.hero().x)).toBe(before);
      await page.keyboard.press('KeyE');
      await expect(dialog).toBeHidden();
      await expect(stage.locator('[data-game-hud]')).toHaveText('1 / 18 found');
    });

    test('walks around the walls to a tapped object in another room and opens it', async ({ page }) => {
      test.setTimeout(30_000);
      const point = await probe(page, (game) => game.toClient({ x: 219, y: 26 }));
      await page.mouse.click(point.x, point.y);
      expect(await probe(page, (game) => game.open())).toBeNull();
      await expect.poll(() => probe(page, (game) => game.open()), { timeout: 15_000 }).toBe('rack-qa');
      const dialog = page.locator('[data-game-dialog]');
      await expect(dialog.getByRole('heading')).toHaveText('QA agent');
      await expect(dialog.locator('[data-game-dialog-room]')).toHaveText('Server room');
      await dialog.getByRole('button', { name: 'Close' }).click();
      await expect(dialog).toBeHidden();
      await expect(page.locator('[data-game-stage]')).toBeFocused();
    });

    test('opens every object from the keyboard list and ends with the finale', async ({ page }) => {
      const stage = page.locator('[data-game-stage]');
      const dialog = stage.locator('[data-game-dialog]');
      const buttons = stage.locator('[data-open-object]');
      await expect(buttons).toHaveCount(18);
      for (let i = 0; i < 18; i++) {
        await buttons.nth(i).focus();
        await page.keyboard.press('Enter');
        await expect(dialog).toBeVisible();
        if (i < 17) await page.keyboard.press('KeyE');
      }
      await expect(stage.locator('[data-game-hud]')).toHaveText('18 / 18 found');
      await page.keyboard.press('KeyE');
      await expect(dialog.getByRole('heading')).toContainText('All 18 found');
      await expect(dialog.getByRole('link', { name: 'Email me' })).toHaveAttribute('href', /^mailto:/);
      await page.keyboard.press('KeyE');
      await expect(dialog).toBeHidden();
    });

    test('keeps the keys alive when E closes the dialogue from a link inside it', async ({ page }) => {
      const stage = page.locator('[data-game-stage]');
      const dialog = stage.locator('[data-game-dialog]');
      await stage.locator('[data-open-object="exit-cv"]').focus();
      await page.keyboard.press('Enter');
      await expect(stage.locator('[data-game-status]')).toContainText('Recruiter CV');
      await dialog.getByRole('link', { name: 'Open the recruiter CV' }).focus();
      await page.keyboard.press('KeyE');
      await expect(dialog).toBeHidden();
      await expect(stage).toBeFocused();
      const x = () => page.evaluate(() => (window as unknown as { __resumeGame: { hero(): { x: number } } }).__resumeGame.hero().x);
      const before = await x();
      await page.keyboard.down('KeyD');
      await page.waitForTimeout(300);
      await page.keyboard.up('KeyD');
      expect(await x()).toBeGreaterThan(before + 5);
    });

    test('keeps the longest text readable and closable on a small stage', async ({ page }) => {
      await page.locator('[data-game]').getByRole('button', { name: 'Exit full screen' }).click();
      await page.setViewportSize({ width: 390, height: 700 });
      const stage = page.locator('[data-game-stage]');
      const longest = await page.locator('[data-object]').evaluateAll((nodes) =>
        nodes.map((node) => ({ id: node.getAttribute('data-object') ?? '', size: node.textContent?.length ?? 0 })).sort((a, b) => b.size - a.size)[0].id);
      await stage.locator(`[data-open-object="${longest}"]`).focus();
      await page.keyboard.press('Enter');
      const dialog = stage.locator('[data-game-dialog]');
      await expect(dialog).toBeVisible();
      const fits = await dialog.evaluate((node) => {
        const stageBox = (node.parentElement as HTMLElement).getBoundingClientRect();
        const box = node.getBoundingClientRect();
        return box.top >= stageBox.top - 1 && box.bottom <= stageBox.bottom + 1 && box.left >= stageBox.left - 1 && box.right <= stageBox.right + 1;
      });
      expect(fits).toBe(true);
      await dialog.getByRole('button', { name: 'Close' }).scrollIntoViewIfNeeded();
      await dialog.getByRole('button', { name: 'Close' }).click();
      await expect(dialog).toBeHidden();
    });
  });

  test.describe('on a phone', () => {
    test.use({ hasTouch: true, viewport: { width: 390, height: 780 } });

    test('walks to a spot tapped with a finger', async ({ page }) => {
      type Probe = { hero(): { x: number; y: number; moving: boolean }; toClient(world: { x: number; y: number }): { x: number; y: number } };
      await page.goto('/');
      await page.locator('[data-game]').getByRole('button', { name: 'Start' }).tap();
      await expect(page.locator('[data-game]')).toHaveAttribute('data-state', 'running');
      await page.waitForFunction(() => '__resumeGame' in window);
      // Let the smooth scroll to the focused stage finish, so the tap lands where it was aimed.
      await page.waitForTimeout(1200);
      const goal = { x: 110, y: 155 };
      const point = await page.evaluate((world) => (window as unknown as { __resumeGame: Probe }).__resumeGame.toClient(world), goal);
      await page.touchscreen.tap(point.x, point.y);
      const read = () => page.evaluate(() => {
        const state = (window as unknown as { __resumeGame: Probe }).__resumeGame.hero();
        return { x: state.x, y: state.y, moving: state.moving };
      });
      await expect.poll(async () => (await read()).x, { timeout: 4000 }).toBeGreaterThan(100);
      await expect.poll(async () => (await read()).moving, { timeout: 4000 }).toBe(false);
      const after = await read();
      expect(Math.hypot(after.x - goal.x, after.y - goal.y)).toBeLessThan(6);
    });
  });

  test('starts from the button at the top of the page, in full screen and focused', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Start the game' }).click();
    const section = page.locator('[data-game]');
    await expect(section).toHaveAttribute('data-state', 'running');
    await expect(section.locator('[data-game-stage]')).toBeFocused();
    await expect.poll(() => page.evaluate(() => document.fullscreenElement?.hasAttribute('data-game-stage') ?? false)).toBe(true);
    await expect(section.getByRole('button', { name: 'Exit full screen' })).toBeVisible();
    const fit = await section.locator('[data-game-canvas]').evaluate((node: HTMLCanvasElement) => ({ height: node.height, screen: window.innerHeight }));
    expect(fit.height).toBeLessThanOrEqual(fit.screen);
    await section.getByRole('button', { name: 'Exit full screen' }).click();
    await expect.poll(() => page.evaluate(() => document.fullscreenElement === null)).toBe(true);
    await expect(section.getByRole('button', { name: 'Full screen' })).toBeVisible();
    await expect(section.locator('[data-game-stage]')).toBeFocused();
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
      await expect(page.locator('[data-game-launch]')).toBeHidden();
      const section = page.locator('[data-game]');
      await expect(section.locator('[data-game-stage]')).toBeHidden();
      await expect(section.locator('[data-object]')).toHaveCount(18);
    });
  });
});
