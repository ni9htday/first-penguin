// Drag navigation is scoped to the V2 project rail.
const v2Rail = document.querySelector('#featured-grid');
let v2Drag = null;
let v2SuppressClick = false;
v2Rail.addEventListener('pointerdown', (event) => {
  if (event.pointerType !== 'mouse' || event.button !== 0) return;
  v2SuppressClick = false;
  v2Drag = { id: event.pointerId, x: event.clientX, y: event.clientY, scroll: v2Rail.scrollLeft, moved: false };
});
window.addEventListener('pointermove', (event) => {
  if (!v2Drag || event.pointerId !== v2Drag.id) return;
  const dx = event.clientX - v2Drag.x;
  if (!v2Drag.moved && Math.abs(dx) > 6 && Math.abs(dx) > Math.abs(event.clientY - v2Drag.y)) {
    v2Drag.moved = true;
    v2Rail.classList.add('is-dragging');
    v2Rail.setPointerCapture(event.pointerId);
  }
  if (v2Drag.moved) { event.preventDefault(); v2Rail.scrollLeft = v2Drag.scroll - dx; }
}, { passive: false });
function finishV2Drag(event) {
  if (!v2Drag || event.pointerId !== v2Drag.id) return;
  v2SuppressClick = v2Drag.moved;
  if (v2Rail.hasPointerCapture(event.pointerId)) v2Rail.releasePointerCapture(event.pointerId);
  v2Rail.classList.remove('is-dragging');
  v2Drag = null;
}
window.addEventListener('pointerup', finishV2Drag);
window.addEventListener('pointercancel', finishV2Drag);
v2Rail.addEventListener('dragstart', (event) => event.preventDefault());
v2Rail.addEventListener('click', (event) => {
  if (v2SuppressClick) { event.preventDefault(); event.stopImmediatePropagation(); v2SuppressClick = false; }
}, true);
// Keep the horizontal rail usable without a mouse or touch gesture.
v2Rail.addEventListener('keydown', (event) => {
  if (event.target !== v2Rail || !['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
  event.preventDefault();
  const behavior = matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';
  if (event.key === 'Home' || event.key === 'End') {
    v2Rail.scrollTo({ left: event.key === 'Home' ? 0 : v2Rail.scrollWidth, behavior });
    return;
  }
  const card = v2Rail.querySelector('.project-card');
  const distance = card ? card.getBoundingClientRect().width + 24 : v2Rail.clientWidth;
  v2Rail.scrollBy({ left: event.key === 'ArrowLeft' ? -distance : distance, behavior });
});
