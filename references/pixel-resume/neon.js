/* Neon top-down direction. Depends on sprites.js (sprite, paint, outlined, bust) and scenes.js (mount, drawers, helpers). */

const NEON = {
  bg: '#1a0b2e', deep: '#2b0f4a', violet: '#5a1a7a', berry: '#b0206f', mag: '#ff2e88', pink: '#ff71ce',
  cyan: '#01e7f0', teal: '#05a8aa', yel: '#fff35c', org: '#ff8a3d', white: '#fdf6ff', ink: '#0d0518',
};
const TOP_PAL = { ...PAL, K: NEON.ink, D: '#2b2440', d: NEON.cyan, F: NEON.white };

/* Hero seen from above, facing up. 24×24. */
function topHero(o = {}) {
  const { pose = 'idle', step = 0, tick = 0 } = o;
  return sprite(24, 24, (r) => {
    const left = step === 1, right = step === 3;
    if (left) { r(6, 5, 3, 4, 'F'); r(15, 16, 3, 3, 'F'); }
    if (right) { r(15, 5, 3, 4, 'F'); r(6, 16, 3, 3, 'F'); }

    if (pose === 'code') {
      r(5, 4, 2, 6, 'B'); r(17, 4, 2, 6, 'B');
      r(6, 0, 12, 5, 'D'); r(7, 1, 10, 2, tick % 2 ? 'd' : 'C'); r(7, 3, 10, 1, 'p');
      r(5 + (tick % 2), 3, 2, 1, 'S'); r(17 - (tick % 2), 3, 2, 1, 'S');
    } else {
      if (left) { r(18, 5, 2, 5, 'B'); r(18, 4, 2, 1, 'S'); r(4, 15, 2, 3, 'b'); }
      if (right) { r(4, 5, 2, 5, 'B'); r(4, 4, 2, 1, 'S'); r(18, 15, 2, 3, 'b'); }
      if (!left && !right) { r(4, 8, 2, 2, 'S'); r(18, 8, 2, 2, 'S'); }
    }

    // shoulders
    r(5, 9, 14, 7, 'B'); r(4, 10, 16, 5, 'B'); r(5, 14, 14, 2, 'b'); r(9, 9, 6, 1, 'C');
    // nose, glasses bar, ears
    r(11, 4, 2, 1, 'S'); r(10, 5, 4, 1, 'S'); r(8, 6, 8, 1, 'G'); r(7, 7, 1, 1, 'G'); r(16, 7, 1, 1, 'G');
    r(7, 11, 1, 2, 'S'); r(16, 11, 1, 2, 'S');
    // hair with the quiff streak
    r(9, 7, 6, 9, 'H'); r(8, 8, 8, 7, 'H');
    r(10, 9, 4, 5, 'h'); r(11, 7, 3, 2, 'l'); r(10, 9, 3, 1, 'l'); r(12, 11, 2, 2, 'l');
  });
}

function topBot(accent, tick = 0) {
  return sprite(10, 10, (r) => {
    r(2, 1, 6, 8, 'F'); r(1, 2, 8, 6, 'F'); r(3, 1, 4, 1, accent);
    r(3, 3, 4, 4, 'K'); r(4, 4, 2, 2, tick % 5 === 0 ? 'K' : accent);
  });
}

function toCanvas(s, pal) {
  const c = document.createElement('canvas');
  c.width = s.w; c.height = s.h;
  paint(c.getContext('2d'), s, 0, 0, pal);
  return c;
}

/* Draws a sprite rotated around its centre with hard pixels. */
function drawRot(ctx, s, x, y, angle, pal = TOP_PAL) {
  ctx.save();
  ctx.translate(x, y); ctx.rotate(angle);
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(toCanvas(s, pal), -s.w / 2, -s.h / 2);
  ctx.restore();
}

