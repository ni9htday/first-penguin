const $ = (selector) => document.querySelector(selector);
const featuredGrid = $("#featured-grid");
const featuredItems = (window.siteContent.featuredOrder || []).map(id => window.siteContent.items.find(item => item.id === id)).filter(Boolean).slice(0, 3);
if (featuredItems.length) {
  featuredItems.forEach((item) => {
    const card = document.createElement(item.detailPath ? "a" : "article");
    card.className = "project-card";
    if (item.detailPath) card.href = item.detailPath;
    const visual = document.createElement("div");
    visual.className = "project-visual";
    if (!item.thumbnail?.src) {
      const index = document.createElement('span'); index.className = 'project-cover-index'; index.textContent = String(featuredGrid.children.length + 1).padStart(2, '0');
      const name = document.createElement('span'); name.className = 'project-cover-name'; name.textContent = item.name;
      visual.append(index, name); visual.setAttribute('aria-hidden', 'true');
    }
    if (item.thumbnail?.src) { const img = document.createElement("img"); img.src = item.thumbnail.src; img.alt = item.thumbnail.alt || ""; img.loading = "lazy"; visual.append(img); }
    const info = document.createElement("div"); info.className = "project-info";
    const heading = document.createElement("h3"); heading.textContent = item.title; const meta = document.createElement('p'); meta.className = 'project-meta'; meta.textContent = window.siteCatalog.label(item); info.append(meta, heading);
    if (item.summary) { const summary = document.createElement("p"); summary.className = "project-summary"; summary.textContent = item.shortIntro || item.summary.split(/(?<=[.!?。])\s/)[0]; info.append(summary); }
    card.append(visual, info); featuredGrid.append(card);
  });
} else {
  const empty = document.createElement("div"); empty.className = "empty-state";
  empty.innerHTML = "<span class=\"empty-symbol\" aria-hidden=\"true\">✳</span><strong>대표 프로젝트를 준비하고 있습니다.</strong>";
  featuredGrid.append(empty);
}

