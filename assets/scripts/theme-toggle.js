const HLJS_THEMES = {
  light: 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.11.1/styles/github.min.css',
  dark: 'https://cdn.jsdelivr.net/npm/highlight.js@11.9.0/styles/atom-one-dark.min.css'
};
const KEY = 'site-theme';

(function () {
  const hljsLink = document.getElementById('hljs-theme');
  const mobileBtn = document.getElementById('theme-toggle'); // your existing mobile toggle (may be absent)
  const pcBtn = document.getElementById('theme-toggle-pc');
  const buttons = [mobileBtn, pcBtn].filter(Boolean);

  function setHljsTheme(dark) {
    hljsLink.href = dark ? HLJS_THEMES.dark : HLJS_THEMES.light;
  }

  function updateButtons(dark){
    // set document class
    document.documentElement.classList.toggle('dark-mode', !!dark);

    // mobile uses aria-pressed (existing), pc uses aria-checked
    if (mobileBtn){
      mobileBtn.setAttribute('aria-pressed', dark ? 'true' : 'false');
    }
    if (pcBtn){
      pcBtn.setAttribute('aria-checked', dark ? 'true' : 'false');
    }

    setHljsTheme(dark);
  }

  // Initial: stored -> system -> light
  const stored = localStorage.getItem(KEY);
  if (stored === 'dark' || stored === 'light') {
    updateButtons(stored === 'dark');
  } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    updateButtons(true);
  } else {
    updateButtons(false);
  }

  // Click handlers for any existing toggle
  buttons.forEach(btn => {
    btn.addEventListener('click', function (ev) {
      // Toggle mode
      const isDark = document.documentElement.classList.toggle('dark-mode');
      localStorage.setItem(KEY, isDark ? 'dark' : 'light');
      // Update both toggles to stay in sync
      updateButtons(isDark);
    });
  });

  // Keep toggles in sync across tabs/windows
  window.addEventListener('storage', function (e) {
    if (e.key === KEY) {
      const val = e.newValue === 'dark';
      updateButtons(val);
    }
  });
})();
