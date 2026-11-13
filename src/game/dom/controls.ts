import { intentFromKeys, isMoveKey } from '../engine/input';
import type { Point } from '../world/collision';

export type Action = 'interact' | 'close';

export interface Controls {
  /** Direction the held keys ask for right now. */
  intent(): Point;
  /** Page coordinates of the latest tap since the last call, or null. */
  takeTap(): Point | null;
  dispose(): void;
}

/**
 * Listens for movement and action keys on the focused stage and for taps on the canvas.
 * Action keys are reported at once, so they work even while the loop is paused.
 * Keys are released when the stage loses focus, so the hero never runs on alone.
 */
export function bindControls(stage: HTMLElement, canvas: HTMLCanvasElement, onAction: (action: Action) => void): Controls {
  let pressed: ReadonlySet<string> = new Set();
  let tap: Point | null = null;

  /** Enter and Space belong to a focused link or button; E works everywhere. */
  const actionFor = (event: KeyboardEvent): Action | null => {
    if (event.code === 'Escape') return 'close';
    if (event.code === 'KeyE') return 'interact';
    const onControl = event.target instanceof Element && event.target.closest('a, button') !== null;
    return (event.code === 'Enter' || event.code === 'Space') && !onControl ? 'interact' : null;
  };

  const onKeyDown = (event: KeyboardEvent) => {
    // A shortcut may swallow the matching keyup (macOS does with Cmd), so held keys are let go.
    if (event.metaKey || event.ctrlKey || event.altKey) { pressed = new Set(); return; }
    const action = actionFor(event);
    if (action) {
      // A held key repeats; one press is one action.
      if (!event.repeat) onAction(action);
      if (action === 'interact') event.preventDefault();
      return;
    }
    // Inside the dialogue the arrow keys scroll its text.
    const inDialog = event.target instanceof Element && event.target.closest('[data-game-dialog]') !== null;
    if (!isMoveKey(event.code) || inDialog) return;
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
