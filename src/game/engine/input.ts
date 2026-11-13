import type { Point } from '../world/collision';

/** Physical keys, so WASD works on any keyboard layout. */
const MOVES: Readonly<Record<string, Point>> = {
  KeyW: { x: 0, y: -1 }, ArrowUp: { x: 0, y: -1 },
  KeyS: { x: 0, y: 1 }, ArrowDown: { x: 0, y: 1 },
  KeyA: { x: -1, y: 0 }, ArrowLeft: { x: -1, y: 0 },
  KeyD: { x: 1, y: 0 }, ArrowRight: { x: 1, y: 0 },
};

export const isMoveKey = (code: string): boolean => Object.hasOwn(MOVES, code);

/** Direction the pressed keys ask for; each axis is -1, 0 or 1. */
export function intentFromKeys(pressed: ReadonlySet<string>): Point {
  const sum = [...pressed].filter(isMoveKey).reduce((total, code) => ({ x: total.x + MOVES[code].x, y: total.y + MOVES[code].y }), { x: 0, y: 0 });
  return { x: Math.sign(sum.x), y: Math.sign(sum.y) };
}
