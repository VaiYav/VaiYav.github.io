import type { Point } from '../world/collision';
import { WORLD } from './viewport';

export interface Camera {
  /** Rotation of the world around its centre, in radians. */
  readonly angle: number;
  readonly scale: number;
}

export interface ClientRect {
  readonly left: number;
  readonly top: number;
  readonly width: number;
  readonly height: number;
}

const SWAY_SPEED = 0.5;
const SWAY_ANGLE = 0.04;
const CENTRE: Point = { x: WORLD.width / 2, y: WORLD.height / 2 };

/** The slowly swaying camera; it stays level when the visitor prefers reduced motion. */
export const cameraAt = (time: number, still = false): Camera => ({
  angle: still ? 0 : Math.sin(time * SWAY_SPEED) * SWAY_ANGLE,
  scale: 1,
});

function turn(point: Point, angle: number, scale: number): Point {
  const dx = point.x - CENTRE.x;
  const dy = point.y - CENTRE.y;
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  return { x: CENTRE.x + (dx * cos - dy * sin) * scale, y: CENTRE.y + (dx * sin + dy * cos) * scale };
}

/** Where a world point lands on the unscaled view. */
export const worldToView = (point: Point, camera: Camera): Point => turn(point, camera.angle, camera.scale);

/** The world point under a point of the unscaled view. */
export const viewToWorld = (point: Point, camera: Camera): Point => turn(point, -camera.angle, 1 / camera.scale);

/** Converts page coordinates of a click into view pixels, whatever size the canvas is shown at. */
export const clientToView = (point: Point, rect: ClientRect): Point => ({
  x: ((point.x - rect.left) / rect.width) * WORLD.width,
  y: ((point.y - rect.top) / rect.height) * WORLD.height,
});
