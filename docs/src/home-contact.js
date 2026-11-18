const homeContactHost = document.querySelector('[data-home-contact]');
if (homeContactHost) {
  const profile = window.siteContent.profile;
  const links = [];
  if (profile.email) links.push({ label: `EMAIL`, href: `mailto:${profile.email}` });
  if (profile.phone) links.push({ label: 'PHONE', href: `tel:${profile.phone.replace(/[^+0-9]/g, '')}` });
  (profile.sns || []).forEach((item) => { if (item?.url) links.push({ label: `${item.label || 'SNS'}`, href: item.url, external: true }); });
  if (profile.behance) links.push({ label: 'BEHANCE', href: profile.behance, external: true });
  links.forEach(({ label, href, external }) => {
    const link = window.siteUtils.makeLink(label, href, external);
    const text = document.createElement('span'); text.textContent = label;
    const arrow = document.createElement('span'); arrow.textContent = '↗'; arrow.setAttribute('aria-hidden', 'true');
    link.replaceChildren(text, arrow); homeContactHost.append(link);
  });
}

