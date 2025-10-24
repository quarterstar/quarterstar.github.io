(() => {
  'use strict';

  // Config
  const OBSERVER_OPTIONS = { root: null, rootMargin: '0px', threshold: 0 };

  // Helpers
  const hasExplicitLoading = img => img.hasAttribute('loading');

  const isInViewport = (el) => {
    const rect = el.getBoundingClientRect();
    const vh = window.innerHeight || document.documentElement.clientHeight;
    const vw = window.innerWidth || document.documentElement.clientWidth;
    return rect.bottom > 0 && rect.top < vh && rect.right > 0 && rect.left < vw;
  };

  // Main behavior when we decide an image is off-screen
  function markLazy(img) {
    try {
      if (!hasExplicitLoading(img)) {
        img.setAttribute('loading', 'lazy');
      }
    } catch (e) {
      // Defensive: ignore if attribute can't be set
      // (very unlikely in normal DOM images)
      console.warn('Could not set loading attribute on image', img, e);
    }
  }

  // Process one image (used by both observer and fallback)
  function processImageCandidate(img, observer) {
    if (!(img instanceof HTMLImageElement)) return;
    if (hasExplicitLoading(img) || img.classList.contains('no-auto-lazy')) {
      if (observer) observer.unobserve(img);
      return;
    }

    if (observer) {
      // With IntersectionObserver, the observer callback will decide
      observer.observe(img);
    } else {
      // Fallback immediate check: if it's NOT in viewport, mark lazy
      if (!isInViewport(img)) {
        markLazy(img);
      }
    }
  }

  // Initial scan & dynamic watching
  function scanAndWatch(root = document) {
    const imgs = root.querySelectorAll('img:not([loading])');
    imgs.forEach(img => processImageCandidate(img, observerIfAny));
  }

  // Create IntersectionObserver if available
  let observerIfAny = null;

  if ('IntersectionObserver' in window) {
    observerIfAny = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        const img = entry.target;
        // If the image already had loading attr added/changed elsewhere, stop observing
        if (hasExplicitLoading(img)) {
          observer.unobserve(img);
          return;
        }

        // If the image is NOT intersecting now (off-screen), add lazy
        if (!entry.isIntersecting) {
          markLazy(img);
          observer.unobserve(img);
        } else {
          // If it's intersecting (on-screen), do not mark lazy; stop observing to avoid churn
          observer.unobserve(img);
        }
      });
    }, OBSERVER_OPTIONS);
  }

  // Initial run once DOM is ready (if script loaded early)
  const start = () => {
    // Process images currently in DOM
    scanAndWatch(document);

    // Watch for future images added to the DOM
    const mo = new MutationObserver(mutations => {
      for (const m of mutations) {
        // Fast path: if nodes added, look for images among them or their descendants
        if (m.addedNodes && m.addedNodes.length) {
          m.addedNodes.forEach(node => {
            if (node.nodeType !== 1) return; // skip non-elements

            if (node.tagName === 'IMG') {
              processImageCandidate(node, observerIfAny);
            } else if (node.querySelectorAll) {
              const imgs = node.querySelectorAll('img:not([loading])');
              imgs.forEach(img => processImageCandidate(img, observerIfAny));
            }
          });
        }
      }
    });

    mo.observe(document.documentElement || document.body, {
      childList: true,
      subtree: true
    });

    // Fallback: if no IntersectionObserver, attach a throttled resize/scroll check
    if (!observerIfAny) {
      let scheduled = false;
      const throttleCheck = () => {
        if (scheduled) return;
        scheduled = true;
        requestAnimationFrame(() => {
          scheduled = false;
          const imgs = document.querySelectorAll('img:not([loading])');
          imgs.forEach(img => {
            if (!isInViewport(img)) markLazy(img);
          });
        });
      };

      // initial check
      throttleCheck();

      window.addEventListener('scroll', throttleCheck, { passive: true });
      window.addEventListener('resize', throttleCheck, { passive: true });
      window.addEventListener('orientationchange', throttleCheck, { passive: true });
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start, { once: true });
  } else {
    start();
  }

})();

