import { AGENT_COLORS, NEON } from './palette';
import { frameAt, type Fill } from './painter';

/** Draws one object from its own origin; time drives the small loops. */
export type ObjectArt = (fill: Fill, time: number) => void;

const INK = NEON.ink;
const SPINES = [NEON.yel, NEON.pink, NEON.cyan, NEON.white, NEON.org];

function chair(R: Fill, x: number, y: number, color: string): void {
  R(x, y, 12, 7, INK); R(x + 1, y + 1, 10, 5, color);
}

const deskMain: ObjectArt = (R, t) => {
  R(1, 1, 50, 14, INK); R(0, 0, 50, 14, NEON.org); R(0, 11, 50, 3, '#c9621f');
  for (const mx of [6, 26]) { R(mx, 2, 16, 3, INK); R(mx + 1, 5, 14, 1, frameAt(t, 5) % 2 ? NEON.cyan : NEON.teal); }
  R(14, 8, 18, 3, '#2b2440'); R(40, 7, 4, 4, NEON.white);
  chair(R, 19, 16, NEON.mag);
};

const deskSecond: ObjectArt = (R, t) => {
  R(1, 1, 50, 14, INK); R(0, 0, 50, 14, '#e06a2a'); R(0, 11, 50, 3, '#b0501c');
  R(12, 2, 26, 3, INK); R(13, 5, 24, 1, frameAt(t, 3) % 2 ? NEON.yel : NEON.org);
  R(3, 7, 3, 3, NEON.yel); R(7, 7, 3, 3, NEON.pink); R(42, 7, 3, 3, NEON.cyan); R(46, 3, 3, 3, NEON.yel);
  R(18, 8, 14, 2, '#2b2440');
  chair(R, 19, 16, NEON.cyan);
};

const archive: ObjectArt = (R, t) => {
  R(1, 1, 10, 16, INK); R(0, 0, 10, 16, '#5c2f4f');
  for (let i = 0; i < 3; i++) { R(1, 1 + i * 5, 8, 4, '#7a4168'); R(4, 2 + i * 5, 2, 1, NEON.yel); }
  R(12, 3, 9, 10, INK); R(11, 2, 9, 10, '#d8c9a8'); R(12, 3, 7, 6, '#0f3d2a');
  R(13, 4, frameAt(t, 2) % 2 ? 3 : 2, 1, '#3fe08a'); R(11, 13, 9, 3, '#b8a888');
};

const bookshelf: ObjectArt = (R) => {
  R(1, 1, 44, 9, INK); R(0, 0, 44, 9, '#5c2f4f');
  for (let i = 0; i < 14; i++) R(1 + i * 3, 1 + (i % 4 === 0 ? 1 : 0), 2, 6, SPINES[i % SPINES.length]);
};

const whiteboard: ObjectArt = (R) => {
  R(0, 0, 34, 6, INK); R(0, 0, 34, 5, NEON.white);
  R(3, 1, 8, 1, NEON.mag); R(3, 3, 5, 1, NEON.teal); R(14, 1, 6, 3, NEON.yel); R(23, 1, 8, 1, INK); R(23, 3, 6, 1, INK);
};

const rack = (accent: string): ObjectArt => (R, t) => {
  R(1, 1, 22, 12, INK); R(0, 0, 22, 12, '#1a1030'); R(0, 0, 22, 1, accent); R(1, 2, 20, 2, '#2b2440');
  for (let i = 0; i < 5; i++) R(2 + i * 4, 6, 2, 2, Math.sin(t * 6 + i * 1.9) > 0 ? accent : '#2b2440');
  R(2, 10, 18, 1, accent);
};

const terminal: ObjectArt = (R, t) => {
  R(1, 5, 18, 10, INK); R(0, 4, 18, 10, '#2b2440'); R(1, 0, 16, 5, INK); R(2, 1, 14, 3, '#06363d');
  for (let k = 0; k < 2; k++) R(3, 1 + k * 2, 3 + ((frameAt(t, 4) + k * 5) % 9), 1, NEON.cyan);
  R(3, 8, 12, 3, '#3a3160'); R(4, 9, 2, 1, NEON.yel);
};

const arcade = (screen: string): ObjectArt => (R, t) => {
  R(1, 1, 16, 14, INK); R(0, 0, 16, 14, NEON.violet);
  R(1, 2, 5, 10, frameAt(t, 4) % 2 ? screen : NEON.white); R(8, 3, 6, 8, '#2b0f4a'); R(10, 5, 2, 2, NEON.mag); R(10, 9, 2, 1, NEON.yel);
};

const trophies: ObjectArt = (R) => {
  R(1, 1, 30, 8, INK); R(0, 0, 30, 8, '#5c2f4f');
  for (let i = 0; i < 4; i++) { R(3 + i * 7, 1, 4, 4, NEON.yel); R(4 + i * 7, 5, 2, 2, '#c9b520'); }
};

const reception: ObjectArt = (R) => {
  R(1, 1, 36, 12, INK); R(0, 0, 36, 12, NEON.white); R(0, 9, 36, 3, '#c9b8e0'); R(6, 2, 10, 5, NEON.mag); R(22, 3, 8, 3, '#2b2440');
};

const meeting: ObjectArt = (R) => {
  R(10, 0, 6, 2, NEON.mag); R(0, 7, 2, 6, NEON.cyan); R(24, 7, 2, 6, NEON.yel);
  R(6, 3, 16, 14, INK); R(4, 5, 20, 10, INK);
  R(5, 2, 16, 14, NEON.white); R(3, 4, 20, 10, NEON.white);
  R(9, 6, 8, 5, '#2b2440'); R(10, 7, 6, 2, NEON.cyan);
};

const mailbox: ObjectArt = (R) => {
  R(1, 1, 12, 16, INK); R(0, 0, 12, 16, NEON.yel); R(0, 13, 12, 3, '#c9b520'); R(2, 3, 8, 1, INK); R(4, 7, 4, 3, NEON.white);
};

const exit: ObjectArt = (R, t) => {
  R(0, 0, 24, 10, NEON.yel); R(2, 2, 20, 6, INK);
  const shift = frameAt(t, 4) % 3;
  R(6 + shift, 4, 8, 2, NEON.yel); R(12 + shift, 3, 2, 4, NEON.yel); R(14 + shift, 4, 1, 2, NEON.yel);
};

export const couch: ObjectArt = (R) => {
  R(1, 1, 48, 14, INK); R(0, 0, 48, 14, NEON.cyan); R(0, 10, 48, 4, NEON.teal); R(2, 2, 20, 7, '#a0f8ff'); R(26, 2, 20, 7, '#a0f8ff');
};

/** Art for every interactive object, keyed by the id used in the content and the map. */
export const OBJECT_ART: Readonly<Record<string, ObjectArt>> = {
  'desk-soulwise': deskMain,
  'desk-oboard': deskSecond,
  'archive-earlier': archive,
  'bookshelf-skills': bookshelf,
  'whiteboard-method': whiteboard,
  'rack-seo': rack(AGENT_COLORS[0]),
  'rack-content': rack(AGENT_COLORS[1]),
  'rack-qa': rack(AGENT_COLORS[2]),
  'rack-social': rack(AGENT_COLORS[3]),
  'terminal-ai': terminal,
  'arcade-saas': arcade(NEON.cyan),
  'arcade-forge': arcade(NEON.yel),
  'arcade-multi': arcade(NEON.pink),
  'shelf-results': trophies,
  'reception-glance': reception,
  'table-consulting': meeting,
  'mailbox-contact': mailbox,
  'exit-cv': exit,
};
