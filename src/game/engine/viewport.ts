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

export interface CanvasSize {
  /** Size the canvas is shown at, in CSS pixels. */
  readonly cssWidth: number;
  readonly cssHeight: number;
  /** Canvas pixels per world pixel. */
  readonly scale: number;
}

/** Below this many CSS pixels per world pixel, whole-pixel scaling would leave a phone screen half empty. */
const WHOLE_PIXELS_FROM = 2;
const MAX_BACKING = 12;

/**
 * How big to show the world and how many canvas pixels to give it.
 * Wide screens get whole CSS pixels; narrow ones fill the width, and the device pixel ratio keeps them sharp.
 */
export function canvasSize(availableWidth: number, availableHeight: number, pixelRatio: number): CanvasSize {
  const fit = Math.min(availableWidth / WORLD.width, availableHeight / WORLD.height);
  const display = fit >= WHOLE_PIXELS_FROM ? fitScale(availableWidth, availableHeight) : Math.max(fit, 1);
  const ratio = Number.isFinite(pixelRatio) && pixelRatio > 0 ? pixelRatio : 1;
  const scale = Math.min(MAX_BACKING, Math.max(1, Math.ceil(display * ratio)));
  return { cssWidth: WORLD.width * display, cssHeight: WORLD.height * display, scale };
}
