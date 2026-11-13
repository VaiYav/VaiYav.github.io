import type { Placement } from '../../data/game/map';
import { distanceToRect, type Point, type Rect } from './collision';
import { createHero, stepHero, withRoute, type HeroState } from './hero';
import { nearestObject, objectAt } from './interaction';
import type { Nav } from './path';

/** Shown in place of an object id when the closing message is on screen. */
export const FINALE = 'finale';
/** How far beside an object a tap may land and still count as a tap on it. */
const TAP_PAD = 3;

/** Everything about the office that the rules need. */
export interface World extends Nav {
  readonly solids: readonly Rect[];
  readonly placements: readonly Placement[];
  /** How close the hero must stand to an object to use it. */
  readonly radius: number;
}

export interface GameState {
  readonly hero: HeroState;
  /** Ids of the objects opened so far. */
  readonly found: ReadonlySet<string>;
  /** Id of the object whose dialogue is open, FINALE, or null. */
  readonly open: string | null;
  /** Object the hero is walking to after a tap; it opens on arrival. */
  readonly pending: string | null;
  readonly finaleSeen: boolean;
}

export const createGame = (spawn: Point): GameState => ({ hero: createHero(spawn), found: new Set(), open: null, pending: null, finaleSeen: false });

const inReach = (hero: Point, placement: Placement, world: World): boolean => distanceToRect(hero, placement) <= world.radius;

/** Id of the object the hero can use right now; nothing while a dialogue is open. */
export function nearId(state: GameState, world: World): string | null {
  if (state.open) return null;
  return nearestObject(state.hero, world.placements, world.radius)?.id ?? null;
}

/** Opens an object's dialogue, stops the hero and counts the object as found. */
export const openObject = (state: GameState, id: string): GameState => ({
  ...state,
  hero: { ...withRoute(state.hero, []), moving: false },
  found: state.found.has(id) ? state.found : new Set([...state.found, id]),
  open: id,
  pending: null,
});

/** Closes the dialogue. Closing the last unseen object brings up the finale, once. */
export function closeDialog(state: GameState, world: World): GameState {
  const complete = state.found.size >= world.placements.length;
  const finale = state.open !== null && state.open !== FINALE && complete && !state.finaleSeen;
  return { ...state, open: finale ? FINALE : null, finaleSeen: state.finaleSeen || finale };
}

/** The action key: closes an open dialogue, otherwise opens the object the hero stands next to. */
export function interact(state: GameState, world: World): GameState {
  if (state.open) return closeDialog(state, world);
  const near = nearId(state, world);
  return near ? openObject(state, near) : state;
}

/** A tap on the world: closes a dialogue, walks to and opens a tapped object, or walks to the spot. */
export function tapWorld(state: GameState, point: Point, world: World): GameState {
  if (state.open) return closeDialog(state, world);
  const hit = objectAt(point, world.placements, TAP_PAD);
  if (!hit) return { ...state, hero: withRoute(state.hero, world.pathTo(state.hero, point)), pending: null };
  if (inReach(state.hero, hit, world)) return openObject(state, hit.id);
  return { ...state, hero: withRoute(state.hero, world.pathNear(state.hero, hit, world.radius)), pending: hit.id };
}

/** Advances the game by one frame. The hero stands still while a dialogue is open. */
export function stepGame(state: GameState, intent: Point, dt: number, world: World): GameState {
  if (state.open) return state.hero.moving ? { ...state, hero: { ...state.hero, moving: false } } : state;
  const steering = intent.x !== 0 || intent.y !== 0;
  const hero = stepHero(state.hero, intent, dt, world.solids);
  const pending = steering ? null : state.pending;
  if (!pending || hero.target) return { ...state, hero, pending };
  const goal = world.placements.find((placement) => placement.id === pending);
  const arrived = { ...state, hero, pending: null };
  return goal && inReach(hero, goal, world) ? openObject(arrived, goal.id) : arrived;
}
