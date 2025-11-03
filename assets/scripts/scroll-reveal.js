(function () {
  const options = {
    root: null,
    // 0.15 means element is considered "visible" when ~15% is in the viewport.
    threshold: 0.15,
    // rootMargin lets you start the effect earlier/later: top right bottom left
    // Negative bottom margin means "enter earlier" before the bottom reaches the element.
    rootMargin: '0px 0px -10% 0px'
  };

  // All elements inside <article> that should fade
  const article = document.querySelector('article');
  if (!article) return;

  const targets = article.querySelectorAll('.fade-element');

  // If IntersectionObserver is unavailable (ancient browsers), reveal everything
  if (!('IntersectionObserver' in window)) {
    targets.forEach(el => el.classList.add('in-view'));
    return;
  }

  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      // Toggle the class based on visibility. This will cause both fade-in and fade-out.
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
      } else {
        entry.target.classList.remove('in-view');
      }
    });
  }, options);

  targets.forEach(el => {
    // Optionally, avoid observing very small elements to reduce work
    io.observe(el);
    // If images inside are still loading, they'll shift layout; keep re-checking
    // (IntersectionObserver handles it automatically).
  });

})();
