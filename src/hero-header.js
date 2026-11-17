// V2 header returns after scrolling rests. Keyboard focus always reveals it.
(() => {
  const header = document.querySelector('.site-header');
  if (!header || !document.body.classList.contains('editorial-site')) return;
  const about = document.getElementById("about");
  let timer;
  const reveal = () => header.classList.remove('is-scroll-hidden');
  const protectedState = () => window.scrollY < 24 || (about && about.getBoundingClientRect().top <= header.offsetHeight) || document.body.classList.contains('menu-open') || header.contains(document.activeElement);
  window.addEventListener('scroll', () => {
    clearTimeout(timer);
    header.classList.toggle('is-scroll-hidden', !protectedState());
    timer = setTimeout(reveal, 250);
  }, { passive: true });
  header.addEventListener('focusin', reveal);
  new MutationObserver(() => {
    if (document.body.classList.contains('menu-open')) reveal();
  }).observe(document.body, { attributes: true, attributeFilter: ['class'] });
})();
