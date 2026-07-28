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

  // Contact form: submit to Google Apps Script as JSON.
  // mode: 'no-cors' + text/plain avoids a CORS preflight, which Apps Script
  // doesn't handle. Trade-off: the response is opaque, so fetch() resolves
  // even if the script errors server-side — .catch() only fires on network
  // failure, not on Apps Script-side failures.
  const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbw1Lwl5LXUNqzVfAwfTRfpFBPOfdsDvVZlV_aawHsAbNSeuy9GHVo9gAxnAmrmUF21Z/exec';
  const form = document.getElementById('inquiry-form');
  if (form) {
    const statusEl = document.getElementById('form-status');
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const btn = form.querySelector('button[type="submit"]');
      if (btn) {
        btn.disabled = true;
        btn.textContent = 'Sending...';
      }
      if (statusEl) {
        statusEl.textContent = '';
        statusEl.style.color = '';
      }

      const payload = {
        name: document.getElementById('name').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value,
        service: document.getElementById('service').value,
        message: document.getElementById('message').value
      };

      fetch(APPS_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(payload)
      })
        .then(() => {
          if (statusEl) {
            statusEl.textContent = "Thanks — your inquiry has been sent. We'll get back to you soon.";
            statusEl.style.color = 'var(--orange-dark)';
          }
          form.reset();
        })
        .catch(() => {
          if (statusEl) {
            statusEl.textContent = 'Something went wrong, please try again.';
            statusEl.style.color = '#c0392b';
          }
        })
        .finally(() => {
          if (btn) {
            btn.disabled = false;
            btn.textContent = 'Send Inquiry';
          }
        });
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
