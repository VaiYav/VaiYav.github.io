import { describe, expect, it } from 'vitest';
import { WORLD, canvasSize, fitScale } from '../../src/game/engine/viewport';

describe('fitScale', () => {
  it('picks the largest whole multiple of the world that fits', () => {
    expect(fitScale(WORLD.width * 4 + 10)).toBe(4);
    expect(fitScale(WORLD.width * 2)).toBe(2);
  });

  it('never goes below one so the canvas stays visible on narrow screens', () => {
    expect(fitScale(120)).toBe(1);
    expect(fitScale(0)).toBe(1);
  });

  it('caps the scale so pixels do not get absurdly large', () => {
    expect(fitScale(100000)).toBe(6);
  });

  it('falls back to one for a width that is not a number', () => {
    expect(fitScale(Number.NaN)).toBe(1);
  });

  it('also fits the height when one is given, as in full screen', () => {
    expect(fitScale(WORLD.width * 6, WORLD.height * 3 + 20)).toBe(3);
    expect(fitScale(WORLD.width * 2, WORLD.height * 5)).toBe(2);
    expect(fitScale(WORLD.width * 4, 10)).toBe(1);
  });
});

describe('canvasSize', () => {
  it('keeps whole pixels on wide screens', () => {
    expect(canvasSize(WORLD.width * 3 + 50, Number.POSITIVE_INFINITY, 1)).toEqual({ cssWidth: WORLD.width * 3, cssHeight: WORLD.height * 3, scale: 3 });
  });

  it('fills a narrow screen instead of staying at one pixel per pixel', () => {
    const size = canvasSize(335, Number.POSITIVE_INFINITY, 1);
    expect(size.cssWidth).toBe(335);
    expect(size.cssHeight).toBeCloseTo((335 / WORLD.width) * WORLD.height);
  });

  it('draws at the device pixel ratio so a phone screen stays sharp', () => {
    expect(canvasSize(335, Number.POSITIVE_INFINITY, 3).scale).toBe(4);
    expect(canvasSize(WORLD.width * 2, Number.POSITIVE_INFINITY, 2).scale).toBe(4);
  });

  it('fits the height too in full screen', () => {
    const size = canvasSize(375, 200, 1);
    expect(size.cssHeight).toBeLessThanOrEqual(200);
    expect(size.cssWidth).toBeCloseTo((200 / WORLD.height) * WORLD.width);
  });

  it('caps the backing store and survives a broken ratio', () => {
    expect(canvasSize(100000, Number.POSITIVE_INFINITY, 3).scale).toBeLessThanOrEqual(12);
    expect(canvasSize(335, Number.POSITIVE_INFINITY, Number.NaN).scale).toBe(2);
  });
});
