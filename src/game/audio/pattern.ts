/* The original synth loop as data: which sounds start on each sixteenth note. No samples, no recordings. */

export type VoiceKind = 'kick' | 'snare' | 'hat' | 'bass' | 'arp' | 'pad';

export interface VoiceEvent {
  readonly kind: VoiceKind;
  /** Pitch in hertz for the pitched voices. */
  readonly freq?: number;
  /** Length in sixteenth-note steps for the pitched voices. */
  readonly steps?: number;
}

const BPM = 112;
const STEPS_PER_BAR = 16;
const OCTAVE = 12;
/** One bar per chord (Am, F, C, G): bass root plus three arpeggio tones, as MIDI notes. */
const BARS = [
  { root: 45, tones: [57, 60, 64] },
  { root: 41, tones: [53, 57, 60] },
  { root: 36, tones: [60, 64, 67] },
  { root: 43, tones: [55, 59, 62] },
] as const;
/** Which chord tone the arpeggio plays on each step of a bar. */
const ARP = [0, 1, 2, 1, 0, 2, 1, 2, 0, 1, 2, 1, 2, 1, 0, 2] as const;
const BASS_PICKUPS = [6, 14];
const SNARE_STEPS = [4, 12];

export const LOOP_STEPS = BARS.length * STEPS_PER_BAR;

export const hz = (midi: number): number => 440 * 2 ** ((midi - 69) / OCTAVE);

/** Length of one sixteenth note in seconds. */
export const stepSeconds = (): number => 60 / BPM / 4;

/** Everything that starts on the given sixteenth note; the pattern repeats every LOOP_STEPS. */
export function eventsAt(index: number): readonly VoiceEvent[] {
  const bar = BARS[Math.floor(index / STEPS_PER_BAR) % BARS.length];
  const step = index % STEPS_PER_BAR;
  const events: VoiceEvent[] = [];
  if (step % 4 === 0) events.push({ kind: 'kick' });
  if (SNARE_STEPS.includes(step)) events.push({ kind: 'snare' });
  if (step % 2 === 1) events.push({ kind: 'hat' });
  if (step % 2 === 0) events.push({ kind: 'bass', freq: hz(bar.root + (BASS_PICKUPS.includes(step) ? OCTAVE : 0)), steps: 1.8 });
  events.push({ kind: 'arp', freq: hz(bar.tones[ARP[step]] + OCTAVE), steps: 0.9 });
  if (step === 0) for (const tone of bar.tones) events.push({ kind: 'pad', freq: hz(tone), steps: 15 });
  return events;
}
