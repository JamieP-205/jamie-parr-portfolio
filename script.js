(function () {
  document.documentElement.classList.remove('no-js');
  document.documentElement.classList.add('js');

  const storage = {
    get(key) {
      try { return window.localStorage.getItem(key); } catch (_) { return null; }
    },
    set(key, value) {
      try { window.localStorage.setItem(key, value); } catch (_) {}
    }
  };

  const navToggle = document.querySelector('.nav-toggle');
  const nav = document.querySelector('#site-nav');

  function setNavOpen(open) {
    document.body.classList.toggle('nav-open', open);
    if (navToggle) navToggle.setAttribute('aria-expanded', String(open));
  }

  if (navToggle && nav) {
    navToggle.addEventListener('click', () => {
      setNavOpen(!document.body.classList.contains('nav-open'));
    });

    nav.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => setNavOpen(false));
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') setNavOpen(false);
    });
  }

  const themeButton = document.querySelector('[data-theme-toggle]');
  const textButton = document.querySelector('[data-text-toggle]');
  const motionButton = document.querySelector('[data-motion-toggle]');

  function applyTheme(theme) {
    document.documentElement.dataset.theme = theme;
    if (themeButton) {
      const isDark = theme === 'dark';
      themeButton.setAttribute('aria-pressed', String(isDark));
      themeButton.textContent = isDark ? 'Light' : 'Dark';
    }
    storage.set('portfolio-theme', theme);
  }

  function applyText(size) {
    if (size === 'large') {
      document.documentElement.dataset.text = 'large';
    } else {
      delete document.documentElement.dataset.text;
    }
    if (textButton) textButton.setAttribute('aria-pressed', String(size === 'large'));
    storage.set('portfolio-text', size);
  }

  function applyMotion(mode) {
    if (mode === 'reduced') {
      document.documentElement.dataset.motion = 'reduced';
    } else {
      delete document.documentElement.dataset.motion;
    }
    if (motionButton) motionButton.setAttribute('aria-pressed', String(mode === 'reduced'));
    storage.set('portfolio-motion', mode);
  }

  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  applyTheme(storage.get('portfolio-theme') || (prefersDark ? 'dark' : 'light'));
  applyText(storage.get('portfolio-text') || 'normal');
  applyMotion(storage.get('portfolio-motion') || 'normal');

  function reducedMotion() {
    return document.documentElement.dataset.motion === 'reduced'
      || (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }

  // Theme changes sweep out from the button when the browser supports
  // view transitions; otherwise they just switch.
  function switchTheme(origin) {
    const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    if (!document.startViewTransition || reducedMotion() || !origin) {
      applyTheme(next);
      return;
    }
    const rect = origin.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    const radius = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));
    const transition = document.startViewTransition(() => applyTheme(next));
    transition.ready.then(() => {
      document.documentElement.animate(
        { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
        { duration: 420, easing: 'ease-in-out', pseudoElement: '::view-transition-new(root)' }
      );
    }).catch(() => {});
  }

  window.portfolioSwitchTheme = switchTheme;
  window.portfolioToggleText = () => {
    applyText(document.documentElement.dataset.text === 'large' ? 'normal' : 'large');
  };

  if (themeButton) {
    themeButton.addEventListener('click', () => {
      switchTheme(themeButton);
    });
  }

  if (textButton) {
    textButton.addEventListener('click', () => {
      applyText(document.documentElement.dataset.text === 'large' ? 'normal' : 'large');
    });
  }

  if (motionButton) {
    motionButton.addEventListener('click', () => {
      applyMotion(document.documentElement.dataset.motion === 'reduced' ? 'normal' : 'reduced');
    });
  }

  document.querySelectorAll('[data-year]').forEach((node) => {
    node.textContent = new Date().getFullYear();
  });
}());

/* Reading progress line under the masthead. */
(function () {
  const root = document.documentElement;
  let queued = false;

  function update() {
    queued = false;
    const max = root.scrollHeight - root.clientHeight;
    const progress = max > 0 ? (root.scrollTop || document.body.scrollTop) / max : 0;
    root.style.setProperty('--scroll-progress', `${(progress * 100).toFixed(2)}%`);
  }

  window.addEventListener('scroll', () => {
    if (!queued) {
      queued = true;
      requestAnimationFrame(update);
    }
  }, { passive: true });

  update();
}());

/* Gentle pointer tilt on project screenshots. Mouse-only, and skipped
   when the visitor prefers reduced motion. */
