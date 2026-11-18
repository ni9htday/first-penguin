(() => {
  const footer = document.querySelector('footer.minimal-footer, footer.site-footer');
  if (!footer) return;
  const profile = window.siteContent?.profile;
  const prefix = location.pathname.includes('/details/') ? '../' : './';
  const create = (tag, className, text) => {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (text) element.textContent = text;
    return element;
  };
  const link = (label, href, external = false) => {
    const element = create('a', '', label);
    element.href = href;
    if (external) { element.target = '_blank'; element.rel = 'noopener noreferrer'; }
    return element;
  };
  footer.className = 'site-colophon';
  footer.replaceChildren();
  const inner = create('div', 'colophon-inner');
  const copy = create('div', 'colophon-copy');
  copy.append(
    create('p', '', '작은 신호를 발견하고 더 나은 경험으로 연결하는 과정을 기록합니다.')
  );
  const linkedin = profile?.sns?.find(item => item.label === 'LINKEDIN' && item.url);
  const notion = profile?.sns?.find(item => item.label === 'NOTION' && item.url);
  const explore = create('nav', 'colophon-links');
  explore.setAttribute('aria-label', '외부 링크');
  explore.append(create('h2', '', 'Connect'));
  if (linkedin) explore.append(link('LinkedIn ↗', linkedin.url, true));
  if (notion) explore.append(link('Notion ↗', notion.url, true));
  const header = document.querySelector('header.minimal-header, header.site-header');
  if (header) {
    const contact = create('nav', 'header-contact');
    contact.setAttribute('aria-label', '연락처');
    const direct = create('div', 'header-contact-group');
    if (profile?.email) direct.append(link(profile.email, `mailto:${profile.email}`));
    if (profile?.phone) direct.append(link(profile.phone, `tel:${profile.phone.replace(/[^+0-9]/g, '')}`));
    contact.append(direct);
    header.append(contact);
  }
  const bottom = create('div', 'colophon-bottom');
  bottom.append(create('span', '', '© 2026 FIRST PENGUIN'), create('span', '', 'MADE TO EXPLORE'));
  inner.append(copy, explore, bottom);
  {
    footer.classList.add('has-pool');
    const pool = create('div', 'footer-pool');
    pool.setAttribute('aria-hidden', 'true');
    for (let i = 1; i <= 3; i += 1) {
      const lane = create('div', `footer-swimmer footer-swimmer-${i}`);
      const swimmer = create('img', 'footer-swimmer-image');
      swimmer.src = `${prefix}assets/penguin/${i === 1 ? 'pg_run_to_R-v3.svg' : 'pixel-fish.svg'}`;
      swimmer.alt = '';
      lane.append(swimmer);
      pool.append(lane);
    }
    for (let i = 1; i <= 7; i += 1) pool.append(create('i', `footer-bubble footer-bubble-${i}`));
    footer.append(pool);
  }
  footer.append(inner);
})();
