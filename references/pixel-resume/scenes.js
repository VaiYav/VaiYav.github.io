/* Mounts the sprite previews and the four concept scenes. Depends on sprites.js. */

const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const drawers = [];

/* Registers a canvas whose logical size is w×h "pixels", shown at an integer scale. */
function mount(id, w, h, scale, draw) {
  const canvas = document.getElementById(id);
  if (!canvas) return;
  canvas.width = w * scale;
  canvas.height = h * scale;
  const ctx = canvas.getContext('2d');
  const R = (x, y, ww, hh, c) => { ctx.fillStyle = c; ctx.fillRect(x, y, ww, hh); };
  const T = (str, x, y, c, size = 6, align = 'left') => {
    ctx.fillStyle = c; ctx.font = `${size}px Silkscreen, monospace`; ctx.textAlign = align; ctx.fillText(str, x, y);
  };
  drawers.push((t) => {
    ctx.setTransform(scale, 0, 0, scale, 0, 0);
    ctx.clearRect(0, 0, w, h);
    draw(ctx, t, R, T);
  });
}

const frame = (t, fps) => Math.floor(t * fps);
const blinkAt = (t) => t % 3.2 > 3.05;
const wrap = (v, len) => ((v % len) + len) % len;
const hash = (a, b) => Math.abs(Math.sin(a * 127.1 + b * 311.7) * 43758.5453) % 1;

/* ---------- character cards ---------- */

mount('charA', 18, 26, 10, (c, t) => paint(c, outlined(chibi()), 0, frame(t, 2) % 2));
mount('charB', 34, 50, 6, (c, t) => paint(c, outlined(hero({ bob: frame(t, 2) % 2, blink: blinkAt(t) })), 0, 0));
mount('charC', 48, 48, 5, (c, t) => paint(c, bust(blinkAt(t)), 0, 0));
mount('charD', 34, 50, 6, (c, t) => paint(c, outlined(hero({ bob: frame(t, 2) % 2, blink: blinkAt(t) })), 0, 0, BRAND));

const pose = (id, opts) => mount(id, 34, 50, 3, (c, t) => paint(c, outlined(hero(opts(t))), 0, 0));
pose('poseIdle', (t) => ({ bob: frame(t, 2) % 2, blink: blinkAt(t) }));
pose('poseWalk', (t) => ({ step: frame(t, 7) % 4, bob: frame(t, 7) % 2 }));
pose('poseCode', (t) => ({ arms: 'code', tick: frame(t, 6) }));
pose('poseShip', (t) => ({ arms: 'ship', tick: frame(t, 4), bob: frame(t, 4) % 2 }));
pose('poseWave', (t) => ({ arms: 'wave', tick: frame(t, 5) }));
mount('poseBots', 34, 50, 3, (c, t) => {
  BOT_COLORS.forEach((col, i) => {
    const hop = frame(t + i * 0.3, 3) % 2;
    paint(c, outlined(bot(col, frame(t, 4) + i)), 2 + (i % 2) * 17, 8 + Math.floor(i / 2) * 20 + hop);
  });
});

/* ---------- 1 · Career Run ---------- */

const STARS = Array.from({ length: 46 }, (_, i) => [Math.floor(hash(i, 1) * 240), Math.floor(hash(i, 2) * 78)]);
const FAR = [[0, 26, 30], [30, 18, 44], [52, 30, 24], [88, 22, 52], [114, 34, 34], [152, 20, 46], [176, 28, 28], [208, 30, 40]];
const NEAR = [[10, 30, 22], [60, 24, 34], [104, 40, 18], [160, 26, 30], [200, 34, 24]];
const STOPS = [
  { x: 40, a: '2017', b: 'FIRST JOB' },
  { x: 200, a: '2022', b: 'OBOARD' },
  { x: 360, a: '2025', b: 'SOULWISE AI' },
  { x: 520, a: 'NOW', b: 'AI CONSULTING' },
];
const CHIPS = ['VUE', 'TS', 'NODE', 'AI'];
const LOOP = 640;

function skyline(R, list, shift, base, wall, lit) {
  list.forEach(([x, w, h], n) => {
    for (const off of [0, -240]) {
      const sx = Math.floor(wrap(x - shift, 240)) + off;
      R(sx, base - h, w, h, wall);
      for (let j = 3; j < h - 3; j += 5) {
        for (let i = 3; i < w - 3; i += 5) if (hash(n * 7 + i, j) > 0.62) R(sx + i, base - h + j, 2, 2, lit);
      }
    }
  });
}

