import { describe, expect, it } from 'vitest';
import { cameraAt, clientToView, viewToWorld, worldToView } from '../../src/game/engine/camera';
import { WORLD } from '../../src/game/engine/viewport';

describe('camera', () => {
  it('sways over time and stays level when motion is reduced', () => {
    expect(cameraAt(1).angle).not.toBe(0);
    expect(cameraAt(1, true).angle).toBe(0);
  });

  it('keeps the centre of the world in the centre of the view', () => {
    const centre = { x: WORLD.width / 2, y: WORLD.height / 2 };
    const view = worldToView(centre, cameraAt(3));
    expect(view.x).toBeCloseTo(centre.x);
    expect(view.y).toBeCloseTo(centre.y);
  });

  it('maps view points back to the same world point', () => {
    const camera = cameraAt(2.5);
    for (const point of [{ x: 30, y: 40 }, { x: 250, y: 170 }, { x: 140, y: 95 }]) {
      const back = viewToWorld(worldToView(point, camera), camera);
      expect(back.x).toBeCloseTo(point.x);
      expect(back.y).toBeCloseTo(point.y);
    }
  });
});

describe('clientToView', () => {
  it('converts a click on a scaled, offset canvas into world-sized view pixels', () => {
    const rect = { left: 100, top: 50, width: WORLD.width * 3, height: WORLD.height * 3 };
    expect(clientToView({ x: 100, y: 50 }, rect)).toEqual({ x: 0, y: 0 });
    const middle = clientToView({ x: 100 + rect.width / 2, y: 50 + rect.height / 2 }, rect);
    expect(middle.x).toBeCloseTo(WORLD.width / 2);
    expect(middle.y).toBeCloseTo(WORLD.height / 2);
  });
});
