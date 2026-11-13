/* Rooms and interactive objects. Depends on sprites.js, scenes.js, neon.js, hero.js. */

const INK = NEON.ink;
const SPINES = [NEON.yel, NEON.pink, NEON.cyan, NEON.white, NEON.org];

/* Object sprites. Each draws at the origin with R(x, y, w, h, colour); t drives small loops. */
const draw = {
  chair: (R, x, y, c) => { R(x, y, 12, 7, INK); R(x + 1, y + 1, 10, 5, c); },
  deskMain: (R, t) => {
    R(1, 1, 50, 14, INK); R(0, 0, 50, 14, NEON.org); R(0, 11, 50, 3, '#c9621f');
    for (const mx of [6, 26]) { R(mx, 2, 16, 3, INK); R(mx + 1, 5, 14, 1, frame(t, 5) % 2 ? NEON.cyan : NEON.teal); }
    R(14, 8, 18, 3, '#2b2440'); R(40, 7, 4, 4, NEON.white);
    draw.chair(R, 19, 16, NEON.mag);
  },
  deskSecond: (R, t) => {
    R(1, 1, 50, 14, INK); R(0, 0, 50, 14, '#e06a2a'); R(0, 11, 50, 3, '#b0501c');
    R(12, 2, 26, 3, INK); R(13, 5, 24, 1, frame(t, 3) % 2 ? NEON.yel : NEON.org);
    R(3, 7, 3, 3, NEON.yel); R(7, 7, 3, 3, NEON.pink); R(42, 7, 3, 3, NEON.cyan); R(46, 3, 3, 3, NEON.yel);
    R(18, 8, 14, 2, '#2b2440');
    draw.chair(R, 19, 16, NEON.cyan);
  },
  archive: (R, t) => {
    R(1, 1, 10, 16, INK); R(0, 0, 10, 16, '#5c2f4f');
    for (let i = 0; i < 3; i++) { R(1, 1 + i * 5, 8, 4, '#7a4168'); R(4, 2 + i * 5, 2, 1, NEON.yel); }
    R(12, 3, 9, 10, INK); R(11, 2, 9, 10, '#d8c9a8'); R(12, 3, 7, 6, '#0f3d2a');
    R(13, 4, frame(t, 2) % 2 ? 3 : 2, 1, '#3fe08a'); R(11, 13, 9, 3, '#b8a888');
  },
  bookshelf: (R) => {
    R(1, 1, 44, 9, INK); R(0, 0, 44, 9, '#5c2f4f');
    for (let i = 0; i < 14; i++) R(1 + i * 3, 1 + (i % 4 === 0 ? 1 : 0), 2, 6, SPINES[i % 5]);
  },
  whiteboard: (R) => {
    R(0, 0, 34, 6, INK); R(0, 0, 34, 5, NEON.white);
    R(3, 1, 8, 1, NEON.mag); R(3, 3, 5, 1, NEON.teal); R(14, 1, 6, 3, NEON.yel); R(23, 1, 8, 1, INK); R(23, 3, 6, 1, INK);
  },
  rack: (accent) => (R, t) => {
    R(1, 1, 22, 12, INK); R(0, 0, 22, 12, '#1a1030'); R(0, 0, 22, 1, accent); R(1, 2, 20, 2, '#2b2440');
    for (let i = 0; i < 5; i++) R(2 + i * 4, 6, 2, 2, Math.sin(t * 6 + i * 1.9) > 0 ? accent : '#2b2440');
    R(2, 10, 18, 1, accent);
  },
  terminal: (R, t) => {
    R(1, 5, 18, 10, INK); R(0, 4, 18, 10, '#2b2440'); R(1, 0, 16, 5, INK); R(2, 1, 14, 3, '#06363d');
    for (let k = 0; k < 2; k++) R(3, 1 + k * 2, 3 + ((frame(t, 4) + k * 5) % 9), 1, NEON.cyan);
    R(3, 8, 12, 3, '#3a3160'); R(4, 9, 2, 1, NEON.yel);
  },
  arcade: (screen) => (R, t) => {
    R(1, 1, 16, 14, INK); R(0, 0, 16, 14, NEON.violet);
    R(1, 2, 5, 10, frame(t, 4) % 2 ? screen : NEON.white); R(8, 3, 6, 8, '#2b0f4a'); R(10, 5, 2, 2, NEON.mag); R(10, 9, 2, 1, NEON.yel);
  },
  trophies: (R) => {
    R(1, 1, 30, 8, INK); R(0, 0, 30, 8, '#5c2f4f');
    for (let i = 0; i < 4; i++) { R(3 + i * 7, 1, 4, 4, NEON.yel); R(4 + i * 7, 5, 2, 2, '#c9b520'); }
  },
  reception: (R) => {
    R(1, 1, 36, 12, INK); R(0, 0, 36, 12, NEON.white); R(0, 9, 36, 3, '#c9b8e0'); R(6, 2, 10, 5, NEON.mag); R(22, 3, 8, 3, '#2b2440');
  },
  meeting: (R) => {
    R(10, 0, 6, 2, NEON.mag); R(0, 7, 2, 6, NEON.cyan); R(24, 7, 2, 6, NEON.yel);
    R(6, 3, 16, 14, INK); R(4, 5, 20, 10, INK);
    R(5, 2, 16, 14, NEON.white); R(3, 4, 20, 10, NEON.white);
    R(9, 6, 8, 5, '#2b2440'); R(10, 7, 6, 2, NEON.cyan);
  },
  mailbox: (R) => { R(1, 1, 12, 16, INK); R(0, 0, 12, 16, NEON.yel); R(0, 13, 12, 3, '#c9b520'); R(2, 3, 8, 1, INK); R(4, 7, 4, 3, NEON.white); },
  exit: (R, t) => {
    R(0, 0, 24, 10, NEON.yel); R(2, 2, 20, 6, INK);
    const shift = frame(t, 4) % 3;
    R(6 + shift, 4, 8, 2, NEON.yel); R(12 + shift, 3, 2, 4, NEON.yel); R(14 + shift, 4, 1, 2, NEON.yel);
  },
  couch: (R) => {
    R(1, 1, 48, 14, INK); R(0, 0, 48, 14, NEON.cyan); R(0, 10, 48, 4, NEON.teal); R(2, 2, 20, 7, '#a0f8ff'); R(26, 2, 20, 7, '#a0f8ff');
  },
};

