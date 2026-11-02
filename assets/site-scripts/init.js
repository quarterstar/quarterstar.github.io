/*
 * Synchronous head initialization — CSP-safe replacements for the former
 * inline <script> blocks and onload="" handler attributes.
 *
 * Loaded as a classic, synchronous, same-origin script from
 * _includes/layout/global.html so that everything below runs:
 *   - before first paint (theme bootstrap),
 *   - before the deferred scripts (bundle.js, mailerlite-webform.js),
 *   - with the async/deferred CSS <link>s already parsed (listener attach).
 *
 * Requires no 'unsafe-inline' / 'unsafe-hashes' / hashes in the CSP.
 */

/* 1) Async-CSS activation.
 *    Replaces onload="this.onload=null;this.rel='stylesheet'" (preload trick)
 *    and onload="this.media='all'" (print-media trick).
 *    Race-free: listeners are attached synchronously at parse time, and links
 *    that finished loading before this script ran are detected via .sheet /
 *    the Resource Timing API and swapped immediately. */
(function () {
  function swap(link) {
    if (link.rel !== "stylesheet") link.rel = "stylesheet";
    if (link.media === "print") link.media = "all";
  }
  function alreadyLoaded(link) {
    if (link.sheet) return true;
    if (!link.href) return false;
    try {
      var entries = performance.getEntriesByName(link.href);
      return entries.length > 0 && entries[entries.length - 1].responseEnd > 0;
    } catch (e) {
      return false;
    }
  }
  var links = document.querySelectorAll(
    'link[rel="preload"][as="style"], link[rel="stylesheet"][media="print"]'
  );
  for (var i = 0; i < links.length; i++) {
    (function (link) {
      if (alreadyLoaded(link)) {
        swap(link);
      } else {
        link.addEventListener(
          "load",
          function () {
            swap(link);
          },
          { once: true }
        );
      }
    })(links[i]);
  }
})();

/* 2) Dark-mode bootstrap — prevents a light/dark flash on first paint.
 *    Verbatim logic from the deleted _includes/theme/load.html.
 *    Keep the storage key and class name in sync with src/theme.ts. */
(function () {
  try {
    var darkClass = "dark-mode";
    var stored = localStorage.getItem("site-theme");
    var prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

    if (stored === "dark" || (!stored && prefersDark)) {
      document.documentElement.classList.add(darkClass);
    }
  } catch (e) {}
})();

/* 3) MailerLite webform success callback — called by name from
 *    assets/external-scripts/mailerlite-webform.js ("ml_webform_success_"+id).
 *    Uses direct CSSOM writes (element.style.display = ...), which a strict
 *    style-src allows, instead of jQuery show()/hide(). */
function ml_webform_success_32409238() {
  var shown = document.querySelectorAll(
    ".ml-subscribe-form-32409238 .row-success"
  );
  var hidden = document.querySelectorAll(
    ".ml-subscribe-form-32409238 .row-form"
  );
  for (var i = 0; i < shown.length; i++) shown[i].style.display = "block";
  for (var j = 0; j < hidden.length; j++) hidden[j].style.display = "none";
}
