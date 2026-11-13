import { eventsAt, stepSeconds, type VoiceEvent } from './pattern';

/** Levels and filter cutoffs of every voice. Small phone speakers hear almost nothing below ~300 Hz. */
export const MIX = {
  master: 0.8,
  echoFeedback: 0.35,
  kick: 0.9,
  snare: 0.45,
  hat: 0.2,
  bass: { level: 0.32, cutoff: 380 },
  /** The bass an octave up as a square wave, so its line carries on speakers that cannot play the root. */
  bassEdge: { level: 0.1, cutoff: 1400 },
  arp: { level: 0.12, cutoff: 2200 },
  pad: { level: 0.07, cutoff: 1200 },
} as const;

const SILENCE = 0.001;
const LIMITER = { threshold: -14, knee: 8, ratio: 6, attack: 0.003, release: 0.2 } as const;

export interface Rig {
  readonly ctx: BaseAudioContext;
  readonly master: GainNode;
  readonly echo: DelayNode;
  readonly noise: AudioBuffer;
}

/** Builds the mixer on any audio context, live or offline, and routes it into out. */
export function createRig(ctx: BaseAudioContext, out: AudioNode): Rig {
  const master = ctx.createGain();
  master.gain.value = MIX.master;
  // Evens out the louder mix so the peaks never clip on a phone at full volume.
  const limiter = ctx.createDynamicsCompressor();
  limiter.threshold.value = LIMITER.threshold;
  limiter.knee.value = LIMITER.knee;
  limiter.ratio.value = LIMITER.ratio;
  limiter.attack.value = LIMITER.attack;
  limiter.release.value = LIMITER.release;
  master.connect(limiter);
  limiter.connect(out);
  const echo = ctx.createDelay();
  echo.delayTime.value = stepSeconds() * 3;
  const feedback = ctx.createGain();
  feedback.gain.value = MIX.echoFeedback;
  echo.connect(feedback);
  feedback.connect(echo);
  echo.connect(master);
  const noise = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
  const data = noise.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  return { ctx, master, echo, noise };
}

function tone(rig: Rig, type: OscillatorType, freq: number, at: number, length: number, level: number, cutoff: number, out: AudioNode): void {
  if (level <= 0) return;
  const osc = rig.ctx.createOscillator();
  const filter = rig.ctx.createBiquadFilter();
  const gain = rig.ctx.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(cutoff * 3, at);
  filter.frequency.exponentialRampToValueAtTime(cutoff, at + length);
  gain.gain.setValueAtTime(level, at);
  gain.gain.exponentialRampToValueAtTime(SILENCE, at + length);
  osc.connect(filter);
  filter.connect(gain);
  gain.connect(out);
  osc.start(at);
  osc.stop(at + length + 0.02);
}

function kick(rig: Rig, at: number): void {
  const osc = rig.ctx.createOscillator();
  const gain = rig.ctx.createGain();
  osc.frequency.setValueAtTime(150, at);
  osc.frequency.exponentialRampToValueAtTime(42, at + 0.12);
  gain.gain.setValueAtTime(MIX.kick, at);
  gain.gain.exponentialRampToValueAtTime(SILENCE, at + 0.22);
  osc.connect(gain);
  gain.connect(rig.master);
  osc.start(at);
  osc.stop(at + 0.25);
}

function hit(rig: Rig, at: number, length: number, level: number, type: BiquadFilterType, freq: number): void {
  const source = rig.ctx.createBufferSource();
  const filter = rig.ctx.createBiquadFilter();
  const gain = rig.ctx.createGain();
  source.buffer = rig.noise;
  filter.type = type;
  filter.frequency.value = freq;
  gain.gain.setValueAtTime(level, at);
  gain.gain.exponentialRampToValueAtTime(SILENCE, at + length);
  source.connect(filter);
  filter.connect(gain);
  gain.connect(rig.master);
  source.start(at);
  source.stop(at + length + 0.02);
}

function play(rig: Rig, event: VoiceEvent, at: number): void {
  const length = (event.steps ?? 1) * stepSeconds();
  const freq = event.freq ?? 0;
  if (event.kind === 'kick') kick(rig, at);
  else if (event.kind === 'snare') hit(rig, at, 0.16, MIX.snare, 'bandpass', 1800);
  else if (event.kind === 'hat') hit(rig, at, 0.04, MIX.hat, 'highpass', 7000);
  else if (event.kind === 'bass') {
    tone(rig, 'sawtooth', freq, at, length, MIX.bass.level, MIX.bass.cutoff, rig.master);
    tone(rig, 'square', freq * 2, at, length, MIX.bassEdge.level, MIX.bassEdge.cutoff, rig.master);
  } else if (event.kind === 'arp') tone(rig, 'square', freq, at, length, MIX.arp.level, MIX.arp.cutoff, rig.echo);
  else tone(rig, 'sawtooth', freq, at, length, MIX.pad.level, MIX.pad.cutoff, rig.master);
}

/** Queues count sixteenth notes starting at step from, the first at time at. Returns when the next one is due. */
export function queueSteps(rig: Rig, from: number, count: number, at: number): number {
  let time = at;
  for (let step = from; step < from + count; step++) {
    for (const event of eventsAt(step)) play(rig, event, time);
    time += stepSeconds();
  }
  return time;
}
