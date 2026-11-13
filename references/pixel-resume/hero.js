/* Top-down hero, second pass: 32×32, accessories, full animation set. Depends on sprites.js, scenes.js, neon.js. */

const HERO_PAL = { ...TOP_PAL, Y: NEON.yel, y: '#c9b520', P: '#2b2440', p: '#3a3160' };
const SHADOW_PAL = Object.fromEntries(Object.keys(HERO_PAL).map((k) => [k, 'rgba(13,5,24,.5)']));
const STRIDE = [0, 2, 3, 2, 0, -2, -3, -2];
const ANIMS = [
  { key: 'idle', frames: 2, fps: 2, note: 'дыхание, плечи чуть шире' },
  { key: 'walk', frames: 8, fps: 10, note: 'ноги и руки в противофазе' },
  { key: 'type', frames: 2, fps: 7, note: 'за столом, руки на клавиатуре' },
  { key: 'reach', frames: 2, fps: 3, note: 'открыть объект, клавиша E' },
  { key: 'carry', frames: 8, fps: 10, note: 'несёт светящийся ноутбук' },
  { key: 'cheer', frames: 2, fps: 5, note: 'раздел найден' },
];
const DEFAULT_ACC = 'phones';

function drawLeg(r, x, s) {
  if (s > 0) { r(x, 11 - s, 4, s + 3, 'P'); r(x, 8 - s, 4, 3, 'F'); }
  if (s < 0) { r(x, 20, 4, 2 - s, 'P'); r(x, 22 - s, 4, 2, 'F'); }
}

function drawArm(r, x, f) {
  if (f >= 0) { r(x, 15 - f, 3, 4 + f, 'B'); r(x, 13 - f, 3, 2, 'S'); return; }
  r(x, 16, 3, 4 - f, 'b'); r(x, 20 - f, 3, 1, 'S');
}

/* Arm reach per animation, as [left, right] forward extents. */
function armPose(anim, f, stride) {
  if (anim === 'walk') return [-Math.round(stride * 0.7), Math.round(stride * 0.7)];
  if (anim === 'type') return [4 + (f % 2), 5 - (f % 2)];
  if (anim === 'reach') return [0, 5 + (f % 2) * 2];
  if (anim === 'carry') return [3, 3];
  return [0, 0];
}

function drawHead(r, acc) {
  // nose, glasses with lit lenses, brow, temple arms, ears
  r(15, 6, 2, 1, 'S');
  r(11, 7, 10, 1, 'G'); r(12, 7, 3, 1, 'd'); r(17, 7, 3, 1, 'd');
  r(12, 8, 8, 1, 'S'); r(10, 8, 1, 5, 'G'); r(21, 8, 1, 5, 'G');
  r(10, 13, 1, 3, 'S'); r(21, 13, 1, 3, 'S');
  // hair: dark cap, mid swirl, light quiff streak sweeping to the front
  r(12, 9, 8, 10, 'H'); r(11, 10, 10, 8, 'H');
  r(13, 10, 6, 6, 'h'); r(14, 9, 5, 2, 'l'); r(16, 11, 3, 2, 'l'); r(13, 12, 2, 3, 'l'); r(15, 14, 2, 2, 'H');
  if (acc === 'phones') {
    r(10, 13, 12, 2, 'Y'); r(10, 14, 12, 1, 'y');
    r(9, 11, 2, 5, 'Y'); r(21, 11, 2, 5, 'Y'); r(9, 15, 2, 1, 'y'); r(21, 15, 2, 1, 'y');
  }
}

function heroTop(o = {}) {
  const { acc = DEFAULT_ACC, anim = 'idle', f = 0 } = o;
  return sprite(32, 32, (r) => {
    const stride = anim === 'walk' || anim === 'carry' ? STRIDE[f % 8] : 0;
    drawLeg(r, 9, stride); drawLeg(r, 19, -stride);

    if (anim === 'cheer') {
      r(2, 15, 5, 3, 'B'); r(0, 14 + (f % 2), 2, 3, 'S');
      r(25, 15, 5, 3, 'B'); r(30, 14 + (f % 2), 2, 3, 'S');
    } else {
      const [left, right] = armPose(anim, f, stride);
      drawArm(r, 5, left); drawArm(r, 24, right);
    }
    if (anim === 'idle' && f % 2) { r(4, 16, 1, 3, 'B'); r(27, 16, 1, 3, 'B'); }
    if (anim === 'carry') { r(9, 3, 14, 7, 'D'); r(10, 4, 12, 3, f % 4 < 2 ? 'd' : 'C'); r(10, 8, 12, 1, 'p'); }

    // shoulders and back
    r(10, 13, 12, 1, 'B'); r(8, 14, 16, 7, 'B'); r(7, 15, 18, 5, 'B');
    r(8, 19, 16, 2, 'b'); r(10, 21, 12, 1, 'b');
    r(9, 15, 2, 1, 'C'); r(21, 15, 2, 1, 'C'); r(13, 13, 6, 1, 'C');
    if (acc === 'pack') { r(11, 19, 10, 6, 'Y'); r(11, 24, 10, 1, 'y'); r(13, 21, 6, 1, 'y'); r(15, 19, 2, 1, 'K'); }

    drawHead(r, acc);
  });
}

