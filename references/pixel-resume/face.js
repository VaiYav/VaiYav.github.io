/* Builds pixel portraits from the real photo, entirely in the browser: downsample, cut the backdrop, remap colours. */

const PHOTO = { src: 'portrait.jpg', x: 58, y: 64, size: 680 };
const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5].map((v) => (v + 0.5) / 16 - 0.5);
const INK = '#0d0518';

const NATURAL = ['#15121f', '#2b2018', '#4a3426', '#6b4a34', '#9a7350', '#b98463', '#dba682', '#f4cfae', '#f9e3cc',
  '#a8604f', '#c98f7c', '#5f7fae', '#7fa6d6', '#a9c8ee', '#d6e6f9', '#ffffff', '#59606e'];
const RAMP_HOT = [INK, '#3a1f6b', '#8a1f6f', '#ff2e88', '#ff8a3d', '#fff35c', '#fdf6ff'];
const RAMP_KEY = [INK, '#4a1458', '#b0206f', '#ff2e88', '#ff71ce', '#ffd0e0', '#fdf6ff'];
const RAMP_RIM = [INK, '#12304a', '#05788a', '#01c8d8', '#01e7f0', '#a0f8ff', '#fdf6ff'];
const BANDS_BG = ['#2b0f4a', '#5a1a7a', '#b0206f', '#ff2e88', '#b0206f', '#5a1a7a'];

const clamp01 = (v) => Math.min(1, Math.max(0, v));
const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const NATURAL_RGB = NATURAL.map(hex);

/* Averages the crop into an n×n grid of [r, g, b]. */
function downsample(img, n) {
  const block = Math.floor(PHOTO.size / n);
  const side = block * n;
  const c = document.createElement('canvas');
  c.width = side; c.height = side;
  const ctx = c.getContext('2d');
  ctx.drawImage(img, PHOTO.x, PHOTO.y, PHOTO.size, PHOTO.size, 0, 0, side, side);
  const data = ctx.getImageData(0, 0, side, side).data;
  const cells = [];
  for (let cy = 0; cy < n; cy++) {
    for (let cx = 0; cx < n; cx++) {
      const sum = [0, 0, 0];
      for (let y = 0; y < block; y++) {
        for (let x = 0; x < block; x++) {
          const i = ((cy * block + y) * side + cx * block + x) * 4;
          sum[0] += data[i]; sum[1] += data[i + 1]; sum[2] += data[i + 2];
        }
      }
      cells.push(sum.map((v) => v / (block * block)));
    }
  }
  return cells;
}

const luma = ([r, g, b]) => (0.299 * r + 0.587 * g + 0.114 * b) / 255;

/* The studio backdrop is a cool grey: neutral or bluish, mid-dark. Flood from the frame edges so glasses stay. */
function backdropMask(cells, n) {
  const isGrey = ([r, g, b]) => r - b < 10 && luma([r, g, b]) < 0.6;
  const mask = new Array(n * n).fill(false);
  const queue = [];
  const visit = (x, y) => {
    if (x < 0 || y < 0 || x >= n || y >= n) return;
    const i = y * n + x;
    if (mask[i] || !isGrey(cells[i])) return;
    mask[i] = true; queue.push([x, y]);
  };
  for (let x = 0; x < n; x++) visit(x, 0);
  for (let y = 0; y < Math.floor(n * 0.6); y++) { visit(0, y); visit(n - 1, y); }
  while (queue.length) {
    const [x, y] = queue.pop();
    visit(x + 1, y); visit(x - 1, y); visit(x, y + 1); visit(x, y - 1);
  }
  return mask;
}

function nearestNatural([r, g, b]) {
  let best = 0, bestD = Infinity;
  NATURAL_RGB.forEach(([pr, pg, pb], i) => {
    const d = (r - pr) ** 2 * 0.9 + (g - pg) ** 2 * 1.2 + (b - pb) ** 2;
    if (d < bestD) { bestD = d; best = i; }
  });
  return NATURAL[best];
}

