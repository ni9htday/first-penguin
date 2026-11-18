window.siteCatalog = {
  label(item) { return item.kind === 'storyboard' ? '스토리보드' : (item.keywords || []).find(value => !/^SB$/i.test(value)) || ''; },
  matchesFilter(item, filter) {
    if (filter === 'all') return true;
    if (filter === 'storyboard') return item.kind === 'storyboard';
    return item.kind === 'project' && item.categories?.includes(filter);
  },
  detailUrl(item, filter = 'all', prefix = '') {
    const query = new URLSearchParams({ from: filter });
    return `${prefix}${item.detailPath}?${query}`;
  },
};
