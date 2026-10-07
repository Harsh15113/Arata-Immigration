// Scroll animations for the inner pages — GSAP + ScrollTrigger (cdnjs).
// The photo banner drifts and fades, headings slide in from alternating
// sides, and cards, tiles and photos rise into place as they scroll in.
// (The home page has its own script, js/home.js.)
// If GSAP fails to load or the visitor prefers reduced motion, nothing here
// runs and every page shows its normal static layout.
document.addEventListener('DOMContentLoaded', function () {
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  gsap.registerPlugin(ScrollTrigger);
  var EASE = 'power3.out';

  // ---- Photo banner: text rises in, then the photo parallaxes away. ----
  var banner = document.querySelector('.p-hero');
  if (banner) {
    gsap.from(banner.querySelectorAll('.p-hero-content > *'), {
      y: 50, opacity: 0, duration: 1.1, stagger: 0.12, ease: EASE, delay: 0.15
    });
    gsap.fromTo(banner.querySelector('.p-hero-img'), { scale: 1.15 }, { scale: 1, duration: 1.8, ease: 'power2.out' });
    var bannerScroll = { trigger: banner, start: 'top top', end: 'bottom top', scrub: true };
    gsap.to(banner.querySelector('.p-hero-img'), { yPercent: 20, ease: 'none', scrollTrigger: bannerScroll });
    gsap.to(banner.querySelector('.p-hero-content'), { y: -80, opacity: 0, ease: 'none', scrollTrigger: bannerScroll });
  }

  // ---- Section headings slide in from alternating sides. ----
  document.querySelectorAll('.section-head, .h-head').forEach(function (head, i) {
    gsap.from(head.children, {
      x: i % 2 ? 80 : -80, opacity: 0, duration: 1, stagger: 0.1, ease: EASE,
      scrollTrigger: { trigger: head, start: 'top 85%', toggleActions: 'play none none reverse' }
    });
  });

  // ---- Cards and tiles rise in, a row at a time. ----
  // These elements have their own CSS hover transitions, which would fight
  // the tween — switch them off while it runs, then restore them.
  var risers = '.card, .value-item, .info-card, .stat, .h-dest, .form-card';
  gsap.set(risers, { opacity: 0, y: 70 });
  ScrollTrigger.batch(risers, {
    start: 'top 90%',
    onEnter: function (batch) {
      batch.forEach(function (el) { el.style.transition = 'none'; });
      gsap.to(batch, {
        opacity: 1, y: 0, duration: 1, stagger: 0.09, ease: EASE, overwrite: true,
        clearProps: 'transform,opacity,transition'
      });
    }
  });
  ScrollTrigger.batch('.h-dest', {
    start: 'top 90%',
    onEnter: function (batch) {
      gsap.fromTo(batch.map(function (el) { return el.querySelector('img'); }),
        { scale: 1.25 }, { scale: 1, duration: 1.6, stagger: 0.09, ease: EASE, clearProps: 'transform' });
    }
  });

  // ---- Photos open up as they scroll in (About and Gallery). ----
  document.querySelectorAll('.about-photo, .gallery-card').forEach(function (el, i) {
    gsap.fromTo(el, { clipPath: 'inset(8% 8% 8% 8% round 8px)', opacity: 0.4 }, {
      clipPath: 'inset(0% 0% 0% 0% round 8px)', opacity: 1, ease: 'none',
      scrollTrigger: { trigger: el, start: 'top 95%', end: 'top 45%', scrub: true }
    });
    var img = el.querySelector('img');
    if (img) {
      gsap.fromTo(img, { scale: 1.2 }, {
        scale: 1, ease: 'none',
        scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true }
      });
    }
  });
  var story = document.querySelector('.about-photo + div');
  if (story) {
    gsap.from(story.children, {
      x: 60, opacity: 0, duration: 1, stagger: 0.06, ease: EASE,
      scrollTrigger: { trigger: story, start: 'top 80%' }
    });
  }

  // ---- Programme pages: brochure cover tilts in, copy slides across. ----
  var brochure = document.querySelector('.gv-brochure');
  if (brochure) {
    // Ends on the cover's CSS tilt (-3deg), then hands back to CSS for hover.
    var cover = brochure.querySelector('.gv-brochure-cover');
    gsap.fromTo(cover, { rotation: -12, y: 80, opacity: 0 }, {
      rotation: -3, y: 0, opacity: 1, duration: 1.2, ease: EASE,
      clearProps: 'transform,opacity,transition',
      onStart: function () { cover.style.transition = 'none'; },
      scrollTrigger: { trigger: brochure, start: 'top 80%' }
    });
    gsap.from(brochure.querySelectorAll(':scope > div > *'), {
      x: 60, opacity: 0, duration: 1, stagger: 0.08, ease: EASE,
      scrollTrigger: { trigger: brochure, start: 'top 80%' }
    });
  }

  // ---- Closing call to action. ----
  gsap.from('.h-cta .h-wrap > *', {
    y: 50, opacity: 0, duration: 1, stagger: 0.1, ease: EASE,
    scrollTrigger: { trigger: '.h-cta', start: 'top 80%', toggleActions: 'play none none reverse' }
  });

  // Images change section heights once loaded — recompute trigger positions.
  window.addEventListener('load', function () { ScrollTrigger.refresh(); });
});
