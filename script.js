// LeetCode live stats
async function loadLeetCodeStats() {
  const username = 'ripperTMS';
  try {
    const res = await fetch(`https://leetcode-stats-api.herokuapp.com/${username}`);
    if (!res.ok) throw new Error('API error');
    const data = await res.json();
    if (data.status !== 'success') throw new Error('Bad response');

    const map = {
      '.lc-total   .lc-count': data.totalSolved,
      '.lc-easy-card .lc-count':   data.easySolved,
      '.lc-medium-card .lc-count': data.mediumSolved,
      '.lc-hard-card .lc-count':   data.hardSolved,
    };

    Object.entries(map).forEach(([selector, value]) => {
      const el = document.querySelector(selector);
      if (el) animateCount(el, value);
    });
  } catch (e) {
    // Silently fail — static 0s remain visible
    console.warn('LeetCode stats unavailable:', e.message);
  }
}

function animateCount(el, target) {
  const duration = 1000;
  const start = performance.now();
  const from = parseInt(el.textContent) || 0;

  function step(now) {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
    el.textContent = Math.round(from + (target - from) * eased);
    if (progress < 1) requestAnimationFrame(step);
  }

  requestAnimationFrame(step);
}

loadLeetCodeStats();

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
