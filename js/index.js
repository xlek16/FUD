/* ============================================================
   FIND YOUR DUO — Index Page JavaScript
   ============================================================ */

// Animate hero stat counters
function animateValue(el, start, end, duration, suffix = '') {
  if (!el) return;
  const startTime = performance.now();
  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = Math.floor(start + (end - start) * eased);
    el.textContent = current.toLocaleString() + suffix;
    if (progress < 1) requestAnimationFrame(update);
  }
  requestAnimationFrame(update);
}

function animateDecimal(el, end, duration, decimals = 1) {
  if (!el) return;
  const startTime = performance.now();
  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = (eased * end).toFixed(decimals);
    if (progress < 1) requestAnimationFrame(update);
  }
  requestAnimationFrame(update);
}

// Observe stat counters
const statsBar = document.querySelector('.hero-stats-bar');
if (statsBar) {
  const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateValue(document.getElementById('stat-matched'), 0, 127, 1600, 'K+');
        animateValue(document.getElementById('stat-games'), 0, 48, 1200, '');
        animateDecimal(document.getElementById('stat-rating'), 4.9, 1400, 1);
        statsObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });
  statsObserver.observe(statsBar);
}

// Subtle live counter simulation on the badge
const onlineCount = document.getElementById('online-count');
if (onlineCount) {
  let base = 2431;
  setInterval(() => {
    const delta = Math.floor(Math.random() * 5) - 2; // -2 to +2
    base = Math.max(2400, Math.min(2500, base + delta));
    onlineCount.textContent = base.toLocaleString();
  }, 4000);
}
