import { makeSprite, type Sprite, type SpriteRect } from './sprites';

export type HeroAnim = 'idle' | 'walk';

export const HERO_SIZE = 32;
/** How far each leg reaches forward on every frame of the walk cycle. */
const STRIDE = [0, 2, 3, 2, 0, -2, -3, -2];
const ARM_SWING = 0.7;

function drawLeg(r: SpriteRect, x: number, reach: number): void {
  if (reach > 0) { r(x, 11 - reach, 4, reach + 3, 'P'); r(x, 8 - reach, 4, 3, 'F'); }
  if (reach < 0) { r(x, 20, 4, 2 - reach, 'P'); r(x, 22 - reach, 4, 2, 'F'); }
}

function drawArm(r: SpriteRect, x: number, reach: number): void {
  if (reach >= 0) { r(x, 15 - reach, 3, 4 + reach, 'B'); r(x, 13 - reach, 3, 2, 'S'); return; }
  r(x, 16, 3, 4 - reach, 'b'); r(x, 20 - reach, 3, 1, 'S');
}

function drawBack(r: SpriteRect): void {
  r(10, 13, 12, 1, 'B'); r(8, 14, 16, 7, 'B'); r(7, 15, 18, 5, 'B');
  r(8, 19, 16, 2, 'b'); r(10, 21, 12, 1, 'b');
  r(9, 15, 2, 1, 'C'); r(21, 15, 2, 1, 'C'); r(13, 13, 6, 1, 'C');
}

function drawHead(r: SpriteRect): void {
  // nose, glasses with lit lenses, brow, temple arms, ears
  r(15, 6, 2, 1, 'S');
  r(11, 7, 10, 1, 'G'); r(12, 7, 3, 1, 'd'); r(17, 7, 3, 1, 'd');
  r(12, 8, 8, 1, 'S'); r(10, 8, 1, 5, 'G'); r(21, 8, 1, 5, 'G');
  r(10, 13, 1, 3, 'S'); r(21, 13, 1, 3, 'S');
  // hair: dark cap, mid swirl, light quiff streak sweeping to the front
  r(12, 9, 8, 10, 'H'); r(11, 10, 10, 8, 'H');
  r(13, 10, 6, 6, 'h'); r(14, 9, 5, 2, 'l'); r(16, 11, 3, 2, 'l'); r(13, 12, 2, 3, 'l'); r(15, 14, 2, 2, 'H');
  // yellow headphones
  r(10, 13, 12, 2, 'Y'); r(10, 14, 12, 1, 'y');
  r(9, 11, 2, 5, 'Y'); r(21, 11, 2, 5, 'Y'); r(9, 15, 2, 1, 'y'); r(21, 15, 2, 1, 'y');
}

/** The hero seen from above, facing up the screen. */
export function heroFrame(anim: HeroAnim, f: number): Sprite {
  return makeSprite(HERO_SIZE, HERO_SIZE, (r) => {
    const stride = anim === 'walk' ? STRIDE[f % STRIDE.length] : 0;
    const swing = Math.round(stride * ARM_SWING);
    drawLeg(r, 9, stride); drawLeg(r, 19, -stride);
    drawArm(r, 5, -swing); drawArm(r, 24, swing);
    // breathing: the shoulders widen on every other idle frame
    if (anim === 'idle' && f % 2 === 1) { r(4, 16, 1, 3, 'B'); r(27, 16, 1, 3, 'B'); }
    drawBack(r);
    drawHead(r);
  });
}
