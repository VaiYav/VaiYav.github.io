import { ROOM_BOUNDS, WALLS } from '../../data/game/map';
import { NEON } from './palette';
import type { Fill } from './painter';

const RUG = { x: 176, y: 104, size: 46 } as const;
const DOORMAT = { x: 58, y: 163, w: 24, h: 10 } as const;

function checker(fill: Fill, x0: number, y0: number, w: number, h: number, size: number, a: string, b: string): void {
  for (let y = 0; y < h; y += size) {
    for (let x = 0; x < w; x += size) {
      fill(x0 + x, y0 + y, Math.min(size, w - x), Math.min(size, h - y), ((x + y) / size) % 2 ? a : b);
    }
  }
}

/** The four room floors, the lounge rug and the doormat. */
export function drawFloors(fill: Fill): void {
  const { office, server, lounge, lobby } = ROOM_BOUNDS;
  checker(fill, office.x, office.y, office.w, office.h, 8, '#3a1f6b', '#4b2a8a');
  checker(fill, server.x, server.y, server.w, server.h, 6, '#06363d', '#0a4a52');
  fill(lounge.x, lounge.y, lounge.w, lounge.h, '#6b1248');
  for (let y = lounge.y + 4; y < lounge.y + lounge.h; y += 6) fill(lounge.x, y, lounge.w, 2, '#7d1a57');
  fill(lobby.x, lobby.y, lobby.w, lobby.h, '#a8502a');
  for (let x = lobby.x; x < lobby.x + lobby.w; x += 7) fill(x, lobby.y, 1, lobby.h, '#8f4222');
  fill(RUG.x, RUG.y, RUG.size, RUG.size, NEON.mag);
  fill(RUG.x + 4, RUG.y + 4, RUG.size - 8, RUG.size - 8, '#6b1248');
  fill(RUG.x + 8, RUG.y + 8, RUG.size - 16, RUG.size - 16, NEON.pink);
  fill(DOORMAT.x, DOORMAT.y, DOORMAT.w, DOORMAT.h, NEON.yel);
}

/** White walls with a hard one-pixel shadow. */
export function drawWalls(fill: Fill): void {
  for (const wall of WALLS) fill(wall.x + 1, wall.y + 1, wall.w, wall.h, NEON.ink);
  for (const wall of WALLS) fill(wall.x, wall.y, wall.w, wall.h, NEON.white);
}
