(function () {
  const legacySections = {
    about: 'profile',
    skills: 'profile',
    experience: 'background'
  };

  function repairLegacySectionHash() {
    const requested = window.location.hash.slice(1);
    const replacement = legacySections[requested];
    if (!replacement) return false;

    if (window.history && history.replaceState) {
      history.replaceState(null, '', `#${replacement}`);
    }
    requestAnimationFrame(() => document.getElementById(replacement)?.scrollIntoView());
    return true;
  }

  repairLegacySectionHash();

  const explorer = document.querySelector('[data-project-explorer]');
  if (!explorer) return;

  const triggers = Array.from(explorer.querySelectorAll('[data-project-trigger]'));
  const panels = Array.from(explorer.querySelectorAll('[data-project-panel]'));
  const ids = new Set(panels.map((panel) => panel.dataset.projectPanel));

  function idFromHash() {
    const prefix = '#project-';
    if (!window.location.hash.startsWith(prefix)) return '';
    const id = window.location.hash.slice(prefix.length);
    return ids.has(id) ? id : '';
  }

  function select(id, options) {
    const settings = Object.assign({ updateHash: false, focus: false }, options);
    if (!ids.has(id)) return;

    triggers.forEach((trigger) => {
      const active = trigger.dataset.projectTrigger === id;
      trigger.setAttribute('aria-current', active ? 'true' : 'false');
      trigger.tabIndex = active ? 0 : -1;
    });

    panels.forEach((panel) => {
      const active = panel.dataset.projectPanel === id;
      panel.hidden = !active;
      panel.setAttribute('aria-hidden', String(!active));
    });

    const activeTrigger = triggers.find((trigger) => trigger.dataset.projectTrigger === id);
    if (activeTrigger) activeTrigger.scrollIntoView({ block: 'nearest', inline: 'nearest' });

    if (settings.updateHash) {
      const next = `#project-${id}`;
      if (window.location.hash !== next) history.replaceState(null, '', next);
    }

    if (settings.focus) {
      const heading = panels.find((panel) => panel.dataset.projectPanel === id)?.querySelector('h3');
      if (heading) {
        heading.tabIndex = -1;
        heading.focus({ preventScroll: true });
      }
    }
  }

  triggers.forEach((trigger, index) => {
    trigger.addEventListener('click', (event) => {
      event.preventDefault();
      select(trigger.dataset.projectTrigger, { updateHash: true });
    });

    trigger.addEventListener('keydown', (event) => {
      if (!['ArrowDown', 'ArrowUp', 'ArrowRight', 'ArrowLeft', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault();
      let next = index;
      if (event.key === 'Home') next = 0;
      else if (event.key === 'End') next = triggers.length - 1;
      else if (event.key === 'ArrowDown' || event.key === 'ArrowRight') next = (index + 1) % triggers.length;
      else next = (index - 1 + triggers.length) % triggers.length;
      const target = triggers[next];
      target.focus();
      select(target.dataset.projectTrigger, { updateHash: true });
    });
  });

  window.addEventListener('hashchange', () => {
    if (repairLegacySectionHash()) return;
    const id = idFromHash();
    if (id) select(id, { focus: true });
  });

  document.documentElement.classList.add('project-explorer-ready');
  select(idFromHash() || triggers[0]?.dataset.projectTrigger || '', { updateHash: false });
}());
