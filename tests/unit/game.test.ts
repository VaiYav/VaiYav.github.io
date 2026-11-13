import { describe, expect, it } from 'vitest';
import { FINALE, closeDialog, createGame, interact, nearId, openObject, stepGame, tapWorld, type World } from '../../src/game/world/game';

const desk = { id: 'desk', x: 40, y: 0, w: 20, h: 10 };
const shelf = { id: 'shelf', x: 100, y: 0, w: 20, h: 10 };
const world: World = {
  solids: [desk, shelf],
  placements: [desk, shelf],
  radius: 12,
  pathTo: (_from, to) => [to],
  pathNear: (_from, rect) => [{ x: rect.x + rect.w / 2, y: rect.y + rect.h + 6 }],
};
const still = { x: 0, y: 0 };

const settle = (game: ReturnType<typeof createGame>) => {
  let next = game;
  for (let i = 0; i < 400; i++) next = stepGame(next, still, 0.05, world);
  return next;
};

describe('near and open', () => {
  it('knows which object the hero stands next to', () => {
    expect(nearId(createGame({ x: 50, y: 18 }), world)).toBe('desk');
    expect(nearId(createGame({ x: 80, y: 60 }), world)).toBeNull();
  });

  it('opens the nearby object on interact and counts it as found', () => {
    const game = interact(createGame({ x: 50, y: 18 }), world);
    expect(game.open).toBe('desk');
    expect([...game.found]).toEqual(['desk']);
  });

  it('does nothing on interact when nothing is near', () => {
    const start = createGame({ x: 80, y: 60 });
    expect(interact(start, world)).toBe(start);
  });

  it('closes the dialogue on a second interact', () => {
    const game = interact(interact(createGame({ x: 50, y: 18 }), world), world);
    expect(game.open).toBeNull();
    expect(game.found.size).toBe(1);
  });

  it('keeps the hero in place while a dialogue is open', () => {
    const open = interact(createGame({ x: 50, y: 18 }), world);
    const next = stepGame(open, { x: 1, y: 0 }, 0.5, world);
    expect(next.hero.x).toBe(50);
    expect(nearId(next, world)).toBeNull();
  });

  it('does not count the same object twice', () => {
    const once = closeDialog(openObject(createGame({ x: 0, y: 30 }), 'desk'), world);
    expect(openObject(once, 'desk').found.size).toBe(1);
  });

  it('never mutates the previous state', () => {
    const start = createGame({ x: 50, y: 18 });
    interact(start, world);
    expect(start.open).toBeNull();
    expect(start.found.size).toBe(0);
  });
});

describe('finale', () => {
  it('shows once, after the last object is closed', () => {
    let game = closeDialog(openObject(createGame({ x: 0, y: 30 }), 'desk'), world);
    expect(game.open).toBeNull();
    game = openObject(game, 'shelf');
    expect(game.open).toBe('shelf');
    game = closeDialog(game, world);
    expect(game.open).toBe(FINALE);
    game = closeDialog(game, world);
    expect(game.open).toBeNull();
    game = closeDialog(openObject(game, 'desk'), world);
    expect(game.open).toBeNull();
  });
});

describe('tapWorld', () => {
  it('walks to a tapped spot on the floor', () => {
    const game = settle(tapWorld(createGame({ x: 0, y: 40 }), { x: 30, y: 40 }, world));
    expect(game.hero.x).toBeCloseTo(30);
    expect(game.open).toBeNull();
  });

  it('walks up to a tapped object and opens it on arrival', () => {
    const tapped = tapWorld(createGame({ x: 0, y: 40 }), { x: 110, y: 5 }, world);
    expect(tapped.open).toBeNull();
    const game = settle(tapped);
    expect(game.open).toBe('shelf');
    expect(game.found.has('shelf')).toBe(true);
  });

  it('opens at once when the tapped object is already in reach', () => {
    expect(tapWorld(createGame({ x: 50, y: 18 }), { x: 50, y: 5 }, world).open).toBe('desk');
  });

  it('opens the tapped object, not a nearer one', () => {
    const between = createGame({ x: 62, y: 16 });
    expect(nearId(between, world)).toBe('desk');
    expect(settle(tapWorld(between, { x: 110, y: 5 }, world)).open).toBe('shelf');
  });

  it('closes an open dialogue instead of walking', () => {
    const open = interact(createGame({ x: 50, y: 18 }), world);
    const game = tapWorld(open, { x: 200, y: 200 }, world);
    expect(game.open).toBeNull();
    expect(game.hero.target).toBeNull();
  });

  it('forgets the object when the keyboard takes over', () => {
    const tapped = tapWorld(createGame({ x: 0, y: 40 }), { x: 110, y: 5 }, world);
    const steered = stepGame(tapped, { x: 0, y: 1 }, 0.1, world);
    expect(settle(steered).open).toBeNull();
  });

  it('does not open an object it could not reach', () => {
    const blocked: World = { ...world, pathNear: () => [] };
    const game = settle(tapWorld(createGame({ x: 0, y: 40 }), { x: 110, y: 5 }, blocked));
    expect(game.open).toBeNull();
  });
});
