/* Pixel sprites drawn as palette-indexed grids. Every sprite is { w, h, d } where d holds palette keys. */

const PAL = {
  K: '#15121f', H: '#4a3426', h: '#6b4a34', l: '#9a7350',
  S: '#f4cfae', s: '#dba682', L: '#f9e3cc', G: '#111111', E: '#2b2f3a', W: '#ffffff',
  M: '#a87b5c', u: '#e3b793', m: '#c2705f', B: '#a9c8ee', b: '#7fa6d6', C: '#d6e6f9',
  P: '#2b3148', p: '#3a4262', F: '#f5f4ef', Y: '#f6c945', D: '#3a3f4b', d: '#4b5160',
};

/* Same sprite, current site palette: black, white, yellow. */
const BRAND = {
  ...PAL, K: '#111', H: '#111', h: '#111', l: '#5d5d59',
  S: '#fff', s: '#e4e2d8', L: '#fff', E: '#111', M: '#5d5d59', u: '#e4e2d8', m: '#111',
  B: '#fff', b: '#e4e2d8', C: '#fff', P: '#111', p: '#111', F: '#fff', D: '#111', d: '#5d5d59',
};

function sprite(w, h, draw) {
  const d = new Array(w * h).fill(null);
  const r = (x, y, ww, hh, c) => {
    for (let j = y; j < y + hh; j++) {
      for (let i = x; i < x + ww; i++) {
        if (i >= 0 && j >= 0 && i < w && j < h) d[j * w + i] = c === '.' ? null : c;
      }
    }
  };
  draw(r);
  return { w, h, d };
}

function fromRows(rows) {
  return sprite(rows[0].length, rows.length, (r) => {
    rows.forEach((row, y) => [...row].forEach((c, x) => r(x, y, 1, 1, c)));
  });
}

/* Adds a 1px outline around the silhouette; the result is 2px wider and taller. */
function outlined(s, c = 'K') {
  const w = s.w + 2, h = s.h + 2;
  const base = new Array(w * h).fill(null);
  for (let y = 0; y < s.h; y++) for (let x = 0; x < s.w; x++) base[(y + 1) * w + x + 1] = s.d[y * s.w + x];
  const out = base.slice();
  const filled = (x, y) => x >= 0 && y >= 0 && x < w && y < h && base[y * w + x];
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (!base[y * w + x] && (filled(x - 1, y) || filled(x + 1, y) || filled(x, y - 1) || filled(x, y + 1))) out[y * w + x] = c;
    }
  }
  return { w, h, d: out };
}

function paint(ctx, s, ox, oy, pal = PAL) {
  for (let y = 0; y < s.h; y++) {
    for (let x = 0; x < s.w; x++) {
      const c = s.d[y * s.w + x];
      if (!c) continue;
      ctx.fillStyle = pal[c] || c;
      ctx.fillRect(ox + x, oy + y, 1, 1);
    }
  }
}

/* A — chibi, 16×24 */
const CHIBI_ROWS = [
  '.......HHHHH....',
  '.....HHhllhhH...',
  '...HHhhlllhhhH..',
  '..HhhhllhhhhhH..',
  '..HhhhhhhhhhhH..',
  '..HSSSSSSSSSSH..',
  '.SGGGGGSSGGGGGS.',
  '.SGLELGGGGLELGS.',
  '..GGGGGSSGGGGG..',
  '..SSSSSssSSSSS..',
  '..SSSSMMMMSSSS..',
  '..SuSSSmmSSSuS..',
  '...SuuuuuuuuS...',
  '.....CCssCC.....',
  '...BBBCSSCBBB...',
  '..BBBBBCCBBBBB..',
  '..BBBBBBbBBBBB..',
  '..BBBBBBbBBBBB..',
  '..SSBBBBbBBBSS..',
  '....PPPPPPPP....',
  '....PPPPPPPP....',
  '....PPP..PPP....',
  '....PPP..PPP....',
  '...FFFF..FFFF...',
];
const chibi = () => fromRows(CHIBI_ROWS);

