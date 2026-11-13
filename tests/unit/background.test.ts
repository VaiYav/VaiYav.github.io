import { describe, expect, it } from 'vitest';
import { WORLD } from '../../src/game/engine/viewport';
import { BAND_COLORS, bandColor, drawBackdrop } from '../../src/game/render/background';

describe('bandColor', () => {
  it('always returns a colour from the band palette', () => {
    for (let y = 0; y < 200; y += 7) {
      for (const time of [0, 1.5, 40]) expect(BAND_COLORS).toContain(bandColor(3, y, time));
    }
  });

  it('scrolls: the same row changes colour as time passes', () => {
    const seen = new Set([0, 1, 2, 3, 4, 5, 6, 7].map((time) => bandColor(0, 0, time)));
    expect(seen.size).toBeGreaterThan(1);
  });

  it('is stable for the same input', () => {
    expect(bandColor(4, 9, 2)).toBe(bandColor(4, 9, 2));
  });
});

describe('drawBackdrop', () => {
  it('paints every world pixel exactly once with palette colours', () => {
    let area = 0;
    const colours = new Set<string>();
    const ctx = {
      fillStyle: '',
      fillRect(_x: number, _y: number, width: number, height: number) {
        area += width * height;
        colours.add(String(this.fillStyle));
      },
    };
    drawBackdrop(ctx as unknown as CanvasRenderingContext2D, 0);
    expect(area).toBe(WORLD.width * WORLD.height);
    for (const colour of colours) expect(BAND_COLORS).toContain(colour);
  });

  it('skips the cells inside a covered hole and nothing else', () => {
    const cells: { x: number; y: number }[] = [];
    const ctx = { fillStyle: '', fillRect(x: number, y: number) { cells.push({ x, y }); } };
    const hole = { x: 10, y: 10, w: 20, h: 8 };
    drawBackdrop(ctx as unknown as CanvasRenderingContext2D, 0, hole);
    expect(cells).toHaveLength((WORLD.width * WORLD.height) / 4 - (hole.w * hole.h) / 4);
    expect(cells.some((cell) => cell.x === 12 && cell.y === 12)).toBe(false);
    expect(cells.some((cell) => cell.x === 8 && cell.y === 10)).toBe(true);
  });
});
