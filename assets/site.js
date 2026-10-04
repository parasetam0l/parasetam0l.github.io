// Progressive enhancement only: the page is complete without this script.
(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  const year = document.getElementById('year');
  if (year) year.textContent = String(new Date().getFullYear());

  // Reveal tiles as they scroll in; their scenes only animate while on screen.
  const tiles = document.querySelectorAll('.tile');
  const seen = new IntersectionObserver((entries) => {
    for (const { target, isIntersecting } of entries) {
      target.classList.toggle('live', isIntersecting);
      if (isIntersecting) target.classList.add('in');
    }
  }, { threshold: 0.12 });
  for (const tile of tiles) {
    seen.observe(tile);
    // The spotlight follows the pointer.
    tile.addEventListener('pointermove', (e) => {
      const r = tile.getBoundingClientRect();
      tile.style.setProperty('--mx', `${e.clientX - r.left}px`);
      tile.style.setProperty('--my', `${e.clientY - r.top}px`);
    });
  }

  // SemiVPN: packets take the tunnel or go direct, depending on the routing mode.
  const route = document.querySelector('.route');
  if (route) {
    const MODES = { all: [1, 1, 1], apps: [1, 1, 0], mixed: [1, 0, 1], sites: [0, 0, 1] };
    const ORDER = Object.keys(MODES);
    const buttons = route.querySelectorAll('button[data-mode]');
    const tunnel = route.querySelectorAll('.tp');
    const direct = route.querySelectorAll('.dp');
    const packets = route.querySelectorAll('.pk');
    const length = new Map();
    let mode = route.dataset.mode;
    let auto = !reduce;

    const setMode = (next) => {
      mode = next;
      route.dataset.mode = next;
      buttons.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.mode === next)));
      MODES[next].forEach((viaTunnel, app) => {
        tunnel[app].classList.toggle('on', viaTunnel === 1);
        direct[app].classList.toggle('on', viaTunnel === 0);
      });
    };
    const place = (now) => {
      packets.forEach((pk, i) => {
        const app = i % 3;
        const viaTunnel = MODES[mode][app] === 1;
        const path = viaTunnel ? tunnel[app] : direct[app];
        if (!length.has(path)) length.set(path, path.getTotalLength());
        const t = (now / 2400 + app * 0.21 + (i >= 3 ? 0.5 : 0)) % 1;
        const p = path.getPointAtLength(t * length.get(path));
        pk.setAttribute('cx', p.x.toFixed(1));
        pk.setAttribute('cy', p.y.toFixed(1));
        // Past the shield, tunnelled traffic is encrypted.
        pk.classList.toggle('sealed', viaTunnel && p.x > 200);
      });
    };

    buttons.forEach((b) => b.addEventListener('click', () => {
      auto = false;
      setMode(b.dataset.mode);
      if (reduce) place(1200);
    }));
    setMode(mode);

    if (reduce) {
      place(1200);
    } else {
      let visible = false;
      let frame = 0;
      const tick = (now) => {
        place(now);
        frame = visible ? requestAnimationFrame(tick) : 0;
      };
      new IntersectionObserver(([entry]) => {
        visible = entry.isIntersecting;
        if (visible && !frame) frame = requestAnimationFrame(tick);
      }).observe(route);
      setInterval(() => {
        if (auto && visible) setMode(ORDER[(ORDER.indexOf(mode) + 1) % ORDER.length]);
      }, 3400);
    }
  }

  // Show each app's latest release so the page doesn't go stale between edits.
  // The version written in the HTML stays whenever GitHub can't be reached.
  // Answers, including "no usable release", are kept for the session so reloads
  // don't spend the visitor's API rate limit.
  const KEY = 'latest-releases';
  const VERSION = /^v?\d+(\.\d+){1,3}([-+][0-9A-Za-z.-]+)?$/;
  let cache = {};
  try { cache = JSON.parse(sessionStorage.getItem(KEY)) || {}; } catch {}

  const remember = (repo, tag) => {
    cache[repo] = tag;
    try { sessionStorage.setItem(KEY, JSON.stringify(cache)); } catch {}
  };
  const show = (el, tag) => {
    if (tag) el.textContent = tag.startsWith('v') ? tag : `v${tag}`;
  };

  for (const el of document.querySelectorAll('[data-release]')) {
    const repo = el.dataset.release;
    if (repo in cache) { show(el, cache[repo]); continue; }
    fetch(`https://api.github.com/repos/parasetam0l/${repo}/releases/latest`, {
      headers: { Accept: 'application/vnd.github+json' },
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((release) => {
        const tag = release && release.tag_name;
        const valid = typeof tag === 'string' && VERSION.test(tag);
        remember(repo, valid ? tag : '');
        if (valid) show(el, tag);
      })
      .catch(() => {}); // offline or blocked: try again on the next visit
  }
})();
