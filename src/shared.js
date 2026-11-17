const menuButton = document.querySelector('.menu-toggle');
const nav = document.querySelector('.site-nav');
const pageTopButton = document.querySelector('#top-button');
const prefersReducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
pageTopButton.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: prefersReducedMotion.matches ? 'auto' : 'smooth' });
  document.querySelector('.brand').focus({ preventScroll: true });
});
if (!document.querySelector('.hero')) {
  const updateTopButton = () => {
    const visible = window.scrollY > 240;
    pageTopButton.classList.toggle('is-visible', visible);
    pageTopButton.tabIndex = visible ? 0 : -1;
    pageTopButton.setAttribute('aria-hidden', String(!visible));
  };
  addEventListener('scroll', updateTopButton, { passive: true });
  updateTopButton();
}
const innerContact = document.querySelector('.inner-page .contact-section');
if (innerContact) {
  const header = document.querySelector('.site-header');
  const updateHeaderContrast = () => {
    const bounds = innerContact.getBoundingClientRect();
    header.classList.toggle('is-over-dark', bounds.top < header.offsetHeight && bounds.bottom > 0);
  };
  addEventListener('scroll', updateHeaderContrast, { passive: true });
  addEventListener('resize', updateHeaderContrast);
  updateHeaderContrast();
}

const panelNavigation = document.body.classList.contains('editorial-site');
if (panelNavigation) { document.body.classList.add('panel-nav-site'); document.body.append(nav); }
const menuBackdrop = document.createElement('div');
menuBackdrop.className = 'menu-backdrop';
menuBackdrop.hidden = true;
menuBackdrop.setAttribute('aria-hidden', 'true');
if (panelNavigation) document.body.append(menuBackdrop);
const menuClose = document.createElement('button');
menuClose.type = 'button';
menuClose.className = 'menu-close';
menuClose.setAttribute('aria-label', '메뉴 닫기');
menuClose.innerHTML = '<span></span><span></span>';
if (panelNavigation) nav.prepend(menuClose);
nav.inert = true;
const pageContent = [...document.querySelectorAll('main, .site-footer')];
const previousInert = new Map();
function closeMenu() {
  menuButton.setAttribute('aria-expanded', 'false');
  menuButton.setAttribute('aria-label', '메뉴 열기');
  nav.classList.remove('is-open');
  nav.inert = true;
  menuBackdrop.hidden = true;
  document.body.classList.remove('menu-open');
  pageContent.forEach(element => { if (previousInert.has(element)) element.inert = previousInert.get(element); });
  previousInert.clear();
}
menuButton.addEventListener('click', () => {
  if (menuButton.getAttribute('aria-expanded') === 'true') { closeMenu(); return; }
  menuButton.setAttribute('aria-expanded', 'true');
  menuButton.setAttribute('aria-label', '메뉴 닫기');
  nav.classList.add('is-open');
  nav.inert = false;
  menuBackdrop.hidden = false;
  document.body.classList.toggle('menu-open', panelNavigation);
  if (panelNavigation) pageContent.forEach(element => { previousInert.set(element, element.inert); element.inert = true; });
  nav.querySelector('a')?.focus();
});
menuClose.addEventListener('click', () => { closeMenu(); menuButton.focus(); });
nav.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
document.addEventListener('keydown', event => {
  if (menuButton.getAttribute('aria-expanded') !== 'true') return;
  if (event.key === 'Tab') {
    const controls = [menuButton, ...nav.querySelectorAll('a')];
    const index = controls.indexOf(document.activeElement);
    if (event.shiftKey && index <= 0) { event.preventDefault(); controls.at(-1).focus(); }
    else if (!event.shiftKey && (index === controls.length - 1 || index < 0)) { event.preventDefault(); controls[0].focus(); }
  }
  if (event.key === 'Escape') { closeMenu(); menuButton.focus(); }
});
document.addEventListener('pointerdown', event => {
  if (!nav.contains(event.target) && !menuButton.contains(event.target) && menuButton.getAttribute('aria-expanded') === 'true') {
    closeMenu(); menuButton.focus();
  }
});

