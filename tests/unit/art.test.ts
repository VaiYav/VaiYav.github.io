import { describe, expect, it } from 'vitest';
import { PLACEMENTS, WALLS } from '../../src/data/game/map';
import { WORLD } from '../../src/game/engine/viewport';
import { drawFloors, drawWalls } from '../../src/game/render/floor';
import { OBJECT_ART, couch } from '../../src/game/render/objects';
import { fillOn, frameAt, offset, type Fill } from '../../src/game/render/painter';
import { heroFrame } from '../../src/game/render/hero';
import { HERO_PALETTE } from '../../src/game/render/palette';
import { paintSprite } from '../../src/game/render/sprites';

interface Call { x: number; y: number; w: number; h: number; color: string }

function recorder(): { fill: Fill; calls: Call[] } {
  const calls: Call[] = [];
  return { calls, fill: (x, y, w, h, color) => { calls.push({ x, y, w, h, color }); } };
}

/** A stand-in for a canvas context that remembers what was filled. */
function fakeContext() {
  const filled: Call[] = [];
  return {
    filled,
    fillStyle: '' as string | CanvasGradient | CanvasPattern,
    fillRect(x: number, y: number, w: number, h: number) { filled.push({ x, y, w, h, color: String(this.fillStyle) }); },
  };
}

describe('painter helpers', () => {
  it('fills with the given colour and shifts by an offset', () => {
    const context = fakeContext();
    offset(fillOn(context), 10, 20)(1, 2, 3, 4, '#fff');
    expect(context.filled).toEqual([{ x: 11, y: 22, w: 3, h: 4, color: '#fff' }]);
  });

  it('counts whole animation frames', () => {
    expect(frameAt(0.49, 4)).toBe(1);
    expect(frameAt(1, 4)).toBe(4);
  });
});

describe('floors and walls', () => {
  it('stay inside the world', () => {
    const { fill, calls } = recorder();
    drawFloors(fill);
    drawWalls(fill);
    expect(calls.length).toBeGreaterThan(100);
    for (const call of calls) {
      expect(call.x).toBeGreaterThanOrEqual(0);
      expect(call.y).toBeGreaterThanOrEqual(0);
      expect(call.x + call.w).toBeLessThanOrEqual(WORLD.width);
      expect(call.y + call.h).toBeLessThanOrEqual(WORLD.height);
    }
  });

  it('draw every wall with its shadow', () => {
    const { fill, calls } = recorder();
    drawWalls(fill);
    expect(calls).toHaveLength(WALLS.length * 2);
  });
});

describe('object art', () => {
  it('exists for every placed object', () => {
    expect(Object.keys(OBJECT_ART).sort()).toEqual(PLACEMENTS.map((p) => p.id).sort());
  });

  it('fits its footprint, give or take the one-pixel shadow', () => {
    for (const placement of PLACEMENTS) {
      for (const time of [0, 0.3, 0.7]) {
        const { fill, calls } = recorder();
        OBJECT_ART[placement.id](fill, time);
        expect(calls.length, placement.id).toBeGreaterThan(0);
        for (const call of calls) {
          expect(call.x, placement.id).toBeGreaterThanOrEqual(0);
          expect(call.y, placement.id).toBeGreaterThanOrEqual(0);
          expect(call.x + call.w, placement.id).toBeLessThanOrEqual(placement.w + 1);
          expect(call.y + call.h, placement.id).toBeLessThanOrEqual(placement.h + 1);
        }
      }
    }
  });

  it('animates the screens', () => {
    const at = (time: number) => { const { fill, calls } = recorder(); OBJECT_ART['terminal-ai'](fill, time); return JSON.stringify(calls); };
    expect(at(0)).not.toBe(at(0.3));
  });

  it('draws the couch', () => {
    const { fill, calls } = recorder();
    couch(fill, 0);
    expect(calls.length).toBeGreaterThan(0);
  });
});

describe('paintSprite', () => {
  it('paints one pixel per filled cell in palette colours', () => {
    const sprite = heroFrame('idle', 1);
    const context = fakeContext();
    paintSprite(context, sprite, HERO_PALETTE);
    expect(context.filled).toHaveLength(sprite.cells.filter(Boolean).length);
    expect(context.filled.some((call) => call.color === HERO_PALETTE.Y)).toBe(true);
    expect(context.filled.every((call) => call.color.startsWith('#'))).toBe(true);
  });

  it('paints a single colour when tinted', () => {
    const context = fakeContext();
    paintSprite(context, heroFrame('walk', 3), HERO_PALETTE, 'red');
    expect(new Set(context.filled.map((call) => call.color))).toEqual(new Set(['red']));
  });
});
