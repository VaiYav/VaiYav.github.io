import type { Point, Rect } from '../../game/world/collision';
import type { RoomId } from './content';

/** Half the side of the hero's collision square, in world pixels. */
export const HERO_HALF = 5;
/** How close the hero must stand to an object to use it. */
export const INTERACT_RADIUS = 12;
/** Where the hero appears: in the lobby, just inside the entrance. */
export const SPAWN: Point = { x: 70, y: 150 };

/** The rectangle enclosed by the outer walls. */
export const OUTER: Rect = { x: 18, y: 13, w: 244, h: 164 };

export const WALLS: readonly Rect[] = [
  { x: 18, y: 13, w: 244, h: 3 }, { x: 18, y: 13, w: 3, h: 164 }, { x: 259, y: 13, w: 3, h: 164 },
  { x: 18, y: 174, w: 40, h: 3 }, { x: 82, y: 174, w: 180, h: 3 },
  { x: 151, y: 13, w: 3, h: 27 }, { x: 151, y: 56, w: 3, h: 74 }, { x: 151, y: 146, w: 3, h: 30 },
  { x: 18, y: 111, w: 72, h: 3 }, { x: 106, y: 111, w: 46, h: 3 },
  { x: 151, y: 81, w: 49, h: 3 }, { x: 216, y: 81, w: 46, h: 3 },
];

/** The entrance is drawn open, but the hero stays inside the building. */
const ENTRANCE: Rect = { x: 58, y: 174, w: 24, h: 3 };

export const ROOM_BOUNDS: Readonly<Record<RoomId, Rect>> = {
  office: { x: 20, y: 15, w: 132, h: 97 },
  server: { x: 152, y: 15, w: 108, h: 67 },
  lounge: { x: 152, y: 82, w: 108, h: 93 },
  lobby: { x: 20, y: 112, w: 132, h: 63 },
};

export interface Placement extends Rect {
  /** Matches the id of a GameObjectContent entry. */
  readonly id: string;
  /** Walkable objects lie on the floor and do not block the hero. */
  readonly walkable?: boolean;
}

export const PLACEMENTS: readonly Placement[] = [
  { id: 'desk-soulwise', x: 28, y: 34, w: 50, h: 23 },
  { id: 'desk-oboard', x: 28, y: 72, w: 50, h: 23 },
  { id: 'archive-earlier', x: 124, y: 86, w: 21, h: 17 },
  { id: 'bookshelf-skills', x: 102, y: 17, w: 45, h: 10 },
  { id: 'whiteboard-method', x: 30, y: 17, w: 34, h: 6 },
  { id: 'rack-seo', x: 158, y: 20, w: 23, h: 13 },
  { id: 'rack-content', x: 183, y: 20, w: 23, h: 13 },
  { id: 'rack-qa', x: 208, y: 20, w: 23, h: 13 },
  { id: 'rack-social', x: 233, y: 20, w: 23, h: 13 },
  { id: 'terminal-ai', x: 162, y: 58, w: 19, h: 15 },
  { id: 'arcade-saas', x: 240, y: 90, w: 17, h: 15 },
  { id: 'arcade-forge', x: 240, y: 110, w: 17, h: 15 },
  { id: 'arcade-multi', x: 240, y: 130, w: 17, h: 15 },
  { id: 'shelf-results', x: 158, y: 86, w: 31, h: 9 },
  { id: 'reception-glance', x: 28, y: 120, w: 37, h: 13 },
  { id: 'table-consulting', x: 108, y: 120, w: 26, h: 17 },
  { id: 'mailbox-contact', x: 30, y: 148, w: 13, h: 17 },
  { id: 'exit-cv', x: 58, y: 164, w: 24, h: 10, walkable: true },
];

/** Furniture that is only scenery. */
export const COUCH: Rect = { x: 158, y: 157, w: 48, h: 14 };

const SOLIDS: readonly Rect[] = [...WALLS, ENTRANCE, COUCH, ...PLACEMENTS.filter((placement) => !placement.walkable)];

/** Everything the hero cannot walk through. */
export const solidRects = (): readonly Rect[] => SOLIDS;
