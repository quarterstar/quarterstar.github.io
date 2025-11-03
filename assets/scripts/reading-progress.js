(function () {
  const bar = document.getElementById('reading-progress-bar');
  if (!bar) return;

  function getScrollProgress() {
    const doc = document.documentElement;
    const scrollTop = (window.pageYOffset || doc.scrollTop) - (doc.clientTop || 0);
    const scrollHeight = doc.scrollHeight - doc.clientHeight;
    return scrollHeight > 0 ? scrollTop / scrollHeight : 0;
  }

  let ticking = false;
  function update() {
    const progress = Math.min(Math.max(getScrollProgress(), 0), 1);
    // set transform for smooth and performant animation
    bar.style.transform = `scaleX(${progress})`;

    // update accessible value as integer 0..100
    const percent = Math.round(progress * 100);
    bar.setAttribute('aria-valuenow', String(percent));
    // optionally set aria-label for screen readers
    bar.setAttribute('aria-label', `${percent}% read`);

    ticking = false;
  }

  function onScroll() {
    if (!ticking) {
      requestAnimationFrame(update);
      ticking = true;
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  // initialize on load
  document.addEventListener('DOMContentLoaded', onScroll, { passive: true });
})();

