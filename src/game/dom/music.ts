import { createRig, queueSteps, type Rig } from '../audio/synth';

export interface Music {
  /** Turns the loop on or off and reports whether it is now on. */
  toggle(): boolean;
  /** Holds the sound while the game is paused or out of sight, without changing the on/off choice. */
  setPaused(paused: boolean): void;
  /** 'off' until first switched on, then the audio context's own state. */
  state(): string;
  dispose(): void;
}

/** How far ahead notes are queued, and how often the queue is topped up. */
const LOOK_AHEAD = 0.12;
const TICK_MS = 25;
const START_DELAY = 0.08;

type AudioSessionNavigator = Navigator & { audioSession?: { type: string } };

/**
 * On iPhone every browser runs on WebKit, which mutes Web Audio while the ring/silent switch is on.
 * Declaring the sound as playback, like a music player, lets it through. Other browsers have no such switch.
 */
function playThroughSilentSwitch(): void {
  const session = (navigator as AudioSessionNavigator).audioSession;
  if (!session) return;
  try {
    session.type = 'playback';
  } catch {
    // An older WebKit may refuse the type; the music then simply follows the switch.
  }
}

function liveRig(): Rig & { readonly ctx: AudioContext } {
  const Context = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Context) throw new Error('Web Audio is not available in this browser.');
  playThroughSilentSwitch();
  const ctx = new Context();
  return { ...createRig(ctx, ctx.destination), ctx };
}

/** The synth loop. Nothing is created until it is first switched on, which must happen inside a click. */
export function createMusic(): Music {
  let rig: (Rig & { readonly ctx: AudioContext }) | null = null;
  let timer: number | null = null;
  let on = false;
  let paused = false;
  let step = 0;
  let nextAt = 0;

  const fill = (current: Rig) => {
    while (nextAt < current.ctx.currentTime + LOOK_AHEAD) {
      nextAt = queueSteps(current, step, 1, nextAt);
      step += 1;
    }
  };
  const stopTimer = () => {
    if (timer !== null) window.clearInterval(timer);
    timer = null;
  };
  /** Brings the sound in line with the on/off choice and the pause. */
  const apply = () => {
    const audible = on && !paused;
    const current = rig;
    if (!current) return;
    stopTimer();
    // Suspending or resuming can only fail on a closed context, which dispose() never leaves behind.
    if (!audible) { current.ctx.suspend().catch(() => undefined); return; }
    current.ctx.resume().catch(() => undefined);
    nextAt = Math.max(nextAt, current.ctx.currentTime + START_DELAY);
    timer = window.setInterval(() => fill(current), TICK_MS);
  };

  return {
    toggle() {
      on = !on;
      try {
        // Built here and nowhere else: a browser only lets sound start from inside a click.
        if (on && !rig) rig = liveRig();
        apply();
      } catch (error) {
        on = false;
        throw error;
      }
      return on;
    },
    setPaused(next) {
      if (paused === next) return;
      paused = next;
      apply();
    },
    state: () => (rig ? rig.ctx.state : 'off'),
    dispose() {
      stopTimer();
      on = false;
      rig?.ctx.close().catch(() => undefined);
      rig = null;
    },
  };
}