/* Scrolling dithered colour bands. */
const BANDS = [NEON.deep, NEON.violet, NEON.berry, NEON.mag, NEON.berry, NEON.violet];
function bandColor(x, y, t, size = 14) {
  const v = wrap(y + t * 10, BANDS.length * size) / size;
  const i = Math.floor(v);
  const next = v - i > 0.6 && (Math.floor(x) + Math.floor(y)) % 2 === 0;
  return BANDS[(i + (next ? 1 : 0)) % BANDS.length];
}
function ditherBg(R, w, h, t, cell = 2) {
  for (let y = 0; y < h; y += cell) for (let x = 0; x < w; x += cell) R(x, y, cell, cell, bandColor(x / cell, y / cell, t, 9));
}
function scanlines(R, w, h) {
  for (let y = 0; y < h; y += 2) R(0, y, w, 0.5, 'rgba(13,5,24,.28)');
}

/* Portrait: the 48×48 bust relit with a magenta key light and a cyan rim. */
const LIT = {
  mid: { ...PAL, S: '#f0a57a', s: '#c46a6a', L: '#ffd9b0', u: '#d98a70', M: '#8a4a4a', m: '#a8324a', H: '#3a1f3d', h: '#5c2f4f', l: '#8f4a5c', B: '#5b8fe0', b: '#3a5fb8', C: '#9cc4ff', G: NEON.ink, E: NEON.ink, W: NEON.white },
  key: { ...PAL, S: '#ff9fb5', s: '#e0608f', L: '#ffd0e0', u: '#f080a0', M: '#a03a6a', m: '#c02a5a', H: '#7a2a6a', h: '#b0408a', l: NEON.pink, B: '#b07ae8', b: '#8a4fd0', C: '#e0b0ff', G: NEON.ink, E: NEON.ink, W: NEON.white },
  rim: { ...PAL, S: '#7fb8c8', s: '#4a8a9a', L: '#b0e8f0', u: '#5fa0b0', M: '#2f5a6a', m: '#3a5a7a', H: '#12304a', h: '#1a5a6a', l: NEON.cyan, B: '#2ad0e0', b: NEON.teal, C: '#a0f8ff', G: NEON.ink, E: NEON.ink, W: '#a0f8ff' },
};
function neonBust(ctx, ox, oy, t) {
  const s = bust(blinkAt(t));
  for (let y = 0; y < s.h; y++) {
    for (let x = 0; x < s.w; x++) {
      const c = s.d[y * s.w + x];
      const odd = (x + y) % 2 === 0;
      let zone = LIT.mid;
      if (x < 17 || (x < 20 && odd)) zone = LIT.key;
      if (x > 32 || (x > 29 && odd)) zone = LIT.rim;
      ctx.fillStyle = c === 'Y' ? bandColor(x, y, t, 10) : zone[c];
      ctx.fillRect(ox + x, oy + y, 1, 1);
    }
  }
}

/* ---------- character sheet ---------- */

mount('nHero', 30, 30, 8, (c, t) => {
  const f = frame(t, 7);
  drawRot(c, outlined(topHero({ step: f % 4 })), 15, 15, 0);
});
mount('nPortrait', 48, 48, 5, (c, t) => neonBust(c, 0, 0, t));
mount('nDirs', 8 * 30, 30, 3, (c, t) => {
  for (let i = 0; i < 8; i++) drawRot(c, outlined(topHero({ step: frame(t, 7) % 4 })), 15 + i * 30, 15, i * Math.PI / 4);
});
mount('nPoses', 4 * 30, 30, 4, (c, t) => {
  drawRot(c, outlined(topHero()), 15, 15, 0);
  drawRot(c, outlined(topHero({ step: frame(t, 7) % 4 })), 45, 15, 0);
  drawRot(c, outlined(topHero({ pose: 'code', tick: frame(t, 6) })), 75, 15, 0);
  BOT_COLORS.forEach((col, i) => drawRot(c, outlined(topBot(col, frame(t, 4) + i)), 99 + (i % 2) * 13, 9 + Math.floor(i / 2) * 13, t + i));
});

