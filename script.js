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

/* ===== CONTRIBUTION HEATMAP ===== */
function buildHeatmap() {
  const grid = document.getElementById('heatmap');
  if (!grid) return;
  const weeks = 52, days = 7;
  const cells = weeks * days;
  for (let i = 0; i < cells; i++) {
    const cell = document.createElement('div');
    cell.className = 'gh-cell';
    // weighted random: mostly 0, some activity
    const rand = Math.random();
    let lvl = 0;
    if (rand > 0.72) lvl = 1;
    if (rand > 0.85) lvl = 2;
    if (rand > 0.93) lvl = 3;
    if (rand > 0.97) lvl = 4;
    cell.classList.add('gh-' + lvl);
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
