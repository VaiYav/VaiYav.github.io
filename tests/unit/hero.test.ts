import { describe, expect, it } from 'vitest';
import { HERO_SPEED, createHero, stepHero, walkFrame, type HeroState } from '../../src/game/world/hero';
import type { Rect } from '../../src/game/world/collision';

const none = { x: 0, y: 0 };
const open: Rect[] = [];

describe('stepHero', () => {
  it('stands still without input', () => {
    const hero = createHero({ x: 50, y: 50 });
    const next = stepHero(hero, none, 0.1, open);
    expect(next.x).toBe(50);
    expect(next.moving).toBe(false);
  });

  it('walks at a fixed speed and faces where it goes', () => {
    const next = stepHero(createHero({ x: 50, y: 50 }), { x: 1, y: 0 }, 0.5, open);
    expect(next.x).toBeCloseTo(50 + HERO_SPEED * 0.5);
    expect(next.moving).toBe(true);
    expect(next.angle).toBeCloseTo(Math.PI / 2);
  });

  it('is no faster on a diagonal', () => {
    const next = stepHero(createHero({ x: 0, y: 0 }), { x: 1, y: 1 }, 1, open);
    expect(Math.hypot(next.x, next.y)).toBeCloseTo(HERO_SPEED);
  });

  it('is stopped by a wall', () => {
    const wall: Rect = { x: 60, y: 0, w: 4, h: 100 };
    const next = stepHero(createHero({ x: 50, y: 50 }), { x: 1, y: 0 }, 1, [wall]);
    expect(next.x).toBeLessThanOrEqual(55);
  });

  it('walks to a tapped target and stops there', () => {
    let hero: HeroState = { ...createHero({ x: 0, y: 0 }), target: { x: 30, y: 0 } };
    for (let i = 0; i < 100 && hero.target; i++) hero = stepHero(hero, none, 0.05, open);
    expect(hero.x).toBeCloseTo(30);
    expect(hero.target).toBeNull();
    expect(stepHero(hero, none, 0.05, open).moving).toBe(false);
  });

  it('gives up on a target it cannot reach', () => {
    const wall: Rect = { x: 20, y: -100, w: 4, h: 200 };
    let hero: HeroState = { ...createHero({ x: 0, y: 0 }), target: { x: 60, y: 0 } };
    for (let i = 0; i < 200 && hero.target; i++) hero = stepHero(hero, none, 0.05, [wall]);
    expect(hero.target).toBeNull();
    expect(hero.x).toBeLessThan(20);
  });

  it('lets the keyboard override a tapped target', () => {
    const hero = { ...createHero({ x: 0, y: 0 }), target: { x: 100, y: 0 } };
    const next = stepHero(hero, { x: 0, y: 1 }, 0.1, open);
    expect(next.target).toBeNull();
    expect(next.y).toBeGreaterThan(0);
  });

  it('returns a new state and leaves the old one untouched', () => {
    const hero = createHero({ x: 5, y: 5 });
    const next = stepHero(hero, { x: 1, y: 0 }, 0.1, open);
    expect(next).not.toBe(hero);
    expect(hero.x).toBe(5);
  });
});

describe('walkFrame', () => {
  it('cycles through eight frames as distance grows', () => {
    const frames = new Set([0, 3, 6, 9, 12, 15, 18, 21, 24].map((d) => walkFrame(d)));
    expect(frames.size).toBe(8);
    for (const frame of frames) expect(frame).toBeGreaterThanOrEqual(0);
  });
});
