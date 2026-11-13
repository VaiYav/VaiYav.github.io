/**
 * Bakes the dialogue portrait from the photo into three palette-indexed frames
 * (idle, blink, talk), so the game ships a few kilobytes of text and never the photo.
 *
 * Run: npm run bake:portrait            (rewrites src/game/render/portrait-data.ts)
 *      npm run bake:portrait -- out.png (also writes an enlarged preview of the frames)
 */
import { writeFile } from 'node:fs/promises';
import sharp from 'sharp';

const SOURCE = new URL('../assets/unnamed.jpg', import.meta.url);
const TARGET = new URL('../src/game/render/portrait-data.ts', import.meta.url);
/** Square crop of the photo around the face, in photo pixels. */
const CROP = { left: 58, top: 64, size: 680 };
const SIZE = 48;
const PREVIEW_SCALE = 6;

const INK = '#0d0518';
/** Magenta key light on the left, cyan rim light on the right. */
const RAMP_KEY = [INK, '#4a1458', '#b0206f', '#ff2e88', '#ff71ce', '#ffd0e0', '#fdf6ff'];
const RAMP_RIM = [INK, '#12304a', '#05788a', '#01c8d8', '#01e7f0', '#a0f8ff', '#fdf6ff'];
const KEY_CODES = '0123456';
const RIM_CODES = '0abcdef';
const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5].map((v) => (v + 0.5) / 16 - 0.5);
const MOUTH_INSIDE = [34, 8, 26];

/** Feature positions as fractions of the crop, measured on the photo. */
const FEATURES = {
  eyes: [[0.437, 0.535], [0.694, 0.55]], eyeSize: [0.1, 0.04],
  mouth: [0.569, 0.795], mouthSize: [0.11, 0.035],
};

const clamp01 = (v) => Math.min(1, Math.max(0, v));
const luma = ([r, g, b]) => (0.299 * r + 0.587 * g + 0.114 * b) / 255;
const bayer = (x, y) => BAYER[(y % 4) * 4 + (x % 4)];

/** Averages the crop into a SIZE×SIZE grid of [r, g, b]. */
async function downsample() {
  const block = Math.floor(CROP.size / SIZE);
  const side = block * SIZE;
  const { data, info } = await sharp(SOURCE.pathname)
    .rotate()
    .extract({ left: CROP.left, top: CROP.top, width: CROP.size, height: CROP.size })
    .resize(side, side, { kernel: 'linear' })
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  if (info.channels !== 3) throw new Error(`Expected an RGB image, got ${info.channels} channels.`);
  const cells = [];
  for (let cy = 0; cy < SIZE; cy++) {
    for (let cx = 0; cx < SIZE; cx++) {
      const sum = [0, 0, 0];
      for (let y = 0; y < block; y++) {
        for (let x = 0; x < block; x++) {
          const i = ((cy * block + y) * side + cx * block + x) * 3;
          sum[0] += data[i]; sum[1] += data[i + 1]; sum[2] += data[i + 2];
        }
      }
      cells.push(sum.map((v) => v / (block * block)));
    }
  }
  return cells;
}

/** The studio backdrop is a cool grey. Flooding from the frame edges keeps the glasses. */
function backdropMask(cells) {
  const isGrey = ([r, g, b]) => r - b < 10 && luma([r, g, b]) < 0.6;
  const mask = new Array(SIZE * SIZE).fill(false);
  const queue = [];
  const visit = (x, y) => {
    if (x < 0 || y < 0 || x >= SIZE || y >= SIZE) return;
    const i = y * SIZE + x;
    if (mask[i] || !isGrey(cells[i])) return;
    mask[i] = true;
    queue.push([x, y]);
  };
  for (let x = 0; x < SIZE; x++) visit(x, 0);
  for (let y = 0; y < Math.floor(SIZE * 0.6); y++) { visit(0, y); visit(SIZE - 1, y); }
  while (queue.length) {
    const [x, y] = queue.pop();
    visit(x + 1, y); visit(x - 1, y); visit(x, y + 1); visit(x, y - 1);
  }
  return mask;
}