/* B — hero, 32×48. Options drive the pose. */
function hero(o = {}) {
  const { arms = 'down', step = 0, bob = 0, blink = false, tick = 0 } = o;
  return sprite(32, 48, (r) => {
    const b = bob;
    const lu = step === 1 ? 2 : 0;
    const ru = step === 3 ? 2 : 0;

    // legs and sneakers
    r(10, 34 + b, 5, 10 - lu - b, 'P'); r(17, 34 + b, 5, 10 - ru - b, 'P'); r(15, 34 + b, 2, 2, 'P');
    r(11, 35 + b, 1, 8 - lu - b, 'p'); r(18, 35 + b, 1, 8 - ru - b, 'p');
    r(9, 44 - lu, 6, 2, 'F'); r(9, 46 - lu, 6, 1, 'K');
    r(17, 44 - ru, 6, 2, 'F'); r(17, 46 - ru, 6, 1, 'K');

    // neck, shirt, collar
    r(14, 19 + b, 4, 2, 's');
    r(8, 21 + b, 16, 3, 'B'); r(10, 24 + b, 12, 9, 'B');
    r(10, 25 + b, 1, 8, 'b'); r(21, 25 + b, 1, 8, 'b'); r(16, 23 + b, 1, 10, 'b');
    r(10, 33 + b, 12, 1, 'K'); r(15, 33 + b, 2, 1, 'Y');
    r(12, 20 + b, 3, 2, 'C'); r(17, 20 + b, 3, 2, 'C'); r(15, 20 + b, 2, 2, 'S');

    // left arm is the same in every pose except "code"
    if (arms === 'code') {
      const tap = tick % 2;
      r(7, 22 + b, 3, 8, 'B'); r(22, 22 + b, 3, 8, 'B');
      r(9, 26 + b, 14, 9, 'D'); r(10, 27 + b, 12, 7, 'd'); r(15, 29 + b, 2, 2, tap ? 'Y' : 'F');
      r(7, 30 + b + tap, 3, 2, 'S'); r(22, 31 + b - tap, 3, 2, 'S');
    } else {
      r(7, 22 + b, 3, 10, 'B'); r(9, 24 + b, 1, 8, 'b'); r(7, 32 + b, 3, 2, 'S');
      if (arms === 'down') {
        r(22, 22 + b, 3, 10, 'B'); r(22, 24 + b, 1, 8, 'b'); r(22, 32 + b, 3, 2, 'S');
      } else {
        const sway = arms === 'wave' ? tick % 2 : 0;
        r(22, 21 + b, 4, 2, 'B'); r(25 + sway, 12 + b, 3, 10, 'B'); r(25 + sway, 10 + b, 3, 2, 'S');
        if (arms === 'ship') {
          const f = tick % 2;
          r(28, 2 + b, 1, 9, 'K'); r(29, 2 + b, 3, 3, 'Y'); r(30, 3 + b + f, 2, 3, 'Y');
        }
      }
    }

    // head: hair, ears, face
    r(9, 3 + b, 14, 5, 'H'); r(11, 1 + b, 11, 2, 'H'); r(14, b, 7, 1, 'H');
    r(15, 1 + b, 5, 1, 'h'); r(12, 2 + b, 7, 1, 'l'); r(11, 4 + b, 9, 1, 'h'); r(14, 5 + b, 8, 1, 'h');
    r(7, 11 + b, 2, 3, 'S'); r(23, 11 + b, 2, 3, 'S'); r(8, 12 + b, 1, 1, 's'); r(23, 12 + b, 1, 1, 's');
    r(9, 8 + b, 14, 9, 'S'); r(10, 17 + b, 12, 1, 'S'); r(11, 18 + b, 10, 1, 'S');
    r(8, 6 + b, 2, 4, 'H'); r(22, 6 + b, 2, 3, 'H'); r(10, 8 + b, 2, 1, 'H');

    // glasses and eyes
    for (const x of [9, 17]) {
      r(x, 10 + b, 6, 1, 'G'); r(x, 13 + b, 6, 1, 'G'); r(x, 10 + b, 1, 4, 'G'); r(x + 5, 10 + b, 1, 4, 'G');
      r(x + 1, 11 + b, 4, 2, 'L');
      if (blink) r(x + 2, 12 + b, 2, 1, 's'); else r(x + 2, 11 + b, 1, 2, 'E');
    }
    r(15, 11 + b, 2, 1, 'G'); r(8, 11 + b, 1, 1, 'G'); r(23, 11 + b, 1, 1, 'G');

    // nose, moustache, mouth, stubble
    r(16, 14 + b, 1, 1, 's');
    r(12, 15 + b, 8, 1, 'M'); r(12, 16 + b, 1, 1, 'M'); r(19, 16 + b, 1, 1, 'M');
    r(15, 16 + b, 2, 1, 'm');
    r(13, 17 + b, 6, 1, 'u'); r(12, 18 + b, 8, 1, 'u'); r(10, 16 + b, 1, 2, 'u'); r(21, 16 + b, 1, 2, 'u');
  });
}

