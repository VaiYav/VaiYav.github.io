import { intentFromKeys, isMoveKey } from '../engine/input';
import type { Point } from '../world/collision';

export interface Controls {
  /** Direction the held keys ask for right now. */
  intent(): Point;
  /** Page coordinates of the latest tap since the last call, or null. */
  takeTap(): Point | null;
  dispose(): void;
}

/**
 * Listens for movement keys on the focused stage and for taps on the canvas.
 * Keys are released when the stage loses focus, so the hero never runs on alone.
 */
export function bindControls(stage: HTMLElement, canvas: HTMLCanvasElement): Controls {
  let pressed: ReadonlySet<string> = new Set();
  let tap: Point | null = null;

  const onKeyDown = (event: KeyboardEvent) => {
    // A shortcut may swallow the matching keyup (macOS does with Cmd), so held keys are let go.
    if (event.metaKey || event.ctrlKey || event.altKey) { pressed = new Set(); return; }
    if (!isMoveKey(event.code)) return;
    event.preventDefault();
    pressed = new Set([...pressed, event.code]);
  };
  const onKeyUp = (event: KeyboardEvent) => {
    pressed = new Set([...pressed].filter((code) => code !== event.code));
  };
  const release = () => { pressed = new Set(); };
  const onClick = (event: MouseEvent) => { tap = { x: event.clientX, y: event.clientY }; };

  stage.addEventListener('keydown', onKeyDown);
  stage.addEventListener('keyup', onKeyUp);
  stage.addEventListener('focusout', release);
  window.addEventListener('blur', release);
  canvas.addEventListener('click', onClick);

  return {
    intent: () => intentFromKeys(pressed),
    takeTap: () => {
      const latest = tap;
      tap = null;
      return latest;
    },
    dispose: () => {
      stage.removeEventListener('keydown', onKeyDown);
      stage.removeEventListener('keyup', onKeyUp);
      stage.removeEventListener('focusout', release);
      window.removeEventListener('blur', release);
      canvas.removeEventListener('click', onClick);
    },
  };
}
