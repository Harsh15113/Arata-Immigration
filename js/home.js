// Home page behaviour: numbered tab rotators, intro loader and GSAP
// ScrollTrigger animations. Every section renders in
// its final state if GSAP is unavailable or the visitor prefers reduced motion.
document.addEventListener('DOMContentLoaded', function () {
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---- Numbered tabs with progress lines (hero slides, client quotes). ----
  // The active tab's bar fills via a CSS animation; when it finishes, the
  // next item is shown. Clicking a tab jumps straight to it.
  function setupTabs(tabList, items, seconds) {
    if (!tabList || !items.length) return;
    var tabs = Array.prototype.slice.call(tabList.querySelectorAll('.h-tab'));
    tabList.style.setProperty('--tab-count', tabs.length);
    tabList.style.setProperty('--tab-duration', seconds + 's');
    var current = 0;

    function show(index) {
      tabs[current].classList.remove('is-active');
      tabs[current].setAttribute('aria-selected', 'false');
      items[current].classList.remove('is-active');
      current = index;
      tabs[current].classList.add('is-active');
      tabs[current].setAttribute('aria-selected', 'true');
      items[current].classList.add('is-active');
    }

    tabs.forEach(function (tab, i) {
      tab.addEventListener('click', function () { if (i !== current) show(i); });
      tab.querySelector('.h-tab-bar i').addEventListener('animationend', function () {
        if (i === current) show((current + 1) % tabs.length);
      });
    });
  }
  setupTabs(document.querySelector('.h-hero-tabs'), document.querySelectorAll('.h-hero-slide'), 6);
  setupTabs(document.querySelector('.h-quote-tabs'), document.querySelectorAll('.h-quote'), 7);

  var loader = document.querySelector('.intro-loader');
  var showIntro = document.documentElement.classList.contains('show-intro');

  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined' || reduceMotion) {
    if (loader) loader.remove();
    return;
  }
  gsap.registerPlugin(ScrollTrigger);
  var EASE = 'power3.out';

  // ---- Intro: logo and corner brackets assemble, then the curtain lifts. ----
  var heroDelay = 0.1;
  if (showIntro && loader) {
    loader.style.animation = 'none';
    gsap.timeline({ onComplete: function () { loader.remove(); } })
      .from('.intro-mark img', { scale: 0.6, opacity: 0, duration: 0.7, ease: 'back.out(1.6)' }, 0.1)
      .from('.intro-corner.tl', { x: -40, y: -40, opacity: 0, duration: 0.7, ease: EASE }, 0.25)
      .from('.intro-corner.tr', { x: 40, y: -40, opacity: 0, duration: 0.7, ease: EASE }, 0.25)
      .from('.intro-corner.bl', { x: -40, y: 40, opacity: 0, duration: 0.7, ease: EASE }, 0.25)
      .from('.intro-corner.br', { x: 40, y: 40, opacity: 0, duration: 0.7, ease: EASE }, 0.25)
      .to('.intro-mark', { scale: 0.85, opacity: 0, duration: 0.4, ease: 'power2.in' }, 1.25)
      .to(loader, { yPercent: -100, duration: 0.9, ease: 'power4.inOut' }, 1.45);
    heroDelay = 1.9;
  } else if (loader) {
    loader.remove();
  }

  // ---- Hero: content rises in, then drifts away as you scroll. ----
  var hero = document.querySelector('.h-hero');
  if (hero) {
    gsap.from(['.h-hero-rating', '.h-hero-slides', '.h-hero-content .h-hero-actions', '.h-hero-tabs'], {
      y: 40, opacity: 0, duration: 1.1, stagger: 0.12, ease: EASE, delay: heroDelay, clearProps: 'transform,opacity'
    });
    var heroScroll = { trigger: hero, start: 'top top', end: 'bottom top', scrub: true };
    gsap.to('.h-hero .hero-globe-layer', { yPercent: 25, ease: 'none', scrollTrigger: heroScroll });
    gsap.to('.h-hero-content', { y: -90, opacity: 0, ease: 'none', scrollTrigger: heroScroll });
  }

  // ---- Statement: words light up one by one as you scroll through it. ----
  var statement = document.querySelector('.h-statement');
  if (statement) {
    statement.innerHTML = statement.textContent.trim().split(/\s+/).map(function (word) {
      return '<span class="w">' + word + '</span>';
    }).join(' ');
    gsap.fromTo(statement.querySelectorAll('.w'), { opacity: 0.15 }, {
      opacity: 1, stagger: 0.05, ease: 'none',
      scrollTrigger: { trigger: statement, start: 'top 80%', end: 'bottom 45%', scrub: true }
    });
  }

  function rise(targets, trigger, extra) {
    gsap.from(targets, Object.assign({
      y: 50, opacity: 0, duration: 1, ease: EASE, stagger: 0.1,
      scrollTrigger: { trigger: trigger, start: 'top 85%', toggleActions: 'play none none reverse' }
    }, extra || {}));
  }
  rise('.h-intro .h-stats > div, .h-intro .pill', '.h-stats');
  rise('.h-intro-grid > .mono-label', '.h-intro-grid', { x: -60, y: 0 });

  // Section titles slide in from alternating sides.
  document.querySelectorAll('.h-head, .h-stories-grid > div:first-child').forEach(function (head, i) {
    rise(head.children, head, { x: i % 2 ? 80 : -80, y: 0 });
  });

  // ---- Services: horizontal row driven by vertical scroll on desktop. ----
  var mm = gsap.matchMedia();
  mm.add('(min-width: 900px)', function () {
    var section = document.querySelector('.h-services');
    var scroller = section.querySelector('.h-hscroll');
    var track = section.querySelector('.h-track');
    scroller.style.overflow = 'visible';
    var distance = function () { return Math.max(0, track.scrollWidth - window.innerWidth); };

    gsap.to(track, {
      x: function () { return -distance(); },
      ease: 'none',
      scrollTrigger: {
        trigger: section,
        start: 'top top',
        end: function () { return '+=' + distance(); },
        scrub: 1,
        pin: true,
        invalidateOnRefresh: true
      }
    });
    return function () { scroller.style.overflow = ''; };
  });
  rise('.h-card', '.h-track', { y: 80, stagger: 0.08 });

  // ---- Full-screen moment: a tilted, framed card expands to fill the screen. ----
  var moment = document.querySelector('.h-moment');
  if (moment) {
    var tl = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: { trigger: moment, start: 'top top', end: '+=120%', scrub: 1, pin: true }
    });
    tl.fromTo('.h-moment-frame',
        { clipPath: 'inset(14% 12% round 16px)', rotationX: 14, transformPerspective: 1200 },
        { clipPath: 'inset(0% 0% round 0px)', rotationX: 0, duration: 1 }, 0)
      .fromTo('.h-moment-frame img', { scale: 1.3 }, { scale: 1, duration: 1 }, 0)
      .fromTo('.h-corner.tl', { top: '20%', left: '15%' }, { top: '13%', left: '4%', duration: 1 }, 0)
      .fromTo('.h-corner.tr', { top: '20%', right: '15%' }, { top: '13%', right: '4%', duration: 1 }, 0)
      .fromTo('.h-corner.bl', { bottom: '18%', left: '15%' }, { bottom: '6%', left: '4%', duration: 1 }, 0)
      .fromTo('.h-corner.br', { bottom: '18%', right: '15%' }, { bottom: '6%', right: '4%', duration: 1 }, 0)
      .fromTo('.h-moment-text > *', { y: 40, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.08, duration: 0.35 }, 0.6);
  }

  // ---- Greece Golden Visa advert: photo opens up, copy slides in. ----
  var promo = document.querySelector('.h-promo');
  if (promo) {
    gsap.fromTo('.h-promo-media', { clipPath: 'inset(10% 10% 10% 10% round 8px)' }, {
      clipPath: 'inset(0% 0% 0% 0% round 8px)', ease: 'none',
      scrollTrigger: { trigger: promo, start: 'top 85%', end: 'top 30%', scrub: true }
    });
    gsap.fromTo('.h-promo-media img', { scale: 1.25 }, {
      scale: 1, ease: 'none',
      scrollTrigger: { trigger: promo, start: 'top bottom', end: 'bottom top', scrub: true }
    });
    rise('.h-promo-body > *, .h-promo-points li', '.h-promo-body', { x: 60, y: 0, stagger: 0.07 });
  }

  // ---- Destinations: tiles rise in, photos settle from a slight zoom. ----
  ScrollTrigger.batch('.h-dest', {
    start: 'top 90%',
    onEnter: function (batch) {
      gsap.fromTo(batch, { y: 70, opacity: 0 }, { y: 0, opacity: 1, duration: 1, stagger: 0.1, ease: EASE, overwrite: true });
      gsap.fromTo(batch.map(function (el) { return el.querySelector('img'); }),
        { scale: 1.25 }, { scale: 1, duration: 1.6, stagger: 0.1, ease: EASE, clearProps: 'transform' });
    }
  });
  gsap.set('.h-dest', { opacity: 0 });

  // ---- Client stories: the office photo opens up as it scrolls in. ----
  gsap.fromTo('.h-stories-photo', { clipPath: 'inset(0% 10% round 8px)' }, {
    clipPath: 'inset(0% 0% round 8px)', ease: 'none',
    scrollTrigger: { trigger: '.h-stories-photo', start: 'top 90%', end: 'top 25%', scrub: true }
  });
  gsap.fromTo('.h-stories-photo img', { scale: 1.25 }, {
    scale: 1, ease: 'none',
    scrollTrigger: { trigger: '.h-stories-photo', start: 'top bottom', end: 'bottom top', scrub: true }
  });
  rise('.h-quotes', '.h-quotes', { x: 80, y: 0 });

  // ---- Closing call to action. ----
  rise('.h-cta .h-wrap > *', '.h-cta');

  // Images change section heights once loaded — recompute trigger positions.
  window.addEventListener('load', function () { ScrollTrigger.refresh(); });
});
