(() => {
  const content = window.siteContent;
  const experience = window.profileExperience;
  if (!content || !experience) return;
  const profile = content.profile;
  const escape = value => String(value ?? '').replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]);
  const overview = document.querySelector('#profile-overview');
  if (!overview) return;
  const linkedin = (profile.sns || []).find(item => item?.label === 'LINKEDIN' && item.url);
  const notion = (profile.sns || []).find(item => item?.label === 'NOTION' && item.url);
  overview.innerHTML = `<figure><img src="${escape(profile.image.src)}" alt="${escape(profile.image.alt)}" width="432" height="540" /></figure><div class="profile-statement"><h2>${escape(profile.name)} <span>Kwon Nayoung</span></h2><p class="profile-role-label">UX Planner</p><address class="profile-contact"><a href="mailto:${escape(profile.email)}">${escape(profile.email)} <span aria-hidden="true">↗</span></a><a href="tel:${escape(profile.phone.replaceAll('-', ''))}">${escape(profile.phone)} <span aria-hidden="true">↗</span></a>${linkedin ? `<a href="${escape(linkedin.url)}" target="_blank" rel="noopener noreferrer">LinkedIn <span aria-hidden="true">↗</span></a>` : ''}${notion ? `<a href="${escape(notion.url)}" target="_blank" rel="noopener noreferrer">Notion <span aria-hidden="true">↗</span></a>` : ''}</address><div class="document-links"><a href="${escape(profile.resumePdf)}" target="_blank" rel="noopener noreferrer">이력서 PDF 다운받기 <span aria-hidden="true">↗</span></a><a href="${escape(profile.selfIntroductionPdf)}" target="_blank" rel="noopener noreferrer">자기소개서 PDF 다운받기 <span aria-hidden="true">↗</span></a></div></div>`;
  document.querySelector('#profile-role').textContent = profile.role;
  const history = document.querySelector('#minimal-history');
  const historyOrder = ['수상 이력', '경력', '학력', '자격증과 면허'];
  const historyGroups = [...(experience.history || [])].sort((a, b) => {
    const rank = label => { const index = historyOrder.indexOf(label); return index < 0 ? historyOrder.length : index; };
    return rank(a.label) - rank(b.label);
  });
  history.innerHTML = historyGroups.map(group => `<article><h3>${escape(group.label)}</h3><ul>${group.items.map(item => {
    const match = item.match(/^(\d{4}(?:\.\d{2})?(?:~\d{4}(?:\.\d{2})?)?)\s+(.+)$/);
    return match ? `<li class="history-entry"><span class="history-date">${escape(match[1])}</span><span>${escape(match[2])}</span></li>` : `<li class="history-description">${escape(item)}</li>`;
  }).join('')}</ul></article>`).join('');
  const tools = document.querySelector('#minimal-tools');
  const toolGroups = [
    { label: '설계와 협업', names: ['Figma', 'Notion'] },
    { label: '문서와 데이터', names: ['Excel', 'PowerPoint', '한글'] },
    { label: 'AI 활용', names: ['ChatGPT', 'Codex', 'Claude', 'Gemini'] }
  ];
  tools.innerHTML = toolGroups.map(group => {
    const entries = (experience.tools || []).filter(([name]) => group.names.includes(name));
    return `<section class="tool-group"><h3>${escape(group.label)}</h3>${entries.map(([name, action, description]) => `<article><div class="tool-name"><h4>${escape(name)}</h4><span>${escape(action)}</span></div><p>${escape(description)}</p></article>`).join('')}</section>`;
  }).join('');
})();