mount('s1', 240, 135, 4, (c, t, R, T) => {
  R(0, 0, 240, 135, '#1b1f3b'); R(0, 44, 240, 24, '#262b55'); R(0, 68, 240, 18, '#3a3470');
  R(0, 86, 240, 14, '#6b3f7a'); R(0, 100, 240, 12, '#b0527a');
  STARS.forEach(([x, y], i) => { if (Math.sin(t * 2 + i) > -0.5) R(x, y, 1, 1, '#f5f4ef'); });
  R(194, 14, 10, 14, '#f5f4ef'); R(192, 16, 14, 10, '#f5f4ef'); R(196, 18, 3, 3, '#d8d6cc');

  skyline(R, FAR, t * 5, 112, '#2d3561', '#c9a23a');
  skyline(R, NEAR, t * 14, 112, '#15182f', '#f6c945');

  R(0, 112, 240, 2, '#f6c945'); R(0, 114, 240, 21, '#111');
  for (let k = 0; k < 10; k++) R(Math.floor(wrap(k * 24 - t * 40, 240)), 121, 10, 1, '#3a3a3a');

  STOPS.forEach((p, i) => {
    const sx = Math.floor(wrap(p.x - t * 40, LOOP)) - 90;
    R(sx + 26, 92, 2, 20, '#f5f4ef');
    R(sx, 70, 54, 22, '#f6c945'); R(sx + 1, 71, 52, 20, '#111');
    T(p.a, sx + 27, 80, '#f6c945', 8, 'center'); T(p.b, sx + 27, 88, '#fff', 4, 'center');
    const cx = sx + 96, cy = 52 + Math.round(Math.sin(t * 3 + i) * 2);
    R(cx, cy, 22, 10, '#111'); R(cx + 1, cy + 1, 20, 8, '#f6c945'); T(CHIPS[i], cx + 11, cy + 7, '#111', 4, 'center');
  });

  const f = frame(t, 7);
  paint(c, outlined(hero({ step: f % 4, bob: f % 2, blink: blinkAt(t) })), 44, 64);

  R(4, 4, 92, 11, '#111'); T('LVL 8 - SENIOR', 8, 12, '#f6c945', 8);
  R(4, 17, 92, 4, '#111'); R(5, 18, Math.floor(wrap(t * 6, 90)), 2, '#f6c945');
  T('STAGE 3 / 4', 236, 12, '#f5f4ef', 8, 'right');
  T('SCROLL OR ARROWS TO WALK', 120, 130, '#8d8d8d', 4, 'center');
});

/* ---------- 2 · Agent HQ ---------- */

const LINES = ['OBOARD - 2022 TO 2025', 'FEATURE OWNER. SHIPPED INSIDE MONDAY,', 'SALESFORCE, JIRA AND CONFLUENCE.', 'CUT MANUAL WORK BY 40%.'];
const BOOKS = ['#f6c945', '#e0709a', '#7fa6d6', '#3ad1a0', '#f5f4ef'];

