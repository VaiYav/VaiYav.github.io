/* ===== TYPING EFFECT ===== */
function typeWriter(el, texts, speed = 60, pause = 2000) {
  let ti = 0, ci = 0, deleting = false;
  function tick() {
    const full = texts[ti];
    el.textContent = deleting ? full.slice(0, ci--) : full.slice(0, ci++);
    if (!deleting && ci > full.length) {
      deleting = true; setTimeout(tick, pause); return;
    }
    if (deleting && ci < 0) {
      deleting = false; ti = (ti + 1) % texts.length; ci = 0;
    }
    setTimeout(tick, deleting ? speed / 2 : speed);
  }
  tick();
}

/* ===== COUNTER ANIMATION ===== */
function animateCounter(el, target, duration = 1500) {
  const suffix = el.dataset.suffix || '';
  const start = performance.now();
  function update(now) {
    const t = Math.min((now - start) / duration, 1);
    const ease = 1 - Math.pow(1 - t, 3);
    el.textContent = Math.round(ease * target) + suffix;
    if (t < 1) requestAnimationFrame(update);
  }
  requestAnimationFrame(update);
}

/* ===== SKILL BARS ===== */
function animateSkillBars() {
  document.querySelectorAll('.skill-bar').forEach(bar => {
    bar.style.width = bar.dataset.pct + '%';
  });
}

/* ===== INTERSECTION OBSERVER ===== */
function setupObserver() {
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const el = e.target;
      el.classList.add('visible');

      // counters
      if (el.classList.contains('stat-num')) {
        animateCounter(el, parseInt(el.dataset.target), 1400);
      }
      // skills section
      if (el.classList.contains('skills-block')) {
        animateSkillBars();
      }
      io.unobserve(el);
    });
  }, { threshold: 0.15 });

  document.querySelectorAll('.fade-up, .tl-item, .stat-num, .skills-block').forEach(el => io.observe(el));
}

/* ===== 3D CARD TILT ===== */
function setupTilt() {
  document.querySelectorAll('.card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const r = card.getBoundingClientRect();
      const x = e.clientX - r.left, y = e.clientY - r.top;
      const cx = r.width / 2, cy = r.height / 2;
      const rotX = ((y - cy) / cy) * -5;
      const rotY = ((x - cx) / cx) * 5;
      card.style.transform = `perspective(600px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateY(-3px)`;
      card.style.setProperty('--mx', (x / r.width * 100) + '%');
      card.style.setProperty('--my', (y / r.height * 100) + '%');
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });
}

/* ===== CONTRIBUTION HEATMAP (deterministic seed) ===== */
function buildHeatmap() {
  const grid = document.getElementById('heatmap');
  if (!grid) return;
  const weeks = 52, days = 7, total = weeks * days;

  // Simple seeded PRNG (mulberry32)
  function seeded(s) {
    return function() {
      s |= 0; s = s + 0x6D2B79F5 | 0;
      let t = Math.imul(s ^ s >>> 15, 1 | s);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }
  const rng = seeded(0xDEADBEEF);

  // Build activity pattern: ramp up towards week 44 (Nov 2024 launch), stay high
  for (let i = 0; i < total; i++) {
    const week = Math.floor(i / days);
    const r = rng();
    // activity weight: low at start, high from week 40 onwards
    const weight = week < 20 ? 0.18 : week < 35 ? 0.28 : week < 44 ? 0.42 : 0.62;
    let lvl = 0;
    if (r < weight * 0.45) lvl = 1;
    if (r < weight * 0.28) lvl = 2;
    if (r < weight * 0.15) lvl = 3;
    if (r < weight * 0.06) lvl = 4;
    const cell = document.createElement('div');
    cell.className = 'gh-cell gh-' + lvl;
    grid.appendChild(cell);
  }
}

/* ===== INIT ===== */
document.addEventListener('DOMContentLoaded', () => {
  const titleEl = document.getElementById('typing-title');
  if (titleEl) {
    typeWriter(titleEl, [
      'Full-Stack Developer',
      '7+ years Vue.js',
      'NestJS Backend',
      'Founder of My Zodiac AI 🚀',
    ]);
  }
  buildHeatmap();
  setupObserver();
  setupTilt();
});
