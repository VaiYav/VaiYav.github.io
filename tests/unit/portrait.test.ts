import { describe, expect, it } from 'vitest';
import { PLACEMENTS } from '../../src/data/game/map';
import { createGame, nearId, stepGame, tapWorld } from '../../src/game/world/game';
import { createOffice } from '../../src/game/world/office';
import { SPAWN } from '../../src/data/game/map';
import { drawFoundMarker, drawNearMarker } from '../../src/game/render/markers';
import type { Fill } from '../../src/game/render/painter';
import { PORTRAIT_SIZE, portraitFrameAt, portraitSprite, talkSeconds } from '../../src/game/render/portrait';

describe('portrait', () => {
  it('has three frames of the same size that differ only by expression', () => {
    const idle = portraitSprite('idle');
    const blink = portraitSprite('blink');
    const talk = portraitSprite('talk');
    for (const sprite of [idle, blink, talk]) expect(sprite.cells).toHaveLength(PORTRAIT_SIZE * PORTRAIT_SIZE);
    const changed = (other: typeof idle) => other.cells.filter((cell, i) => cell !== idle.cells[i]).length;
    expect(changed(blink)).toBeGreaterThan(0);
    expect(changed(blink)).toBeLessThan(60);
    expect(changed(talk)).toBeGreaterThan(0);
    expect(changed(talk)).toBeLessThan(60);
  });

  it('keeps the backdrop transparent and reuses built frames', () => {
    expect(portraitSprite('idle').cells[0]).toBeNull();
    expect(portraitSprite('idle')).toBe(portraitSprite('idle'));
  });

  it('blinks now and then, and moves the mouth only while talking', () => {
    expect(portraitFrameAt(false, 1)).toBe('idle');
    expect(portraitFrameAt(false, 3.3)).toBe('blink');
    const talking = new Set([0, 0.1, 0.2, 0.3, 0.4].map((time) => portraitFrameAt(true, time)));
    expect(talking).toEqual(new Set(['idle', 'talk']));
    expect(new Set([0, 0.1, 0.2, 0.3].map((time) => portraitFrameAt(false, time)))).toEqual(new Set(['idle']));
  });

  it('talks longer for longer texts, within limits', () => {
    expect(talkSeconds(0)).toBe(1.2);
    expect(talkSeconds(120)).toBeCloseTo(2.4);
    expect(talkSeconds(5000)).toBe(4);
  });
});

describe('markers', () => {
  const record = () => {
    const calls: { x: number; y: number; color: string }[] = [];
    const fill: Fill = (x, y, _w, _h, color) => { calls.push({ x, y, color }); };
    return { calls, fill };
  };
  const desk = PLACEMENTS[0];

  it('frames the nearby object and blinks between two colours', () => {
    const on = record();
    const off = record();
    drawNearMarker(on.fill, desk, true);
    drawNearMarker(off.fill, desk, false);
    expect(on.calls.some((call) => call.x === desk.x - 3 && call.y === desk.y - 3)).toBe(true);
    expect(on.calls[0].color).not.toBe(off.calls[0].color);
    expect(on.calls).toHaveLength(off.calls.length);
  });

  it('ticks off a found object at its top right corner', () => {
    const { calls, fill } = record();
    drawFoundMarker(fill, desk);
    expect(calls.length).toBeGreaterThan(2);
    for (const call of calls) expect(call.x).toBeGreaterThanOrEqual(desk.x + desk.w - 3);
  });
});

describe('the real office', () => {
  const office = createOffice();

  it('walks from the entrance to a tapped server rack and opens it', () => {
    const rack = PLACEMENTS.find((placement) => placement.id === 'rack-qa');
    if (!rack) throw new Error('rack-qa is missing from the map');
    let game = tapWorld(createGame(SPAWN), { x: rack.x + 5, y: rack.y + 5 }, office);
    expect(game.pending).toBe('rack-qa');
    for (let i = 0; i < 3000 && !game.open; i++) game = stepGame(game, { x: 0, y: 0 }, 1 / 60, office);
    expect(game.open).toBe('rack-qa');
  });

  it('starts with nothing in reach, so no dialogue is one key press away by accident', () => {
    expect(nearId(createGame(SPAWN), office)).toBeNull();
  });
});
