import { HERO_HALF } from '../../data/game/map';
import { slide, type Point, type Rect } from './collision';

/** Walking speed in world pixels per second. */
export const HERO_SPEED = 55;

/** Distance at which a target counts as reached. */
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
  /** Point the hero is walking to right now, or null. */
  readonly target: Point | null;
  /** Points to visit after the target, in order. */
  readonly route: readonly Point[];
  /** Total distance walked; drives the walk cycle. */
  readonly distance: number;
}

export const createHero = (at: Point): HeroState => ({ x: at.x, y: at.y, angle: 0, moving: false, target: null, route: [], distance: 0 });

/** Sends the hero along a list of points; an empty list stops it. */
export const withRoute = (hero: HeroState, points: readonly Point[]): HeroState => ({ ...hero, target: points[0] ?? null, route: points.slice(1) });

/** Frame of the eight-frame walk cycle for a distance walked. */
export const walkFrame = (distance: number): number => Math.floor(distance / STRIDE_LENGTH) % WALK_FRAMES;

const gap = (a: Point, b: Point): number => Math.hypot(b.x - a.x, b.y - a.y);

/** Moves along a heading by up to a stride and reports how far the hero really got. */
function walk(state: HeroState, heading: Point, stride: number, solids: readonly Rect[]): { hero: HeroState; moved: number } {
  const length = Math.hypot(heading.x, heading.y);
  const delta: Point = { x: (heading.x / length) * stride, y: (heading.y / length) * stride };
  const end = slide(state, delta, HERO_HALF, solids);
  const moved = gap(state, end);
  const hero = { ...state, x: end.x, y: end.y, angle: Math.atan2(heading.y, heading.x) + Math.PI / 2, moving: moved > ARRIVE, distance: state.distance + moved };
  return { hero, moved };
}

/** Drops targets the hero already stands on. */
function skipReached(state: HeroState): HeroState {
  let hero = state;
  while (hero.target && gap(hero, hero.target) < ARRIVE) hero = withRoute(hero, hero.route);
  return hero;
}

/**
 * Advances the hero by one frame. A keyboard intent wins over a tapped route;
 * the route is dropped once its end is reached or the way is blocked.
 */
export function stepHero(state: HeroState, intent: Point, dt: number, solids: readonly Rect[]): HeroState {
  const reach = HERO_SPEED * dt;
  if (intent.x !== 0 || intent.y !== 0) return walk(withRoute(state, []), intent, reach, solids).hero;

  const aimed = skipReached(state);
  const target = aimed.target;
  if (!target) return { ...aimed, moving: false };

  const stride = Math.min(reach, gap(aimed, target));
  const { hero, moved } = walk(aimed, { x: target.x - aimed.x, y: target.y - aimed.y }, stride, solids);
  if (gap(hero, target) < ARRIVE) return withRoute(hero, hero.route);
  return moved < stride * STUCK_SHARE ? withRoute(hero, []) : hero;
}