/* ---------- scene: Agent HQ, neon top-down ---------- */

const WORLD = { w: 280, h: 190 };
const ROUTE = [[70, 150], [98, 150], [98, 48], [208, 48], [208, 138], [70, 138]];
const ROOMS = [
  { name: 'EXPERIENCE', x: 86, y: 100 },
  { name: 'AI AGENTS', x: 206, y: 72 },
  { name: 'PROJECTS', x: 206, y: 166 },
  { name: 'CONTACT', x: 70, y: 166 },
  { name: 'SKILLS', x: 125, y: 34 },
];

function checker(R, x0, y0, w, h, size, a, b) {
  for (let y = 0; y < h; y += size) {
    for (let x = 0; x < w; x += size) {
      R(x0 + x, y0 + y, Math.min(size, w - x), Math.min(size, h - y), ((x + y) / size) % 2 ? a : b);
    }
  }
}

/* Position and heading along the closed route at a given distance. */
function along(route, dist) {
  const legs = route.map((p, i) => {
    const q = route[(i + 1) % route.length];
    return { p, q, len: Math.hypot(q[0] - p[0], q[1] - p[1]) };
  });
  let d = wrap(dist, legs.reduce((sum, l) => sum + l.len, 0));
  const leg = legs.find((l) => { if (d <= l.len) return true; d -= l.len; return false; }) || legs[0];
  const k = d / leg.len;
  return {
    x: leg.p[0] + (leg.q[0] - leg.p[0]) * k,
    y: leg.p[1] + (leg.q[1] - leg.p[1]) * k,
    a: Math.atan2(leg.q[1] - leg.p[1], leg.q[0] - leg.p[0]) + Math.PI / 2,
  };
}

function drawFloors(R) {
  checker(R, 20, 15, 132, 97, 8, '#3a1f6b', '#4b2a8a');
  checker(R, 152, 15, 108, 67, 6, '#06363d', '#0a4a52');
  R(152, 82, 108, 93, '#6b1248');
  for (let y = 86; y < 175; y += 6) R(152, y, 108, 2, '#7d1a57');
  R(20, 112, 132, 63, '#a8502a');
  for (let x = 20; x < 152; x += 7) R(x, 112, 1, 63, '#8f4222');
  R(176, 104, 46, 46, '#ff2e88'); R(180, 108, 38, 38, '#6b1248'); R(184, 112, 30, 30, '#ff71ce');
  R(58, 163, 24, 10, NEON.yel);
}

function drawWalls(R) {
  const W = NEON.white, S = NEON.ink;
  const wall = (x, y, w, h) => { R(x + 1, y + 1, w, h, S); R(x, y, w, h, W); };
  wall(18, 13, 244, 3); wall(18, 13, 3, 164); wall(259, 13, 3, 164);
  wall(18, 174, 40, 3); wall(82, 174, 180, 3);
  wall(151, 13, 3, 27); wall(151, 56, 3, 74); wall(151, 146, 3, 30);
  wall(18, 111, 72, 3); wall(106, 111, 46, 3);
  wall(151, 81, 49, 3); wall(216, 81, 46, 3);
}

