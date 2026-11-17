// Carry the actual F and P positions into the home link as the page scrolls.
(() => {
  const title = document.getElementById('hero-title');
  const mark = document.querySelector('.site-header .brand-mark');
  if (!title || !mark || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const initials = [...title.querySelectorAll('.wordmark-initial')];
  if (initials.length !== 2) return;
  const layer = document.createElement('div');
  layer.className = 'wordmark-flight'; layer.setAttribute('aria-hidden', 'true');
  const letters = initials.map(source => {
    const letter = document.createElement('span'); letter.textContent = source.textContent;
    layer.append(letter); return letter;
  });
  document.body.append(layer);
  document.body.classList.add('wordmark-morph');
  const copy = title.parentElement;
  const nav = document.querySelector('.site-header .site-nav');
  let origins = null;
  let pending = false;
  const ease = t => t * t * (3 - 2 * t);
  function measure() {
    const size = parseFloat(getComputedStyle(title).fontSize);
    const first = initials[0].getBoundingClientRect();
    const titleBox = title.getBoundingClientRect();
    const baselineOffset = first.top - titleBox.top;
    origins = initials.map(el => {
      const rect = el.getBoundingClientRect();
      // Hero copy is in a pinned scene whose camera offset changes while scrolling.
      return {x:rect.left,y:rect.top - (copy.getBoundingClientRect().top - copy.offsetTop),size};
    });

  }
  function draw() {
    pending = false;
    if (!origins) measure();
    const raw = Math.min(1, Math.max(0, window.scrollY / Math.min(280, innerHeight * .38)));
    const p = ease(raw);
    const destination = mark.getBoundingClientRect();
    const targetSize = parseFloat(getComputedStyle(mark).fontSize);
    // Measure the target initials in the same font so spacing stays continuous.
    letters.forEach((letter, i) => {
      const origin = origins[i];
      const x = destination.left + (i ? targetSize * .56 : 0);
      const y = destination.top;
      letter.style.fontSize = `${origin.size}px`;
      letter.style.transform = `translate3d(${origin.x + (x-origin.x)*p}px,${origin.y + (y-origin.y)*p}px,0) scale(${1+(targetSize/origin.size-1)*p})`;
      letter.style.color = '#000';
    });
    title.style.setProperty('--wordmark-rest-opacity', String(1-Math.min(1,raw*2.2)));
    copy.style.setProperty('--intro-opacity', String(1-Math.min(1,raw*1.7)));
    document.body.classList.toggle('wordmark-arrived', raw >= 1);
  }
  const request = () => {if (!pending) {pending=true; requestAnimationFrame(draw);}};
  addEventListener('scroll', request, {passive:true});
  addEventListener('resize', () => {origins=null;request();});
  if (document.fonts?.ready) document.fonts.ready.then(() => {origins=null;request();});
  request();
})();
