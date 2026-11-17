// Keep title typography while standardizing standalone English UI labels.
(() => {
  for (const element of document.querySelectorAll('body *')) {
    if (element.children.length || element.closest('h1,h2,h3,h4,.filter-button,.hero-copy,.brand,.wordmark-flight,svg,script,style,[aria-hidden="true"]')) continue;
    const text = element.textContent.trim();
    if (/[A-Za-z]/.test(text) && !/[가-힣ㄱ-ㅎㅏ-ㅣ]/.test(text)) element.classList.add('english-body-text');
  }
})();
