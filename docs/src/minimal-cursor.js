(() => {
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  if (!matchMedia('(hover: hover) and (pointer: fine)').matches || reducedMotion.matches) return;

  const cursor = document.createElement('div');
  cursor.className = 'inversion-cursor';
  cursor.setAttribute('aria-hidden', 'true');
  document.body.append(cursor);

  const hide = () => document.body.classList.remove('cursor-ready');
  document.addEventListener('pointermove', event => {
    if (event.pointerType === 'touch') {
      hide();
      return;
    }

    cursor.style.left = `${event.clientX}px`;
    cursor.style.top = `${event.clientY}px`;
    const action = event.target.closest('a[href], button:not(:disabled), [role="button"]');
    const penguin = action?.matches('.wandering-penguin, .penguin-guide-launcher');
    let symbol = '';
    if (action && !penguin) {
      if (action.hasAttribute('download')) symbol = '↓';
      else if (action.matches('#top-button')) symbol = '↑';
      else symbol = action.matches('a[target="_blank"], a[href^="mailto:"], a[href^="tel:"]') ? '↗' : '>';
    }
    cursor.textContent = symbol;
    cursor.classList.toggle('is-link', Boolean(symbol));
    document.body.classList.add('cursor-ready');
  }, { passive: true });
  document.documentElement.addEventListener('pointerleave', hide);
  document.addEventListener('pointercancel', hide);
  addEventListener('blur', hide);
})();
