import { describe, expect, it } from 'vitest';
import { LOOP_STEPS, eventsAt, hz, stepSeconds } from '../../src/game/audio/pattern';

const kinds = (index: number) => eventsAt(index).map((event) => event.kind);

describe('synth pattern', () => {
  it('converts MIDI notes to frequencies', () => {
    expect(hz(69)).toBe(440);
    expect(hz(57)).toBeCloseTo(220);
  });

  it('plays sixteenth notes at 112 beats a minute', () => {
    expect(stepSeconds()).toBeCloseTo(60 / 112 / 4);
  });

  it('opens each bar with a kick, the bass root, an arpeggio note and a three-note pad', () => {
    const first = eventsAt(0);
    expect(kinds(0)).toEqual(['kick', 'bass', 'arp', 'pad', 'pad', 'pad']);
    expect(first.find((event) => event.kind === 'bass')?.freq).toBeCloseTo(hz(45));
    expect(first.find((event) => event.kind === 'arp')?.freq).toBeCloseTo(hz(57 + 12));
  });

  it('puts the kick on every beat, the snare on two and four, hats on the off steps', () => {
    for (const step of [0, 4, 8, 12]) expect(kinds(step)).toContain('kick');
    expect(kinds(4)).toContain('snare');
    expect(kinds(12)).toContain('snare');
    expect(kinds(8)).not.toContain('snare');
    expect(kinds(3)).toEqual(['hat', 'arp']);
  });

  it('lifts the bass an octave on the pickup steps', () => {
    expect(eventsAt(6).find((event) => event.kind === 'bass')?.freq).toBeCloseTo(hz(45 + 12));
  });

  it('moves through four chords and then repeats', () => {
    const roots = [0, 16, 32, 48].map((index) => eventsAt(index).find((event) => event.kind === 'bass')?.freq);
    expect(roots).toEqual([hz(45), hz(41), hz(36), hz(43)]);
    expect(LOOP_STEPS).toBe(64);
    expect(eventsAt(LOOP_STEPS + 5)).toEqual(eventsAt(5));
  });
});
