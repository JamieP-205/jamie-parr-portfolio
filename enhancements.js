(function () {
  const root = document.documentElement;

  function stored(key) {
    try { return window.localStorage.getItem(key); } catch (_) { return null; }
  }

  function store(key, value) {
    try { window.localStorage.setItem(key, value); } catch (_) {}
  }

  function reducedMotion() {
    return root.dataset.motion === 'reduced'
      || (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }

  function updateThemeButton(button) {
    if (!button) return;
    const dark = root.dataset.theme === 'dark';
    button.setAttribute('aria-pressed', String(dark));
    button.textContent = dark ? 'Light' : 'Dark';
  }

  function applyTheme(next, button) {
    root.dataset.theme = next;
    store('portfolio-theme', next);
    updateThemeButton(button);
  }

  function smoothThemeSwitch(origin) {
    const button = origin && origin.matches && origin.matches('[data-theme-toggle]')
      ? origin
      : document.querySelector('[data-theme-toggle]');
    const next = root.dataset.theme === 'dark' ? 'light' : 'dark';

    if (!document.startViewTransition || reducedMotion() || !button) {
      root.classList.add('theme-soft-switch');
      applyTheme(next, button);
      window.setTimeout(() => root.classList.remove('theme-soft-switch'), 900);
      return;
    }

    const rect = button.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    const radius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y)
    );

    const transition = document.startViewTransition(() => applyTheme(next, button));
    transition.ready.then(() => {
      root.animate(
        { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
        {
          duration: 860,
          easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
          pseudoElement: '::view-transition-new(root)'
        }
      );
    }).catch(() => {});
  }

  const oldThemeButton = document.querySelector('[data-theme-toggle]');
  if (oldThemeButton) {
    const cleanButton = oldThemeButton.cloneNode(true);
    oldThemeButton.replaceWith(cleanButton);
    updateThemeButton(cleanButton);
    cleanButton.addEventListener('click', () => smoothThemeSwitch(cleanButton));
  }
  window.portfolioSwitchTheme = smoothThemeSwitch;

  const lavaButton = document.querySelector('[data-lava-toggle]');

  function applyLava(enabled) {
    if (enabled) root.dataset.lava = 'on';
    else delete root.dataset.lava;
    if (lavaButton) lavaButton.setAttribute('aria-pressed', String(enabled));
    store('portfolio-lava', enabled ? 'on' : 'off');
  }

  applyLava(stored('portfolio-lava') === 'on');

  if (lavaButton) {
    lavaButton.addEventListener('click', () => {
      applyLava(root.dataset.lava !== 'on');
    });
  }
}());
