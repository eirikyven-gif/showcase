(() => {
  const input = document.querySelector('#app-search');
  const grid = document.querySelector('#app-grid');
  const count = document.querySelector('#result-count');
  const empty = document.querySelector('#empty-state');
  const noResults = document.querySelector('#no-results');
  const error = document.querySelector('#catalog-error');

  const normalize = (value) => String(value || '').toLocaleLowerCase('nb-NO').normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const searchableText = (app) => [app.name, app.useCase, app.category, ...(app.audience || [])].join(' ');

  function hasValidCatalogShape(catalog) {
    if (!catalog || !Array.isArray(catalog.apps)) return false;
    const slugs = new Set();
    return catalog.apps.every((app) => {
      if (!app || typeof app !== 'object') return false;
      if (typeof app.slug !== 'string' || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(app.slug) || slugs.has(app.slug)) return false;
      if (!['name', 'useCase', 'category'].every((key) => typeof app[key] === 'string' && app[key].trim())) return false;
      if (!Array.isArray(app.audience) || app.audience.length === 0 || !app.audience.every((value) => typeof value === 'string' && value.trim())) return false;
      slugs.add(app.slug);
      return true;
    });
  }

  function render(apps) {
    const query = normalize(input.value.trim());
    const matches = apps.filter((app) => normalize(searchableText(app)).includes(query));
    grid.replaceChildren();
    matches.forEach((app) => {
      const card = document.createElement('article');
      card.className = 'app-card';
      const category = document.createElement('p');
      category.className = 'card-category';
      category.textContent = app.category;
      const title = document.createElement('h3');
      const link = document.createElement('a');
      link.href = `/vibe/${encodeURIComponent(app.slug)}/`;
      link.textContent = app.name;
      title.append(link);
      const description = document.createElement('p');
      description.className = 'card-description';
      description.textContent = app.useCase;
      const audiences = document.createElement('p');
      audiences.className = 'card-audience';
      audiences.textContent = (app.audience || []).join(' · ');
      card.append(category, title, description, audiences);
      grid.append(card);
    });
    const hasApps = apps.length > 0;
    empty.hidden = hasApps;
    noResults.hidden = !hasApps || matches.length > 0;
    count.textContent = hasApps ? `${matches.length} ${matches.length === 1 ? 'verktøy' : 'verktøy'}` : '0 verktøy foreløpig';
    grid.setAttribute('aria-busy', 'false');
  }

  fetch('/vibe/catalog.json', { headers: { Accept: 'application/json' } })
    .then((response) => {
      if (!response.ok) throw new Error('Katalogen svarte ikke');
      return response.json();
    })
    .then((catalog) => {
      if (!hasValidCatalogShape(catalog)) throw new Error('Ugyldig katalogformat');
      render(catalog.apps);
      input.addEventListener('input', () => render(catalog.apps));
      document.querySelector('#clear-search').addEventListener('click', () => {
        input.value = '';
        render(catalog.apps);
        input.focus();
      });
    })
    .catch(() => {
      grid.setAttribute('aria-busy', 'false');
      error.hidden = false;
      count.textContent = '';
    });

  document.addEventListener('keydown', (event) => {
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
      event.preventDefault();
      input.focus();
    }
  });
})();
