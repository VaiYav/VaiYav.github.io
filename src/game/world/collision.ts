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

/** One small step along one axis; the body stays put when a solid is in the way. */
function nudge(from: Point, axis: 'x' | 'y', amount: number, half: number, solids: readonly Rect[]): Point {
  if (amount === 0) return from;
  const next: Point = { ...from, [axis]: from[axis] + amount };
  return isBlocked(next, half, solids) ? from : next;
}

/**
 * Moves a square body by delta in small steps, trying each axis on its own, so that it
 * slides along walls and never passes through a solid however large the step is.
 * The axes take turns, which keeps the body close to the straight line it was asked to follow.
 */
export function slide(from: Point, delta: Point, half: number, solids: readonly Rect[]): Point {
  const steps = Math.ceil(Math.max(Math.abs(delta.x), Math.abs(delta.y)) / SUB_STEP);
  let position: Point = { x: from.x, y: from.y };
  for (let i = 0; i < steps; i++) {
    position = nudge(position, 'x', delta.x / steps, half, solids);
    position = nudge(position, 'y', delta.y / steps, half, solids);
  }
  return position;
}

/** Shortest distance from a point to a rectangle; zero inside it. */
export function distanceToRect(point: Point, rect: Rect): number {
  const dx = Math.max(rect.x - point.x, 0, point.x - (rect.x + rect.w));
  const dy = Math.max(rect.y - point.y, 0, point.y - (rect.y + rect.h));
  return Math.hypot(dx, dy);
}