mount('s2', 240, 160, 4, (c, t, R, T) => {
  R(0, 28, 240, 72, '#c99f6b');
  for (let y = 28; y < 100; y += 8) {
    R(0, y, 240, 1, '#b58a58');
    for (let x = (y % 16) * 2; x < 240; x += 40) R(x, y, 1, 8, '#b58a58');
  }
  R(0, 0, 240, 28, '#2d3561'); R(0, 25, 240, 3, '#1b1f3b');

  // window, bookshelf, door, server rack on the back wall
  R(58, 4, 30, 17, '#111'); R(60, 6, 26, 13, '#1b1f3b'); R(72, 6, 2, 13, '#111');
  R(64, 9, 1, 1, '#fff'); R(80, 12, 1, 1, '#fff'); R(77, 8, 3, 3, '#f5f4ef');
  R(100, 2, 40, 28, '#4a3426');
  for (let row = 0; row < 3; row++) {
    R(102, 4 + row * 9, 36, 7, '#2a1d15');
    for (let i = 0; i < 11; i++) R(103 + i * 3, 5 + row * 9 + ((i + row) % 3 === 0 ? 1 : 0), 2, 6, BOOKS[(i * 2 + row) % 5]);
  }
  R(150, 4, 18, 24, '#111'); R(152, 6, 14, 22, '#f6c945'); R(162, 17, 2, 2, '#111');
  R(184, 0, 28, 36, '#15121f');
  for (let i = 0; i < 6; i++) {
    R(186, 3 + i * 5, 24, 4, '#2b3148');
    R(188, 4 + i * 5, 1, 1, Math.sin(t * 5 + i * 1.7) > 0 ? '#3ad1a0' : '#1d6b52');
    R(191, 4 + i * 5, 1, 1, Math.sin(t * 3 + i) > 0.4 ? '#f6c945' : '#6b5a1f');
    R(196, 4 + i * 5, 12, 1, '#15121f');
  }

  // rug, desk with two monitors, arcade cabinet, plant
  R(92, 54, 58, 36, '#b0527a'); R(94, 56, 54, 32, '#c9688f'); R(98, 60, 46, 24, '#b0527a');
  R(14, 42, 64, 14, '#8f6a48'); R(14, 56, 64, 4, '#6b4a34'); R(16, 60, 3, 6, '#4a3426'); R(73, 60, 3, 6, '#4a3426');
  for (const x of [20, 46]) {
    R(x, 26, 22, 15, '#111'); R(x + 2, 28, 18, 10, '#10261f'); R(x + 9, 41, 4, 2, '#111');
    for (let k = 0; k < 4; k++) R(x + 3, 29 + k * 2, 4 + ((k * 5 + frame(t, 3) + x) % 11), 1, k === 1 ? '#f6c945' : '#3ad1a0');
  }
  R(30, 47, 24, 5, '#2b3148'); R(60, 46, 5, 5, '#f5f4ef'); R(65, 47, 2, 2, '#f5f4ef');
  R(202, 50, 24, 38, '#3a3470'); R(205, 54, 18, 13, '#111');
  R(206, 55, 16, 11, frame(t, 4) % 2 ? '#3ad1a0' : '#2fb58a'); R(210, 58, 3, 3, '#111'); R(216, 61, 2, 2, '#f6c945');
  R(205, 70, 18, 6, '#f6c945'); R(208, 71, 2, 3, '#e0709a'); R(216, 72, 4, 2, '#111');
  R(168, 50, 12, 11, '#2f8f5b'); R(171, 46, 6, 6, '#3fae6f'); R(170, 61, 8, 8, '#c2705f');

  T('EXPERIENCE', 46, 73, '#4a3426', 4, 'center'); T('SKILLS', 120, 39, '#4a3426', 4, 'center');
  T('CONTACT', 159, 36, '#4a3426', 4, 'center'); T('AI AGENTS', 198, 43, '#4a3426', 4, 'center');
  T('PROJECTS', 214, 96, '#4a3426', 4, 'center');

  BOT_COLORS.forEach((col, i) => {
    const x = 126 + i * 12 + Math.round(Math.sin(t * 1.3 + i * 2) * 10);
    const y = 60 + (i % 2) * 16 + Math.round(Math.cos(t * 1.1 + i) * 4);
    paint(c, outlined(bot(col, frame(t, 4) + i)), x, y);
  });
  paint(c, outlined(chibi()), 84, 50 + (frame(t, 2) % 2));
  if (frame(t, 2) % 2) { R(64, 30, 11, 11, '#111'); R(65, 31, 9, 9, '#f6c945'); T('E', 70, 39, '#111', 8, 'center'); }

  // dialogue box with the portrait
  R(4, 100, 232, 56, '#f6c945'); R(6, 102, 228, 52, '#111');
  paint(c, bust(blinkAt(t)), 8, 104);
  T('VALENTYN', 62, 113, '#f6c945', 8);
  let budget = Math.floor(wrap(t, 14) * 16);
  LINES.forEach((line, i) => {
    const shown = line.slice(0, Math.max(0, budget));
    budget -= line.length;
    T(shown, 62, 124 + i * 8, i === 0 ? '#f6c945' : '#f5f4ef', 4);
  });
  if (frame(t, 3) % 2) R(224, 146, 5, 3, '#f6c945');
});

/* ---------- 3 · Voxel Desk (isometric stand-in for a three.js scene) ---------- */

