import { describe, expect, it } from 'vitest';
import { distanceToRect, intersects, isBlocked, slide, type Rect } from '../../src/game/world/collision';

const wall: Rect = { x: 20, y: 0, w: 4, h: 40 };

describe('intersects', () => {
  it('detects overlap and ignores touching edges', () => {
    expect(intersects({ x: 0, y: 0, w: 10, h: 10 }, { x: 5, y: 5, w: 10, h: 10 })).toBe(true);
    expect(intersects({ x: 0, y: 0, w: 10, h: 10 }, { x: 10, y: 0, w: 10, h: 10 })).toBe(false);
  });
});

describe('isBlocked', () => {
  it('treats the hero as a box around its centre', () => {
    expect(isBlocked({ x: 14, y: 10 }, 5, [wall])).toBe(false);
    expect(isBlocked({ x: 16, y: 10 }, 5, [wall])).toBe(true);
  });
});

describe('slide', () => {
  it('moves freely in open space', () => {
    expect(slide({ x: 5, y: 5 }, { x: 3, y: -2 }, 2, [])).toEqual({ x: 8, y: 3 });
  });

  it('stops at a wall instead of passing through it', () => {
    const end = slide({ x: 10, y: 10 }, { x: 30, y: 0 }, 5, [wall]);
    expect(end.x).toBeLessThanOrEqual(15);
    expect(end.x).toBeGreaterThan(13);
    expect(end.y).toBe(10);
  });

  it('does not tunnel through a thin wall on a large step', () => {
    const end = slide({ x: 10, y: 10 }, { x: 200, y: 0 }, 5, [wall]);
    expect(end.x).toBeLessThanOrEqual(15);
  });

  it('slides along a wall when moving diagonally into it', () => {
    const end = slide({ x: 14, y: 10 }, { x: 10, y: 10 }, 5, [wall]);
    expect(end.x).toBeLessThanOrEqual(15);
    expect(end.y).toBeCloseTo(20);
  });

  it('does not mutate its inputs', () => {
    const from = { x: 1, y: 1 };
    const delta = { x: 2, y: 2 };
    slide(from, delta, 1, []);
    expect(from).toEqual({ x: 1, y: 1 });
    expect(delta).toEqual({ x: 2, y: 2 });
  });
});

describe('distanceToRect', () => {
  it('is zero inside and measures the gap outside', () => {
    expect(distanceToRect({ x: 22, y: 5 }, wall)).toBe(0);
    expect(distanceToRect({ x: 10, y: 5 }, wall)).toBe(10);
    expect(distanceToRect({ x: 27, y: 44 }, wall)).toBe(5);
  });
});
