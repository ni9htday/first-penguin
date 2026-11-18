(() => {
  const scriptUrl = document.currentScript?.src;
  if (!scriptUrl) return;

  const penguinUrl = new URL('../assets/penguin/pg_run_to_R-v3.svg', scriptUrl).href;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const homeButtons = document.querySelectorAll('.minimal-logo, .site-header .brand');
  if (!homeButtons.length) return;

  const style = document.createElement('style');
  style.textContent = `
    .home-onboarding {
      position: fixed;
      inset: 0;
      z-index: 100000;
      overflow: hidden;
      background: #fff;
      opacity: 0;
      pointer-events: none;
      transition: opacity 160ms ease;
    }
    .home-onboarding.is-active {
      opacity: 1;
      pointer-events: auto;
    }
    .home-onboarding img {
      position: absolute;
      left: 0;
      top: 54%;
      width: clamp(40px, 4.2vw, 64px);
      height: auto;
      transform: translate3d(-130%, -50%, 0);
      image-rendering: pixelated;
      will-change: transform;
    }
    .home-onboarding.is-running img {
      animation: home-penguin-run 1.25s linear forwards;
    }
    @keyframes home-penguin-run {
      to { transform: translate3d(calc(100vw + 130%), -50%, 0); }
    }
    @media (prefers-reduced-motion: reduce) {
      .home-onboarding { display: none; }
    }
  `;
  document.head.appendChild(style);

  const overlay = document.createElement('div');
  overlay.className = 'home-onboarding';
  overlay.setAttribute('aria-hidden', 'true');
  overlay.innerHTML = `<img src="${penguinUrl}" alt="" />`;
  document.body.appendChild(overlay);

  let isRunning = false;
  homeButtons.forEach(button => button.addEventListener('click', event => {
    if (isRunning || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    if (reduceMotion.matches) return;

    event.preventDefault();
    isRunning = true;
    const destination = button.href;
    overlay.classList.add('is-active');
    window.requestAnimationFrame(() => overlay.classList.add('is-running'));
    window.setTimeout(() => {
      window.location.href = destination;
    }, 1320);
  }));
})();
