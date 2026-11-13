/* Original synth loop generated in the browser with Web Audio: no samples, no third-party recordings. */

const TRACK = {
  bpm: 112,
  // one bar per chord: bass root plus three arpeggio tones, as MIDI notes
  bars: [
    { root: 45, tones: [57, 60, 64] },
    { root: 41, tones: [53, 57, 60] },
    { root: 36, tones: [60, 64, 67] },
    { root: 43, tones: [55, 59, 62] },
  ],
  arp: [0, 1, 2, 1, 0, 2, 1, 2, 0, 1, 2, 1, 2, 1, 0, 2],
};
const hz = (midi) => 440 * 2 ** ((midi - 69) / 12);

function createLoop() {
  const ctx = new (window.AudioContext || window.webkitAudioContext)();
  const master = ctx.createGain();
  master.gain.value = 0.45;
  master.connect(ctx.destination);

  const delay = ctx.createDelay();
  delay.delayTime.value = 60 / TRACK.bpm * 0.75;
  const feedback = ctx.createGain();
  feedback.gain.value = 0.35;
  delay.connect(feedback); feedback.connect(delay); delay.connect(master);

  const noise = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
  const data = noise.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;

  const tone = (type, freq, at, len, level, cutoff, out = master) => {
    const osc = ctx.createOscillator();
    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();
    osc.type = type; osc.frequency.value = freq;
    filter.type = 'lowpass'; filter.frequency.setValueAtTime(cutoff * 3, at);
    filter.frequency.exponentialRampToValueAtTime(cutoff, at + len);
    gain.gain.setValueAtTime(level, at);
    gain.gain.exponentialRampToValueAtTime(0.001, at + len);
    osc.connect(filter); filter.connect(gain); gain.connect(out);
    osc.start(at); osc.stop(at + len + 0.02);
  };
  const kick = (at) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.frequency.setValueAtTime(150, at);
    osc.frequency.exponentialRampToValueAtTime(42, at + 0.12);
    gain.gain.setValueAtTime(0.9, at);
    gain.gain.exponentialRampToValueAtTime(0.001, at + 0.22);
    osc.connect(gain); gain.connect(master);
    osc.start(at); osc.stop(at + 0.25);
  };
  const hit = (at, len, level, type, freq) => {
    const src = ctx.createBufferSource();
    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();
    src.buffer = noise;
    filter.type = type; filter.frequency.value = freq;
    gain.gain.setValueAtTime(level, at);
    gain.gain.exponentialRampToValueAtTime(0.001, at + len);
    src.connect(filter); filter.connect(gain); gain.connect(master);
    src.start(at); src.stop(at + len + 0.02);
  };

  const stepLen = 60 / TRACK.bpm / 4;
  let step = 0;
  let nextAt = ctx.currentTime + 0.08;

  const schedule = (index, at) => {
    const bar = TRACK.bars[Math.floor(index / 16) % TRACK.bars.length];
    const s = index % 16;
    if (s % 4 === 0) kick(at);
    if (s === 4 || s === 12) hit(at, 0.16, 0.35, 'bandpass', 1800);
    if (s % 2 === 1) hit(at, 0.04, 0.12, 'highpass', 7000);
    if (s % 2 === 0) tone('sawtooth', hz(bar.root + (s === 6 || s === 14 ? 12 : 0)), at, stepLen * 1.8, 0.32, 380);
    tone('square', hz(bar.tones[TRACK.arp[s]] + 12), at, stepLen * 0.9, 0.06, 1600, delay);
    if (s === 0) bar.tones.forEach((n) => tone('sawtooth', hz(n), at, stepLen * 15, 0.045, 700));
  };

  const timer = window.setInterval(() => {
    while (nextAt < ctx.currentTime + 0.12) {
      schedule(step, nextAt);
      step += 1;
      nextAt += stepLen;
    }
  }, 25);

  return { stop: () => { window.clearInterval(timer); return ctx.close(); } };
}

(function bindMusicButton() {
  const button = document.getElementById('musicToggle');
  if (!button) return;
  let loop = null;
  button.addEventListener('click', () => {
    if (loop) { loop.stop(); loop = null; } else { loop = createLoop(); }
    button.textContent = loop ? '■ Остановить' : '▶ Включить луп';
    button.setAttribute('aria-pressed', String(Boolean(loop)));
  });
}());