/* Every interactive object: where it stands and which real résumé content it opens. */
const ROOM_NAMES = { office: 'Офис — опыт и навыки', server: 'Серверная — AI-агенты', lounge: 'Лаунж — проекты', lobby: 'Лобби — контакты' };
const OBJECTS = [
  { room: 'office', name: 'Рабочий стол', w: 50, h: 23, x: 28, y: 34, art: draw.deskMain, opens: 'Soulwise AI, 2025 — сейчас. Full-Stack Engineer: AI-фичи на OpenAI, Claude и Gemini, приложения iOS и Android из одной кодовой базы, загрузка быстрее на 36%.' },
  { room: 'office', name: 'Стол с канбаном', w: 50, h: 23, x: 28, y: 72, art: draw.deskSecond, opens: 'Oboard, 2022–2025. Senior Frontend Developer и Feature Owner: продукт внутри Monday.com, Salesforce, Jira и Confluence, интеграция платежей.' },
  { room: 'office', name: 'Архив и старый монитор', w: 21, h: 17, x: 124, y: 86, art: draw.archive, opens: 'Ранние роли, 2017–2022. Frontend на Vue.js и React в ITOMYCH Studio, AnyforSoft, IT Svit, Codica и QPARD.' },
  { room: 'office', name: 'Книжная полка', w: 45, h: 10, x: 102, y: 17, art: draw.bookshelf, opens: 'Навыки по группам: full-stack, кросс-платформа, AI и агенты, данные и инфраструктура, интеграции, продукт и лидерство.' },
  { room: 'office', name: 'Доска на стене', w: 34, h: 6, x: 30, y: 17, art: draw.whiteboard, opens: 'Как я работаю: SDD, TDD и BDD — сначала спецификация и тесты, потом код.' },
  { room: 'server', name: 'Стойка SEO-агента', w: 23, h: 13, x: 158, y: 20, art: draw.rack(BOT_COLORS[0]), opens: 'Агент адаптирует и переводит контент под поисковые системы.' },
  { room: 'server', name: 'Стойка контент-агента', w: 23, h: 13, x: 183, y: 20, art: draw.rack(BOT_COLORS[1]), opens: 'Агент готовит маркетинговые креативы и статьи.' },
  { room: 'server', name: 'Стойка QA-агента', w: 23, h: 13, x: 208, y: 20, art: draw.rack(BOT_COLORS[2]), opens: 'Агент тестирует каждую фичу и сам пишет документацию.' },
  { room: 'server', name: 'Стойка SMM-агента', w: 23, h: 13, x: 233, y: 20, art: draw.rack(BOT_COLORS[3]), opens: 'Агент ведёт соцсети сам, через браузерную автоматизацию.' },
  { room: 'server', name: 'Терминал', w: 19, h: 15, x: 162, y: 58, art: draw.terminal, opens: 'AI в продакшене: OpenAI, Claude и Gemini с векторным поиском на Qdrant, fallback между провайдерами и контроль стоимости.' },
  { room: 'lounge', name: 'Автомат «SaaS»', w: 17, h: 15, x: 240, y: 90, art: draw.arcade(NEON.cyan), opens: 'SaaS-продукт, сделанный в одиночку: веб и нативный Android, платежи, AI-функции, платящие пользователи.' },
  { room: 'lounge', name: 'Автомат «Open Source»', w: 17, h: 15, x: 240, y: 110, art: draw.arcade(NEON.yel), opens: 'speckit-product-forge — открытый фреймворк Spec-Driven Development поверх GitHub Spec Kit.' },
  { room: 'lounge', name: 'Автомат «5 в 1»', w: 17, h: 15, x: 240, y: 130, art: draw.arcade(NEON.pink), opens: 'Один продукт в 5+ версиях из одной кодовой базы: веб, Monday.com, Salesforce, Atlassian и мобильная.' },
  { room: 'lounge', name: 'Полка с кубками', w: 31, h: 9, x: 158, y: 86, art: draw.trophies, opens: 'Результаты: внутренние инструменты сократили ручную работу примерно на 40%, несколько запусков 0 → 1.' },
  { room: 'lobby', name: 'Стойка ресепшен', w: 37, h: 13, x: 28, y: 120, art: draw.reception, opens: 'Коротко: 8+ лет в разработке, 2+ года с AI и агентами в продакшене, remote из Украины.' },
  { room: 'lobby', name: 'Переговорный стол', w: 26, h: 17, x: 108, y: 120, art: draw.meeting, opens: 'AI Integration Consultant, 2025 — сейчас: три клиента, дорожные карты внедрения AI и внутренние агенты для команд.' },
  { room: 'lobby', name: 'Почтовый ящик', w: 13, h: 17, x: 30, y: 148, art: draw.mailbox, opens: 'Контакты: email, LinkedIn, GitHub, Telegram.' },
  { room: 'lobby', name: 'Выход', w: 24, h: 10, x: 58, y: 164, art: draw.exit, opens: 'Обычное резюме для рекрутера — тот же переход, что и по ESC.' },
].map((o, i) => ({ ...o, n: i + 1 }));

