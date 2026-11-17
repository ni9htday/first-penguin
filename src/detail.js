const detailItem = window.siteContent.items.find((item) => item.id === document.body.dataset.project);
const detailFilterValues = new Set(window.siteContent.filters.map(([value]) => value));
const detailRequestedFilter = new URLSearchParams(location.search).get('from');
const detailReturnFilter = detailFilterValues.has(detailRequestedFilter) ? detailRequestedFilter : 'all';
const detailBackUrl = new URL('../projects.html', location.href);
if (detailReturnFilter !== 'all') detailBackUrl.searchParams.set('filter', detailReturnFilter);
document.querySelectorAll('[data-list-link]').forEach((link) => { link.href = detailBackUrl.href; });
const detailPath = (path) => /^(https?:|\/)/.test(path) ? path : `../${path}`;
function detailParagraphs(host, value) {
  if (!host || !value) return;
  const values = Array.isArray(value) ? value : [value];
  host.replaceChildren(...values.map((text) => {
    const paragraph = document.createElement('p');
    paragraph.textContent = text;
    return paragraph;
  }));
}
if (detailItem) {
  const titleHost = document.querySelector('.detail-title');
  if (titleHost) titleHost.textContent = detailItem.title;
  document.title = `${detailItem.title}   FIRST PENGUIN`;
  // Facts are displayed once. Empty fact fields never become invented credentials.
  const properties = {
    award: detailItem.award,
    categories: window.siteCatalog.label(detailItem),
    period: detailItem.period,
    summary: detailItem.shortIntro || detailItem.summary?.split(/(?<=[.!?。])\s/)[0],
    projectType: detailItem.projectType,
    skills: detailItem.skills,
    tools: detailItem.tools,
  };
  for (const [key, value] of Object.entries(properties)) {
    const field = document.querySelector(`[data-field="${key}"]`);
    if (!field) continue;
    if (!value || (Array.isArray(value) && !value.length)) field.closest('div').remove();
    else field.textContent = Array.isArray(value) ? value.join(' / ') : value;
  }
  const intro = document.querySelector('#detail-summary');
  if (intro) intro.textContent = detailItem.introduction || detailItem.summary || '';
  if (detailItem.contentDraft && intro) {
    const note = document.createElement('p');
    note.className = 'detail-draft-note';
    note.textContent = '본문은 구성을 확인하기 위한 예시 문구입니다.';
    intro.before(note);
  }
  const cover = detailItem.cover || detailItem.thumbnail;
  const coverHost = document.querySelector('.detail-cover');
  if (cover?.src && coverHost) {
    const image = document.createElement('img');
    image.src = detailPath(cover.src); image.alt = cover.alt || detailItem.title;
    image.decoding = 'async';
    coverHost.replaceChildren(image);
  } else if (coverHost) {
    const inner = document.createElement('div'); inner.className = 'detail-cover-placeholder';
    const label = document.createElement('span'); label.textContent = window.siteCatalog.label(detailItem);
    const name = document.createElement('strong'); name.textContent = detailItem.name;
    inner.append(label, name); coverHost.replaceChildren(inner);
  }
  const downloadHost = document.querySelector('#detail-download');
  downloadHost?.replaceChildren();
  for (const [path, label] of [[detailItem.summaryPdfPath, '요약본 PDF 다운로드 ↓'], [detailItem.pdfPath, '전체 PDF 다운로드 ↓']]) {
    if (!path || !downloadHost) continue;
    const link = document.createElement('a');
    link.className = 'detail-button'; link.href = detailPath(path); link.download = '';
    link.textContent = label; downloadHost.append(link);
  }
  const relatedId = detailItem.kind === 'storyboard' ? detailItem.sourceId : detailItem.storyboardId;
  const relatedItem = window.siteContent.items.find((item) => item.id === relatedId);
  const relatedHost = document.querySelector('#detail-related');
  relatedHost?.replaceChildren();
  if (relatedItem && relatedHost) {
    const link = document.createElement('a'); link.className = 'detail-button';
    link.href = window.siteCatalog.detailUrl(relatedItem, detailReturnFilter, '../');
    link.textContent = detailItem.kind === 'storyboard' ? '원본 프로젝트 보기 >' : '스토리보드 살펴보기 >';
    relatedHost.append(link);
  }
  if (downloadHost && !downloadHost.children.length) {
    const pending = document.createElement('button');
    pending.type = 'button'; pending.className = 'detail-button'; pending.disabled = true;
    pending.textContent = 'PDF 다운로드 ↓';
    const state = document.createElement('span'); state.className = 'detail-download-state'; state.textContent = '파일 준비 중';
    downloadHost.append(pending, state);
  }
  for (const key of ['participation', 'reflection', 'process']) {
    const host = document.querySelector(`#detail-${key}`);
    const value = key === 'reflection' ? (detailItem.results || detailItem.reflection) : detailItem[key];
    if (!value || (Array.isArray(value) && !value.length)) {
      if (host) (key === 'process' ? host.closest('.detail-process') : host.parentElement)?.remove();
      continue;
    }
    if (key === 'reflection' && detailItem.results?.length) host.parentElement.querySelector('h2').textContent = '결과';
    detailParagraphs(host, typeof value === 'string' ? value.split(/\n+/).filter(Boolean) : value);
  }
  const visual = document.querySelector('#detail-visual');
  if (detailItem.previewPages?.length) {
    visual?.remove(); // The cover is not repeated above actual preview pages.
    const gallery = document.createElement('div'); gallery.className = 'detail-page-images';
    detailItem.previewPages.forEach((page, index) => {
      const figure = document.createElement('figure');
      const image = document.createElement('img');
      image.src = detailPath(page.src); image.alt = page.alt || `프로젝트 자료 ${index + 1}페이지`;
      image.loading = 'lazy'; image.decoding = 'async';
      image.width = 1920; image.height = 1080;
      figure.append(image);
      if (page.caption) { const caption = document.createElement('figcaption'); caption.textContent = page.caption; figure.append(caption); }
      gallery.append(figure);
    });
    document.querySelector('.detail-preview')?.append(gallery);
  } else if (visual) {
    visual.textContent = detailItem.kind === 'storyboard' ? '정보 우선순위 → 주요 행동 → 다음 화면' : '문제 발견 → 방향 설정 → 경험 설계';
  }
  if (detailItem.kind === 'storyboard' && detailItem.designPoints?.length) {
    const list = document.createElement('ul');
    detailItem.designPoints.forEach((point) => { const entry = document.createElement('li'); entry.textContent = point; list.append(entry); });
    document.querySelector('#storyboard-points')?.replaceChildren(list);
  }
  let group = window.siteContent.items.filter((item) => item.kind === detailItem.kind && window.siteCatalog.matchesFilter(item, detailReturnFilter));
  if (!group.some((item) => item.id === detailItem.id)) group = window.siteContent.items.filter((item) => item.kind === detailItem.kind);
  const current = group.findIndex((item) => item.id === detailItem.id);
  for (const [direction, offset] of [['previous', -1], ['next', 1]]) {
    const host = document.querySelector(`[data-adjacent="${direction}"]`);
    const adjacent = group[current + offset];
    if (!host) continue;
    if (!adjacent) { host.replaceChildren(); continue; }
    const link = document.createElement('a'); link.href = window.siteCatalog.detailUrl(adjacent, detailReturnFilter, '../');
    const directionLabel = document.createElement('span'); directionLabel.className = 'detail-adjacent-label';
    directionLabel.textContent = direction === 'previous' ? '< 이전' : '다음';
    const projectName = document.createElement('span'); projectName.className = 'detail-adjacent-name'; projectName.textContent = adjacent.name;
    link.append(directionLabel, projectName);
    if (direction === 'next') { const arrow = document.createElement('span'); arrow.textContent = '>'; arrow.setAttribute('aria-hidden', 'true'); link.append(arrow); }
    host.replaceChildren(link);
  }
  // Compact facts and an editorial introduction precede the project imagery.
  document.body.classList.add('reference-detail');
  const main = document.querySelector('.detail-main');
  const heading = document.createElement('div'); heading.className = 'detail-intro-heading';
  const overview = document.createElement('div'); overview.className = 'detail-overview';
  const facts = document.querySelector('.detail-meta');
  const content = document.createElement('div'); content.className = 'detail-overview-content';
  const kind = document.querySelector('.detail-kind');
  const summarySection = document.querySelector('.detail-section');
  if (kind) heading.append(kind);
  if (titleHost) heading.append(titleHost);
  content.append(heading);
  if (summarySection) content.append(summarySection);
  const experience = document.querySelector('.detail-experience');
  if (experience && experience.children.length) content.append(experience);
  else experience?.remove();
  if (facts) {
    const labels = { categories: '분류', period: '기간', projectType: '역할', award: '수상' };
    ['summary', 'skills', 'tools'].forEach(key => {
      const field = facts.querySelector(`[data-field="${key}"]`);
      if (key === 'summary') field?.closest('div').remove();
      else if (field) {
        const row = field.closest('div');
        let extra = content.querySelector('.detail-capabilities');
        if (!extra) { extra = document.createElement('dl'); extra.className = 'detail-capabilities'; content.append(extra); }
        extra.append(row);
      }
    });
    Object.entries(labels).forEach(([key, label]) => {
      const row = facts.querySelector(`[data-field="${key}"]`)?.closest('div');
      if (row) { row.querySelector('dt').textContent = label; facts.append(row); }
    });
    overview.append(facts);
  }
  if (downloadHost) {
    const downloadArea = document.createElement('div'); downloadArea.className = 'detail-primary-download';
    downloadArea.setAttribute('aria-label', '프로젝트 PDF 다운로드');
    downloadArea.append(downloadHost); content.append(downloadArea);
  }
  overview.append(content);
  document.querySelector('.detail-back')?.after(overview);
  const coverElement = document.querySelector('.detail-cover');
  if (coverElement) overview.after(coverElement);
  const previewSection = document.querySelector('.detail-preview');
  if (previewSection && !detailItem.previewPages?.length) previewSection.remove();
  const layout = document.querySelector('.detail-layout');
  if (layout && !layout.children.length) layout.remove();
  const processHost = document.querySelector('#detail-process');
  if (processHost) {
    const values = Array.isArray(detailItem.process) ? detailItem.process : detailItem.process.split(/\n+/).filter(Boolean);
    processHost.replaceChildren(...values.map((value, index) => {
      const step = document.createElement('section'); step.className = 'detail-process-step';
      const summary = document.createElement('h3');
      const split = value.indexOf(':');
      summary.textContent = `STEP ${index + 1}. ${split > 0 ? value.slice(0, split).trim() : '진행 과정'}`;
      const paragraph = document.createElement('p'); paragraph.textContent = split > 0 ? value.slice(split + 1).trim() : value;
      step.append(summary, paragraph); return step;
    }));
    processHost.parentElement.querySelector('h2').textContent = '이렇게 진행했어요';
  }
  const resourceSection = document.querySelector('.detail-resources');
  const adjacentSection = document.querySelector('.detail-adjacent');
  if (resourceSection) {
    resourceSection.querySelectorAll(':scope > div').forEach(section => {
      if (section.id !== 'detail-related') section.remove();
    });
    if (!relatedItem) resourceSection.remove();
    else if (adjacentSection) adjacentSection.before(resourceSection);
  }
  // Build a small in-page contents list only from sections that are actually present.
  const sectionDefinitions = [
    ['.detail-section', 'project-intro', '프로젝트 소개'],
    ['.storyboard-points', 'design-points', '설계 포인트'],
    ['.detail-preview', 'project-preview', '미리보기'],
    ['#detail-participation', 'project-participation', '담당 업무'],
    ['#detail-reflection', 'project-reflection', detailItem.results?.length ? '결과' : '배운 점'],
    ['.detail-process', 'project-process', '주요 과정'],
  ];
  const toc = document.createElement('nav'); toc.className = 'detail-toc'; toc.setAttribute('aria-label', '상세페이지 목차');
  const label = document.createElement('p'); label.className = 'detail-toc-label'; label.textContent = 'ON THIS PAGE'; toc.append(label);
  const sections = [];
  sectionDefinitions.forEach(([selector, id, title]) => {
    let section = document.querySelector(selector);
    if (!section) return;
    if (selector.startsWith('#detail-')) section = section.parentElement;
    section.id = id;
    const link = document.createElement('a'); link.href = `#${id}`; link.textContent = title;
    toc.append(link); sections.push({ section, link });
  });
  if (sections.length) document.querySelector('.detail-back')?.after(toc);
  const sidebar = document.createElement('aside'); sidebar.className = 'detail-fixed-info'; sidebar.setAttribute('aria-label', '프로젝트 정보');
  const rightContent = document.createElement('div'); rightContent.className = 'detail-scroll-content';
  const splitLayout = document.createElement('div'); splitLayout.className = 'detail-split-layout';
  const backLink = document.querySelector('.detail-back');
  if (backLink) sidebar.append(backLink);
  sidebar.append(overview);
  if (toc.children.length > 1) sidebar.append(toc);
  const projectExperience = experience?.children.length ? experience : null;
  if (projectExperience) projectExperience.remove();
  [...main.children].forEach(element => { if (element !== sidebar) rightContent.append(element); });
  const processSection = rightContent.querySelector('.detail-process');
  if (projectExperience) {
    if (processSection) processSection.before(projectExperience);
    else rightContent.append(projectExperience);
  }
  const readingIntro = document.createElement('div'); readingIntro.className = 'detail-reading-intro';
  const introduction = sidebar.querySelector('.detail-section');
  const capabilities = sidebar.querySelector('.detail-capabilities');
  if (introduction) readingIntro.append(introduction);
  if (capabilities) readingIntro.append(capabilities);
  if (readingIntro.children.length) rightContent.prepend(readingIntro);
  if (toc.children.length > 1) rightContent.prepend(toc);
  // Long participation and result text always belongs to the scrolling body.
  ['#detail-participation', '#detail-reflection'].forEach(selector => {
    const section = sidebar.querySelector(selector)?.parentElement;
    if (section) rightContent.append(section);
  });
  const participationBody = rightContent.querySelector('.detail-experience');
  if (participationBody) {
    if (introduction) introduction.after(participationBody);
    else readingIntro.prepend(participationBody);
  }
  const skillValues = (Array.isArray(detailItem.skills) ? detailItem.skills : (detailItem.skills || '').split(/\/|\n/)).map(value => value.trim()).filter(Boolean);
  if (skillValues.length) {
    const skillGroup = document.createElement('section'); skillGroup.className = 'detail-skill-group'; skillGroup.setAttribute('aria-label', '활용 역량');
    const label = document.createElement('h2'); label.textContent = '활용 역량';
    const chips = document.createElement('ul'); chips.className = 'detail-skill-chips';
    skillValues.forEach(value => { const chip = document.createElement('li'); chip.textContent = value; chips.append(chip); });
    skillGroup.append(label, chips);
    const pdfArea = sidebar.querySelector('.detail-primary-download');
    if (pdfArea) pdfArea.before(skillGroup); else sidebar.append(skillGroup);
    capabilities?.querySelector('[data-field="skills"]')?.closest('div').remove();
    if (capabilities && !capabilities.children.length) capabilities.remove();
  }
  splitLayout.append(sidebar, rightContent); main.append(splitLayout);
  if (typeof window.IntersectionObserver === 'function' && sections.length) {
    const observer = new window.IntersectionObserver((entries) => {
      const active = entries.filter((entry) => entry.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
      if (!active) return;
      sections.forEach(({ section, link }) => {
        if (section === active.target) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      });
    }, { rootMargin: '-104px 0px -55% 0px' });
    sections.forEach(({ section }) => observer.observe(section));
  }
}
