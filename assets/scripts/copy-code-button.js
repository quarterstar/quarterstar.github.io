(function () {
  'use strict';

  const selectors = [
    'pre > code',                 // typical Markdown -> <pre><code>
    'div.highlighter-rouge pre',  // Jekyll Rouge wrapper (some themes)
    '.highlight pre'              // other theme patterns
  ];

  const allSelector = selectors.join(',');

  function createButton() {
    const btn = document.createElement('button');
    btn.className = 'copy-code-button';
    btn.type = 'button';
    btn.setAttribute('aria-label', 'Copy code to clipboard');
    btn.textContent = 'Copy';
    return btn;
  }

  function copyText(text) {
    // Use Clipboard API if available
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text);
    }
    // Fallback using textarea + execCommand
    return new Promise(function (resolve, reject) {
      try {
        const ta = document.createElement('textarea');
        ta.value = text;
        // move outside viewport
        ta.style.position = 'fixed';
        ta.style.left = '-9999px';
        document.body.appendChild(ta);
        ta.select();
        const ok = document.execCommand('copy');
        document.body.removeChild(ta);
        if (ok) resolve();
        else reject(new Error('execCommand copy failed'));
      } catch (err) {
        reject(err);
      }
    });
  }

  function setButtonState(btn, state) {
    // state: 'idle' | 'copied' | 'failed'
    btn.disabled = false;
    btn.classList.remove('copied', 'failed');
    if (state === 'copied') {
      btn.classList.add('copied');
      btn.textContent = 'Copied!';
      btn.setAttribute('aria-label', 'Code copied to clipboard');
      // revert after 2s
      setTimeout(() => {
        btn.textContent = 'Copy';
        btn.classList.remove('copied');
        btn.setAttribute('aria-label', 'Copy code to clipboard');
      }, 2000);
    } else if (state === 'failed') {
      btn.classList.add('failed');
      btn.textContent = 'Failed';
      setTimeout(() => {
        btn.textContent = 'Copy';
        btn.classList.remove('failed');
        btn.setAttribute('aria-label', 'Copy code to clipboard');
      }, 2000);
    }
  }

  function attachButtons(root = document) {
    const nodes = Array.from(root.querySelectorAll(allSelector));
    nodes.forEach(codeEl => {
      // we want the <pre> container to position the button
      const pre = codeEl.tagName.toLowerCase() === 'pre' ? codeEl : codeEl.closest('pre') || codeEl.parentElement;
      if (!pre) return;
      // avoid double-inserting
      if (pre.querySelector('.copy-code-button')) return;

      // create container if necessary
      // position button in top-right of pre
      const btn = createButton();
      btn.addEventListener('click', function () {
        // get text content (preserve whitespace)
        const codeText = codeEl.innerText;
        btn.disabled = true;
        copyText(codeText).then(() => {
          setButtonState(btn, 'copied');
        }).catch(() => {
          setButtonState(btn, 'failed');
        });
      });

      // position the button as first child of pre for easier CSS positioning
      pre.classList.add('copy-code-pre');
      pre.appendChild(btn);
      //pre.insertBefore(btn, pre.firstChild);

      const gap = btn.offsetWidth + 12; // 12px gap buffer
      pre.style.setProperty('--copy-button-gap', `${gap}px`);
    });
  }

  // init on DOMContentLoaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => attachButtons());
  } else {
    attachButtons();
  }

  window.JekyllCopyCode = { attachButtons };

})();

