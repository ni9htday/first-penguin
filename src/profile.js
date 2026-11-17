const { profile } = window.siteContent;
const { create, makeLink } = window.siteUtils;

const documents = [
  { label: 'RESUME', title: '펭귄의 발자취를 기록한 이력서', description: '얼음판 위에 차곡차곡 쌓아온 이력과 활동 기록', path: profile.resumePdf, number: '01' },
  { label: 'SELF INTRODUCTION', title: '펭귄의 스토리를 담은 자기소개서', description: '퍼스트 펭귄의 가치관과 커리어 도약의 이야기', path: profile.selfIntroductionPdf, number: '02' },
  { label: 'PORTFOLIO', title: '펭귄의 다이빙 기록이 담긴 포트폴리오', description: '바다 속에서 건져올린 UX 기획 프로젝트 모음집', path: profile.portfolioPdf, number: '03' },
];
const documentHost = document.querySelector('#document-links');
documents.sort((a, b) => ({ '02': 0, '01': 1, '03': 2 }[a.number] - { '02': 0, '01': 1, '03': 2 }[b.number]));
documents.forEach((document) => {
  const ready = Boolean(document.path);
  const card = create(ready ? 'a' : 'div', `document-card${ready ? '' : ' is-pending'}`);
  if (ready) { card.href = document.path; card.download = ''; card.setAttribute('aria-label', `${document.title} PDF 다운로드`); }
  card.append(create('span', 'doc-number', document.number), create('span', 'doc-label', document.label), create('strong', '', document.title), create('p', 'doc-description', document.description), create('span', 'doc-action', ready ? 'PDF 다운로드' : ['경험과 이력을 한눈에', '기획에 뛰어든 이유', '문제를 발견하고 설계한 과정'][Number(document.number) - 1]));
  if (ready) {
    const action = card.querySelector('.doc-action');
    action.textContent = 'PDF 다운로드 ';

  }
  const heading = card.querySelector('strong');
  const keyword = { '01': '이력서', '02': '자기소개서', '03': '포트폴리오' }[document.number];
  heading.textContent = document.title.slice(0, -keyword.length);
  heading.append(create('span', 'document-title-accent', keyword));
  if (!ready && document.number === '03') {
    card.setAttribute('aria-disabled', 'true');
    card.setAttribute('aria-label', '포트폴리오 PDF 다운로드   파일 등록 전');
    card.querySelector('.doc-action').textContent = 'PDF 다운로드   파일 등록 전';
  }
  documentHost.append(card);
});

function getContactLinks() {
  const links = [];
  if (profile.email) links.push({ label: 'EMAIL', href: `mailto:${profile.email}` });
  if (profile.phone) links.push({ label: 'PHONE', href: `tel:${profile.phone.replace(/[^+0-9]/g, '')}` });
  (profile.sns || []).forEach((item) => { if (item?.url) links.push({ label: item.label || 'SNS', href: item.url, external: true }); });
  if (profile.behance) links.push({ label: 'BEHANCE', href: profile.behance, external: true });
  return links;
}

const profileHost = document.querySelector('#profile-content');
const hasProfile = [profile.name, profile.englishName, profile.role, profile.school, profile.department, profile.major, profile.email, profile.behance, ...(profile.sns || [])].some(Boolean);
if (hasProfile) {
  const imageColumn = create('div', 'profile-visual');
  if (profile.image?.src) { const img = create('img'); img.src = profile.image.src; img.alt = profile.image.alt || ''; img.loading = 'lazy'; imageColumn.append(img); }
  else imageColumn.append(create('span', 'profile-symbol', '✳'));
  const details = create('div', 'profile-details');
  details.append(create('p', 'eyebrow', 'PROFILE'));
  if (profile.name) details.append(create('h2', '', profile.name));
  if (profile.englishName) details.append(create('p', 'english-name', profile.englishName));
  if (profile.role) {
    const role = create('p', 'profile-role', profile.role + ' ');
    role.append(create('strong', '', `${profile.name} 입니다!`));
    details.append(role);
  }
  const links = create('div', 'profile-links');
  getContactLinks().forEach(({ label, href, external }) => links.append(makeLink(label, href, external)));
  details.append(links); profileHost.append(imageColumn, details);
} else {
  profileHost.classList.add('profile-pending');
  profileHost.append(create('span', 'profile-symbol', '✳'), create('p', '', '프로필 자료를 준비하고 있습니다.'));
}


const historyHost = document.querySelector('#profile-history');
function appendWithBoldNumbers(host, text) {
  text.split(/(\d+(?:[.~-]\d+)*)/g).forEach(part => {
    if (!part) return;
    host.append(create(/^[0-9]/.test(part) ? 'strong' : 'span', '', part));
  });
}
window.profileExperience?.history.forEach(group => {
  const section = create('section', 'history-group');
  section.append(create('h3', '', group.label));
  const list = create('ul');
  if (group.label === '수상 이력') {
    section.classList.add('history-awards');
    const event = create('p', 'awards-event');
    appendWithBoldNumbers(event, '제32회 커뮤니케이션 디자인 국제 어워드');
    section.append(event);
    window.profileExperience.awards.forEach(award => {
      const item = create('li', 'award-item');
      appendWithBoldNumbers(item, `2026   ${award.title}   ${award.award}`);
      list.append(item);
    });
  } else {
    group.items.forEach((text,index) => {
      const item = create('li', group.label === '경력' && index > 0 ? 'career-description' : '');
      appendWithBoldNumbers(item, text); list.append(item);
    });
  }
  section.append(list); historyHost.append(section);
});
const toolHost = document.querySelector('#profile-tools');
if (toolHost && window.profileExperience) {
  const list = create('ul', 'tool-list');
  const order = ['ChatGPT', 'Codex', 'Claude', 'Gemini', 'Excel', 'PowerPoint', '한글', 'Figma', 'Notion'];
  const concise = {
    ChatGPT: '리서치 구조화   가설 검증   이미지 생성',
    Codex: '웹페이지 웹 앱 구현과 배포',
    Claude: '요구사항 정리   기능과 예외 검토',
    Gemini: '시장 트렌드 분석   사례 탐색',
    Excel: '리서치 데이터와 평가 결과 정리',
    PowerPoint: '와이어프레임과 발표 자료 제작',
    '한글': '보고서와 제안서 작성',
    Figma: '화면 설계와 프로토타입 제작',
    Notion: '회의 피드백 기록과 업무 공유',
  };
  [...window.profileExperience.tools].sort((a,b) => order.indexOf(a[0]) - order.indexOf(b[0])).forEach(([tool, capability, task]) => {
    const item = create('li', 'tool-item');
    const logo = window.profileExperience.toolLogos?.[tool];
    const badge = logo ? create('img', 'tool-logo') : create('span', 'tool-monogram', tool === '한글' ? '한' : tool.slice(0, 2));
    if (logo) { badge.src = logo; badge.alt = ''; badge.loading = 'lazy'; badge.width = 28; badge.height = 28; }
    badge.setAttribute('aria-hidden', 'true');
    const content = create('div', 'tool-content');
    const title = create('div', 'tool-heading'); title.append(create('h3', '', tool));
    content.append(title, create('p', '', concise[tool] || task)); item.append(badge, content); list.append(item);
  });
  toolHost.append(list);
}
