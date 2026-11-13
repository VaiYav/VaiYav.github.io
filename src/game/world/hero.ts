import { HERO_HALF } from '../../data/game/map';
import { slide, type Point, type Rect } from './collision';

/** Walking speed in world pixels per second. */
export const HERO_SPEED = 55;

/** Distance at which a tapped target counts as reached. */
const ARRIVE = 0.01;
/** A step shorter than this share of the intended one means the way is blocked. */
const STUCK_SHARE = 0.2;
/** World pixels walked per animation frame. */
const STRIDE_LENGTH = 3;
const WALK_FRAMES = 8;

export interface HeroState {
  readonly x: number;
  readonly y: number;
  /** Heading in radians; zero faces up the screen. */
  readonly angle: number;
  readonly moving: boolean;
  /** Point the hero is walking to after a tap, or null. */
  readonly target: Point | null;
  /** Total distance walked; drives the walk cycle. */
  readonly distance: number;
}

export const createHero = (at: Point): HeroState => ({ x: at.x, y: at.y, angle: 0, moving: false, target: null, distance: 0 });

/** Frame of the eight-frame walk cycle for a distance walked. */
export const walkFrame = (distance: number): number => Math.floor(distance / STRIDE_LENGTH) % WALK_FRAMES;

/**
 * Advances the hero by one frame. A keyboard intent wins over a tapped target;
 * a target is dropped once it is reached or the way to it is blocked.
 */
export function stepHero(state: HeroState, intent: Point, dt: number, solids: readonly Rect[]): HeroState {
  const keyboard = intent.x !== 0 || intent.y !== 0;
  const target = keyboard ? null : state.target;
  const heading = keyboard ? intent : target ? { x: target.x - state.x, y: target.y - state.y } : null;
  const length = heading ? Math.hypot(heading.x, heading.y) : 0;
  if (!heading || length < ARRIVE) return { ...state, moving: false, target: null };

  const reach = HERO_SPEED * dt;
  const stride = keyboard ? reach : Math.min(reach, length);
  const delta: Point = { x: (heading.x / length) * stride, y: (heading.y / length) * stride };
  const end = slide(state, delta, HERO_HALF, solids);
  const moved = Math.hypot(end.x - state.x, end.y - state.y);
  const arrived = target !== null && Math.hypot(target.x - end.x, target.y - end.y) < ARRIVE;
  const stuck = moved < stride * STUCK_SHARE;

  return {
    x: end.x,
    y: end.y,
    angle: Math.atan2(heading.y, heading.x) + Math.PI / 2,
    moving: moved > ARRIVE,
    target: arrived || stuck ? null : target,
    distance: state.distance + moved,
  };
}
