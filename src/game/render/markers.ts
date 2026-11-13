import type { Rect } from '../world/collision';
import { NEON } from './palette';
import type { Fill } from './painter';

const FRAME_GAP = 3;
const FOUND_GREEN = '#3fe08a';
/** The letter E, three pixels wide, as [x, y, width] strokes. */
const LETTER_E = [[0, 0, 3], [0, 1, 1], [0, 2, 2], [0, 3, 1], [0, 4, 3]] as const;

/** A frame around the object the hero can use, with a key badge at its corner. */
export function drawNearMarker(fill: Fill, object: Rect, lit: boolean): void {
  const color = lit ? NEON.yel : NEON.white;
  const { x, y, w, h } = object;
  fill(x - FRAME_GAP, y - FRAME_GAP, w + FRAME_GAP * 2, 1, color);
  fill(x - FRAME_GAP, y + h + FRAME_GAP - 1, w + FRAME_GAP * 2, 1, color);
  fill(x - FRAME_GAP, y - FRAME_GAP, 1, h + FRAME_GAP * 2, color);
  fill(x + w + FRAME_GAP - 1, y - FRAME_GAP, 1, h + FRAME_GAP * 2, color);
  const bx = x + w - 2;
  const by = y - 9;
  fill(bx, by, 9, 9, NEON.ink);
  fill(bx + 1, by + 1, 7, 7, NEON.yel);
  for (const [dx, dy, width] of LETTER_E) fill(bx + 3 + dx, by + 2 + dy, width, 1, NEON.ink);
}

/** A green tick on an object that has been opened. */
export function drawFoundMarker(fill: Fill, object: Rect): void {
  const bx = object.x + object.w - 3;
  const by = object.y - 4;
  fill(bx, by, 7, 7, NEON.ink);
  fill(bx + 1, by + 1, 5, 5, FOUND_GREEN);
  fill(bx + 2, by + 3, 1, 2, NEON.ink);
  fill(bx + 3, by + 4, 1, 1, NEON.ink);
  fill(bx + 4, by + 2, 1, 2, NEON.ink);
}