const hero = $('.hero');
const scene = $('.hero-sticky');
const siteHeader = $('.site-header');
const topButton = $('#top-button');
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
let ticking = false;
let displayedProgress = null;
let heroLastFrame = null;
let heroLaunchPosition = null;
const clamp01 = (value) => Math.min(1, Math.max(0, value));
const lerp = (start, end, progress) => start + (end - start) * progress;
const smoothstep = (start, end, value) => {
  const t = clamp01((value - start) / (end - start));
  return t * t * (3 - 2 * t);
};
function setTopButtonVisible(visible) {
  topButton.classList.toggle('is-visible', visible);
  topButton.tabIndex = visible ? 0 : -1;
  topButton.setAttribute('aria-hidden', String(!visible));
}
function requestHeroUpdate() {
  if (ticking) return;
  ticking = true;
  requestAnimationFrame(updateHero);
}
function updateHero(timestamp = performance.now()) {
  ticking = false;
  if (reducedMotion.matches && window.heroMotion) {
    renderV2Hero(window.heroMotion.frame(0, { width: scene.clientWidth, height: scene.clientHeight, start: window.v2PenguinPosition?.() }));
    scene.dataset.heroPhase = 'static';
    siteHeader.classList.remove('is-over-dark');
    setTopButtonVisible(hero.getBoundingClientRect().bottom < innerHeight * .75);
    return;
  }
  if (reducedMotion.matches) {
    siteHeader.classList.toggle('is-over-dark', hero.getBoundingClientRect().bottom > siteHeader.offsetHeight);
    setTopButtonVisible(hero.getBoundingClientRect().bottom < innerHeight * .75);
    return;
  }
  const rect = hero.getBoundingClientRect();
  const range = Math.max(1, hero.offsetHeight - scene.clientHeight);
  const targetProgress = clamp01(-rect.top / range);
  if (window.heroMotion) {
    const delta = heroLastFrame === null ? 16.67 : Math.max(0, timestamp - heroLastFrame);
    heroLastFrame = timestamp;
    displayedProgress = window.heroMotion.settle(displayedProgress, targetProgress, delta);
    const progress = displayedProgress;
    if (progress <= .16 || !heroLaunchPosition) heroLaunchPosition = window.v2PenguinPosition?.() || { x: scene.clientWidth * .69, y: scene.clientHeight * .48 };
    const state = window.heroMotion.frame(progress, { width: scene.clientWidth, height: scene.clientHeight, start: heroLaunchPosition, characterWidth: scene.clientWidth <= 767 ? 80 : 100, characterHeight: scene.clientWidth <= 767 ? 105 : 140 });
    renderV2Hero(state);
    siteHeader.classList.toggle('is-over-dark', rect.bottom > siteHeader.offsetHeight && state.headerDark && (document.getElementById('about')?.getBoundingClientRect().top ?? Infinity) > siteHeader.offsetHeight);
    setTopButtonVisible(state.topVisible);
    if (displayedProgress !== targetProgress) requestHeroUpdate();
    return;
  }
  displayedProgress = displayedProgress === null ? targetProgress : lerp(displayedProgress, targetProgress, .22);
  if (Math.abs(targetProgress - displayedProgress) < .0005) displayedProgress = targetProgress;
  const progress = displayedProgress;
  const underwater = smoothstep(.47, .85, progress);
  const submerge = smoothstep(.38, .81, progress);
  siteHeader.classList.toggle('is-over-dark', rect.bottom > siteHeader.offsetHeight && submerge > .45);
  const dive = smoothstep(.2, .62, progress);
  const swim = clamp01((progress - .62) / .08);
  const shelf = smoothstep(.78, .95, progress);
  const bodyReveal = smoothstep(.54, .84, progress);
  const diveLabel = Math.max(0, Math.min(1, (progress - .19) / .1, (.5 - progress) / .08));
  const revealLabel = Math.min(1, Math.max(0, (progress - .73) / .13));
  const width = scene.clientWidth;
  const height = scene.clientHeight;
  const mobile = width <= 767;
  const interactiveStart = window.v2PenguinPosition?.();
  const startX = interactiveStart?.x ?? width * (mobile ? .7 : .69);
  const startY = interactiveStart?.y ?? height * (mobile ? .53 : .48);
  const diveX = width * (mobile ? .82 : .79);
  const diveY = height * (mobile ? .76 : .73) - height * (mobile ? .16 : .14) * smoothstep(.47, .85, .62);
  const standX = width * (mobile ? .2 : .165);
  const standY = height * .64;
  let x, y, angle, visible = 1;
  if (progress <= .62) {
    x = lerp(startX, diveX, dive);
    y = startY + height * (mobile ? .23 : .25) * dive - height * (mobile ? .16 : .14) * underwater;
    angle = 115 * dive;
  } else if (progress < .7) {
    x = lerp(diveX, width + 120, swim * swim);
    y = lerp(diveY, height * .52, swim);
    angle = lerp(115, 78, clamp01(swim * 2));
  } else if (progress < .72) {
    x = width + 120; y = height * .52; angle = 78; visible = 0;
  } else {
    const enter = smoothstep(.72, .78, progress);
    x = lerp(-90, standX, enter);
    y = standY;
    angle = 0;
  }
  scene.style.setProperty('--progress', progress.toFixed(4));
  scene.style.setProperty('--dive', dive.toFixed(4));
  scene.style.setProperty('--swim', swim.toFixed(4));
  scene.style.setProperty('--shelf', shelf.toFixed(4));
  scene.style.setProperty('--body-reveal', bodyReveal.toFixed(4));
  scene.style.setProperty('--body-wipe', `${((1 - bodyReveal) * 100).toFixed(1)}%`);
  scene.style.setProperty('--penguin-x', `${x.toFixed(1)}px`);
  scene.style.setProperty('--penguin-y', `${y.toFixed(1)}px`);
  scene.style.setProperty('--penguin-angle', `${angle.toFixed(1)}deg`);
  scene.style.setProperty('--penguin-visible', String(visible));
  scene.classList.toggle('is-swimming', progress > .62 && progress < .7);
  scene.classList.toggle('is-waving', progress >= .78 && progress < .82);
  setTopButtonVisible(progress >= .82);
  scene.style.setProperty('--underwater', underwater.toFixed(4));
  scene.style.setProperty('--submerge', submerge.toFixed(4));
  scene.style.setProperty('--dive-label', diveLabel.toFixed(4));
  scene.style.setProperty('--reveal-label', revealLabel.toFixed(4));
  scene.style.setProperty('--copy-opacity', Math.max(0, 1 - progress * 3.6).toFixed(4));
  if (displayedProgress !== targetProgress) requestHeroUpdate();
}
function renderV2Hero(state) {
  const numeric = {
    progress: state.progress, dive: state.dive, swim: state.swim,
    shelf: state.shelf, underwater: state.underwater, submerge: state.submerge,
    'body-reveal': state.bodyReveal, 'dive-label': state.diveLabel,
    'reveal-label': state.revealLabel, 'copy-opacity': state.copyOpacity,
    'cue-opacity': state.cueOpacity, 'light-depth': state.light,
    'scene-parallax': state.parallax, 'penguin-visible': state.visible,
  };
  for (const [property, value] of Object.entries(numeric)) scene.style.setProperty(`--${property}`, value.toFixed(4));
  scene.style.setProperty('--ice-left', `${state.ice.left.toFixed(2)}px`);
  scene.style.setProperty('--ice-top', `${state.ice.top.toFixed(2)}px`);
  scene.style.setProperty('--ice-width', `${state.ice.width.toFixed(2)}px`);
  scene.style.setProperty('--ice-height', `${state.ice.height.toFixed(2)}px`);
  scene.style.setProperty('--surface-y', `${state.surfaceY.toFixed(2)}px`);
  scene.style.setProperty('--body-wipe', `${state.bodyWipe.toFixed(3)}%`);
  scene.style.setProperty('--penguin-x', `${state.x.toFixed(2)}px`);
  scene.style.setProperty('--penguin-y', `${state.y.toFixed(2)}px`);
  scene.style.setProperty('--penguin-angle', `${state.angle.toFixed(2)}deg`);
  scene.dataset.heroPhase = state.phase;
  scene.classList.toggle('is-swimming', state.swimming);
  scene.classList.toggle('is-penguin-arrived', state.progress >= .96);
  scene.classList.toggle('is-waving', state.waving);
  scene.classList.toggle('is-penguin-diving', !state.interactive);
  scene.classList.toggle('is-tip-gone', state.tipGone);
  scene.dispatchEvent(new CustomEvent('hero:frame', { detail: state }));
}
window.addEventListener('scroll', requestHeroUpdate, { passive: true });
window.addEventListener('resize', () => { heroLaunchPosition = null; heroLastFrame = null; requestHeroUpdate(); });
reducedMotion.addEventListener('change', () => { displayedProgress = null; heroLastFrame = null; requestHeroUpdate(); });
updateHero();

const featuredButtons = document.querySelectorAll('[data-featured-direction]');
function updateFeaturedControls() {
  const end = featuredGrid.scrollWidth - featuredGrid.clientWidth;
  featuredButtons.forEach((button) => { button.disabled = Number(button.dataset.featuredDirection) < 0 ? featuredGrid.scrollLeft <= 2 : featuredGrid.scrollLeft >= end - 2; });
}
featuredButtons.forEach((button) => button.addEventListener('click', () => {
  const card = featuredGrid.querySelector('.project-card');
  const distance = card ? card.getBoundingClientRect().width + 24 : featuredGrid.clientWidth;
  featuredGrid.scrollBy({ left: Number(button.dataset.featuredDirection) * distance, behavior: reducedMotion.matches ? 'instant' : 'smooth' });
}));
featuredGrid.addEventListener('scroll', updateFeaturedControls, { passive: true });
window.addEventListener('resize', updateFeaturedControls);
updateFeaturedControls();
