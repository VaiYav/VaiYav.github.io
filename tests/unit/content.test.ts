import { describe, expect, it } from 'vitest';
import { gameObjects, objectsByRoom, roomOrder, rooms } from '../../src/data/game/content';

describe('game content', () => {
  it('describes eighteen interactive objects', () => {
    expect(gameObjects).toHaveLength(18);
  });

  it('gives every object a unique id', () => {
    const ids = gameObjects.map((object) => object.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('gives every object a title and a body that fits a dialogue box', () => {
    for (const object of gameObjects) {
      expect(object.title.trim().length, object.id).toBeGreaterThan(0);
      expect(object.body.trim().length, object.id).toBeGreaterThan(20);
      expect(object.body.length, object.id).toBeLessThanOrEqual(280);
    }
  });

  it('places every object in a known room and leaves no room empty', () => {
    for (const object of gameObjects) expect(roomOrder).toContain(object.room);
    for (const room of roomOrder) {
      expect(rooms[room].title.length).toBeGreaterThan(0);
      expect(objectsByRoom(room).length, room).toBeGreaterThan(0);
    }
  });

  it('returns room objects without exposing the shared list to mutation', () => {
    const first = objectsByRoom('office');
    const second = objectsByRoom('office');
    expect(first).not.toBe(second);
    expect(first).toEqual(second);
  });

  it('only links to http, mailto or site-relative targets', () => {
    const links = gameObjects.flatMap((object) => object.links ?? []);
    expect(links.length).toBeGreaterThan(0);
    for (const link of links) {
      expect(link.label.length).toBeGreaterThan(0);
      expect(link.href).toMatch(/^(https:\/\/|mailto:|\/)/);
    }
  });

  it('keeps the plain résumé one object away', () => {
    const exit = gameObjects.find((object) => object.id === 'exit-cv');
    expect(exit?.links?.[0]?.href).toBe('/valentyn-yakovliev-recruiter-resume.html');
  });
});
