(function () {
  document.querySelectorAll('[data-case-gallery]').forEach((gallery) => {
    const slides = Array.from(gallery.querySelectorAll('[data-case-slide]'));
    const previous = gallery.querySelector('[data-gallery-prev]');
    const next = gallery.querySelector('[data-gallery-next]');
    const status = gallery.querySelector('[data-gallery-status]');
    if (!slides.length) return;

    let index = 0;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach((slide, slideIndex) => {
        slide.hidden = slideIndex !== index;
      });
      if (status) status.textContent = `${index + 1} / ${slides.length}`;
    }

    previous?.addEventListener('click', () => show(index - 1));
    next?.addEventListener('click', () => show(index + 1));
    gallery.addEventListener('keydown', (event) => {
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        show(index - 1);
      } else if (event.key === 'ArrowRight') {
        event.preventDefault();
        show(index + 1);
      }
    });

    show(0);
  });
}());
