// assets/js/heading-links.js
(function () {
  const selector = 'article'; // change if your post wrapper uses a different selector

  function slugify(text) {
    return text.toString().trim().toLowerCase()
      .replace(/\s+/g, '-')           // spaces -> -
      .replace(/[^\w\-]+/g, '')       // remove non-word chars
      .replace(/\-\-+/g, '-')         // collapse dashes
      .replace(/^-+|-+$/g, '');       // trim dashes
  }

  function ensureId(el) {
    if (el.id) return el.id;
    // prefer heading text; if empty, fall back to generated unique id
    const text = el.textContent || el.innerText || 'section';
    let id = slugify(text);
    if (!id) id = 'section';
    let unique = id;
    let i = 1;
    // ensure uniqueness within document
    while (document.getElementById(unique)) {
      unique = id + '-' + i++;
    }
    el.id = unique;
    return unique;
  }

  function copyToClipboard(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text);
    }
    // fallback
    return new Promise((resolve, reject) => {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.setAttribute('readonly', '');
      textarea.style.position = 'absolute';
      textarea.style.left = '-9999px';
      document.body.appendChild(textarea);
      textarea.select();
      try {
        const ok = document.execCommand('copy');
        document.body.removeChild(textarea);
        if (ok) resolve();
        else reject();
      } catch (err) {
        document.body.removeChild(textarea);
        reject(err);
      }
    });
  }

  function installHeadingLinks(root) {
    if (!root) return;
    const headings = root.querySelectorAll('h2, h3, h4, h5, h6');
    if (!headings.length) return;

    // live region for screen reader announcements
    let liveRegion = document.getElementById('heading-link-live-region');
    if (!liveRegion) {
      liveRegion = document.createElement('div');
      liveRegion.id = 'heading-link-live-region';
      liveRegion.setAttribute('aria-live', 'polite');
      liveRegion.setAttribute('aria-atomic', 'true');
      liveRegion.style.position = 'absolute';
      liveRegion.style.left = '-9999px';
      liveRegion.style.width = '1px';
      liveRegion.style.height = '1px';
      liveRegion.style.overflow = 'hidden';
      document.body.appendChild(liveRegion);
    }

    headings.forEach(heading => {
      // skip headings in non-article contexts (optional)
      if (!root.contains(heading)) return;

      // avoid duplicating an anchor if already added
      if (heading.querySelector('.heading-link')) return;

      const id = ensureId(heading);

      // create link element
      const a = document.createElement('a');
      a.className = 'heading-link';
      a.href = '#' + id;
      a.setAttribute('aria-label', 'Copy link to this section');
      a.setAttribute('title', 'Copy link to this section');
      a.setAttribute('role', 'button'); // it's an action (we prevent default navigation)
      a.tabIndex = 0;

      // copy feedback bubble
      const feedback = document.createElement('span');
      feedback.className = 'copy-feedback';
      feedback.textContent = 'Copied!';
      a.appendChild(feedback);

      // icon
      const emoji = document.createTextNode('🔗');
      a.appendChild(emoji);

      // attach click handler
      let feedbackTimeout = null;
      a.addEventListener('click', function (ev) {
        ev.preventDefault(); // prevent default anchor jump
        const fullUrl = location.origin + location.pathname + location.search + '#' + id;
        copyToClipboard(fullUrl).then(() => {
          // visual feedback
          a.classList.add('copied');
          if (feedbackTimeout) clearTimeout(feedbackTimeout);
          feedbackTimeout = setTimeout(() => a.classList.remove('copied'), 1500);

          // announce for screen readers
          liveRegion.textContent = 'Link copied to clipboard';
        }).catch(() => {
          // fallback: navigate to the anchor if copy fails
          location.hash = id;
          liveRegion.textContent = 'Link focused';
        });
      }, false);

      // keyboard: Enter or Space should trigger click
      a.addEventListener('keydown', function (ev) {
        if (ev.key === 'Enter' || ev.key === ' ') {
          ev.preventDefault();
          a.click();
        }
      });

      // Insert the link as the last child of the heading so it appears inline
      heading.appendChild(a);
      // add class to heading for potential extra styling
      heading.classList.add('heading-anchor');
    });
  }

  // Auto-run on DOM ready
  function init() {
    const root = document.querySelector(selector) || document;
    installHeadingLinks(root);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // expose for manual re-initialization (e.g. after dynamic content)
  window.installHeadingLinks = installHeadingLinks;
})();

