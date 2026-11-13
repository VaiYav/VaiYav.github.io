import { describe, expect, it } from 'vitest';
import { nearestObject, objectAt } from '../../src/game/world/interaction';

const desk = { id: 'desk', x: 10, y: 10, w: 20, h: 10 };
const lamp = { id: 'lamp', x: 34, y: 10, w: 4, h: 4 };
const mat = { id: 'mat', x: 60, y: 60, w: 10, h: 10, walkable: true };
const all = [desk, lamp, mat];

describe('nearestObject', () => {
  it('finds nothing when every object is out of reach', () => {
    expect(nearestObject({ x: 100, y: 100 }, all, 12)).toBeNull();
  });

  it('picks the closest object within the radius', () => {
    expect(nearestObject({ x: 31, y: 25 }, all, 12)?.id).toBe('desk');
    expect(nearestObject({ x: 33, y: 15 }, all, 12)?.id).toBe('lamp');
  });

  it('counts standing on a walkable object as next to it', () => {
    expect(nearestObject({ x: 65, y: 65 }, all, 12)?.id).toBe('mat');
  });
});

describe('objectAt', () => {
  it('hits an object under the tap', () => {
    expect(objectAt({ x: 15, y: 15 }, all, 3)?.id).toBe('desk');
  });

  it('forgives a tap that lands just beside a small object', () => {
    expect(objectAt({ x: 40, y: 12 }, all, 3)?.id).toBe('lamp');
    expect(objectAt({ x: 45, y: 12 }, all, 3)).toBeNull();
  });

  it('prefers the object actually under the finger over a padded neighbour', () => {
    expect(objectAt({ x: 31, y: 12 }, all, 3)?.id).toBe('desk');
    expect(objectAt({ x: 33, y: 12 }, all, 3)?.id).toBe('lamp');
  });
});