/** A copy of the cells with closed eyes or an open mouth painted in. */
function withExpression(cells, kind) {
  if (kind === 'idle') return cells;
  const next = cells.map((cell) => cell.slice());
  const fill = (cx, cy, w, h, colorAt) => {
    const x0 = Math.round(cx * SIZE - w / 2);
    const y0 = Math.round(cy * SIZE - h / 2);
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) next[(y0 + y) * SIZE + x0 + x] = colorAt(y, h);
  };
  if (kind === 'blink') {
    const w = Math.max(3, Math.round(FEATURES.eyeSize[0] * SIZE));
    const h = Math.max(2, Math.round(FEATURES.eyeSize[1] * SIZE));
    for (const [ex, ey] of FEATURES.eyes) {
      const skin = cells[Math.round((ey + 0.075) * SIZE) * SIZE + Math.round(ex * SIZE)];
      fill(ex, ey, w, h, (y, rows) => (y === rows - 1 ? skin.map((v) => v * 0.4) : skin));
    }
  }
  if (kind === 'talk') {
    const w = Math.max(3, Math.round(FEATURES.mouthSize[0] * SIZE));
    const h = Math.max(2, Math.round(FEATURES.mouthSize[1] * SIZE));
    fill(FEATURES.mouth[0], FEATURES.mouth[1], w, h, () => MOUTH_INSIDE);
  }
  return next;
}

/** Maps one frame to rows of palette codes; '.' is the transparent backdrop. */
function encode(cells, mask) {
  const isBg = (x, y) => x < 0 || y < 0 || x >= SIZE || y >= SIZE || mask[y * SIZE + x];
  const rows = [];
  for (let y = 0; y < SIZE; y++) {
    let row = '';
    for (let x = 0; x < SIZE; x++) {
      if (mask[y * SIZE + x]) { row += '.'; continue; }
      const onEdge = (isBg(x - 1, y) || isBg(x + 1, y) || isBg(x, y - 1)) && y > 0 && x > 0 && x < SIZE - 1;
      if (onEdge) { row += '0'; continue; }
      const codes = x / SIZE + bayer(x, y) * 0.22 < 0.52 ? KEY_CODES : RIM_CODES;
      const tone = clamp01((luma(cells[y * SIZE + x]) - 0.5) * 1.5 + 0.5 - 0.1);
      const steps = codes.length - 1;
      row += codes[Math.round(clamp01(tone + bayer(x, y) / steps) * steps)];
    }
    rows.push(row);
  }
  return rows;
}

const palette = Object.fromEntries([...RAMP_KEY.map((c, i) => [KEY_CODES[i], c]), ...RAMP_RIM.slice(1).map((c, i) => [RIM_CODES[i + 1], c])]);

function moduleSource(frames) {
  const frame = (name) => `  ${name}: [\n${frames[name].map((row) => `    '${row}',`).join('\n')}\n  ],`;
  return `/* Generated by scripts/bake-portrait.mjs from assets/unnamed.jpg. Do not edit by hand. */

export const PORTRAIT_SIZE = ${SIZE};

export const PORTRAIT_PALETTE: Readonly<Record<string, string>> = ${JSON.stringify(palette)};

/** Rows of palette codes; '.' is transparent. */
export const PORTRAIT_ROWS: Readonly<Record<'idle' | 'blink' | 'talk', readonly string[]>> = {
${['idle', 'blink', 'talk'].map(frame).join('\n')}
};
`;
}

async function writePreview(frames, path) {
  const names = Object.keys(frames);
  const width = SIZE * names.length;
  const pixels = Buffer.alloc(width * SIZE * 3);
  names.forEach((name, n) => frames[name].forEach((row, y) => [...row].forEach((code, x) => {
    const hex = code === '.' ? '#5a1a7a' : palette[code];
    const at = (y * width + n * SIZE + x) * 3;
    for (let c = 0; c < 3; c++) pixels[at + c] = parseInt(hex.slice(1 + c * 2, 3 + c * 2), 16);
  })));
  await sharp(pixels, { raw: { width, height: SIZE, channels: 3 } })
    .resize(width * PREVIEW_SCALE, SIZE * PREVIEW_SCALE, { kernel: 'nearest' })
    .png()
    .toFile(path);
}

try {
  const cells = await downsample();
  const mask = backdropMask(cells);
  const frames = Object.fromEntries(['idle', 'blink', 'talk'].map((kind) => [kind, encode(withExpression(cells, kind), mask)]));
  await writeFile(TARGET, moduleSource(frames));
  const preview = process.argv[2];
  if (preview) await writePreview(frames, preview);
  process.stdout.write(`Baked ${SIZE}×${SIZE} portrait frames into ${TARGET.pathname}\n`);
} catch (error) {
  process.stderr.write(`Portrait bake failed: ${error instanceof Error ? error.message : String(error)}\n`);
  process.exitCode = 1;
}
