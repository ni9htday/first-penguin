(() => {
  if (document.body.dataset.project !== 'naver-map') return;
  const content = document.querySelector('.detail-scroll-content');
  const process = document.querySelector('.detail-process');
  if (!content || !process) return;

  const downloads = document.querySelector('#detail-download');
  if (downloads) {
    downloads.replaceChildren();
    [
      ['기획서 요약본 보기 16쪽 ↗', 'https://drive.google.com/file/d/1hTqKiOV2g_KGX0xdCxrZwvmC5ZnwX5tm/view?usp=sharing'],
      ['기획서 전체본 보기 79쪽 ↗', 'https://drive.google.com/file/d/1UPS4Oi8NMTAv95P4q8Fwt5lJznhlP72S/view?usp=sharing']
    ].forEach(([label, href]) => {
      const link = document.createElement('a'); link.className = 'detail-button'; link.href = href;
      link.target = '_blank'; link.rel = 'noopener noreferrer'; link.textContent = label; downloads.append(link);
    });
  }

  const comparison = document.createElement('section');
  comparison.className = 'naver-comparison'; comparison.id = 'naver-comparison';
  comparison.innerHTML = `<p class="naver-eyebrow">TEST RESULT</p><h2>더 빠르고 분명해진 경유지 관리</h2><p class="naver-lead">같은 과업을 수행한 참가자 5명의 기존안과 개선안을 비교했어요.</p><div class="naver-switch" role="group" aria-label="비교할 화면 선택"><button type="button" data-version="before" aria-pressed="true">기존안</button><button type="button" data-version="after" aria-pressed="false">개선안</button></div><div class="naver-metrics" aria-live="polite"><div><span>평균 과업 수행 시간</span><strong data-time>63.6<small>초</small></strong></div><div><span>수행 시간 표준편차</span><strong data-deviation>11.7<small>초</small></strong></div><div><span>의사결정 포인트 합계</span><strong data-decisions>23<small>회</small></strong></div></div><p class="naver-footnote">동일 참가자 5명 기준. 실제 주행이 아닌 테스트 환경에서 확인한 결과입니다.</p>`;
  process.before(comparison);
  const setVersion = version => {
    const after = version === 'after';
    comparison.querySelector('[data-time]').innerHTML = `${after ? '21.8' : '63.6'}<small>초</small>`;
    comparison.querySelector('[data-deviation]').innerHTML = `${after ? '5.0' : '11.7'}<small>초</small>`;
    comparison.querySelector('[data-decisions]').innerHTML = `${after ? '0' : '23'}<small>회</small>`;
    comparison.querySelectorAll('[data-version]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.version === version)));
  };
  comparison.addEventListener('click', event => { const button = event.target.closest('[data-version]'); if (button) setVersion(button.dataset.version); });

  process.querySelector('h2').textContent = '문제에서 검증까지';
  const host = process.querySelector('#detail-process');
  host.replaceChildren();
  const steps = [
    ['01 탐색하기', '기능을 찾는 시간을 관찰하다', '앱 리뷰와 기존 경유지 변경 흐름을 살폈습니다. 참가자 5명의 아이트래킹으로 시선 이동과 반복 탐색을 확인하고 경쟁 내비게이션과 Spotify의 리스트 관리 방식을 비교했습니다.'],
    ['02 조준하기', '흩어진 기능을 하나의 흐름으로', '추가와 편집이 서로 다른 화면에 흩어져 사용자가 기능을 찾고 결과를 다시 확인해야 했습니다. 알아보기 쉬운 기능과 편한 터치 및 변경 완료 확인을 개선 기준으로 삼았습니다.'],
    ['03 뛰어들기', '한 번의 테스트로 끝내지 않기', '경유지 추가와 수정 및 삭제를 하나의 바텀 시트에 모았습니다. 2차 테스트에서 스와이프 삭제를 알아보기 어렵다는 점을 발견해 눈에 보이는 삭제 버튼으로 바꾸고 순서 변경 핸들과 분리했습니다.'],
    ['04 증명하기', '같은 참가자와 다시 비교하다', '문제 확인 1회와 개선안 검증 2회로 총 세 차례 아이트래킹을 진행했습니다. 기존 참가자 5명의 같은 과업 수행 시간과 편차를 비교해 개선 효과를 확인했습니다.']
  ];
  steps.forEach(([number, title, body], index) => {
    const section = document.createElement('details'); section.className = 'naver-step'; section.open = index === 0;
    const summary = document.createElement('summary');
    const prefix = document.createElement('span'); prefix.textContent = number;
    const heading = document.createElement('strong'); heading.textContent = title;
    summary.append(prefix, heading);
    const paragraph = document.createElement('p'); paragraph.textContent = body;
    section.append(summary, paragraph); host.append(section);
  });
  const reflection = document.createElement('section'); reflection.className = 'naver-reflection';
  reflection.innerHTML = '<p class="naver-eyebrow">TAKEAWAY</p><h2>사용자의 행동으로 확인하는 설계</h2><p>감각적인 개선안보다 사용자의 시선과 행동으로 문제를 확인하는 과정이 더 설득력 있는 설계를 만든다는 점을 배웠습니다.</p>';
  process.after(reflection);
  const toc = document.querySelector('.detail-toc');
  if (toc) { const link = document.createElement('a'); link.href = '#naver-comparison'; link.textContent = '기존안과 개선안 비교'; toc.append(link); }
})();
