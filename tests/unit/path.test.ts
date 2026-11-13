import { describe, expect, it } from 'vitest';
import { HERO_HALF, INTERACT_RADIUS, PLACEMENTS, SPAWN, solidRects } from '../../src/data/game/map';
import { WORLD } from '../../src/game/engine/viewport';
import { distanceToRect, isBlocked, type Point, type Rect } from '../../src/game/world/collision';
import { createHero, stepHero, withRoute, type HeroState } from '../../src/game/world/hero';
import { createNav } from '../../src/game/world/path';

const bounds = { width: WORLD.width, height: WORLD.height };
const nav = createNav(solidRects(), HERO_HALF, bounds);

/** Walks a route to its end and reports where the hero stopped. */
function walk(from: Point, route: readonly Point[], dt: number, solids: readonly Rect[] = solidRects()): HeroState {
  let hero = withRoute(createHero(from), route);
  for (let i = 0; i < 4000 && hero.target; i++) hero = stepHero(hero, { x: 0, y: 0 }, dt, solids);
  return hero;
}

describe('createNav', () => {
  it('goes straight when nothing is in the way', () => {
    const route = nav.pathTo(SPAWN, { x: 110, y: 155 });
    expect(route).toHaveLength(1);
    expect(route[0]).toEqual({ x: 110, y: 155 });
  });

  it('finds the way into another room through the doorways', () => {
    const goal = { x: 230, y: 60 };
    const route = nav.pathTo(SPAWN, goal);
    expect(route.length).toBeGreaterThan(1);
    for (const dt of [1 / 60, 0.1]) {
      const end = walk(SPAWN, route, dt);
      expect(Math.hypot(end.x - goal.x, end.y - goal.y), `dt ${dt}`).toBeLessThan(3);
    }
  });

  it('stops at the nearest free spot when the goal is inside a wall or outside', () => {
    const route = nav.pathTo(SPAWN, { x: 70, y: 400 });
    const end = walk(SPAWN, route, 1 / 60);
    expect(isBlocked(end, HERO_HALF, solidRects())).toBe(false);
    expect(end.y).toBeGreaterThan(160);
  });

  it('leads to within reach of every object, at any frame rate', () => {
    for (const placement of PLACEMENTS) {
      const route = nav.pathNear(SPAWN, placement, INTERACT_RADIUS);
      expect(route.length, placement.id).toBeGreaterThan(0);
      for (const dt of [1 / 60, 0.1]) {
        const end = walk(SPAWN, route, dt);
        expect(distanceToRect(end, placement), `${placement.id} dt ${dt}`).toBeLessThanOrEqual(INTERACT_RADIUS);
      }
    }
  });

  it('starts cleanly from a spot pressed against a wall, off the grid', () => {
    const start = { x: 26.3, y: 105.7 };
    expect(isBlocked(start, HERO_HALF, solidRects())).toBe(false);
    const goal = { x: 230, y: 160 };
    const end = walk(start, nav.pathTo(start, goal), 0.1);
    expect(Math.hypot(end.x - goal.x, end.y - goal.y)).toBeLessThan(3);
  });

  it('returns an empty route when already there', () => {
    expect(nav.pathNear({ x: 70, y: 160 }, PLACEMENTS.find((p) => p.id === 'exit-cv') as Rect, INTERACT_RADIUS)).toEqual([]);
  });

  it('reports no route in a sealed box', () => {
    const box: Rect[] = [{ x: 0, y: 0, w: 40, h: 2 }, { x: 0, y: 38, w: 40, h: 2 }, { x: 0, y: 0, w: 2, h: 40 }, { x: 38, y: 0, w: 2, h: 40 }];
    const sealed = createNav(box, 5, { width: 100, height: 100 });
    const route = sealed.pathTo({ x: 20, y: 20 }, { x: 80, y: 80 });
    const end = walk({ x: 20, y: 20 }, route, 1 / 60, box);
    expect(end.x).toBeLessThan(34);
    expect(sealed.pathNear({ x: 20, y: 20 }, { x: 70, y: 70, w: 5, h: 5 }, 4)).toEqual([]);
  });
});
