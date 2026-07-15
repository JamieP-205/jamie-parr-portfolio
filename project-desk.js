(function () {
  const sectionAliases = { about: 'background', skills: 'background', experience: 'background' };
  const incomingHash = window.location.hash.slice(1);
  if (sectionAliases[incomingHash]) {
    const targetId = sectionAliases[incomingHash];
    if (window.history && history.replaceState) history.replaceState(null, '', `#${targetId}`);
    requestAnimationFrame(() => document.getElementById(targetId)?.scrollIntoView());
  }

  const desk = document.querySelector('[data-project-desk]');
  if (!desk) return;

  const tabs = Array.from(desk.querySelectorAll('[data-project-tab]'));
  const panels = Array.from(desk.querySelectorAll('[role="tabpanel"]'));
  if (!tabs.length || !panels.length) return;

  function activate(tab, options) {
    const settings = Object.assign({ focus: false, updateHash: false }, options);
    const panelId = tab.dataset.projectTab;

    tabs.forEach((item) => {
      const selected = item === tab;
      item.setAttribute('aria-selected', String(selected));
      item.tabIndex = selected ? 0 : -1;
    });

    panels.forEach((panel) => {
      panel.hidden = panel.id !== panelId;
    });

    if (settings.focus) tab.focus();
    if (settings.updateHash && window.history && history.replaceState) {
      history.replaceState(null, '', `#${panelId}`);
    }
  }

  function tabFromHash() {
    const id = window.location.hash.slice(1);
    return tabs.find((tab) => tab.dataset.projectTab === id) || null;
  }

  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => activate(tab, { updateHash: true }));
    tab.addEventListener('keydown', (event) => {
      let nextIndex = null;
      if (event.key === 'ArrowRight' || event.key === 'ArrowDown') nextIndex = (index + 1) % tabs.length;
      if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') nextIndex = (index - 1 + tabs.length) % tabs.length;
      if (event.key === 'Home') nextIndex = 0;
      if (event.key === 'End') nextIndex = tabs.length - 1;
      if (nextIndex === null) return;
      event.preventDefault();
      activate(tabs[nextIndex], { focus: true, updateHash: true });
      tabs[nextIndex].scrollIntoView({ block: 'nearest', inline: 'nearest' });
    });
  });

  const requested = tabFromHash();
  const initial = requested || tabs.find((tab) => tab.getAttribute('aria-selected') === 'true') || tabs[0];
  activate(initial, { updateHash: Boolean(requested) });

  window.addEventListener('hashchange', () => {
    const tab = tabFromHash();
    if (tab) activate(tab, { focus: false, updateHash: false });
  });
}());
