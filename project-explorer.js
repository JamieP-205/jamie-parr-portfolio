(function () {
  const evidenceStyles = document.createElement('link');
  evidenceStyles.rel = 'stylesheet';
  evidenceStyles.href = 'project-evidence.css';
  evidenceStyles.dataset.projectEvidence = 'true';
  document.head.appendChild(evidenceStyles);

  const legacySections = {
    about: 'profile',
    skills: 'profile',
    experience: 'background'
  };

  const projectRepos = {
    'the-world-forgot-us': 'the-world-forgot-us',
    'french-learning-platform': 'french-for-life',
    'coast-internet-radio': 'coast-internet-radio',
    'talk-with-jamie': 'talk-with-jamie',
    'local-web-fix': 'local-web-fix'
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

  panels.forEach((panel) => {
    const accent = panel.style.getPropertyValue('--project-accent').trim();
    const trigger = triggers.find((item) => item.dataset.projectTrigger === panel.dataset.projectPanel);
    if (trigger && accent) trigger.style.setProperty('--item-accent', accent);
  });

  function idFromHash() {
    const prefix = '#project-';
    if (!window.location.hash.startsWith(prefix)) return '';
    const id = window.location.hash.slice(prefix.length);
    return ids.has(id) ? id : '';
  }

  function select(id, options) {
    const settings = Object.assign({ updateHash: false, focus: false, scroll: false }, options);
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
      if (active) {
        const accent = panel.style.getPropertyValue('--project-accent').trim();
        if (accent) explorer.style.setProperty('--active-project-accent', accent);
      }
    });

    const activeTrigger = triggers.find((trigger) => trigger.dataset.projectTrigger === id);
    if (activeTrigger) activeTrigger.scrollIntoView({ block: 'nearest', inline: 'nearest' });

    if (settings.updateHash) {
      const next = `#project-${id}`;
      if (window.location.hash !== next) history.replaceState(null, '', next);
    }

    if (settings.scroll) explorer.scrollIntoView({ behavior: 'smooth', block: 'start' });

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

  const intro = document.querySelector('.projects-intro');
  if (intro) {
    const hint = document.createElement('p');
    hint.className = 'project-key-hint';
    hint.innerHTML = 'Keyboard: <kbd>1–6</kbd> choose a project &nbsp; <kbd>[</kbd><kbd>]</kbd> move through the desk';
    intro.insertAdjacentElement('afterend', hint);
  }

  document.addEventListener('keydown', (event) => {
    const active = document.activeElement;
    const typing = /^(input|textarea|select|button)$/i.test(active?.tagName || '') || active?.isContentEditable;
    const rect = explorer.getBoundingClientRect();
    const workbenchVisible = rect.bottom > 0 && rect.top < window.innerHeight;
    if (typing || !workbenchVisible || event.altKey || event.ctrlKey || event.metaKey) return;

    const currentIndex = Math.max(0, triggers.findIndex((trigger) => trigger.getAttribute('aria-current') === 'true'));
    let targetIndex = -1;
    if (/^[1-6]$/.test(event.key)) targetIndex = Number(event.key) - 1;
    else if (event.key === ']') targetIndex = (currentIndex + 1) % triggers.length;
    else if (event.key === '[') targetIndex = (currentIndex - 1 + triggers.length) % triggers.length;
    if (targetIndex < 0 || !triggers[targetIndex]) return;

    event.preventDefault();
    select(triggers[targetIndex].dataset.projectTrigger, { updateHash: true });
  });

  window.addEventListener('hashchange', () => {
    if (repairLegacySectionHash()) return;
    const id = idFromHash();
    if (id) select(id, { focus: true });
  });

  function relativeTime(iso) {
    const then = new Date(iso).getTime();
    if (!Number.isFinite(then)) return '';
    const minutes = Math.max(1, Math.round((Date.now() - then) / 60000));
    if (minutes < 60) return `${minutes} min ago`;
    const hours = Math.round(minutes / 60);
    if (hours < 24) return hours === 1 ? '1 hour ago' : `${hours} hours ago`;
    const days = Math.round(hours / 24);
    if (days < 7) return days === 1 ? 'yesterday' : `${days} days ago`;
    return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short' }).format(new Date(iso));
  }

  function firstLine(value) {
    return String(value || 'Pushed project updates').split(/\r?\n/, 1)[0].trim();
  }

  function makeBuildLedger() {
    const projectMore = document.querySelector('.project-more');
    if (!projectMore || typeof fetch !== 'function') return;

    const ledger = document.createElement('section');
    ledger.className = 'build-ledger';
    ledger.hidden = true;
    ledger.setAttribute('aria-labelledby', 'build-ledger-title');

    const heading = document.createElement('div');
    heading.className = 'build-ledger-heading';
    heading.innerHTML = '<div><p class="eyebrow">Live build ledger</p><h3 id="build-ledger-title">Recent public work</h3></div><p>Real push activity from the public repositories, kept separate from private study data and unfinished local work.</p>';

    const list = document.createElement('ol');
    list.className = 'build-ledger-list';
    list.setAttribute('aria-live', 'polite');

    const footer = document.createElement('div');
    footer.className = 'build-ledger-footer';
    footer.innerHTML = '<p>Updates come from GitHub’s public activity feed and fail quietly if it is unavailable.</p><a href="https://github.com/JamieP-205?tab=repositories" target="_blank" rel="noopener noreferrer">Open all public repositories</a>';

    ledger.append(heading, list, footer);
    projectMore.insertAdjacentElement('beforebegin', ledger);

    const cacheKey = 'portfolio-public-build-ledger-v1';
    const maxAge = 10 * 60 * 1000;

    function render(entries) {
      if (!Array.isArray(entries) || !entries.length) return;
      list.replaceChildren();

      entries.slice(0, 4).forEach((entry) => {
        const item = document.createElement('li');
        item.className = 'build-ledger-item';

        const repoCell = document.createElement('div');
        repoCell.className = 'build-ledger-repo';
        const repoLink = document.createElement('a');
        const projectId = projectRepos[entry.repo];
        repoLink.textContent = entry.repo.replaceAll('-', ' ');
        if (projectId) {
          repoLink.href = `#project-${projectId}`;
          repoLink.addEventListener('click', (event) => {
            event.preventDefault();
            select(projectId, { updateHash: true, scroll: true });
          });
        } else {
          repoLink.href = `https://github.com/JamieP-205/${entry.repo}`;
          repoLink.target = '_blank';
          repoLink.rel = 'noopener noreferrer';
        }
        repoCell.appendChild(repoLink);

        const message = document.createElement('p');
        message.className = 'build-ledger-message';
        const commitLink = document.createElement('a');
        commitLink.textContent = entry.message;
        commitLink.href = entry.sha
          ? `https://github.com/JamieP-205/${entry.repo}/commit/${entry.sha}`
          : `https://github.com/JamieP-205/${entry.repo}`;
        commitLink.target = '_blank';
        commitLink.rel = 'noopener noreferrer';
        message.appendChild(commitLink);

        const time = document.createElement('time');
        time.className = 'build-ledger-time';
        time.dateTime = entry.when;
        time.textContent = relativeTime(entry.when);

        item.append(repoCell, message, time);
        list.appendChild(item);
      });

      ledger.hidden = false;
    }

    let cached = null;
    try { cached = JSON.parse(sessionStorage.getItem(cacheKey) || 'null'); } catch {}
    if (cached && Date.now() - cached.at < maxAge && Array.isArray(cached.entries)) {
      render(cached.entries);
      return;
    }

    fetch('https://api.github.com/users/JamieP-205/events/public?per_page=30')
      .then((response) => (response.ok ? response.json() : null))
      .then((events) => {
        if (!Array.isArray(events)) return;
        const seen = new Set();
        const entries = [];

        events.forEach((event) => {
          if (event.type !== 'PushEvent' || !event.repo?.name) return;
          const repo = String(event.repo.name).split('/')[1];
          if (!repo || seen.has(repo)) return;
          const commits = Array.isArray(event.payload?.commits) ? event.payload.commits : [];
          const latest = commits[commits.length - 1] || {};
          seen.add(repo);
          entries.push({
            repo,
            message: firstLine(latest.message),
            sha: latest.sha || '',
            when: event.created_at
          });
        });

        if (!entries.length) return;
        try { sessionStorage.setItem(cacheKey, JSON.stringify({ entries, at: Date.now() })); } catch {}
        render(entries);
      })
      .catch(() => {});
  }

  document.documentElement.classList.add('project-explorer-ready');
  select(idFromHash() || triggers[0]?.dataset.projectTrigger || '', { updateHash: false });
  makeBuildLedger();
}());