const tone = (cell, gain = 1.35, lift = 0.04) => clamp01((luma(cell) - 0.5) * gain + 0.5 + lift);
const rampAt = (ramp, v, x, y, spread = 1) => {
  const steps = ramp.length - 1;
  return ramp[Math.round(clamp01(v + BAYER[(y % 4) * 4 + (x % 4)] * spread / steps) * steps)];
};
const bandAt = (x, y, n, t) => {
  const size = n / 5;
  const v = (((y + t * n * 0.12) % (BANDS_BG.length * size)) + BANDS_BG.length * size) % (BANDS_BG.length * size) / size;
  const i = Math.floor(v);
  return BANDS_BG[(i + (v - i > 0.6 && (x + y) % 2 === 0 ? 1 : 0)) % BANDS_BG.length];
};

const STYLES = {
  natural: { animated: false, edge: null, bg: () => '#f6c945', px: (cell) => nearestNatural(cell.map((v) => clamp01(((v / 255 - 0.5) * 1.15 + 0.52)) * 255)) },
  hot: { animated: true, edge: INK, bg: bandAt, px: (cell, x, y) => rampAt(RAMP_HOT, tone(cell, 1.5, -0.13), x, y) },
  split: {
    animated: true, edge: INK, bg: bandAt,
    px: (cell, x, y, n) => {
      const side = x / n + BAYER[(y % 4) * 4 + (x % 4)] * 0.22;
      return rampAt(side < 0.52 ? RAMP_KEY : RAMP_RIM, tone(cell, 1.5, -0.1), x, y);
    },
  },
  brand: {
    animated: false, edge: '#111', bg: () => '#f6c945',
    px: (cell, x, y) => (tone(cell, 1.7, -0.14) + BAYER[(y % 4) * 4 + (x % 4)] * 0.55 > 0.5 ? '#ffffff' : '#111111'),
  },
};

function renderPortrait(ctx, model, style, t, ox = 0, oy = 0) {
  const { n, cells, mask } = model;
  const isBg = (x, y) => x < 0 || y < 0 || x >= n || y >= n || mask[y * n + x];
  for (let y = 0; y < n; y++) {
    for (let x = 0; x < n; x++) {
      const bg = mask[y * n + x];
      const onEdge = !bg && style.edge && (isBg(x - 1, y) || isBg(x + 1, y) || isBg(x, y - 1)) && y > 0 && x > 0 && x < n - 1;
      ctx.fillStyle = bg ? style.bg(x, y, n, t) : onEdge ? style.edge : style.px(cells[y * n + x], x, y, n);
      ctx.fillRect(ox + x, oy + y, 1, 1);
    }
  }
}

function startPortraits(img) {
  const models = new Map();
  const modelFor = (n) => {
    if (!models.has(n)) {
      const cells = downsample(img, n);
      models.set(n, { n, cells, mask: backdropMask(cells, n) });
    }
    return models.get(n);
  };
  /* Lets other boards draw the photo portrait into their own canvases. */
  window.pixelFace = { draw: (ctx, styleName, n, ox, oy, t) => renderPortrait(ctx, modelFor(n), STYLES[styleName], t, ox, oy) };
  const jobs = [...document.querySelectorAll('canvas[data-face]')].map((canvas) => {
    const n = Number(canvas.dataset.size);
    canvas.width = n; canvas.height = n;
    return { ctx: canvas.getContext('2d'), model: modelFor(n), style: STYLES[canvas.dataset.face] };
  });
  const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  jobs.forEach((job) => renderPortrait(job.ctx, job.model, job.style, 0));
  if (still) return;
  const animated = jobs.filter((job) => job.style.animated);
  window.setInterval(() => {
    const t = performance.now() / 1000;
    animated.forEach((job) => renderPortrait(job.ctx, job.model, job.style, t));
  }, 110);
}

(function loadPhoto() {
  const img = new Image();
  const status = document.getElementById('faceStatus');
  img.onload = () => startPortraits(img);
  img.onerror = () => { if (status) status.textContent = 'Не удалось загрузить portrait.jpg — открой страницу через локальный сервер.'; };
  img.src = PHOTO.src;
}());
