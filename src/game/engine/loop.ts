/** Longest step the world is allowed to take in one frame, in seconds. */
const MAX_STEP = 0.1;

export interface Scheduler {
  request(callback: (ms: number) => void): number;
  cancel(id: number): void;
}

export interface Loop {
  start(): void;
  stop(): void;
  readonly running: boolean;
}

export type Tick = (deltaSeconds: number, timeSeconds: number) => void;

const browserScheduler: Scheduler = {
  request: (callback) => window.requestAnimationFrame(callback),
  cancel: (id) => window.cancelAnimationFrame(id),
};

/**
 * Frame loop with game time that only advances while running.
 * The scheduler is injectable so the loop can be tested without a browser.
 */
export function createLoop(tick: Tick, scheduler: Scheduler = browserScheduler): Loop {
  let frameId: number | null = null;
  let lastMs: number | null = null;
  let time = 0;

  const onFrame = (ms: number) => {
    const delta = lastMs === null ? 0 : Math.min(MAX_STEP, Math.max(0, (ms - lastMs) / 1000));
    lastMs = ms;
    time += delta;
    frameId = scheduler.request(onFrame);
    tick(delta, time);
  };

  return {
    start() {
      if (frameId !== null) return;
      lastMs = null;
      frameId = scheduler.request(onFrame);
    },
    stop() {
      if (frameId === null) return;
      scheduler.cancel(frameId);
      frameId = null;
    },
    get running() {
      return frameId !== null;
    },
  };
}
