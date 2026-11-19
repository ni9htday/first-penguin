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
  const icons = {
    email: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="1"/><path d="m4 7 8 6 8-6"/></svg>',
    phone: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 3h4l2 5-2.5 2a15 15 0 0 0 5.5 5.5L16 13l5 2v4c0 1-1 2-2 2C10 20 4 14 3 5c0-1 1-2 2-2Z"/></svg>',
    linkedin: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="1"/><circle cx="7.5" cy="8" r="1" fill="currentColor" stroke="none"/><path d="M7.5 11v6M11 17v-6m0 2.5c0-3.5 5-3.5 5 0V17"/></svg>',
    notion: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 3.5h14l2 2v15H6l-2-2z"/><path d="M8 17V8l8 9V8M7 8h3m4 9h3"/></svg>'
  };
  overview.innerHTML = `<figure><img src="${escape(profile.image.src)}" alt="${escape(profile.image.alt)}" width="432" height="540" /></figure><div class="profile-statement"><h2>${escape(profile.name)} <span>Kwon Nayoung</span></h2><p class="profile-role-label">UX Planner</p><address class="profile-contact" aria-label="연락처"><a href="mailto:${escape(profile.email)}" aria-label="이메일 보내기" title="이메일">${icons.email}</a><a href="tel:${escape(profile.phone.replaceAll('-', ''))}" aria-label="전화하기" title="전화">${icons.phone}</a>${linkedin ? `<a href="${escape(linkedin.url)}" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn 열기 (새 탭)" title="LinkedIn">${icons.linkedin}</a>` : ''}${notion ? `<a href="${escape(notion.url)}" target="_blank" rel="noopener noreferrer" aria-label="Notion 열기 (새 탭)" title="Notion">${icons.notion}</a>` : ''}</address><div class="document-links"><a href="${escape(profile.resumePdf)}" target="_blank" rel="noopener noreferrer">이력서 PDF 다운받기</a><a href="${escape(profile.selfIntroductionPdf)}" target="_blank" rel="noopener noreferrer">자기소개서 PDF 다운받기</a></div></div>`;
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