/* Draws one object at (ox, oy) with an interaction state layered on top. */
function drawObject(ctx, R, T, obj, ox, oy, t, state = 'idle') {
  const local = (x, y, w, h, c) => R(ox + x, oy + y, w, h, c);
  if (state === 'near') {
    const c = frame(t, 4) % 2 ? NEON.yel : NEON.white;
    R(ox - 3, oy - 3, obj.w + 6, 1, c); R(ox - 3, oy + obj.h + 2, obj.w + 6, 1, c);
    R(ox - 3, oy - 3, 1, obj.h + 6, c); R(ox + obj.w + 2, oy - 3, 1, obj.h + 6, c);
  }
  obj.art(local, t);
  if (state === 'near') {
    R(ox + obj.w - 2, oy - 9, 9, 9, INK); R(ox + obj.w - 1, oy - 8, 7, 7, NEON.yel); T('E', ox + obj.w + 2.5, oy - 2, INK, 6, 'center');
  }
  if (state === 'open') {
    R(ox + obj.w - 3, oy - 4, 7, 7, INK); R(ox + obj.w - 2, oy - 3, 5, 5, '#3fe08a');
    R(ox + obj.w - 1, oy - 1, 1, 2, INK); R(ox + obj.w, oy, 1, 1, INK); R(ox + obj.w + 1, oy - 2, 1, 2, INK);
  }
}

