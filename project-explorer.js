(() => {
  const portrait = document.querySelector('.portrait-card .portrait');
  if (portrait) portrait.src = 'assets/jamie-parr-suit.jpg';

  const intro = document.querySelector('.projects-intro');
  if (intro) {
    const label = intro.querySelector('.eyebrow');
    const heading = intro.querySelector('h2');
    const copy = intro.querySelector(':scope > p');
    if (label) label.textContent = 'Projects';
    if (heading) heading.textContent = 'Selected projects, shown simply.';
    if (copy) copy.textContent = 'A straightforward look at what I built, what each project does and the main tools behind it.';
  }
  const replacements = {
    'project-coast-internet-radio': 'assets/coast-home-top.jpg',
    'project-talk-with-jamie': 'assets/talk-with-jamie-home.jpg',
    'project-local-web-fix': 'assets/local-web-fix-home.jpg'
  };
  for (const [id, src] of Object.entries(replacements)) {
    const image = document.querySelector(`#${id} .project-stage-media img`);
    if (image) image.src = src;
  }
  const stage = document.querySelector('.project-stage');
  if (stage) stage.removeAttribute('aria-live');
})();
