import { describe, expect, it } from 'vitest';
import { heroFrame } from '../../src/game/render/hero';
import { makeSprite, outlined } from '../../src/game/render/sprites';

describe('makeSprite', () => {
  it('fills rectangles, clips to the grid and erases with a dot', () => {
    const sprite = makeSprite(4, 4, (r) => { r(-1, -1, 3, 3, 'A'); r(0, 0, 1, 1, '.'); });
    expect(sprite.cells[0]).toBeNull();
    expect(sprite.cells[1]).toBe('A');
    expect(sprite.cells[5]).toBe('A');
    expect(sprite.cells[2]).toBeNull();
    expect(sprite.cells).toHaveLength(16);
  });
});

describe('outlined', () => {
  it('grows the sprite by one pixel on every side and rings the shape', () => {
    const dot = makeSprite(1, 1, (r) => r(0, 0, 1, 1, 'A'));
    const ringed = outlined(dot, 'K');
    expect([ringed.w, ringed.h]).toEqual([3, 3]);
    expect(ringed.cells[4]).toBe('A');
    expect([ringed.cells[1], ringed.cells[3], ringed.cells[5], ringed.cells[7]]).toEqual(['K', 'K', 'K', 'K']);
    expect(ringed.cells[0]).toBeNull();
    expect(dot.cells).toEqual(['A']);
  });
});

describe('heroFrame', () => {
  it('is a 32 by 32 sprite with the yellow headphones', () => {
    const frame = heroFrame('idle', 0);
    expect([frame.w, frame.h]).toEqual([32, 32]);
    expect(frame.cells).toContain('Y');
  });

  it('changes pose across the walk cycle', () => {
    const still = heroFrame('walk', 0).cells.join('');
    const stride = heroFrame('walk', 2).cells.join('');
    const opposite = heroFrame('walk', 6).cells.join('');
    expect(stride).not.toBe(still);
    expect(opposite).not.toBe(stride);
  });
});
