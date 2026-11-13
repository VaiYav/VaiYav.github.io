/** Size of the game world in logical pixels. */
export const WORLD = { width: 280, height: 190 } as const;

const MAX_SCALE = 6;

/** Largest whole-number scale at which the world fits the available width. */
export function fitScale(availableWidth: number): number {
  if (!Number.isFinite(availableWidth)) return 1;
  return Math.min(MAX_SCALE, Math.max(1, Math.floor(availableWidth / WORLD.width)));
}
