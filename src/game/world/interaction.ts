import type { Placement } from '../../data/game/map';
import { distanceToRect, type Point } from './collision';

function closest(point: Point, placements: readonly Placement[], reach: number): Placement | null {
  let best: Placement | null = null;
  let bestGap = Number.POSITIVE_INFINITY;
  for (const placement of placements) {
    const gap = distanceToRect(point, placement);
    if (gap <= reach && gap < bestGap) { best = placement; bestGap = gap; }
  }
  return best;
}

/** The object the hero can use from where it stands: the closest one within the radius. */
export const nearestObject = (point: Point, placements: readonly Placement[], radius: number): Placement | null =>
  closest(point, placements, radius);

/** The object under a tap. A little padding forgives a finger that lands beside a small object. */
export const objectAt = (point: Point, placements: readonly Placement[], pad: number): Placement | null =>
  closest(point, placements, pad);
