import { describe, expect, it } from 'vitest';
import { createLoop, type Scheduler } from '../../src/game/engine/loop';

/** A scheduler the test drives by hand. */
function fakeScheduler() {
  let next = 1;
  const pending = new Map<number, (ms: number) => void>();
  const scheduler: Scheduler = {
    request: (callback) => { const id = next++; pending.set(id, callback); return id; },
    cancel: (id) => { pending.delete(id); },
  };
  const fire = (ms: number) => {
    const callbacks = [...pending.values()];
    pending.clear();
    callbacks.forEach((callback) => callback(ms));
  };
  return { scheduler, fire, pendingCount: () => pending.size };
}

describe('createLoop', () => {
  it('does nothing until started', () => {
    const { scheduler, pendingCount } = fakeScheduler();
    const loop = createLoop(() => {}, scheduler);
    expect(loop.running).toBe(false);
    expect(pendingCount()).toBe(0);
  });

  it('ticks with elapsed seconds between frames', () => {
    const { scheduler, fire } = fakeScheduler();
    const ticks: Array<[number, number]> = [];
    const loop = createLoop((dt, time) => ticks.push([dt, time]), scheduler);
    loop.start();
    fire(1000);
    fire(1016);
    fire(1032);
    expect(ticks).toHaveLength(3);
    expect(ticks[0]).toEqual([0, 0]);
    expect(ticks[1][0]).toBeCloseTo(0.016);
    expect(ticks[2][1]).toBeCloseTo(0.032);
  });

  it('clamps a long pause so the world does not jump', () => {
    const { scheduler, fire } = fakeScheduler();
    const deltas: number[] = [];
    const loop = createLoop((dt) => deltas.push(dt), scheduler);
    loop.start();
    fire(0);
    fire(5000);
    expect(deltas[1]).toBe(0.1);
  });

  it('stops ticking and cancels the pending frame', () => {
    const { scheduler, fire, pendingCount } = fakeScheduler();
    let count = 0;
    const loop = createLoop(() => { count += 1; }, scheduler);
    loop.start();
    fire(0);
    loop.stop();
    expect(loop.running).toBe(false);
    expect(pendingCount()).toBe(0);
    fire(16);
    expect(count).toBe(1);
  });

  it('ignores a second start while running', () => {
    const { scheduler, pendingCount } = fakeScheduler();
    const loop = createLoop(() => {}, scheduler);
    loop.start();
    loop.start();
    expect(pendingCount()).toBe(1);
  });

  it('resumes without counting the time spent stopped', () => {
    const { scheduler, fire } = fakeScheduler();
    const times: number[] = [];
    const loop = createLoop((_dt, time) => times.push(time), scheduler);
    loop.start();
    fire(0);
    fire(100);
    loop.stop();
    loop.start();
    fire(9000);
    expect(times[2]).toBeCloseTo(0.1);
  });
});
