import { describe, expect, it } from 'vitest';
import { WORLD, fitScale } from '../../src/game/engine/viewport';

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
});
