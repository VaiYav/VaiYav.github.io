import { HERO_HALF, INTERACT_RADIUS, PLACEMENTS, solidRects } from '../../data/game/map';
import { WORLD } from '../engine/viewport';
import type { World } from './game';
import { createNav } from './path';

/** The office as the rules see it: solids, objects and a route finder for the hero. */
export const createOffice = (): World => ({
  solids: solidRects(),
  placements: PLACEMENTS,
  radius: INTERACT_RADIUS,
  ...createNav(solidRects(), HERO_HALF, WORLD),
});
