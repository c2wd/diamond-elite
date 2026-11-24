/* Diamond Elite — interactions & motion */
(() => {
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover:hover) and (pointer:fine)').matches;

  gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);
  if (RM) gsap.globalTimeline.timeScale(60);

  const DIV = { cadets: 'Cadets', juniors: 'Juniors', elite: 'Elite' };
  const gamesEl = $('#games');

  /* ---------------- CURSOR ---------------- */
  if (fine) {
    const cur = $('#cursor'), dot = $('span', cur);
    const qx = gsap.quickTo(cur, 'x', { duration: .35, ease: 'power3' });
    const qy = gsap.quickTo(cur, 'y', { duration: .35, ease: 'power3' });
    addEventListener('pointermove', e => { qx(e.clientX); qy(e.clientY); });
    document.addEventListener('pointerover', e => {
      const t = e.target.closest('[data-cursor],a,button,label');
      cur.classList.toggle('is-hover', !!t);
      dot.textContent = t && t.dataset.cursor ? t.dataset.cursor : '';
    });
  }

  /* ---------------- TEXT SPLITTING ---------------- */
  $$('[data-chars]').forEach(el => {
    el.innerHTML = [...el.textContent].map(c => `<span class="ch">${c}</span>`).join('');
  });
  $$('[data-split]').forEach(el => {
    const out = [];
    el.childNodes.forEach(n => {
      if (n.nodeType === 3) n.textContent.split(/\s+/).filter(Boolean).forEach(w => out.push(`<span class="w"><span class="wi">${w}</span></span>`));
      else out.push(`<span class="w"><span class="wi">${n.outerHTML}</span></span>`);
    });
    el.innerHTML = out.join(' ');
  });

  /* ---------------- NAV ---------------- */
  const nav = $('#nav'), burger = $('#burger'), links = $('#navLinks');
  ScrollTrigger.create({ start: 60, end: 99999, onToggle: s => nav.classList.toggle('is-stuck', s.isActive) });
  burger.addEventListener('click', () => {
    const open = burger.getAttribute('aria-expanded') !== 'true';
    nav.classList.toggle('menu-open', open);
    burger.setAttribute('aria-expanded', open);
    links.classList.toggle('is-open', open);
  });
  document.addEventListener('click', e => {
    const a = e.target.closest('a[href^="#"], [data-goto]');
    if (!a) return;
    const id = a.dataset.goto || a.getAttribute('href');
    if (!id || id === '#') { e.preventDefault(); return; }
    const target = $(id);
    if (!target) return;
    e.preventDefault();
    burger.setAttribute('aria-expanded', 'false'); links.classList.remove('is-open'); nav.classList.remove('menu-open');
    gsap.to(window, { duration: RM ? 0 : 1.3, scrollTo: { y: id === '#top' ? 0 : target, offsetY: 0 }, ease: 'power3.inOut' });
  });

  /* ---------------- MAGNETIC BUTTONS ---------------- */
  if (fine) $$('[data-magnetic]').forEach(b => {
    const mx = gsap.quickTo(b, 'x', { duration: .5, ease: 'power3' }), my = gsap.quickTo(b, 'y', { duration: .5, ease: 'power3' });
    b.addEventListener('pointermove', e => { const r = b.getBoundingClientRect(); mx((e.clientX - r.left - r.width / 2) * .28); my((e.clientY - r.top - r.height / 2) * .35); });
    b.addEventListener('pointerleave', () => { mx(0); my(0); });
  });

  /* ---------------- INTRO ---------------- */
  const loaderNum = $('#loaderNum'), loader = $('#loader');
  document.body.classList.add('is-loading');
  const prog = { v: 0 };
  const intro = gsap.timeline({ paused: true });
  intro
    .to(loader, { yPercent: -100, duration: 1, ease: 'expo.inOut' })
    .set(loader, { display: 'none' })
    .set(document.body, { className: '-=is-loading' }, '<.5')
    .to('.hero__meta', { opacity: 1, y: 0, duration: .8, ease: 'power3.out' }, '-=.4')
    .to('.line--back .ch', { yPercent: 0, duration: 1.2, ease: 'expo.out', stagger: .05 }, '-=.6')
    .to('.line--front .ch', { yPercent: 0, duration: 1.2, ease: 'expo.out', stagger: .06 }, '-=1.05')
    .to('[data-hero-fade]', { opacity: 1, y: 0, duration: 1, ease: 'power3.out', stagger: .12 }, '-=.7');
  gsap.set('.chars .ch', { yPercent: 105 });
  gsap.set(['.hero__meta', '[data-hero-fade]'], { y: 24 });

  gsap.to(prog, {
    v: 100, duration: RM ? .1 : 1.8, ease: 'power2.inOut',
    onUpdate: () => { loaderNum.textContent = Math.round(prog.v); },
    onComplete: () => {
      const go = () => intro.play();
      (document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve()).then(go);
    }
  });

  /* ---------------- SCROLL: REVEALS ---------------- */
  $$('[data-split]').forEach(el => {
    gsap.fromTo($$('.wi', el), { yPercent: 115, rotate: 4 }, {
      yPercent: 0, rotate: 0, duration: 1.1, ease: 'expo.out', stagger: .07,
      scrollTrigger: { trigger: el, start: 'top 85%', once: true }
    });
  });
  $$('[data-reveal]').forEach(el => {
    gsap.fromTo(el, { y: 40, opacity: 0 }, {
      y: 0, opacity: 1, duration: 1, ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 90%', once: true }
    });
  });
  $$('[data-count]').forEach(el => {
    const end = +el.dataset.count, suf = el.dataset.suffix || '', o = { v: 0 };
    ScrollTrigger.create({ trigger: el, start: 'top 90%', once: true, onEnter: () =>
      gsap.to(o, { v: end, duration: 2, ease: 'power2.out', onUpdate: () => el.textContent = Math.round(o.v) + suf }) });
  });
  // game rows stagger in
  const revealGames = () => { const g = $$('.game:not([hidden])'); if (g.length) gsap.fromTo(g, { y: 50, opacity: 0 }, { y: 0, opacity: 1, duration: .8, ease: 'power3.out', stagger: .06 }); };
  if (gamesEl) {
    ScrollTrigger.create({ trigger: gamesEl, start: 'top 85%', once: true, onEnter: revealGames });
    gsap.set($$('.game'), { opacity: 0 });
  }

  // footer giant type
  gsap.from('[data-footer-big] span', { yPercent: 40, opacity: 0, duration: 1.2, ease: 'expo.out', stagger: .12, scrollTrigger: { trigger: '.footer', start: 'top 75%', once: true } });

  /* ---------------- MARQUEE ---------------- */
  const mq = $('#marqueeTrack');
  if (mq) {
    const mqTween = gsap.to(mq, { xPercent: -50, ease: 'none', duration: 22, repeat: -1 });
    ScrollTrigger.create({ onUpdate: s => {
      const v = Math.min(Math.abs(s.getVelocity()) / 400, 6);
      gsap.to(mqTween, { timeScale: (s.direction === 1 ? 1 : -1) * (1 + v), duration: .3, overwrite: true });
      gsap.to(mqTween, { timeScale: s.direction, duration: 1.2, delay: .3, overwrite: 'auto' });
    } });
  }

  /* ---------------- SCHEDULE: COUNTDOWN + FILTER ---------------- */
  if (gamesEl) {
  const gameEls = $$('.game[data-start]');
  const nextEl = gameEls.find(g => new Date(g.dataset.start) > new Date()) || gameEls[0];
  const target = nextEl ? new Date(nextEl.dataset.start) : new Date();
  if (nextEl) {
    const when = target.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    $('#nextVs').textContent = `${$('.game__vs', nextEl).textContent.trim() || 'vs'} ${$('.game__team', nextEl).textContent} · ${when}, ${$('.time', nextEl).textContent}`;
  }
  const pad = n => String(n).padStart(2, '0');
  const setN = (el, v) => { if (el.textContent !== v) el.textContent = v; };
  function count() {
    let s = Math.max(0, Math.floor((target - new Date()) / 1000));
    setN($('#cdD'), pad(Math.floor(s / 86400))); s %= 86400;
    setN($('#cdH'), pad(Math.floor(s / 3600))); s %= 3600;
    setN($('#cdM'), pad(Math.floor(s / 60)));
    setN($('#cdS'), pad(s % 60));
  }
  count(); setInterval(count, 1000);

  const gameChips = $$('#gameFilters .chip');
  gameChips.forEach(chip => chip.addEventListener('click', () => {
    gameChips.forEach(c => c.classList.toggle('is-on', c === chip));
    const f = chip.dataset.filter;
    $$('.game').forEach(g => { g.hidden = !(f === 'all' || g.dataset.loc === f); g.style.display = g.hidden ? 'none' : ''; });
    revealGames();
    ScrollTrigger.refresh();
  }));
  }

  /* ---------------- ROSTER PAGE: DIVISION FILTER ---------------- */
  const rgrid = $('#rgrid');
  if (rgrid) {
    const cards = $$('.card[data-div]', rgrid), chips = $$('.rfilters .chip'), countEl = $('#rcount');
    const valid = f => chips.some(c => c.dataset.filter === f);
    const fromHash = () => { const h = location.hash.slice(1).toLowerCase(); return valid(h) ? h : 'all'; };
    const show = f => {
      let n = 0;
      cards.forEach(c => { const on = f === 'all' || c.dataset.div === f; c.hidden = !on; c.style.display = on ? '' : 'none'; if (on) n++; });
      chips.forEach(c => { const on = c.dataset.filter === f; c.classList.toggle('is-on', on); c.setAttribute('aria-pressed', on); });
      const label = f === 'all' ? 'all divisions' : $(`.rfilters .chip[data-filter="${f}"]`).textContent;
      if (countEl) countEl.textContent = `Showing ${n} ${n === 1 ? 'player' : 'players'} · ${label}`;
    };
    const animate = () => gsap.fromTo($$('.card:not([hidden])', rgrid), { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: .7, ease: 'power3.out', stagger: .05, overwrite: true });
    show(fromHash());
    gsap.set($$('.card', rgrid), { opacity: 0 });
    ScrollTrigger.create({ trigger: rgrid, start: 'top 90%', once: true, onEnter: animate });
    chips.forEach(chip => chip.addEventListener('click', () => {
      const f = chip.dataset.filter;
      show(f);
      history.replaceState(null, '', f === 'all' ? location.pathname + location.search : '#' + f);
      animate();
      ScrollTrigger.refresh();
    }));
    addEventListener('hashchange', () => { show(fromHash()); animate(); });
  }

  /* ---------------- REGISTRATION ---------------- */
  const form = $('#regForm');
  if (form) {
  const sumDiv = $('#sumDiv'), sumPlayer = $('#sumPlayer'), sumTotal = $('#sumTotal');
  const total = { v: 165 };
  function updateSummary() {
    const sel = $('input[name=division]:checked', form);
    const price = +sel.dataset.price - 20;
    sumDiv.textContent = DIV[sel.value];
    gsap.to(total, { v: price, duration: .6, ease: 'power3.out', onUpdate: () => sumTotal.textContent = '$' + Math.round(total.v) });
    gsap.fromTo(sumDiv, { yPercent: 30, opacity: 0 }, { yPercent: 0, opacity: 1, duration: .6, ease: 'expo.out' });
  }
  form.addEventListener('change', e => {
    if (e.target.name === 'division') updateSummary();
    // suggest a division from age
    if (e.target.name === 'age') {
      const a = +e.target.value, d = a <= 8 ? 'cadets' : a <= 11 ? 'juniors' : 'elite';
      if (a >= 6 && a <= 14) { const r = $(`input[value=${d}]`, form); if (!r.checked) { r.checked = true; updateSummary(); } }
    }
  });
  $('#pName').addEventListener('input', e => sumPlayer.textContent = e.target.value.trim() || '—');

  const err = $('#formErr');
  form.addEventListener('submit', e => {
    e.preventDefault();
    let bad = [];
    $$('input[required]', form).forEach(i => {
      const ok = i.type === 'checkbox' ? i.checked : i.checkValidity() && i.value.trim();
      i.classList.toggle('bad', !ok);
      if (!ok) bad.push(i);
    });
    if (bad.length) {
      err.textContent = bad[0].type === 'checkbox' ? 'Please accept the code of conduct to continue.' : 'A few fields need your attention — highlighted above.';
      bad[0].focus();
      gsap.fromTo(form, { x: -8 }, { x: 0, duration: .6, ease: 'elastic.out(1,.3)' });
      return;
    }
    err.textContent = '';
    $('#succMsg').textContent = `${$('#pName').value.trim()} is signed up for ${DIV[$('input[name=division]:checked').value]}. A confirmation is on its way to ${$('#gEmail').value.trim()}.`;
    const s = $('#success'); s.hidden = false;
    gsap.fromTo('.success__card', { scale: .8, opacity: 0, y: 40 }, { scale: 1, opacity: 1, y: 0, duration: .9, ease: 'expo.out' });
    confetti();
    $('#succClose').focus();
  });
  $$('input', form).forEach(i => i.addEventListener('input', () => i.classList.remove('bad')));
  $('#succClose').addEventListener('click', () => { $('#success').hidden = true; });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') $('#success').hidden = true; });

  function confetti() {
    if (RM) return;
    const cols = ['#00c3ff', '#9b7bff', '#ff6b2c', '#f3f1ea'];
    for (let i = 0; i < 70; i++) {
      const b = document.createElement('i'); b.className = 'bit';
      b.style.background = cols[i % 4]; document.body.appendChild(b);
      gsap.set(b, { x: innerWidth / 2, y: innerHeight / 2 + 40, rotate: Math.random() * 360 });
      gsap.to(b, { x: innerWidth / 2 + (Math.random() - .5) * innerWidth * .9, y: innerHeight / 2 - 100 - Math.random() * innerHeight * .45, rotate: '+=' + (Math.random() * 720 - 360), duration: .9, ease: 'power3.out' });
      gsap.to(b, { y: innerHeight + 40, opacity: 0, duration: 1.6, delay: .8, ease: 'power2.in', onComplete: () => b.remove() });
    }
  }
  }

  addEventListener('load', () => ScrollTrigger.refresh());
})();