function drawFurniture(R, t) {
  const ink = NEON.ink;
  // office: two desks with monitors, chairs, bookshelf, plant
  for (const [x, y] of [[30, 24], [30, 70]]) {
    R(x + 1, y + 1, 50, 14, ink); R(x, y, 50, 14, NEON.org); R(x, y + 11, 50, 3, '#c9621f');
    for (const mx of [x + 6, x + 26]) {
      R(mx, y + 2, 16, 3, ink);
      R(mx + 1, y + 5, 14, 1, frame(t, 5) % 2 ? NEON.cyan : NEON.teal);
    }
    R(x + 14, y + 8, 18, 3, '#2b2440'); R(x + 40, y + 7, 4, 4, NEON.white);
    R(x + 19, y + 19, 10, 9, ink); R(x + 20, y + 20, 8, 7, NEON.mag);
  }
  R(104, 17, 43, 8, ink); R(104, 17, 42, 7, '#5c2f4f');
  for (let i = 0; i < 13; i++) R(105 + i * 3, 18, 2, 5, [NEON.yel, NEON.pink, NEON.cyan, NEON.white, NEON.org][i % 5]);
  R(128, 92, 12, 12, ink); R(129, 93, 10, 10, '#1f8f5b'); R(131, 95, 6, 6, '#3fe08a'); R(133, 97, 2, 2, NEON.yel);

  // server room: racks with blinking lights and a cable run
  const racks = [[160, 20], [190, 20], [228, 20], [160, 62], [228, 62]];
  racks.forEach(([x, y], n) => {
    R(x + 1, y + 1, 24, 11, ink); R(x, y, 24, 11, '#1a1030'); R(x + 1, y + 1, 22, 2, '#2b2440');
    for (let i = 0; i < 6; i++) R(x + 2 + i * 4, y + 6, 2, 2, Math.sin(t * 6 + i * 1.9 + n) > 0 ? NEON.cyan : '#0a4a52');
    R(x + 2, y + 9, 20, 1, Math.sin(t * 3 + n) > 0.3 ? NEON.yel : NEON.org);
  });
  R(172, 31, 1, 31, NEON.cyan); R(172, 44, 68, 1, NEON.cyan); R(240, 31, 1, 31, NEON.cyan);

  // lounge: arcade cabinets and a couch
  for (const y of [90, 108, 126]) {
    R(241, y + 1, 16, 14, ink); R(240, y, 16, 14, NEON.violet);
    R(241, y + 2, 5, 10, frame(t, 4) % 2 ? NEON.cyan : NEON.yel); R(248, y + 3, 6, 8, '#2b0f4a'); R(250, y + 5, 2, 2, NEON.mag);
  }
  R(159, 157, 48, 14, ink); R(158, 156, 48, 14, NEON.cyan); R(158, 166, 48, 4, NEON.teal);
  R(160, 158, 20, 7, '#a0f8ff'); R(184, 158, 20, 7, '#a0f8ff');

  // lobby: reception counter, mailbox, plant
  R(29, 121, 36, 12, ink); R(28, 120, 36, 12, NEON.white); R(28, 129, 36, 3, '#c9b8e0'); R(34, 122, 10, 5, NEON.mag);
  R(118, 158, 12, 12, ink); R(119, 159, 10, 10, '#1f8f5b'); R(121, 161, 6, 6, '#3fe08a');
  R(30, 150, 12, 16, ink); R(31, 151, 10, 14, NEON.yel); R(33, 154, 6, 1, ink);
}