// Always-visible contact details and two direct navigation links.
if (panelNavigation) {
  document.body.classList.remove('panel-nav-site');
  document.body.classList.add('contact-header-site');
  const header = document.querySelector('.site-header');
  const prefix = new URL(location.href).pathname.includes('/details/') ? '../' : '';
  const brand = header.querySelector('.brand');
  brand.href = `${prefix}index-v2.html`; brand.setAttribute('aria-label', '홈으로 이동');
  brand.replaceChildren();
  const mark = document.createElement('span'); mark.className = 'brand-mark'; mark.textContent = 'FP'; mark.setAttribute('aria-hidden', 'true'); const registered = document.createElement('sup'); registered.className = 'brand-registered'; registered.textContent = '®'; mark.append(registered); brand.append(mark);
  menuButton.hidden = true; menuButton.tabIndex = -1;
  nav.replaceChildren();
  const pathname = new URL(location.href).pathname;
  for (const [label, href, active] of [['Project', `${prefix}projects.html`, /projects|details/.test(pathname)], ['Information', `${prefix}profile.html`, pathname.includes('profile')]]) {
    const link = document.createElement('a'); link.textContent = label; link.href = href;
    if (active) link.setAttribute('aria-current', 'page'); nav.append(link);
  }
  nav.inert = false; header.append(nav);
}

// Fine pointers get an ice-glass cursor with contextual action symbols.
if (panelNavigation && matchMedia('(hover: hover) and (pointer: fine)').matches && !prefersReducedMotion.matches) {
  const cursor = document.createElement('div');
  cursor.className = 'inversion-cursor';
  cursor.setAttribute('aria-hidden', 'true');
  document.body.append(cursor);
  const hideCursor = () => document.body.classList.remove('cursor-ready');
  document.addEventListener('pointermove', event => {
    if (event.pointerType === 'touch') { hideCursor(); return; }
    cursor.style.left = `${event.clientX}px`;
    cursor.style.top = `${event.clientY}px`;
    const target = event.target;
    const rail = target.closest('#featured-grid, [data-horizontal-scroll]');
    const action = target.closest('a, button, summary, [role="button"], .penguin');
    let symbol = '';
    if (rail && rail.scrollWidth > rail.clientWidth + 2) symbol = '← →';
    else if (action) {
      if (action.matches('summary')) symbol = action.parentElement.open ? '−' : '+';
      else if (action.matches('.menu-close')) symbol = '×';
      else if (action.hasAttribute('download')) symbol = '↓';
      else if (action.matches('#top-button')) symbol = '↑';
      else if (action.matches('.menu-toggle')) symbol = action.getAttribute('aria-expanded') === 'true' ? '×' : '=';
      else if (action.matches('.penguin')) symbol = '↔';
      else symbol = action.matches('a[target="_blank"], a[href^="mailto:"], a[href^="tel:"]') ? '↗' : '>';
    }
    cursor.textContent = symbol;
    cursor.classList.toggle('is-link', Boolean(symbol));
    document.body.classList.add('cursor-ready');
  }, { passive: true });
  document.documentElement.addEventListener('pointerleave', hideCursor);
  document.addEventListener('pointercancel', hideCursor);
  addEventListener('blur', hideCursor);
}

window.siteUtils = {
  create(tag, className, text) {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (text !== undefined) element.textContent = text;
    return element;
  },
  makeLink(label, href, external = false) {
    const link = document.createElement('a');
    link.textContent = `${label} ↗`;
    link.href = href;
    if (external) { link.target = '_blank'; link.rel = 'noopener noreferrer'; }
    return link;
  },
};

// Shared footer uses the same supplied profile information on every page.
if (document.body.classList.contains('editorial-site')) {
  const footer = document.querySelector('.site-footer');
  if (footer) {
    const prefix = new URL(location.href).pathname.includes('/details/') ? '../' : '';
    const profile = window.siteContent.profile;
    const make = window.siteUtils.create;
    const link = (label, href) => { const element = make('a', '', label); element.href = href; return element; };
    footer.classList.add('editorial-footer'); footer.replaceChildren();
    const middle = make('div', 'footer-row footer-links');
    const title = make('h2', '', 'Quick links');
    const nav = make('nav', 'footer-nav'); nav.setAttribute('aria-label', '푸터 바로가기');
    nav.append(link('Project >', `${prefix}projects.html`), link('Information >', `${prefix}profile.html`));
    if (profile.email) nav.append(link('Email ↗', `mailto:${profile.email}`));
    if (profile.phone) nav.append(link('Phone ↗', `tel:${profile.phone.replace(/[^+0-9]/g,'')}`));
    middle.append(title, nav);
    const bottom = make('div', 'footer-row footer-bottom');
    const copyright = make('div', 'footer-copyright');
    copyright.append(make('p', '', '© 2026 FIRST PENGUIN'), make('p', '', 'MADE TO EXPLORE'));
    const note = make('p', 'footer-note', '프로젝트의 기획 과정과 결과를 기록합니다.');
    bottom.append(copyright, note); footer.append(middle, bottom);
  }
}
