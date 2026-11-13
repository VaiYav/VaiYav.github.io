/** Size of the game world in logical pixels. */
export const WORLD = { width: 280, height: 190 } as const;

const MAX_SCALE = 6;

/**
 * Largest whole-number scale at which the world fits the available width,
 * and the available height too when one is given (full screen).
 */
export function fitScale(availableWidth: number, availableHeight = Number.POSITIVE_INFINITY): number {
  if (!Number.isFinite(availableWidth) || Number.isNaN(availableHeight)) return 1;
  const fit = Math.min(availableWidth / WORLD.width, availableHeight / WORLD.height);
  return Math.min(MAX_SCALE, Math.max(1, Math.floor(fit)));
}