/* C — dialogue portrait, 48×48 on a brand-yellow tile. */
function bust(blink = false) {
  return sprite(48, 48, (r) => {
    r(0, 0, 48, 48, 'Y');
    // shoulders, collar, neck
    r(10, 38, 28, 2, 'B'); r(6, 40, 36, 8, 'B'); r(6, 41, 1, 7, 'b'); r(41, 41, 1, 7, 'b'); r(24, 42, 1, 6, 'b');
    r(20, 32, 8, 6, 's'); r(22, 38, 4, 3, 'S');
    r(16, 36, 6, 5, 'C'); r(26, 36, 6, 5, 'C');
    // ears
    r(9, 19, 3, 6, 'S'); r(36, 19, 3, 6, 'S'); r(10, 21, 1, 3, 's'); r(37, 21, 1, 3, 's');
    // face
    r(12, 12, 24, 17, 'S'); r(13, 29, 22, 2, 'S'); r(14, 31, 20, 2, 'S'); r(16, 33, 16, 1, 'S');
    // hair with a swept quiff
    r(11, 6, 26, 7, 'H'); r(13, 3, 22, 3, 'H'); r(17, 1, 15, 2, 'H'); r(22, 0, 8, 1, 'H');
    r(10, 10, 3, 9, 'H'); r(35, 10, 3, 8, 'H'); r(12, 12, 5, 2, 'H'); r(33, 12, 3, 1, 'H');
    r(18, 2, 9, 1, 'h'); r(16, 4, 10, 1, 'l'); r(26, 5, 7, 1, 'l'); r(14, 6, 12, 1, 'h');
    r(20, 8, 12, 1, 'h'); r(15, 9, 8, 1, 'l'); r(24, 10, 9, 1, 'h');
    // brows
    r(14, 15, 7, 1, 'H'); r(27, 15, 7, 1, 'H');
    // glasses
    for (const x of [12, 25]) {
      r(x, 17, 11, 2, 'G'); r(x, 17, 1, 8, 'G'); r(x + 10, 17, 1, 8, 'G'); r(x, 24, 11, 1, 'G');
      r(x + 1, 19, 9, 5, 'L'); r(x + 2, 19, 1, 1, 'W'); r(x + 3, 20, 1, 1, 'W');
      if (blink) {
        r(x + 3, 22, 5, 1, 's');
      } else {
        r(x + 3, 20, 5, 1, 'h'); r(x + 3, 21, 5, 2, 'W'); r(x + 5, 21, 2, 2, 'E');
      }
    }
    r(23, 19, 2, 1, 'G'); r(10, 19, 2, 1, 'G'); r(36, 19, 2, 1, 'G');
    // nose
    r(25, 23, 1, 4, 's'); r(22, 27, 4, 1, 's');
    // moustache, mouth, stubble
    r(19, 28, 10, 1, 'M'); r(18, 29, 12, 1, 'M'); r(17, 30, 3, 1, 'M'); r(28, 30, 3, 1, 'M');
    r(20, 31, 8, 1, 'm');
    r(13, 27, 2, 4, 'u'); r(33, 27, 2, 4, 'u'); r(14, 31, 3, 2, 'u'); r(31, 31, 3, 2, 'u');
    r(17, 32, 2, 1, 'u'); r(29, 32, 2, 1, 'u'); r(16, 33, 16, 1, 'u');
  });
}

/* Agent bots, 10×11. One body, four accent colours. */
function bot(accent, tick = 0) {
  return sprite(10, 11, (r) => {
    r(4, 0, 2, 1, accent); r(4, 1, 2, 1, 'K');
    r(1, 2, 8, 6, 'F'); r(2, 3, 6, 3, 'K');
    r(3, 4, 1, 1, tick % 6 === 0 ? 'K' : accent); r(6, 4, 1, 1, tick % 6 === 0 ? 'K' : accent);
    r(1, 7, 8, 1, accent);
    r(2, 8, 2, 2 + (tick % 2), 'D'); r(6, 8, 2, 3 - (tick % 2), 'D');
  });
}
const BOT_COLORS = ['#3ad1a0', '#f6c945', '#e0709a', '#7fa6d6'];
