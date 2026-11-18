(() => {
  const profile = window.siteContent?.profile;
  if (!profile) return;
  const prefix = location.pathname.includes('/details/') ? '../' : './';
  const heroPenguin = document.querySelector('.wandering-penguin');
  const heroStage = document.querySelector('.penguin-stage');
  const hint = heroStage && heroPenguin ? document.createElement('span') : null;
  if (hint) { hint.className = 'penguin-guide-hint'; hint.setAttribute('aria-hidden', 'true'); hint.innerHTML = '<span></span><span></span><span></span>'; heroStage.append(hint); }
  const launcher = document.createElement('button');
  launcher.type = 'button'; launcher.className = 'penguin-guide-launcher';
  launcher.setAttribute('aria-label', '펭귄에게 물어보기');
  launcher.setAttribute('aria-haspopup', 'dialog');
  launcher.setAttribute('aria-controls', 'penguin-guide');
  launcher.setAttribute('aria-expanded', 'false');
  launcher.innerHTML = `<img src="${prefix}assets/penguin/pg_run_to_R-v3.svg" alt=""><span aria-hidden="true">?</span>`;
  const guide = document.createElement('section');
  guide.className = 'penguin-guide'; guide.id = 'penguin-guide'; guide.hidden = true;
  guide.setAttribute('role', 'dialog'); guide.setAttribute('aria-labelledby', 'guide-title');
  guide.innerHTML = `<header class="guide-header"><div><p>FIRST PENGUIN</p><h2 id="guide-title">펭귄에게 물어보기</h2></div><button class="guide-close" type="button" aria-label="안내창 닫기">×</button></header><div class="guide-body"><div class="guide-answer" aria-live="polite"><p>안녕하세요! 궁금한 질문을 골라주시면 펭귄이 안내해 드릴게요.</p></div><div class="guide-questions" aria-label="질문 선택"><button type="button" data-answer="about">어떤 기획자인가요?</button><button type="button" data-answer="project">프로젝트를 보여주세요</button><button type="button" data-answer="documents">이력서를 보고 싶어요</button><button type="button" data-answer="contact">어떻게 연락하나요?</button></div></div>`;
  document.body.append(launcher, guide);
  const answer = guide.querySelector('.guide-answer');
  const close = guide.querySelector('.guide-close');
  const replies = {
    about: ['권나영은 사용자의 작은 신호를 발견하고 더 나은 경험으로 연결하는 UX 기획자예요.', '나영님 더 알아보기', `${prefix}profile.html`],
    project: ['경유지 관리 흐름을 하나의 바텀 시트로 정리한 네이버 지도 UX 개선 프로젝트를 소개할게요.', '네이버 지도 프로젝트 보기', `${prefix}details/naver-map.html`],
    documents: ['이력서와 자기소개서는 어바웃 페이지에서 확인할 수 있어요.', '서류 보러 가기', `${prefix}profile.html#profile-overview`],
    contact: ['이메일로 편하게 연락해 주세요.', '이메일 보내기', `mailto:${profile.email}`]
  };
  let opener = launcher;
  let frame = 0;
  let hintFrame = 0;
  const heroVisible = () => {
    if (!heroPenguin || heroPenguin.classList.contains('is-submerged')) return false;
    const rect = heroPenguin.getBoundingClientRect();
    const style = getComputedStyle(heroPenguin);
    return style.visibility !== 'hidden' && rect.width > 0 && rect.bottom > 20 && rect.top < innerHeight - 20 && rect.right > 0 && rect.left < innerWidth;
  };
  const updateLauncher = () => {
    launcher.hidden = heroVisible();
    const top = document.querySelector('#top-button');
    if (top && getComputedStyle(top).opacity !== '0') {
      const rect = top.getBoundingClientRect();
      launcher.style.right = `${Math.max(12, innerWidth - rect.right)}px`;
      launcher.style.bottom = `${Math.max(74, innerHeight - rect.top + 12)}px`;
    } else { launcher.style.right = ''; launcher.style.bottom = ''; }
  };
  const updateHint = () => {
    if (!hint || !heroStage || !heroPenguin) return;
    const visible = heroVisible() && guide.hidden;
    hint.hidden = !visible;
    if (visible) {
      const penguinRect = heroPenguin.getBoundingClientRect();
      const stageRect = heroStage.getBoundingClientRect();
      hint.style.left = `${penguinRect.left - stageRect.left + penguinRect.width / 2}px`;
      hint.style.top = `${penguinRect.top - stageRect.top - 10}px`;
    }
    hintFrame = requestAnimationFrame(updateHint);
  };
  const position = () => {
    if (guide.hidden) return;
    updateLauncher();
    const anchor = !launcher.hidden && (opener === launcher || !heroVisible()) ? launcher : heroPenguin;
    if (!anchor) return;
    const rect = anchor.getBoundingClientRect();
    const width = guide.offsetWidth;
    const center = rect.left + rect.width / 2;
    const left = Math.max(12, Math.min(innerWidth - width - 12, center - width / 2));
    const top = Math.max(12, rect.top - guide.offsetHeight - 18);
    guide.style.left = `${left}px`; guide.style.top = `${top}px`;
    guide.style.setProperty('--tail-x', `${Math.max(20, Math.min(width - 20, center - left))}px`);
    frame = requestAnimationFrame(position);
  };
  const open = source => {
    cancelAnimationFrame(frame); opener = source; guide.hidden = false; launcher.setAttribute('aria-expanded', 'true');
    heroPenguin?.setAttribute('aria-expanded', 'true'); position(); close.focus();
  };
  const dismiss = () => {
    guide.hidden = true; cancelAnimationFrame(frame); launcher.setAttribute('aria-expanded', 'false');
    heroPenguin?.setAttribute('aria-expanded', 'false');
    (opener === heroPenguin && heroVisible() ? heroPenguin : launcher).focus({ preventScroll: true });
  };
  launcher.addEventListener('click', () => open(launcher));
  heroPenguin?.addEventListener('click', () => open(heroPenguin));
  heroPenguin?.addEventListener('keydown', event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); open(heroPenguin); } });
  close.addEventListener('click', dismiss);
  guide.addEventListener('keydown', event => { if (event.key === 'Escape') dismiss(); });
  guide.addEventListener('click', event => {
    const button = event.target.closest('button[data-answer]');
    if (!button || !replies[button.dataset.answer]) return;
    const reply = replies[button.dataset.answer];
    const text = document.createElement('p'); text.textContent = reply[0];
    const link = document.createElement('a'); link.href = reply[2]; link.textContent = `${reply[1]} >`;
    answer.replaceChildren(text, link);
    guide.querySelectorAll('[data-answer]').forEach(item => item.setAttribute('aria-pressed', String(item === button)));
  });
  window.addEventListener('scroll', updateLauncher, { passive: true });
  window.addEventListener('resize', updateLauncher);
  updateLauncher();
  if (hint) {
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(entries => {
        if (entries[0].isIntersecting && !hintFrame) hintFrame = requestAnimationFrame(updateHint);
        else if (!entries[0].isIntersecting) { cancelAnimationFrame(hintFrame); hintFrame = 0; hint.hidden = true; }
      });
      observer.observe(heroPenguin);
    } else hintFrame = requestAnimationFrame(updateHint);
  }
  window.addEventListener('pagehide', () => cancelAnimationFrame(hintFrame), { once: true });
})();
