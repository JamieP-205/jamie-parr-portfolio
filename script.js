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

  if (themeButton) {
    themeButton.addEventListener('click', () => {
      applyTheme(document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark');
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
