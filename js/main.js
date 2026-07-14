// Mobile nav toggle
document.addEventListener('DOMContentLoaded', () => {
  const header = document.querySelector('.site-header');
  const toggle = document.querySelector('.nav-toggle');

  if (toggle && header) {
    toggle.addEventListener('click', () => {
      header.classList.toggle('open');
    });

    document.querySelectorAll('.main-nav > a').forEach((link) => {
      link.addEventListener('click', () => header.classList.remove('open'));
    });
  }

  // Mega-menu: hover on desktop (CSS-only), tap-to-expand accordion on mobile.
  document.querySelectorAll('.nav-trigger').forEach((trigger) => {
    trigger.addEventListener('click', (e) => {
      if (window.innerWidth <= 760) {
        e.preventDefault();
        const item = trigger.closest('.nav-item');
        const wasOpen = item.classList.contains('open');
        document.querySelectorAll('.nav-item.open').forEach((el) => el.classList.remove('open'));
        if (!wasOpen) item.classList.add('open');
      }
    });
  });

  document.querySelectorAll('.mega-menu a').forEach((link) => {
    link.addEventListener('click', () => header && header.classList.remove('open'));
  });

  // Contact form: basic client-side check + friendly confirmation.
  // NOTE: this form uses Netlify Forms (works automatically if the site is
  // deployed on Netlify). If hosted elsewhere, swap the <form> action for
  // another form backend (e.g. Formspree) or keep the "Email us directly"
  // mailto link on the contact page as the primary path.
  const form = document.getElementById('inquiry-form');
  if (form) {
    form.addEventListener('submit', () => {
      const btn = form.querySelector('button[type="submit"]');
      if (btn) {
        btn.disabled = true;
        btn.textContent = 'Sending...';
      }
    });
  }

  // Footer year
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Scroll-reveal: fade + rise elements into view as the user scrolls.
  const revealTargets = document.querySelectorAll(
    '.card, .testimonial, .country-chip, .value-item, .info-card, .stat, .gallery-card, .hero-card'
  );
  if (revealTargets.length && 'IntersectionObserver' in window) {
    revealTargets.forEach((el, i) => {
      el.classList.add('reveal');
      el.style.transitionDelay = `${Math.min(i % 6, 5) * 70}ms`;
    });
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
    revealTargets.forEach((el) => observer.observe(el));
  } else {
    revealTargets.forEach((el) => el.classList.add('in-view'));
  }
});
