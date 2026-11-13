import type { FillTarget } from './sprites';

/** Fills a rectangle in world pixels with a colour. */
export type Fill = (x: number, y: number, w: number, h: number, color: string) => void;

export const fillOn = (target: FillTarget): Fill => (x, y, w, h, color) => {
  target.fillStyle = color;
  target.fillRect(x, y, w, h);
};

/** The same painter, shifted so that art can draw from its own origin. */
export const offset = (fill: Fill, ox: number, oy: number): Fill => (x, y, w, h, color) => fill(ox + x, oy + y, w, h, color);

/** Whole animation frames elapsed at a given rate. */
export const frameAt = (time: number, fps: number): number => Math.floor(time * fps);
