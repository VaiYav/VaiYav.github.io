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

/** Fills the whole world with the backdrop. The context is expected to be scaled to world pixels. */
export function drawBackdrop(ctx: CanvasRenderingContext2D, time: number): void {
  for (let y = 0; y < WORLD.height; y += CELL) {
    for (let x = 0; x < WORLD.width; x += CELL) {
      ctx.fillStyle = bandColor(x / CELL, y / CELL, time);
      ctx.fillRect(x, y, CELL, CELL);
    }
  }
}
