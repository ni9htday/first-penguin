const movablePenguin = document.querySelector('.penguin');
const penguinHint = document.querySelector('#penguin-hint');
let penguinRatio = .69;
let penguinDragId = null;
let penguinPress = null;
let penguinAtRightEdge = false;
let penguinAtLeftEdge = false;
let penguinIdleOffset = 0;
let penguinIdleStopped = false;
const penguinIdleStartedAt = performance.now();
const ridge = window.heroMotion.ridge;
window.v2PenguinPosition = () => {
  const svg = document.querySelector('.iceberg');
  const matrix = svg.getScreenCTM();
  if (!matrix) return null;
  const rect = scene.getBoundingClientRect();
  const xScreen = rect.left + scene.clientWidth * (penguinRatio + penguinIdleOffset);
  const svgX = new DOMPoint(xScreen, rect.top).matrixTransform(matrix.inverse()).x;
  const onRidge = window.heroMotion.ridgePoint(svgX);
  const ground = new DOMPoint(onRidge.x, onRidge.y).matrixTransform(matrix);
  const height = movablePenguin.getBoundingClientRect().height;
  return { x: ground.x - rect.left, y: ground.y - rect.top - height * .5 };
};
function alignPenguinHint() {
  const penguinBounds = movablePenguin.getBoundingClientRect();
  const parentBounds = penguinHint.offsetParent?.getBoundingClientRect();
  if (!parentBounds) return;
  penguinHint.style.left = `${penguinBounds.left + penguinBounds.width / 2 - parentBounds.left}px`;
  penguinHint.style.top = `${penguinBounds.top - parentBounds.top - 14}px`;
}
movablePenguin.addEventListener('pointerenter', alignPenguinHint);
movablePenguin.addEventListener('focus', alignPenguinHint);
function stopPenguinIdle() {
  penguinIdleStopped = true;
  penguinRatio += penguinIdleOffset;
  penguinIdleOffset = 0;
}
function movePenguin(ratio) {
  stopPenguinIdle();
  penguinRatio = Math.max(.08, Math.min(.92, ratio));
  penguinAtRightEdge = ratio >= .90;
  penguinAtLeftEdge = ratio <= .10;
  movablePenguin.setAttribute('aria-valuenow', Math.round(penguinRatio * 100));
  movablePenguin.setAttribute('aria-valuetext', `빙산 위 ${Math.round(penguinRatio * 100)}% 위치`);
  requestHeroUpdate();
}
movablePenguin.addEventListener('pointerdown', (event) => {
  if (movablePenguin.getAttribute('aria-disabled') === 'true') return;
  event.preventDefault();
  movablePenguin.focus({ preventScroll: true });
  stopPenguinIdle();
  penguinDragId = event.pointerId;
  penguinPress = {x:event.clientX,y:event.clientY,moved:false};
  movablePenguin.setPointerCapture(event.pointerId);
  scene.classList.add('is-penguin-dragging');
  penguinHint.textContent = '빙산 위에서 좌우로 움직여 보세요';
});
movablePenguin.addEventListener('pointermove', (event) => {
  if (penguinDragId !== event.pointerId) return;
  if (penguinPress && Math.hypot(event.clientX-penguinPress.x,event.clientY-penguinPress.y)>6) penguinPress.moved = true;
  movePenguin((event.clientX - scene.getBoundingClientRect().left) / scene.clientWidth);
});
function showPenguinSplash() {
  if (reducedMotion.matches) return;
  const bounds = movablePenguin.getBoundingClientRect();
  const parent = movablePenguin.parentElement;
  const parentBounds = parent.getBoundingClientRect();
  const splash = document.createElement('span'); splash.className = 'penguin-splash'; splash.setAttribute('aria-hidden', 'true');
  splash.style.left = `${bounds.left + bounds.width/2 - parentBounds.left}px`;
  splash.style.top = `${bounds.top + bounds.height*.65 - parentBounds.top}px`;
  parent.append(splash);
  setTimeout(() => splash.remove(), 750);
}
function releasePenguin(event) {
  const releasedPointerDrag = penguinDragId !== null;
  penguinDragId = null;
  if (releasedPointerDrag) {
    if (event?.type === 'pointerup' && penguinPress && !penguinPress.moved) showPenguinSplash();
    movablePenguin.blur();
  }
  penguinPress = null;
  scene.classList.remove('is-penguin-dragging');
  penguinHint.textContent = '잡고 움직여 보세요\n스크롤하면 물속으로 뛰어들어요';
  if (Number(scene.style.getPropertyValue('--progress')) <= .16) {
    if (penguinAtRightEdge) turnPenguinLeft();
    else if (penguinAtLeftEdge) turnPenguinRight();
  }
}
movablePenguin.addEventListener('pointerup', releasePenguin);
movablePenguin.addEventListener('pointercancel', releasePenguin);
movablePenguin.addEventListener('lostpointercapture', releasePenguin);
movablePenguin.addEventListener('keydown', (event) => {
  if (['Enter',' '].includes(event.key) && movablePenguin.getAttribute('aria-disabled') !== 'true') { event.preventDefault(); showPenguinSplash(); return; }
  if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key) || Number(scene.style.getPropertyValue('--progress')) > .16) return;
  event.preventDefault();
  movePenguin(event.key === 'Home' ? .08 : event.key === 'End' ? .92 : penguinRatio + (event.key === 'ArrowLeft' ? -.03 : .03));
  if (penguinAtRightEdge) turnPenguinLeft();
  else if (penguinAtLeftEdge) turnPenguinRight();
});
window.addEventListener('scroll', () => {
  if (window.scrollY > 8 && !penguinIdleStopped) stopPenguinIdle();
}, { passive:true });
scene.addEventListener('hero:frame', (event) => {
  const active = event.detail.interactive;
  movablePenguin.tabIndex = active ? 0 : -1;
  movablePenguin.setAttribute('aria-disabled', String(!active));
  if (!active) {
    if (penguinDragId !== null && movablePenguin.hasPointerCapture(penguinDragId)) movablePenguin.releasePointerCapture(penguinDragId);
    releasePenguin();
    movablePenguin.classList.toggle('is-facing-left', event.detail.facingLeft);
  } else if (penguinAtRightEdge) movablePenguin.classList.add('is-facing-left');
  alignPenguinHint();
});
requestHeroUpdate();

// Gentle ridge-following movement invites interaction on the opening scene.
function animatePenguinIdle(now) {
  if (penguinIdleStopped || reducedMotion.matches) return;
  const elapsed = (now - penguinIdleStartedAt) / 1000;
  const ramp = Math.min(1, elapsed / .35);
  penguinIdleOffset = Math.sin(elapsed * Math.PI * 2 / 1.8) * (20 / Math.max(1, scene.clientWidth)) * ramp;
  requestHeroUpdate();
  requestAnimationFrame(animatePenguinIdle);
}
requestAnimationFrame(animatePenguinIdle);
reducedMotion.addEventListener('change', stopPenguinIdle);

function turnPenguinLeft() {
  penguinAtRightEdge = false;
  movablePenguin.classList.add('is-facing-left');
  penguinHint.textContent = '왼쪽을 바라봤어요. 다시 움직여 보세요';
}

function turnPenguinRight() {
  penguinAtLeftEdge = false;
  movablePenguin.classList.remove('is-facing-left');
  penguinHint.textContent = '오른쪽을 바라봤어요. 다시 움직여 보세요';
}
