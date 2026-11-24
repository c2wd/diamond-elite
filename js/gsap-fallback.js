/* Diamond Elite — GSAP fallback
   Loaded after the GSAP CDN scripts and before main.js. If GSAP (or its
   plugins) failed to load — ad blocker, corporate network, CDN outage — this
   defines a tiny stand-in so main.js still runs: no animation, but the menu,
   anchor scrolling, stat counters, filters, countdown and form all work and
   the page is never left covered by the loader. */
(() => {
  if (window.gsap && window.ScrollTrigger && window.ScrollToPlugin) return;

  document.documentElement.classList.add('no-gsap');

  const SKIP = new Set(['duration', 'delay', 'repeat', 'yoyo', 'ease', 'stagger', 'overwrite', 'timeScale', 'scrollTrigger', 'onUpdate', 'onComplete', 'onStart']);
  const isDom = t => typeof t === 'string' || t === window || t instanceof Element || t instanceof NodeList || Array.isArray(t);
  const tween = () => ({ kill() {}, pause() {}, play() {}, progress() {}, timeScale() {} });

  // Jump straight to the end state: plain objects (counters, prices) get their
  // final numbers and callbacks fire; DOM targets are left as the CSS renders them.
  const run = (target, vars) => {
    vars = vars || {};
    if (target === window && vars.scrollTo) {
      const st = vars.scrollTo, y = st && typeof st === 'object' ? st.y : st;
      const top = y instanceof Element ? y.getBoundingClientRect().top + scrollY : (+y || 0);
      scrollTo({ top, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
    } else if (target && !isDom(target) && typeof target === 'object') {
      Object.keys(vars).forEach(k => { if (!SKIP.has(k) && typeof vars[k] === 'number') target[k] = vars[k]; });
      if (vars.onUpdate) vars.onUpdate();
    }
    if (vars.onComplete) vars.onComplete();
    return tween();
  };

  const timeline = () => {
    const tl = {
      to() { return tl; }, from() { return tl; }, fromTo() { return tl; }, set() { return tl; },
      // the intro timeline's job here is simply to lift the loader
      play() {
        const l = document.getElementById('loader');
        if (l) l.style.display = 'none';
        document.body.classList.remove('is-loading');
        return tl;
      }
    };
    return tl;
  };

  window.gsap = {
    registerPlugin() {},
    globalTimeline: { timeScale() {} },
    quickTo: () => () => {},
    set() {},
    from() { return tween(); },
    fromTo(t, a, b) { return run(t, b); },
    to: run,
    timeline
  };
  window.ScrollToPlugin = {};
  window.ScrollTrigger = {
    refresh() {},
    getAll: () => [],
    create(v) {
      v = v || {};
      if (v.onToggle) {
        // sticky nav: toggle once the page is scrolled past `start`
        let on = null;
        const check = () => { const now = scrollY > (v.start || 0); if (now !== on) { on = now; v.onToggle({ isActive: now }); } };
        addEventListener('scroll', check, { passive: true });
        check();
      } else if (v.onEnter) {
        v.onEnter();
      }
      return { kill() {} };
    }
  };
})();
