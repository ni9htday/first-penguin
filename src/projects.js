const { items } = window.siteContent;
const { create } = window.siteUtils;
const filters = window.siteContent.filters;
const filterHost = document.querySelector('#project-filters');
const grid = document.querySelector('#project-grid');
const validFilters = new Set(filters.map(([value]) => value));
const initialFilter = new URLSearchParams(location.search).get('filter');
let activeFilter = validFilters.has(initialFilter) ? initialFilter : 'all';

filters.forEach(([value, label]) => {
  const button = create('button', 'filter-button', label);
  button.type = 'button'; button.dataset.filter = value;
  button.addEventListener('click', () => setFilter(value, true));
  filterHost.append(button);
});

const matchesFilter = window.siteCatalog.matchesFilter;


// Reveal each new card once when it enters the viewport. No hidden cards without support.
const cardMotionPreference = window.matchMedia?.('(prefers-reduced-motion: reduce)');
const cardRevealObserver = typeof IntersectionObserver === 'function' ? new IntersectionObserver((entries) => {
  const entering = entries.filter(entry => entry.isIntersecting);
  entering.forEach((entry, index) => {
    entry.target.style.setProperty('--card-reveal-delay', `${Math.min(index, 2) * 80}ms`);
    entry.target.classList.add('is-card-visible');
    cardRevealObserver.unobserve(entry.target);
  });
}, { threshold: .08, rootMargin: '0px 0px -24px 0px' }) : null;
cardMotionPreference?.addEventListener('change', () => {
  if (!cardMotionPreference.matches) return;
  cardRevealObserver?.disconnect();
  grid.querySelectorAll('.project-card').forEach(card => card.classList.add('is-card-visible'));
});
grid.addEventListener('focusin', event => {
  const card = event.target.closest('.project-card');
  if (card) { card.classList.add('is-card-visible'); cardRevealObserver?.unobserve(card); }
});

function setFilter(filter, updateUrl = false) {
  cardRevealObserver?.disconnect();
  activeFilter = filter;
  filterHost.querySelectorAll('button').forEach((button) => button.setAttribute('aria-pressed', String(button.dataset.filter === filter)));
  if (updateUrl) {
    const url = new URL(location.href);
    if (filter === 'all') url.searchParams.delete('filter'); else url.searchParams.set('filter', filter);
    history.pushState({ filter }, '', url);
  }
  grid.replaceChildren();
  const filtered = items.filter((item) => matchesFilter(item, filter));
  const count = document.querySelector('#catalog-count');
  if (count) count.textContent = `${String(filtered.length).padStart(2, '0')} projects`;
  if (!filtered.length) {
    const empty = create('div', 'empty-state');
    empty.append(create('strong', '', items.length ? '해당 분야의 프로젝트가 없습니다.' : '프로젝트를 준비하고 있습니다.'));
    if (items.length) {
      const reset = create('button', 'filter-button', '전체 프로젝트 보기');
      reset.type = 'button'; reset.addEventListener('click', () => setFilter('all', true)); empty.append(reset);
    }
    grid.append(empty);
    return;
  }
  filtered.forEach((item, index) => {
    const card = create(item.detailPath ? 'a' : 'article', 'project-card');
    if (item.detailPath) card.href = window.siteCatalog.detailUrl(item, activeFilter);
    const visual = create('div', 'project-visual');
    if (item.thumbnail?.src) { const img = create('img'); img.src = item.thumbnail.src; img.alt = item.thumbnail.alt || ''; img.loading = 'lazy'; visual.append(img); }
    else {
      visual.append(create('span', 'project-cover-index', String(index + 1).padStart(2, '0')), create('span', 'project-cover-name', item.name));
    }
    const info = create('div', 'project-info');
    const meta = create('p', 'project-meta', window.siteCatalog.label(item));
    if (item.year) meta.append(create('span', '', String(item.year)));
    info.append(meta, create('h2', '', item.title));
    if (item.summary) info.append(create('p', 'project-summary', item.shortIntro || item.summary.split(/(?<=[.!?。])\s/)[0]));
    card.append(visual, info); grid.append(card);
    if (cardRevealObserver && !cardMotionPreference?.matches) {
      card.classList.add('has-card-reveal');
      cardRevealObserver.observe(card);
    }
  });
}

setFilter(activeFilter);
window.addEventListener('popstate', () => {
  const filter = new URLSearchParams(location.search).get('filter');
  setFilter(validFilters.has(filter) ? filter : 'all');
});
