(() => {
  const portrait = document.querySelector('.portrait-card .portrait');
  if (portrait) {
    portrait.src = 'assets/jamie-parr-suit.jpg?v=20260917b';
    portrait.alt = 'Jamie Parr wearing a dark suit, white shirt, tie and sunglasses outdoors';
  }

  document.querySelector('[data-project-trigger="groundwork"]')?.remove();
  document.querySelector('#project-groundwork')?.remove();
  document.querySelector('#pal-groundwork')?.remove();
  document.querySelectorAll('.project-stage-media').forEach((media) => media.remove());

  const intro = document.querySelector('.projects-intro');
  if (intro) {
    const label = intro.querySelector('.eyebrow');
    const heading = intro.querySelector('h2');
    const copy = intro.querySelector(':scope > p');
    if (label) label.textContent = 'Projects';
    if (heading) heading.textContent = 'Selected public projects.';
    if (copy) copy.textContent = 'Only projects with public GitHub repositories are included here.';
  }

  const stage = document.querySelector('.project-stage');
  if (stage) stage.removeAttribute('aria-live');
})();