mount('s3', 960, 600, 1, (c, t, R, T) => {
  R(0, 0, 960, 600, '#14162b');
  STARS.forEach(([x, y], i) => R(x * 4, y * 7.4, 3, 3, i % 3 ? '#3a3470' : '#6b3f7a'));
  const A = 46, OX = 480, OY = 180;
  const P = (x, y, z) => [OX + (x - y) * A, OY + (x + y) * A / 2 - z * A];
  const poly = (pts, col) => {
    c.fillStyle = col; c.beginPath();
    pts.forEach((p, i) => (i ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1])));
    c.closePath(); c.fill();
  };
  const box = (x, y, z, w, d, h, [top, left, right]) => {
    poly([P(x, y, z + h), P(x + w, y, z + h), P(x + w, y + d, z + h), P(x, y + d, z + h)], top);
    poly([P(x, y + d, z + h), P(x + w, y + d, z + h), P(x + w, y + d, z), P(x, y + d, z)], left);
    poly([P(x + w, y, z + h), P(x + w, y + d, z + h), P(x + w, y + d, z), P(x + w, y, z)], right);
  };
  /* A flat quad on a box's right face (the x = const plane). */
  const onRight = (x, y0, y1, z0, z1, col) => poly([P(x, y0, z1), P(x, y1, z1), P(x, y1, z0), P(x, y0, z0)], col);
  const tag = (str, x, y, z) => {
    const [sx, sy] = P(x, y, z);
    c.font = '16px Silkscreen, monospace'; c.textAlign = 'center';
    const w = c.measureText(str).width + 16;
    R(sx - w / 2, sy - 20, w, 26, '#111'); R(sx - w / 2, sy + 6, w, 3, '#f6c945');
    c.fillStyle = '#f6c945'; c.fillText(str, sx, sy - 1);
  };

  const WOOD = ['#9a7350', '#4a3426', '#6b4a34'];
  const float = Math.sin(t * 1.2) * 0.06;

  c.fillStyle = 'rgba(246,201,69,.10)'; c.beginPath(); c.ellipse(480, 560, 330, 26, 0, 0, Math.PI * 2); c.fill();
  box(0, 0, -0.6 + float, 8, 8, 0.6, ['#2d3561', '#1b1f3b', '#232750']);
  box(0, 0, float, 8, 8, 0.04, ['#3a4262', '#f6c945', '#f6c945']);

  const z0 = 0.04 + float;
  const items = [
    { key: 0, draw: () => box(1.6, 1.6, z0, 4.8, 4.8, 0.03, ['#b0527a', '#8c3f61', '#8c3f61']) },
    {
      key: 2.2, draw: () => {
        box(0.4, 0.4, z0, 1.3, 1.3, 3.1, ['#2b3148', '#15121f', '#1e1a2e']);
        for (let i = 0; i < 6; i++) {
          onRight(1.71, 0.55, 1.55, z0 + 0.3 + i * 0.45, z0 + 0.58 + i * 0.45, '#2b3148');
          onRight(1.72, 0.65, 0.78, z0 + 0.38 + i * 0.45, z0 + 0.5 + i * 0.45, Math.sin(t * 5 + i * 1.7) > 0 ? '#3ad1a0' : '#1d6b52');
        }
      },
    },
    {
      key: 5.2, draw: () => {
        box(2.8, 0.3, z0, 3.2, 0.8, 2.7, WOOD);
        for (let row = 0; row < 3; row++) {
          for (let i = 0; i < 8; i++) {
            const col = BOOKS[(i * 2 + row) % 5];
            poly([P(3 + i * 0.36, 1.11, z0 + 0.85 + row * 0.85), P(3.3 + i * 0.36, 1.11, z0 + 0.85 + row * 0.85),
              P(3.3 + i * 0.36, 1.11, z0 + 0.25 + row * 0.85), P(3 + i * 0.36, 1.11, z0 + 0.25 + row * 0.85)], col);
          }
        }
      },
    },
    { key: 8.4, draw: () => { box(6.6, 0.8, z0, 0.8, 0.8, 0.7, ['#d98a78', '#8c4a3d', '#c2705f']); box(6.5, 0.7, z0 + 0.7, 1, 1, 0.9, ['#3fae6f', '#1f6b43', '#2f8f5b']); } },
    {
      key: 7.3, draw: () => {
        box(0.6, 4.4, z0, 1.5, 3, 1, WOOD);
        box(0.8, 5, z0 + 1, 0.25, 1.8, 1.1, ['#2b2b2b', '#111', '#111']);
        onRight(1.06, 5.1, 6.7, z0 + 1.12, z0 + 2, '#10261f');
        for (let k = 0; k < 4; k++) onRight(1.07, 5.2, 5.5 + ((k * 3 + frame(t, 3)) % 6) * 0.2, z0 + 1.76 - k * 0.17, z0 + 1.83 - k * 0.17, k === 1 ? '#f6c945' : '#3ad1a0');
      },
    },
    {
      key: 12.6, draw: () => {
        box(5.9, 5.6, z0, 1.3, 1.3, 2.5, ['#4b448c', '#262250', '#3a3470']);
        onRight(7.21, 5.75, 6.75, z0 + 1.4, z0 + 2.25, frame(t, 4) % 2 ? '#3ad1a0' : '#2fb58a');
        onRight(7.21, 5.75, 6.75, z0 + 0.95, z0 + 1.2, '#f6c945');
      },
    },
    {
      key: 8.1, draw: () => {
        const x = 3.6, y = 3.7, z = z0 + Math.abs(Math.sin(t * 2.4)) * 0.08;
        box(x + 0.15, y + 0.05, z, 0.35, 0.35, 0.8, ['#3a4262', '#1e2233', '#2b3148']);
        box(x + 0.15, y + 0.5, z, 0.35, 0.35, 0.8, ['#3a4262', '#1e2233', '#2b3148']);
        box(x + 0.15, y - 0.2, z + 0.9, 0.3, 0.2, 0.7, ['#d6e6f9', '#7fa6d6', '#a9c8ee']);
        box(x + 0.1, y, z + 0.8, 0.45, 0.9, 0.8, ['#d6e6f9', '#7fa6d6', '#a9c8ee']);
        box(x + 0.15, y + 0.9, z + 0.9, 0.3, 0.2, 0.7, ['#d6e6f9', '#7fa6d6', '#a9c8ee']);
        box(x, y + 0.05, z + 1.6, 0.7, 0.8, 0.7, ['#f9e3cc', '#dba682', '#f4cfae']);
        onRight(x + 0.71, y + 0.2, y + 0.7, z + 1.72, z + 1.8, '#a87b5c');
        onRight(x + 0.71, y + 0.05, y + 0.85, z + 1.95, z + 2.14, '#111');
        onRight(x + 0.72, y + 0.12, y + 0.4, z + 1.98, z + 2.1, '#f9e3cc');
        onRight(x + 0.72, y + 0.5, y + 0.78, z + 1.98, z + 2.1, '#f9e3cc');
        box(x - 0.05, y, z + 2.3, 0.8, 0.9, 0.25, ['#6b4a34', '#33241a', '#4a3426']);
        box(x + 0.25, y + 0.1, z + 2.55, 0.5, 0.7, 0.2, ['#9a7350', '#4a3426', '#6b4a34']);
      },
    },
  ];
  BOT_COLORS.forEach((col, i) => {
    const a = t * 0.5 + i * Math.PI / 2;
    const x = 3.9 + Math.cos(a) * 2.5, y = 3.9 + Math.sin(a) * 2.5, z = z0 + 0.5 + Math.sin(t * 2 + i) * 0.15;
    items.push({
      key: x + y + 0.6, draw: () => {
        box(x, y, z, 0.6, 0.6, 0.5, ['#fff', '#b9b8b0', '#e4e2d8']);
        onRight(x + 0.61, y + 0.08, y + 0.52, z + 0.2, z + 0.38, '#111');
        onRight(x + 0.62, y + 0.14, y + 0.24, z + 0.25, z + 0.33, col);
        onRight(x + 0.62, y + 0.36, y + 0.46, z + 0.25, z + 0.33, col);
        box(x + 0.22, y + 0.22, z + 0.5, 0.16, 0.16, 0.2, [col, col, col]);
      },
    });
  });
  items.sort((a, b) => a.key - b.key).forEach((it) => it.draw());

  tag('AI AGENTS', 1.05, 1.05, z0 + 3.5); tag('SKILLS', 4.4, 0.7, z0 + 3.1);
  tag('EXPERIENCE', 1.3, 5.9, z0 + 2.5); tag('PROJECTS', 6.5, 6.2, z0 + 2.9);
  c.font = '16px Silkscreen, monospace'; c.textAlign = 'left'; c.fillStyle = '#8d90b0';
  c.fillText('DRAG TO ROTATE - CLICK AN OBJECT', 24, 580);
});

/* ---------- 4 · Companion ---------- */

mount('s4', 34, 50, 4, (c, t) => {
  const waving = t % 6 > 4;
  const opts = waving ? { arms: 'wave', tick: frame(t, 5) } : { bob: frame(t, 2) % 2, blink: blinkAt(t) };
  paint(c, outlined(hero(opts)), 0, 0, BRAND);
});

/* ---------- loop ---------- */

function tick(ms) {
  const t = ms / 1000;
  drawers.forEach((d) => d(t));
  if (!REDUCED) requestAnimationFrame(tick);
}
const start = () => requestAnimationFrame(tick);
if (document.fonts && document.fonts.ready) document.fonts.ready.then(start, start); else start();