/* Sprite with a hard drop shadow that stays put while the sprite turns. */
function drawHero(ctx, s, x, y, angle) {
  const o = outlined(s);
  drawRot(ctx, o, x + 2, y + 3, angle, SHADOW_PAL);
  drawRot(ctx, o, x, y, angle, HERO_PAL);
}

/* ---------- variants ---------- */

[['hV0', 'none'], ['hV1', 'phones'], ['hV2', 'pack']].forEach(([id, acc]) => {
  mount(id, 40, 40, 6, (c, t) => drawHero(c, heroTop({ acc, anim: 'walk', f: frame(t, 10) % 8 }), 19, 19, 0));
});
mount('hOld', 40, 40, 6, (c, t) => drawRot(c, outlined(topHero({ step: frame(t, 7) % 4 })), 20, 20, 0));

/* ---------- animation cards with sprite sheets ---------- */

(function buildAnimCards() {
  const host = document.getElementById('anims');
  if (!host) return;
  ANIMS.forEach((anim) => {
    const card = document.createElement('figure');
    card.className = 'card anim';
    const stage = document.createElement('div');
    stage.className = 'stage';
    for (const prefix of ['live', 'sheet']) {
      const canvas = document.createElement('canvas');
      canvas.id = `${prefix}-${anim.key}`;
      stage.appendChild(canvas);
    }
    const caption = document.createElement('figcaption');
    const title = document.createElement('b');
    title.textContent = `${anim.key} · ${anim.frames} кадр.`;
    caption.append(title, anim.note);
    card.append(stage, caption);
    host.appendChild(card);
    mount(`live-${anim.key}`, 40, 40, 4, (c, t) => drawHero(c, heroTop({ anim: anim.key, f: frame(t, anim.fps) % anim.frames }), 19, 19, 0));
    mount(`sheet-${anim.key}`, anim.frames * 36, 40, 2, (c, t, R) => {
      const active = frame(t, anim.fps) % anim.frames;
      for (let f = 0; f < anim.frames; f++) {
        R(f * 36 + 1, 1, 34, 38, f === active ? '#3a1f6b' : '#1a0b2e');
        drawRot(c, outlined(heroTop({ anim: anim.key, f })), f * 36 + 18, 20, 0, HERO_PAL);
      }
    });
  });
}());

/* ---------- rotation ---------- */

mount('hDirs', 8 * 40, 40, 3, (c, t) => {
  for (let i = 0; i < 8; i++) drawHero(c, heroTop({ anim: 'walk', f: frame(t, 10) % 8 }), 19 + i * 40, 19, i * Math.PI / 4);
});

/* ---------- in context: the four room floors at game scale ---------- */

mount('hFloors', 280, 80, 4, (c, t, R) => {
  checker(R, 0, 0, 70, 80, 8, '#3a1f6b', '#4b2a8a');
  checker(R, 70, 0, 70, 80, 6, '#06363d', '#0a4a52');
  R(140, 0, 70, 80, '#6b1248');
  for (let y = 4; y < 80; y += 6) R(140, y, 70, 2, '#7d1a57');
  R(210, 0, 70, 80, '#a8502a');
  for (let x = 210; x < 280; x += 7) R(x, 0, 1, 80, '#8f4222');
  const anims = ['walk', 'carry', 'walk', 'walk'];
  for (let i = 0; i < 4; i++) {
    const a = t * 1.1 + i * 1.3;
    const x = 35 + i * 70 + Math.cos(a) * 15, y = 42 + Math.sin(a) * 15;
    drawRot(c, outlined(topBot(BOT_COLORS[i], frame(t, 4))), 12 + i * 70, 12, t + i);
    drawHero(c, heroTop({ anim: anims[i], f: frame(t, 10) % 8 }), x, y, a + Math.PI);
  }
});