(function () {
  if (!window.matchMedia || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

  const maxTilt = 4;

  document.querySelectorAll('.project-card-media').forEach((media) => {
    const img = media.querySelector('img');
    if (!img) return;

    media.addEventListener('pointermove', (event) => {
      if (document.documentElement.dataset.motion === 'reduced'
        || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      const rect = media.getBoundingClientRect();
      const px = (event.clientX - rect.left) / rect.width - 0.5;
      const py = (event.clientY - rect.top) / rect.height - 0.5;
      img.style.transform = `perspective(700px) rotateX(${(-py * maxTilt).toFixed(2)}deg) rotateY(${(px * maxTilt).toFixed(2)}deg)`;
    });

    media.addEventListener('pointerleave', () => {
      img.style.transform = '';
    });
  });
}());

/* Live details pulled from my own projects: the Coast listener count
   and current track from the station's public metadata feed, and my
   latest GitHub push. Every row fails quietly if a feed is down. */
(function () {
  const strip = document.getElementById('live-strip');
  const caseRow = document.getElementById('coast-case-live-row');
  const caseText = document.getElementById('coast-case-live');
  if ((!strip && !caseRow) || typeof fetch !== 'function') return;

  const coastRow = document.getElementById('live-coast-row');
  const coastText = document.getElementById('live-coast-text');
  const trackRow = document.getElementById('live-track-row');
  const trackText = document.getElementById('live-track-text');
  const commitRow = document.getElementById('live-commit-row');
  const commitText = document.getElementById('live-commit-text');
  const commitLink = document.getElementById('live-commit-link');

  function show(row) {
    row.hidden = false;
    if (strip) strip.hidden = false;
  }

  function cleanTitle(value) {
    return String(value || '').trim().replace(/\s*\(\d{2}:\d{2}(:\d{2})?\)\s*$/, '');
  }

  function updateCoast() {
    fetch('https://coast-metadata.jamieparr05.workers.dev', { cache: 'no-store' })
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => {
        if (!data || data.online === false) return;
        const listeners = Number(data.listeners);
        const title = cleanTitle(data.title);

        if (coastRow && coastText) {
          coastText.textContent = Number.isFinite(listeners) && listeners > 0
            ? `is on air with ${listeners} listening right now`
            : 'is on air right now';
          show(coastRow);
          if (title && trackRow && trackText) {
            trackText.textContent = `Now playing: ${title}`;
            show(trackRow);
          }
        }

        if (caseRow && caseText) {
          const parts = [Number.isFinite(listeners) && listeners > 0
            ? `On air, ${listeners} listening`
            : 'On air'];
          if (title) parts.push(`playing ${title}`);
          caseText.textContent = parts.join(', ');
          caseRow.hidden = false;
        }
      })
      .catch(() => {});
  }

  function relativeTime(iso) {
    const then = new Date(iso).getTime();
    if (!Number.isFinite(then)) return '';
    const minutes = Math.max(1, Math.round((Date.now() - then) / 60000));
    if (minutes < 60) return `${minutes} min ago`;
    const hours = Math.round(minutes / 60);
    if (hours < 24) return hours === 1 ? '1 hour ago' : `${hours} hours ago`;
    const days = Math.round(hours / 24);
    return days === 1 ? 'yesterday' : `${days} days ago`;
  }

  function updateCommit() {
    if (!commitRow || !commitText || !commitLink) return;
    const cached = (() => {
      try { return JSON.parse(sessionStorage.getItem('portfolio-live-push') || 'null'); } catch { return null; }
    })();
    if (cached && Date.now() - cached.at < 10 * 60 * 1000) {
      render(cached.repo, cached.when);
      return;
    }
    fetch('https://api.github.com/users/JamieP-205/events/public?per_page=10')
      .then((response) => (response.ok ? response.json() : null))
      .then((events) => {
        const push = Array.isArray(events) && events.find((e) => e.type === 'PushEvent');
        if (!push) return;
        try {
          sessionStorage.setItem('portfolio-live-push', JSON.stringify({
            repo: push.repo.name, when: push.created_at, at: Date.now()
          }));
        } catch {}
        render(push.repo.name, push.created_at);
      })
      .catch(() => {});

    function render(repo, when) {
      const name = String(repo).split('/')[1] || repo;
      commitText.textContent = `to ${name} · ${relativeTime(when)}`;
      commitLink.href = `https://github.com/${repo}`;
      show(commitRow);
    }
  }

  updateCoast();
  updateCommit();
  setInterval(updateCoast, 60000);
}());

/* Quick navigation palette: press "/" or Ctrl+K, or use the Menu
   button. A plain listbox with virtual focus, nothing clever. */
(function () {
  const palette = document.getElementById('palette');
  const input = document.getElementById('palette-input');
  const list = document.getElementById('palette-list');
  if (!palette || !input || !list) return;

  const openers = Array.from(document.querySelectorAll('[data-palette-open]'));
  const options = Array.from(list.querySelectorAll('[role="option"]'));
  let visible = options.slice();
  let active = 0;
  let lastFocus = null;

  function open() {
    lastFocus = document.activeElement;
    palette.hidden = false;
    document.body.classList.add('palette-open');
    input.value = '';
    filter('');
    input.focus();
  }

  function close() {
    palette.hidden = true;
    document.body.classList.remove('palette-open');
    if (lastFocus && typeof lastFocus.focus === 'function') lastFocus.focus();
  }

  function setActive(index) {
    active = Math.max(0, Math.min(index, visible.length - 1));
    options.forEach((option) => option.setAttribute('aria-selected', 'false'));
    const current = visible[active];
    if (current) {
      current.setAttribute('aria-selected', 'true');
      input.setAttribute('aria-activedescendant', current.id);
      current.scrollIntoView({ block: 'nearest' });
    } else {
      input.setAttribute('aria-activedescendant', '');
    }
  }

  function filter(term) {
    const query = term.trim().toLowerCase();
    visible = options.filter((option) => {
      const haystack = `${option.textContent} ${option.dataset.keywords || ''}`.toLowerCase();
      const match = !query || haystack.includes(query);
      option.hidden = !match;
      return match;
    });
    setActive(0);
  }

  /* Brief confirmation note. Kept visible until removal so it still
     reads when animations are turned off. */
  function toast(message) {
    const previous = document.querySelector('.toast');
    if (previous) previous.remove();
    const note = document.createElement('p');
    note.className = 'toast';
    note.setAttribute('role', 'status');
    note.textContent = message;
    document.body.appendChild(note);
    setTimeout(() => note.remove(), 2400);
  }

  function activate(option) {
    if (!option) return;
    close();
    if (option.dataset.action === 'theme') {
      window.portfolioSwitchTheme(openers[0] || null);
      return;
    }
    if (option.dataset.action === 'text') {
      window.portfolioToggleText();
      return;
    }
    if (option.dataset.action === 'copy-email') {
      const email = 'jamieparr05@hotmail.com';
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(email)
          .then(() => toast('Email address copied'))
          .catch(() => { window.location.href = `mailto:${email}`; });
      } else {
        window.location.href = `mailto:${email}`;
      }
      return;
    }
    if (option.dataset.goto) {
      const target = document.querySelector(option.dataset.goto);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
        target.setAttribute('tabindex', '-1');
        target.focus({ preventScroll: true });
      } else {
        // Section lives on the homepage; jump across.
        window.location.href = `index.html${option.dataset.goto}`;
      }
      return;
    }
    if (option.dataset.href) {
      if (option.dataset.external) {
        window.open(option.dataset.href, '_blank', 'noopener');
      } else {
        window.location.href = option.dataset.href;
      }
    }
  }

  openers.forEach((button) => button.addEventListener('click', open));

  input.addEventListener('input', () => filter(input.value));

  input.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowDown') { event.preventDefault(); setActive(active + 1); }
    else if (event.key === 'ArrowUp') { event.preventDefault(); setActive(active - 1); }
    else if (event.key === 'Enter') { event.preventDefault(); activate(visible[active]); }
    else if (event.key === 'Escape') { close(); }
  });

  list.addEventListener('click', (event) => {
    const option = event.target.closest('[role="option"]');
    if (option) activate(option);
  });

  palette.addEventListener('mousedown', (event) => {
    if (event.target === palette) close();
  });

  document.addEventListener('keydown', (event) => {
    const typing = /^(input|textarea|select)$/i.test(document.activeElement?.tagName || '')
      || document.activeElement?.isContentEditable;
    if (!palette.hidden && event.key === 'Escape') { close(); return; }
    if (typing) return;
    if (event.key === '/' || ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k')) {
      event.preventDefault();
      if (palette.hidden) open();
    }
  });
}());