/* ---------- floor plan ---------- */

mount('rMap', WORLD.w, WORLD.h, 4, (c, t, R, T) => {
  ditherBg(R, WORLD.w, WORLD.h, t * 0.4);
  drawFloors(R); drawWalls(R);
  draw.couch((x, y, w, h, col) => R(158 + x, 157 + y, w, h, col));
  const hero = along(ROUTE, t * 26);
  OBJECTS.forEach((obj) => {
    const near = Math.hypot(obj.x + obj.w / 2 - hero.x, obj.y + obj.h / 2 - hero.y) < 34;
    drawObject(c, R, T, obj, obj.x, obj.y, t, near ? 'near' : 'idle');
  });
  BOT_COLORS.forEach((col, i) => drawRot(c, outlined(topBot(col, frame(t, 4) + i)), 169 + i * 25, 42 + Math.round(Math.sin(t * 2 + i) * 2), Math.PI));
  drawHero(c, heroTop({ anim: 'walk', f: frame(t, 10) % 8 }), hero.x, hero.y, hero.a);
  OBJECTS.forEach((obj) => {
    const bx = obj.x - 4, by = obj.y + obj.h - 5;
    R(bx, by, 10, 8, INK); R(bx + 1, by + 1, 8, 6, NEON.white); T(String(obj.n), bx + 5, by + 6.5, INK, 6, 'center');
  });
});

/* ---------- catalogue ---------- */

(function buildCatalogue() {
  const host = document.getElementById('catalogue');
  if (!host) return;
  const el = (tag, cls, text) => {
    const node = document.createElement(tag);
    if (cls) node.className = cls;
    if (text) node.textContent = text;
    return node;
  };
  Object.entries(ROOM_NAMES).forEach(([room, title]) => {
    host.appendChild(el('h3', 'rowhead', title));
    const grid = el('div', 'objects');
    host.appendChild(grid);
    OBJECTS.filter((o) => o.room === room).forEach((obj) => {
      const card = el('figure', 'card object');
      const stage = el('div', 'stage');
      const canvas = el('canvas');
      canvas.id = `obj-${obj.n}`;
      stage.appendChild(canvas);
      const caption = el('figcaption');
      caption.append(el('b', '', `${obj.n} · ${obj.name}`), obj.opens);
      card.append(stage, caption);
      grid.appendChild(card);
      const cell = obj.w + 16;
      mount(canvas.id, cell * 3, obj.h + 20, 3, (c, t, R, T) => {
        ['idle', 'near', 'open'].forEach((state, i) => drawObject(c, R, T, obj, 6 + i * cell, 12, t, state));
      });
    });
  });
}());
