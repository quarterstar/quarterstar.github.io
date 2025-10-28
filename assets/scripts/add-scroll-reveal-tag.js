document.querySelectorAll('article').forEach(article => {
  ['p','h2','h3','h4','li','figure', 'code'].forEach(tag => {
    article.querySelectorAll(tag).forEach(el => el.classList.add('fade-element'));
  });
});
