import { describe, expect, it } from 'vitest';
import { gameObjects } from '../../src/data/game/content';
import { HERO_HALF, INTERACT_RADIUS, OUTER, PLACEMENTS, ROOM_BOUNDS, SPAWN, solidRects } from '../../src/data/game/map';
import { WORLD } from '../../src/game/engine/viewport';
import { distanceToRect, isBlocked, type Point } from '../../src/game/world/collision';
import { nearestObject } from '../../src/game/world/interaction';

const STEP = 2;

/** Every grid point the hero can walk to from the spawn. */
function reachable(): Point[] {
  const solids = solidRects();
  const seen = new Set<string>();
  const queue: Point[] = [SPAWN];
  const found: Point[] = [];
  while (queue.length > 0) {
    const point = queue.pop() as Point;
    const key = `${point.x}:${point.y}`;
    if (seen.has(key)) continue;
    seen.add(key);
    if (point.x < 0 || point.y < 0 || point.x > WORLD.width || point.y > WORLD.height) continue;
    if (isBlocked(point, HERO_HALF, solids)) continue;
    found.push(point);
    queue.push({ x: point.x + STEP, y: point.y }, { x: point.x - STEP, y: point.y }, { x: point.x, y: point.y + STEP }, { x: point.x, y: point.y - STEP });
  }
  return found;
}

describe('office map', () => {
  it('places exactly the objects that have content', () => {
    expect(PLACEMENTS.map((p) => p.id).sort()).toEqual(gameObjects.map((o) => o.id).sort());
  });

  it('keeps every object inside its own room', () => {
    for (const placement of PLACEMENTS) {
      const room = gameObjects.find((o) => o.id === placement.id)?.room;
      expect(room, placement.id).toBeDefined();
      const bounds = ROOM_BOUNDS[room as keyof typeof ROOM_BOUNDS];
      expect(placement.x, placement.id).toBeGreaterThanOrEqual(bounds.x);
      expect(placement.y, placement.id).toBeGreaterThanOrEqual(bounds.y);
      expect(placement.x + placement.w, placement.id).toBeLessThanOrEqual(bounds.x + bounds.w);
      expect(placement.y + placement.h, placement.id).toBeLessThanOrEqual(bounds.y + bounds.h);
    }
  });

  it('starts the hero on free floor', () => {
    expect(isBlocked(SPAWN, HERO_HALF, solidRects())).toBe(false);
  });

  it('lets the hero walk up to every object', () => {
    const cells = reachable();
    for (const placement of PLACEMENTS) {
      const close = cells.some((cell) => distanceToRect(cell, placement) <= INTERACT_RADIUS);
      expect(close, placement.id).toBe(true);
    }
  });

  it('has a spot for every object where the action key opens that object and no other', () => {
    const cells = reachable();
    for (const placement of PLACEMENTS) {
      const spot = cells.some((cell) => nearestObject(cell, PLACEMENTS, INTERACT_RADIUS)?.id === placement.id);
      expect(spot, placement.id).toBe(true);
    }
  });

  it('is sealed: the hero cannot leave the building', () => {
    for (const cell of reachable()) {
      expect(cell.x).toBeGreaterThan(OUTER.x);
      expect(cell.x).toBeLessThan(OUTER.x + OUTER.w);
      expect(cell.y).toBeGreaterThan(OUTER.y);
      expect(cell.y).toBeLessThan(OUTER.y + OUTER.h);
    }
  });
});
