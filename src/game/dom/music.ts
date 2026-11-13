import { eventsAt, stepSeconds, type VoiceEvent } from '../audio/pattern';

export interface Music {
  /** Turns the loop on or off and reports whether it is now on. */
  toggle(): boolean;
  /** Holds the sound while the game is paused or out of sight, without changing the on/off choice. */
  setPaused(paused: boolean): void;
  /** 'off' until first switched on, then the audio context's own state. */
  state(): string;
  dispose(): void;
}

const MASTER_LEVEL = 0.45;
const ECHO_FEEDBACK = 0.35;
/** How far ahead notes are queued, and how often the queue is topped up. */
const LOOK_AHEAD = 0.12;
const TICK_MS = 25;
const START_DELAY = 0.08;
const SILENCE = 0.001;

interface Rig {
  readonly ctx: AudioContext;
  readonly master: GainNode;
  readonly echo: DelayNode;
  readonly noise: AudioBuffer;
}

function buildRig(): Rig {
  const Context = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Context) throw new Error('Web Audio is not available in this browser.');
  const ctx = new Context();
  const master = ctx.createGain();
  master.gain.value = MASTER_LEVEL;
  master.connect(ctx.destination);
  const echo = ctx.createDelay();
  echo.delayTime.value = stepSeconds() * 3;
  const feedback = ctx.createGain();
  feedback.gain.value = ECHO_FEEDBACK;
  echo.connect(feedback);
  feedback.connect(echo);
  echo.connect(master);
  const noise = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
  const data = noise.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  return { ctx, master, echo, noise };
}

function tone(rig: Rig, type: OscillatorType, freq: number, at: number, length: number, level: number, cutoff: number, out: AudioNode): void {
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
  gain.gain.setValueAtTime(0.9, at);
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
  else if (event.kind === 'snare') hit(rig, at, 0.16, 0.35, 'bandpass', 1800);
  else if (event.kind === 'hat') hit(rig, at, 0.04, 0.12, 'highpass', 7000);
  else if (event.kind === 'bass') tone(rig, 'sawtooth', freq, at, length, 0.32, 380, rig.master);
  else if (event.kind === 'arp') tone(rig, 'square', freq, at, length, 0.06, 1600, rig.echo);
  else tone(rig, 'sawtooth', freq, at, length, 0.045, 700, rig.master);
}

/** The synth loop. Nothing is created until it is first switched on, which must happen inside a click. */
export function createMusic(): Music {
  let rig: Rig | null = null;
  let timer: number | null = null;
  let on = false;
  let paused = false;
  let step = 0;
  let nextAt = 0;

  const fill = (current: Rig) => {
    while (nextAt < current.ctx.currentTime + LOOK_AHEAD) {
      for (const event of eventsAt(step)) play(current, event, nextAt);
      step += 1;
      nextAt += stepSeconds();
    }
  };
  const stopTimer = () => {
    if (timer !== null) window.clearInterval(timer);
    timer = null;
  };
  /** Brings the sound in line with the on/off choice and the pause. */
  const apply = () => {
    const audible = on && !paused;
    if (audible && !rig) rig = buildRig();
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
