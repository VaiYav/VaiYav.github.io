import { WORLD } from '../engine/viewport';

export const BAND_COLORS: readonly string[] = ['#2b0f4a', '#5a1a7a', '#b0206f', '#ff2e88', '#b0206f', '#5a1a7a'];

const BAND_HEIGHT = 9;
const SCROLL_SPEED = 10;
const CELL = 2;

/** Colour of the scrolling dithered backdrop at a cell, at a given time in seconds. */
export function bandColor(x: number, y: number, time: number): string {
  const span = BAND_COLORS.length * BAND_HEIGHT;
  const position = ((((y + time * SCROLL_SPEED) % span) + span) % span) / BAND_HEIGHT;
  const index = Math.floor(position);
  const dithered = position - index > 0.6 && (Math.floor(x) + Math.floor(y)) % 2 === 0;
  return BAND_COLORS[(index + (dithered ? 1 : 0)) % BAND_COLORS.length];
}

export interface Hole {
  readonly x: number;
  readonly y: number;
  readonly w: number;
  readonly h: number;
}

const inside = (x: number, y: number, hole: Hole): boolean =>
  x >= hole.x && y >= hole.y && x + CELL <= hole.x + hole.w && y + CELL <= hole.y + hole.h;

/**
 * Fills the world with the backdrop. The context is expected to be scaled to world pixels.
 * Cells that lie wholly inside the hole are skipped: something opaque is drawn over them anyway.
 */
export function drawBackdrop(ctx: Pick<CanvasRenderingContext2D, 'fillStyle' | 'fillRect'>, time: number, hole?: Hole): void {
  for (let y = 0; y < WORLD.height; y += CELL) {
    for (let x = 0; x < WORLD.width; x += CELL) {
      if (hole && inside(x, y, hole)) continue;
      ctx.fillStyle = bandColor(x / CELL, y / CELL, time);
      ctx.fillRect(x, y, CELL, CELL);
    }
  }
}
