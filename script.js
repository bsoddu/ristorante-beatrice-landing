// Cookie banner
(function () {
  var banner = document.getElementById('cookie-banner');
  var acceptBtn = document.getElementById('cookie-accept');
  if (!localStorage.getItem('beatrice_cookies_accepted')) {
    banner.classList.add('is-visible');
  }
  acceptBtn.addEventListener('click', function () {
    localStorage.setItem('beatrice_cookies_accepted', 'true');
    banner.classList.remove('is-visible');
  });
})();

document.getElementById('year').textContent = new Date().getFullYear();

// Low-power detection
const cores = navigator.hardwareConcurrency || 4;
const mem = navigator.deviceMemory || 8;
const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const isLowPower = prefersReduced || cores <= 2 || mem <= 4;
if (isLowPower) document.documentElement.classList.add('low-power');

let animationsStarted = false;

function initReveal() {
  const items = document.querySelectorAll('.reveal');
  items.forEach((el) => el.classList.add('js-ready'));

  if (isLowPower || typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
    // IntersectionObserver fallback — lightweight, no GSAP
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    items.forEach((el) => io.observe(el));
    return;
  }

  gsap.registerPlugin(ScrollTrigger);
  items.forEach((el) => {
    ScrollTrigger.create({
      trigger: el,
      start: 'top 85%',
      once: true,
      onEnter: () => el.classList.add('is-visible'),
    });
  });
}

function initLenis() {
  if (isLowPower || typeof Lenis === 'undefined' || !window.matchMedia('(pointer: fine)').matches) return;
  const lenis = new Lenis({
    duration: 2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
  });
  if (typeof gsap !== 'undefined') {
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(500, 33);
  } else {
    (function raf(t) { lenis.raf(t); requestAnimationFrame(raf); })(performance.now());
  }
  lenis.on('scroll', () => {
    if (typeof ScrollTrigger !== 'undefined') ScrollTrigger.update();
  });
  window._lenis = lenis;
}

function initMarquee() {
  if (isLowPower || typeof gsap === 'undefined') return; // static on low-power, still readable
  const track = document.getElementById('marquee-track');
  if (!track) return;
  const halfWidth = track.scrollWidth / 2;
  gsap.to(track, { x: -halfWidth, duration: 22, ease: 'none', repeat: -1 });
}

function boot() {
  if (animationsStarted) return;
  animationsStarted = true;
  initReveal();
  initLenis();
  initMarquee();
  if (typeof ScrollTrigger !== 'undefined') {
    document.fonts.ready.then(() => ScrollTrigger.refresh());
  }
}

window.addEventListener('load', () => {
  document.fonts.ready.then(boot).catch(boot);
  setTimeout(boot, 2500);
});
