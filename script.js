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
      if (el.classList.contains('stat-num')) {
        animateCounter(el, parseInt(el.dataset.target), 1400);
      }
      if (el.classList.contains('skills-block')) animateSkillBars();
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
      card.style.transform = `perspective(600px) rotateX(${((y-cy)/cy)*-5}deg) rotateY(${((x-cx)/cx)*5}deg) translateY(-3px)`;
      card.style.setProperty('--mx', (x / r.width * 100) + '%');
      card.style.setProperty('--my', (y / r.height * 100) + '%');
    });
    card.addEventListener('mouseleave', () => { card.style.transform = ''; });
  });
}

/* ===== CONTRIBUTION HEATMAP (deterministic seed) ===== */
function buildHeatmap() {
  const grid = document.getElementById('heatmap');
  if (!grid) return;
  function seeded(s) {
    return function() {
      s |= 0; s = s + 0x6D2B79F5 | 0;
      let t = Math.imul(s ^ s >>> 15, 1 | s);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }
  const rng = seeded(0xDEADBEEF);
  const total = 52 * 7;
  for (let i = 0; i < total; i++) {
    const week = Math.floor(i / 7);
    const r = rng();
    const w = week < 20 ? 0.18 : week < 35 ? 0.28 : week < 44 ? 0.42 : 0.62;
    let lvl = 0;
    if (r < w * 0.45) lvl = 1;
    if (r < w * 0.28) lvl = 2;
    if (r < w * 0.15) lvl = 3;
    if (r < w * 0.06) lvl = 4;
    const cell = document.createElement('div');
    cell.className = 'gh-cell gh-' + lvl;
    grid.appendChild(cell);
  }
}

/* ===== WOW #1: PARTICLE CANVAS ===== */
function initParticles() {
  const canvas = document.getElementById('particle-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, particles = [];

  function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  const COUNT = 60;
  for (let i = 0; i < COUNT; i++) {
    particles.push({
      x: Math.random() * W, y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      r: Math.random() * 1.5 + 0.5,
    });
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    // connections
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx*dx + dy*dy);
        if (dist < 140) {
          ctx.beginPath();
          ctx.strokeStyle = `rgba(56,156,255,${0.18 * (1 - dist/140)})`;
          ctx.lineWidth = 0.7;
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }
    }
    // dots
    particles.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(56,156,255,0.55)';
      ctx.fill();
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0 || p.x > W) p.vx *= -1;
      if (p.y < 0 || p.y > H) p.vy *= -1;
    });
    requestAnimationFrame(draw);
  }
  draw();
}

/* ===== WOW #2: CURSOR SPOTLIGHT ===== */
function initSpotlight() {
  const el = document.getElementById('spotlight');
  if (!el) return;
  document.addEventListener('mousemove', e => {
    el.style.setProperty('--mx', e.clientX + 'px');
    el.style.setProperty('--my', e.clientY + 'px');
  });
}

/* ===== WOW #4: TERMINAL TYPING ===== */
function initTerminal() {
  const body = document.getElementById('term-body');
  if (!body) return;

  const lines = [
    { type: 'cmd',  text: 'whoami' },
    { type: 'out',  text: 'Valentyn Yakovliev — Full-stack Product Engineer', cls: 'highlight' },
    { type: 'cmd',  text: 'cat skills.txt' },
    { type: 'out',  text: 'Vue 3 (95%) · TypeScript (88%) · NestJS (80%) · MongoDB · Docker', cls: '' },
    { type: 'cmd',  text: 'cat achievements.txt' },
    { type: 'out',  text: '🚀 Built My Zodiac AI solo → 1,500 users in 4 months', cls: '' },
    { type: 'out',  text: '⚡ 15+ microservices · 99.9% uptime · 85% test coverage', cls: 'dim' },
    { type: 'cmd',  text: 'echo $STATUS' },
    { type: 'out',  text: '✅ Open to work — senior / lead full-stack roles', cls: 'highlight' },
  ];

  let li = 0;
  const CHAR_SPEED = 28;
  const LINE_PAUSE = 320;

  function renderCursor() {
    return '<span class="term-cursor-inline"></span>';
  }

  function typeLine(lineObj, onDone) {
    const row = document.createElement('div');
    row.className = 'term-line';

    if (lineObj.type === 'cmd') {
      row.innerHTML = `<span class="term-prompt">❯</span><span class="term-cmd"></span>`;
      body.appendChild(row);
      const cmdEl = row.querySelector('.term-cmd');
      let ci = 0;
      function typeChar() {
        if (ci <= lineObj.text.length) {
          cmdEl.innerHTML = lineObj.text.slice(0, ci) + (ci < lineObj.text.length ? renderCursor() : '');
          ci++;
          setTimeout(typeChar, CHAR_SPEED);
        } else {
          setTimeout(onDone, LINE_PAUSE);
        }
      }
      typeChar();
    } else {
      row.innerHTML = `<span class="term-out ${lineObj.cls || ''}">${lineObj.text}</span>`;
      body.appendChild(row);
      setTimeout(onDone, 60);
    }
    body.scrollTop = body.scrollHeight;
  }

  function nextLine() {
    if (li >= lines.length) return;
    typeLine(lines[li++], nextLine);
  }

  setTimeout(nextLine, 600);
}

/* ===== INIT ALL ===== */
document.addEventListener('DOMContentLoaded', () => {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (!reduced) {
    initParticles();
    initSpotlight();
  }

  initTerminal();
  buildHeatmap();
  setupObserver();
  setupTilt();
});
