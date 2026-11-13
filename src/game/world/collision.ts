export interface Point {
  readonly x: number;
  readonly y: number;
}

export interface Rect {
  readonly x: number;
  readonly y: number;
  readonly w: number;
  readonly h: number;
}

/** Longest distance moved between two collision checks, in world pixels. */
const SUB_STEP = 1;

/** True when the rectangles overlap; touching edges do not count. */
export const intersects = (a: Rect, b: Rect): boolean =>
  a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;

/** True when a square of the given half-size centred on the point overlaps a solid. */
export function isBlocked(point: Point, half: number, solids: readonly Rect[]): boolean {
  const box: Rect = { x: point.x - half, y: point.y - half, w: half * 2, h: half * 2 };
  return solids.some((solid) => intersects(box, solid));
}

/** Moves along one axis in small steps and stops just before the first solid. */
function advance(from: Point, distance: number, axis: 'x' | 'y', half: number, solids: readonly Rect[]): Point {
  const steps = Math.ceil(Math.abs(distance) / SUB_STEP);
  let position = from;
  for (let i = 0; i < steps; i++) {
    const next: Point = { ...position, [axis]: position[axis] + distance / steps };
    if (isBlocked(next, half, solids)) break;
    position = next;
  }
  return position;
}

/**
 * Moves a square body by delta, one axis at a time, so that it slides along walls
 * and never passes through a solid however large the step is.
 */
export function slide(from: Point, delta: Point, half: number, solids: readonly Rect[]): Point {
  const afterX = advance({ x: from.x, y: from.y }, delta.x, 'x', half, solids);
  return advance(afterX, delta.y, 'y', half, solids);
}

/** Shortest distance from a point to a rectangle; zero inside it. */
export function distanceToRect(point: Point, rect: Rect): number {
  const dx = Math.max(rect.x - point.x, 0, point.x - (rect.x + rect.w));
  const dy = Math.max(rect.y - point.y, 0, point.y - (rect.y + rect.h));
  return Math.hypot(dx, dy);
}
