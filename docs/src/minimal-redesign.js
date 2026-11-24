(() => {
  const content = window.siteContent;
  if (!content) return;
  if (document.body.dataset.page === 'home') {
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
    const resetHomeScroll = () => {
      if (window.location.hash) history.replaceState(history.state, '', `${window.location.pathname}${window.location.search}`);
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    };
    resetHomeScroll();
    window.requestAnimationFrame(resetHomeScroll);
    window.addEventListener('pageshow', resetHomeScroll, { once: true });
  }
  const penguin = document.querySelector('.wandering-penguin');
  const penguinStage = document.querySelector('.penguin-stage');
  const penguinTrail = document.querySelector('.penguin-trail');
  const penguinSplash = document.querySelector('.penguin-splash');
  const diveSequence = document.querySelector('.dive-sequence');
  const hero = document.querySelector('.hero');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (penguin && penguinStage && penguinTrail && diveSequence && hero && !reduceMotion.matches) {
    const sparkle = () => {
      if (penguin.classList.contains('is-submerged')) return;
      const penguinRect = penguin.getBoundingClientRect();
      const stageRect = penguinStage.getBoundingClientRect();
      const spark = document.createElement('span');
      spark.className = 'penguin-tap-spark';
      spark.setAttribute('aria-hidden', 'true');
      spark.style.left = `${penguinRect.left - stageRect.left + penguinRect.width / 2}px`;
      spark.style.top = `${penguinRect.top - stageRect.top + penguinRect.height / 2}px`;
      penguinStage.appendChild(spark);
      spark.addEventListener('animationend', () => spark.remove(), { once: true });
    };
    penguin.addEventListener('click', sparkle);
    penguin.addEventListener('keydown', event => {
      if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); sparkle(); }
    });
    const poses = {
      left: './assets/penguin/pg_run_to_L-v3.svg',
      right: './assets/penguin/pg_run_to_R-v3.svg'
    };
    const surface = [[.04, .48], [.24, .32], [.36, .38], [.49, .18], [.59, .35], [.76, .29], [.96, .48]];
    const surfaceY = ratio => {
      const x = Math.min(.96, Math.max(.04, ratio));
      const endIndex = surface.findIndex(point => point[0] >= x);
      const end = surface[Math.max(1, endIndex)];
      const start = surface[Math.max(0, Math.max(1, endIndex) - 1)];
      const progress = (x - start[0]) / (end[0] - start[0]);
      return start[1] + (end[1] - start[1]) * progress;
    };
    const pointOnIce = ratio => {
      const size = penguinSize();
      return {
        x: penguinStage.clientWidth * ratio - size * .5,
        y: penguinStage.clientHeight * surfaceY(ratio) - size * .84
      };
    };
    let current = { x: 0, y: 0 };
    let destination = current;
    let trailTimer;
    let moveTimer;
    let isDiving = false;
    let isPaused = false;
    let guideOpen = false;
    let jumpStart = null;
    let lastScrollY = window.scrollY;
    const penguinSize = () => penguin.getBoundingClientRect().width || 64;
    const placePenguin = (point, duration = 0) => {
      penguin.style.transitionDuration = `${duration}ms`;
      penguin.style.transform = `translate3d(${point.x}px, ${point.y}px, 0)`;
    };
    const leaveDot = () => {
      const dot = document.createElement('i');
      const progress = Math.min(1, Math.max(0, (performance.now() - moveStartedAt) / activeDuration));
      const x = current.x + (destination.x - current.x) * progress + penguinSize() * .5;
      const y = current.y + (destination.y - current.y) * progress + penguinSize() * .82;
      dot.className = 'penguin-dot';
      dot.style.left = `${x + (Math.random() - .5) * 8}px`;
      dot.style.top = `${y + (Math.random() - .5) * 5}px`;
      dot.style.setProperty('--dot-size', `${2 + Math.random() * 3}px`);
      penguinTrail.appendChild(dot);
      window.setTimeout(() => dot.remove(), 560);
    };
    let moveStartedAt = performance.now();
    let activeDuration = 3000;
    const move = () => {
      if (isDiving || isPaused || guideOpen) return;
      const size = penguinSize();
      const ratio = .25 + Math.random() * .5;
      destination = pointOnIce(ratio);
      const dx = destination.x - current.x;
      penguin.src = dx < 0 ? poses.left : poses.right;
      const distance = Math.hypot(dx, destination.y - current.y);
      activeDuration = Math.max(1400, Math.min(3000, distance * 5.8));
      moveStartedAt = performance.now();
      placePenguin(destination, activeDuration);
      window.clearInterval(trailTimer);
      trailTimer = window.setInterval(leaveDot, 150);
      window.clearTimeout(moveTimer);
      moveTimer = window.setTimeout(() => {
        window.clearInterval(trailTimer);
        current = destination;
        moveTimer = window.setTimeout(move, 90 + Math.random() * 260);
      }, activeDuration);
    };
    current = pointOnIce(.5);
    destination = current;
    placePenguin(current);
    moveTimer = window.setTimeout(move, 80);

    const pausePatrol = () => {
      if (isDiving) return;
      window.clearInterval(trailTimer);
      window.clearTimeout(moveTimer);
      const matrix = new DOMMatrixReadOnly(getComputedStyle(penguin).transform);
      current = { x: matrix.m41, y: matrix.m42 };
      destination = current;
      penguin.style.transitionDuration = '0ms';
      penguin.style.transform = `translate3d(${current.x}px, ${current.y}px, 0)`;
    };
    const resumePatrolIfReady = () => {
      if (isDiving || isPaused || guideOpen) return;
      window.clearTimeout(moveTimer);
      moveTimer = window.setTimeout(move, 120);
    };
    penguin.addEventListener('pointerenter', () => {
      isPaused = true;
      pausePatrol();
    });
    penguin.addEventListener('pointerleave', () => {
      isPaused = false;
      resumePatrolIfReady();
    });
    penguin.addEventListener('penguin-guide-change', event => {
      guideOpen = Boolean(event.detail?.open);
      if (guideOpen) pausePatrol();
      else resumePatrolIfReady();
    });

    const stopPatrol = () => {
      window.clearInterval(trailTimer);
      window.clearTimeout(moveTimer);
      const matrix = new DOMMatrixReadOnly(getComputedStyle(penguin).transform);
      current = { x: matrix.m41, y: matrix.m42 };
      destination = current;
      jumpStart = { ...current };
      penguin.style.transitionDuration = '0ms';
    };
    const resumePatrol = () => {
      if (!isDiving) return;
      isDiving = false;
      jumpStart = null;
      hero.style.setProperty('--dive-progress', '0');
      penguin.classList.remove('is-diving', 'is-submerged');
      penguinSplash?.classList.remove('is-visible');
      if (!isPaused && !guideOpen) moveTimer = window.setTimeout(move, 100);
    };
    const updateDive = () => {
      const viewport = Math.max(window.innerHeight, 1);
      const startRatio = .2;
      const spanRatio = .3;
      const sequenceTop = diveSequence.getBoundingClientRect().top + window.scrollY;
      const progress = Math.min(1, Math.max(0, (window.scrollY - sequenceTop - viewport * startRatio) / (viewport * spanRatio)));
      hero.style.setProperty('--dive-progress', progress.toFixed(4));
      if (progress <= 0) {
        resumePatrol();
        lastScrollY = window.scrollY;
        return;
      }
      if (!isDiving) {
        isDiving = true;
        stopPatrol();
      }
      const start = jumpStart || current;
      const target = { x: penguinStage.clientWidth * .74 - penguinSize() * .5, y: penguinStage.clientHeight * .91 };
      const x = start.x + (target.x - start.x) * progress;
      const linearY = start.y + (target.y - start.y) * progress;
      const arc = Math.sin(progress * Math.PI) * penguinStage.clientHeight * .3;
      const y = linearY - arc;
      const movingRight = x >= start.x;
      penguin.src = movingRight ? poses.right : poses.left;
      penguin.classList.toggle('is-diving', progress > .02);
      penguin.classList.toggle('is-submerged', progress > .9);
      placePenguin({ x, y });
      if (progress > .72 && progress < .99) penguinSplash?.classList.add('is-visible');
      else penguinSplash?.classList.remove('is-visible');
      lastScrollY = window.scrollY;
    };
    let ticking = false;
    window.addEventListener('scroll', () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(() => {
        updateDive();
        ticking = false;
      });
    }, { passive: true });
    window.addEventListener('resize', updateDive);
    updateDive();
  }
  const items = content.items || [];
  const featuredOrder = ['delight-insight-2026', 'floreter', 'naver-map', 'moa'];
  const categoryLabels = { all: 'All', 'service-planning': '기획서', 'service-improvement': '리뉴얼', proposal: '제안서', report: '보고서', storyboard: '스토리보드' };
  const projectUrl = (item, filter = 'all') => `${item.detailPath}?from=${encodeURIComponent(filter)}`;
  const availableProjects = new Set(['naver-map', 'delight-insight-2026']);
  const isAvailable = item => availableProjects.has(item.id);
  const period = item => item.period?.trim().replace(/[\u2013\u2014]/g, '~') || '기간 미등록';
  const label = item => window.siteCatalog?.label(item) || (item.kind === 'storyboard' ? '스토리보드' : item.keywords?.[0] || '');
  const visual = item => item.thumbnail?.src
    ? `<figure class="project-visual has-image"><img src="${item.thumbnail.src}" alt="${item.thumbnail.alt || ''}" /></figure>`
    : `<figure class="project-visual visual-${item.id}"><span>${item.name}</span><i aria-hidden="true"></i></figure>`;
  const selectedCard = (item, index) => `<article class="selected-item${isAvailable(item) ? '' : ' is-pending'}"><a href="${projectUrl(item)}" aria-label="${item.name} ${isAvailable(item) ? '프로젝트 보러가기' : '준비 중 안내 보기'}"><div class="project-meta"><span><small>No.</small><b>${String(index + 1).padStart(2, '0')}</b></span><span><small>Type</small><b>${label(item)}</b></span><span><small>Period</small><b>${period(item).replace('~', '<br />~ ')}</b></span></div>${visual(item)}<div class="project-copy"><h3>${item.name}</h3><p>${item.shortIntro || item.summary}</p><p class="project-role"><span>Role</span><b>${item.role || ''}</b></p>${isAvailable(item) ? '<span class="project-link">프로젝트 보러가기 &gt;</span>' : '<span class="project-status">준비 중</span>'}</div></a></article>`;

  const selected = document.querySelector('#selected-list');
  if (selected) {
    const ordered = [...featuredOrder.map(id => items.find(item => item.id === id)).filter(Boolean), ...items.filter(item => !featuredOrder.includes(item.id))];
    const initial = Math.min(4, ordered.length);
    selected.innerHTML = ordered.slice(0, initial).map(selectedCard).join('');
    const more = document.querySelector('.selected-more');
    if (more && ordered.length > initial) {
      more.hidden = false;
      more.addEventListener('click', () => {
        selected.insertAdjacentHTML('beforeend', ordered.slice(initial).map((item, index) => selectedCard(item, initial + index)).join(''));
        more.setAttribute('aria-expanded', 'true');
        more.hidden = true;
        selected.children[initial]?.querySelector('a')?.focus({ preventScroll: true });
      }, { once: true });
    }
  }

  const list = document.querySelector('#minimal-projects');
  const filters = document.querySelector('#minimal-filters');
  const count = document.querySelector('#minimal-count');
  if (list && filters) {
    let active = 'all';
    filters.innerHTML = Object.entries(categoryLabels).map(([key, value]) => `<button type="button" data-filter="${key}" aria-pressed="${key === active}">${value}</button>`).join('');
    const matches = item => active === 'all' || (active === 'storyboard' ? item.kind === 'storyboard' : item.kind === 'project' && item.categories?.includes(active));
    const render = () => {
      const visible = items.filter(matches);
      count.textContent = `${String(visible.length).padStart(2, '0')} projects`;
      list.innerHTML = visible.map((item, index) => `<article class="catalog-item${isAvailable(item) ? '' : ' is-pending'}"><a href="${projectUrl(item, active)}" aria-label="${item.name} ${isAvailable(item) ? '프로젝트 보러가기' : '준비 중 안내 보기'}">${visual(item)}<div class="catalog-info"><span class="catalog-number">${String(index + 1).padStart(2, '0')}</span><span class="catalog-type">${label(item)}</span><span class="catalog-period">${period(item)}</span><h2 class="catalog-name">${item.name}</h2><p class="catalog-summary">${item.shortIntro || item.summary}</p>${isAvailable(item) ? '' : '<span class="project-status">준비 중</span>'}</div></a></article>`).join('');
    };
    filters.addEventListener('click', event => {
      const button = event.target.closest('button[data-filter]');
      if (!button) return;
      active = button.dataset.filter;
      filters.querySelectorAll('button').forEach(item => item.setAttribute('aria-pressed', String(item === button)));
      render();
    });
    render();
  }

  const observer = new IntersectionObserver(entries => entries.forEach(entry => entry.isIntersecting && entry.target.classList.add('is-visible')), { threshold: 0.12 });
  document.querySelectorAll('.selected-item, .intro, .closing, .catalog-item').forEach(element => observer.observe(element));
})();
