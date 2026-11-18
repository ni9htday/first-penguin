(() => {
  const page = document.body.dataset.page;
  if (!['projects', 'information'].includes(page)) return;

  const stage = document.querySelector('.page-penguin-stage');
  const penguin = stage?.querySelector('.page-wandering-penguin');
  const trail = stage?.querySelector('.page-penguin-trail');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (!stage || !penguin || !trail || reduceMotion.matches) return;

  const poses = {
    left: './assets/penguin/pg_run_to_L-v3.svg',
    right: './assets/penguin/pg_run_to_R-v3.svg'
  };
  let current = { x: 0, y: 0 };
  let destination = current;
  let moveStartedAt = performance.now();
  let moveDuration = 3000;
  let moveTimer;
  let trailTimer;

  const size = () => penguin.getBoundingClientRect().width || 34;
  const place = (point, duration = 0) => {
    penguin.style.transitionDuration = `${duration}ms`;
    penguin.style.transform = `translate3d(${point.x}px, ${point.y}px, 0)`;
  };
  const leaveDot = () => {
    const progress = Math.min(1, Math.max(0, (performance.now() - moveStartedAt) / moveDuration));
    const dot = document.createElement('i');
    const x = current.x + (destination.x - current.x) * progress + size() * .5;
    const y = current.y + (destination.y - current.y) * progress + size() * .8;
    dot.className = 'page-penguin-dot';
    dot.style.left = `${x + (Math.random() - .5) * 6}px`;
    dot.style.top = `${y + (Math.random() - .5) * 4}px`;
    dot.style.setProperty('--dot-size', `${2 + Math.random() * 2}px`);
    trail.appendChild(dot);
    window.setTimeout(() => dot.remove(), 720);
  };
  const move = () => {
    const penguinSize = size();
    const paddingX = Math.max(28, window.innerWidth * .08);
    const top = Math.max(92, window.innerHeight * .14);
    const width = Math.max(1, window.innerWidth - paddingX * 2 - penguinSize);
    const height = Math.max(1, window.innerHeight * .74 - penguinSize);
    destination = {
      x: paddingX + Math.random() * width,
      y: top + Math.random() * height
    };
    const dx = destination.x - current.x;
    penguin.src = dx < 0 ? poses.left : poses.right;
    const distance = Math.hypot(dx, destination.y - current.y);
    moveDuration = Math.max(2200, Math.min(5200, distance * 6.2));
    moveStartedAt = performance.now();
    place(destination, moveDuration);
    window.clearInterval(trailTimer);
    trailTimer = window.setInterval(leaveDot, 260);
    window.clearTimeout(moveTimer);
    moveTimer = window.setTimeout(() => {
      window.clearInterval(trailTimer);
      current = destination;
      moveTimer = window.setTimeout(move, 260 + Math.random() * 500);
    }, moveDuration);
  };

  current = {
    x: window.innerWidth * .18,
    y: Math.max(110, window.innerHeight * .28)
  };
  destination = current;
  place(current);
  moveTimer = window.setTimeout(move, 480);

  window.addEventListener('pagehide', () => {
    window.clearInterval(trailTimer);
    window.clearTimeout(moveTimer);
  }, { once: true });
})();