(function mountHQ() {
  const canvas = document.getElementById('n1');
  if (!canvas) return;
  const scale = 4;
  canvas.width = WORLD.w * scale; canvas.height = WORLD.h * scale;
  const ctx = canvas.getContext('2d');
  const buf = document.createElement('canvas');
  buf.width = WORLD.w; buf.height = WORLD.h;
  const bctx = buf.getContext('2d');
  const R = (x, y, w, h, c) => { ctx.fillStyle = c; ctx.fillRect(x, y, w, h); };
  const B = (x, y, w, h, c) => { bctx.fillStyle = c; bctx.fillRect(x, y, w, h); };
  const T = (str, x, y, c, size, align = 'left') => {
    ctx.fillStyle = c; ctx.font = `${size}px Silkscreen, monospace`; ctx.textAlign = align; ctx.fillText(str, x, y);
  };
  const glow = (str, x, y, size, align) => {
    T(str, x - 1, y, NEON.cyan, size, align); T(str, x + 1, y + 1, NEON.mag, size, align); T(str, x, y, NEON.white, size, align);
  };

  drawers.push((t) => {
    ctx.setTransform(scale, 0, 0, scale, 0, 0);
    ditherBg(R, WORLD.w, WORLD.h, t);

    bctx.clearRect(0, 0, WORLD.w, WORLD.h);
    drawFloors(B); drawFurniture(B, t); drawWalls(B);
    BOT_COLORS.forEach((col, i) => {
      const a = t * 0.9 + i * 1.6;
      const x = 196 + Math.cos(a) * (18 + i * 4), y = (i % 2 ? 126 : 48) + Math.sin(a) * 9;
      drawRot(bctx, outlined(topBot(col, frame(t, 4) + i)), x, y, a + Math.PI);
    });
    const hero = along(ROUTE, t * 26);
    drawRot(bctx, outlined(topHero({ step: frame(t, 7) % 4 })), hero.x, hero.y, hero.a);

    ctx.save();
    ctx.translate(WORLD.w / 2, WORLD.h / 2);
    ctx.rotate(Math.sin(t * 0.5) * 0.04);
    ctx.scale(0.9, 0.9);
    ctx.translate(-WORLD.w / 2, -WORLD.h / 2);
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(buf, 0, 0);
    ROOMS.forEach((room) => {
      const w = room.name.length * 4.2 + 6;
      R(room.x - w / 2, room.y - 6, w, 8, NEON.ink);
      T(room.name, room.x, room.y, NEON.yel, 6, 'center');
    });
    ctx.restore();

    glow('AGENT HQ', 8, 18, 16, 'left');
    glow('3 / 5 FOUND', WORLD.w - 8, 16, 8, 'right');
    R(0, WORLD.h - 14, WORLD.w, 14, NEON.ink);
    T('WASD MOVE - E OPEN - ESC SKIP TO CV', WORLD.w / 2, WORLD.h - 5, NEON.pink, 6, 'center');
    scanlines(R, WORLD.w, WORLD.h);
  });
}());

/* ---------- scene: title screen ---------- */

mount('n2', 240, 135, 4, (c, t, R, T) => {
  ditherBg(R, 240, 135, t * 0.6);
  for (let i = -4; i < 14; i++) {
    c.save(); c.translate(wrap(i * 24 + t * 8, 300) - 40, 0); c.transform(1, 0, -0.5, 1, 0, 0);
    R(0, 0, 6, 135, 'rgba(1,231,240,.10)'); c.restore();
  }
  c.save();
  c.translate(16, 58); c.transform(1, -0.12, -0.18, 1, 0, 0);
  const pulse = Math.round(Math.sin(t * 3));
  T('VALENTYN', -2 - pulse, 0, NEON.cyan, 24); T('VALENTYN', 2 + pulse, 2, NEON.mag, 24); T('VALENTYN', 0, 0, NEON.white, 24);
  T('YAKOVLIEV', 1, 17, NEON.ink, 16); T('YAKOVLIEV', 0, 16, NEON.yel, 16);
  c.restore();
  T('PRODUCT ENGINEER - AI SYSTEMS BUILDER', 14, 84, NEON.white, 6);

  ['START', 'RECRUITER CV', 'CONTACT'].forEach((item, i) => {
    const active = i === 0;
    if (active && frame(t, 3) % 2) T('>', 14, 100 + i * 10, NEON.yel, 8);
    T(item, 24, 100 + i * 10, active ? NEON.yel : NEON.pink, 8);
  });

  R(175, 49, 54, 54, NEON.ink); R(177, 51, 50, 50, NEON.cyan);
  neonBust(c, 178, 52, t);
  T('8+ YEARS', 202, 112, NEON.white, 6, 'center'); T('0 TO 1 BUILDER', 202, 120, NEON.cyan, 6, 'center');
  scanlines(R, 240, 135);
});
