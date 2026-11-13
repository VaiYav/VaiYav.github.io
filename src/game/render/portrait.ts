import { PORTRAIT_PALETTE, PORTRAIT_ROWS, PORTRAIT_SIZE } from './portrait-data';
import type { Palette, Sprite } from './sprites';

export { PORTRAIT_SIZE };
export const PORTRAIT_COLORS: Palette = PORTRAIT_PALETTE;
export type PortraitFrame = keyof typeof PORTRAIT_ROWS;

const BLINK_EVERY = 3.4;
const BLINK_FROM = 3.25;
const MOUTH_RATE = 7;
const SECONDS_PER_LETTER = 0.02;
const TALK_MIN = 1.2;
const TALK_MAX = 4;

const built = new Map<PortraitFrame, Sprite>();

/** One frame of the portrait as a sprite; frames are built once. */
export function portraitSprite(frame: PortraitFrame): Sprite {
  const ready = built.get(frame);
  if (ready) return ready;
  const cells = PORTRAIT_ROWS[frame].flatMap((row) => [...row].map((code) => (code === '.' ? null : code)));
  const sprite: Sprite = { w: PORTRAIT_SIZE, h: PORTRAIT_SIZE, cells };
  built.set(frame, sprite);
  return sprite;
}

/** Which frame to show: a short blink every few seconds, and a moving mouth while talking. */
export function portraitFrameAt(talking: boolean, time: number): PortraitFrame {
  if (time % BLINK_EVERY > BLINK_FROM) return 'blink';
  return talking && Math.floor(time * MOUTH_RATE) % 2 === 0 ? 'talk' : 'idle';
}

/** How long the portrait keeps talking for a text of the given length. */
export const talkSeconds = (letters: number): number => Math.min(TALK_MAX, Math.max(TALK_MIN, letters * SECONDS_PER_LETTER));
