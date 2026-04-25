/* ============================================================
   FIND YOUR DUO — Shared JavaScript
   ============================================================ */

// Navbar scroll effect
const navbar = document.getElementById('navbar');
if (navbar) {
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 30);
  });
}

// Intersection Observer for fade-up animations
const fadeObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      const parent = entry.target.parentElement;
      const siblings = Array.from(parent.querySelectorAll('.fade-up'));
      const index = siblings.indexOf(entry.target);
      entry.target.style.transitionDelay = `${index * 80}ms`;
      entry.target.classList.add('visible');
      fadeObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.fade-up').forEach(el => fadeObserver.observe(el));

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', (e) => {
    const href = a.getAttribute('href');
    if (href === '#') return;
    e.preventDefault();
    const target = document.querySelector(href);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

// Animate stat numbers
function animateValue(el, start, end, duration, suffix = '') {
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

function animateDecimal(el, start, end, duration, decimals = 1) {
  const startTime = performance.now();
  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = (start + (end - start) * eased).toFixed(decimals);
    if (progress < 1) requestAnimationFrame(update);
  }
  requestAnimationFrame(update);
}

// Observe hero stats for animation
const heroStats = document.querySelector('.hero-stats');
if (heroStats) {
  const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const nums = entry.target.querySelectorAll('.hero-stat-num');
        if (nums[0]) animateValue(nums[0], 0, 127, 1600, 'K+');
        if (nums[1]) animateValue(nums[1], 0, 48, 1200, '');
        if (nums[2]) animateDecimal(nums[2], 0, 4.8, 1400, 1);
        statsObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });
  statsObserver.observe(heroStats);
}

// Observe game hero stats
const gameHeroStats = document.querySelector('.game-hero-stats');
if (gameHeroStats) {
  const gameStatsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.querySelectorAll('[data-count]').forEach(el => {
          const end = parseInt(el.dataset.count);
          const suffix = el.dataset.suffix || '';
          animateValue(el, 0, end, 1400, suffix);
        });
        gameStatsObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });
  gameStatsObserver.observe(gameHeroStats);
}

// Auth state checking with real-time updates
function setupAuthListener() {
  const navLogin = document.getElementById('nav-login');
  const navSignup = document.getElementById('nav-signup');
  const userMenu = document.getElementById('user-menu');
  const userName = document.getElementById('user-name');
  const heroCta = document.getElementById('hero-cta');
  const footerCta = document.getElementById('footer-cta');

  if (!navLogin || !navSignup || !userMenu || !userName) return;

  // Listen for auth changes (login, logout, session refresh)
  supabase.auth.onAuthStateChange(async (event, session) => {
    const user = session?.user;
    
    if (user) {
      navLogin.style.display = 'none';
      navSignup.style.display = 'none';
      userMenu.style.display = 'flex';
      userName.textContent = user.user_metadata.username || user.email.split('@')[0];
      
      if (heroCta) {
        heroCta.textContent = "Find My Duo";
        heroCta.href = "#games";
      }
      if (footerCta) {
        footerCta.textContent = "Browse Players";
        footerCta.href = "#games";
      }
    } else {
      navLogin.style.display = 'block';
      navSignup.style.display = 'block';
      userMenu.style.display = 'none';
      
      if (heroCta) {
        heroCta.textContent = "Find My Duo";
        heroCta.href = "login.html";
      }
      if (footerCta) {
        footerCta.textContent = "Create Your Profile";
        footerCta.href = "login.html?mode=signup";
      }
    }
  });
}

// Logout handler
const navLogout = document.getElementById('nav-logout');
if (navLogout) {
  navLogout.addEventListener('click', async (e) => {
    e.preventDefault();
    await supabase.auth.signOut();
    window.location.href = 'index.html';
  });
}

// Initial setup
if (typeof supabase !== 'undefined') {
  setupAuthListener();
}

