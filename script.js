// ── Analytics Dashboard ──────────────────────────────────────────
// GoatCounter site: https://tuhinsamui.goatcounter.com
// To activate public counter: GoatCounter → Settings → Privacy
// → enable "Allow anyone to see my stats"
const GC_CODE = 'tuhinsamui';

const ARTICLES = [
  { id: 'future-ios',    event: 'insight-future-ios'    },
  { id: 'modular-arch',  event: 'insight-modular-arch'  },
  { id: 'leading-teams', event: 'insight-leading-teams' },
  { id: 'ai-engineering',event: 'insight-ai-engineering'},
];

async function gcGet(path) {
  const r = await fetch(`https://${GC_CODE}.goatcounter.com/counter/${path}.json`);
  if (!r.ok) throw new Error(r.status);
  return r.json();
}

function parseCount(str) {
  return parseInt((str || '0').replace(/,/g, ''), 10) || 0;
}

function animateCount(el, target) {
  const start = performance.now();
  const from  = parseCount(el.textContent);
  (function step(now) {
    const p = Math.min((now - start) / 900, 1);
    const e = 1 - Math.pow(1 - p, 3);
    el.textContent = Math.round(from + (target - from) * e).toLocaleString();
    if (p < 1) requestAnimationFrame(step);
  })(start);
}

async function loadAnalytics() {
  // configured — proceeding

  // Hide setup banner once configured
  const banner = document.getElementById('analytics-banner');
  if (banner) banner.style.display = 'none';

  // Total site visits
  try {
    const data = await gcGet('%2F');
    const el = document.getElementById('stat-total');
    if (el) animateCount(el, parseCount(data.count));
  } catch (_) {}

  // Last updated timestamp
  const updEl = document.getElementById('stat-updated');
  if (updEl) updEl.textContent = new Date().toLocaleDateString('en-GB', { day:'numeric', month:'short' });

  // Article interest bars
  const results = await Promise.allSettled(
    ARTICLES.map(a => gcGet(a.event))
  );

  const counts = results.map((r, i) => ({
    ...ARTICLES[i],
    n: r.status === 'fulfilled' ? parseCount(r.value.count) : 0,
  }));

  const max = Math.max(...counts.map(c => c.n), 1);

  counts.forEach(({ id, n }) => {
    const countEl = document.getElementById(`count-${id}`);
    const barEl   = document.getElementById(`bar-${id}`);
    if (countEl) countEl.textContent = n > 0 ? n.toLocaleString() : '—';
    if (barEl) {
      // small delay so CSS transition fires after paint
      requestAnimationFrame(() => {
        barEl.style.width = `${Math.round((n / max) * 100)}%`;
      });
    }
  });
}

loadAnalytics();

// Mobile nav toggle
const toggle = document.querySelector('.nav-toggle');
const navLinks = document.querySelector('.nav-links');

toggle.addEventListener('click', () => {
  navLinks.classList.toggle('open');
});

// Close nav on link click (mobile)
navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => navLinks.classList.remove('open'));
});

// Highlight active nav link on scroll
const sections = document.querySelectorAll('section[id]');
const links = document.querySelectorAll('.nav-links a');

const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      links.forEach(l => l.style.color = '');
      const active = document.querySelector(`.nav-links a[href="#${entry.target.id}"]`);
      if (active) active.style.color = 'var(--accent)';
    }
  });
}, { rootMargin: '-40% 0px -55% 0px' });

sections.forEach(s => observer.observe(s));

// Fade-in on scroll
const fadeEls = document.querySelectorAll('.skill-card, .timeline-item, .oss-card, .edu-card, .stat');

const fadeObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
      fadeObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });

fadeEls.forEach(el => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(20px)';
  el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
  fadeObserver.observe(el);
});
