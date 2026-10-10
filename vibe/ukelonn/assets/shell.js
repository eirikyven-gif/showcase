(() => {
  const root = document.body.dataset.appRoot || './';
  let sessionPromise;
  const session = () => {
    if (!sessionPromise) {
      sessionPromise = fetch(root + 'api/auth.php', { credentials: 'same-origin' })
        .then(async (response) => ({ response, payload: await response.json().catch(() => ({})) }))
        .catch((error) => { sessionPromise = undefined; throw error; });
    }
    return sessionPromise;
  };
  window.Ukelonn = { root, url: (path) => root + path, session };
  const homeHeader = document.querySelector('.site-header .header-inner');
  if (homeHeader) {
    const hubLink = document.createElement('a');
    hubLink.className = 'button button-secondary hub-return-link';
    hubLink.href = '/vibe/';
    hubLink.textContent = 'Til Vibe-huben';
    homeHeader.append(hubLink);
  }
  const favicon = document.createElement('link');
  favicon.rel = 'icon';
  favicon.type = 'image/svg+xml';
  favicon.href = root + 'assets/icon.svg';
  document.head.append(favicon);
  const manifest = document.createElement('link');
  manifest.rel = 'manifest';
  manifest.href = root + 'manifest.webmanifest';
  document.head.append(manifest);
  document.querySelectorAll('.brand-mark').forEach((mark) => {
    const image = document.createElement('img');
    image.src = root + 'assets/icon.svg';
    image.alt = '';
    mark.replaceChildren(image);
  });
  const role = document.body.dataset.role;
  if (role === 'admin' || role === 'user') {
    const header = document.querySelector('.site-header .header-inner');
    const menu = document.querySelector('.primary-nav .nav-inner');
    const navigation = document.querySelector('.primary-nav');
    let menuToggle;
    const backdrop = document.createElement('button');
    backdrop.type = 'button';
    backdrop.className = 'mobile-nav-backdrop';
    backdrop.setAttribute('aria-label', 'Lukk meny');
    backdrop.tabIndex = -1;
    backdrop.hidden = true;
    navigation?.after(backdrop);
    if (menu) {
      navigation.id = 'ukelonn-primary-nav';
      menuToggle = document.createElement('button');
      menuToggle.type = 'button';
      menuToggle.className = 'button button-secondary mobile-menu-toggle';
      menuToggle.dataset.mobileMenuToggle = '';
      menuToggle.setAttribute('aria-controls', navigation.id);
      menuToggle.setAttribute('aria-expanded', 'false');
      menuToggle.setAttribute('aria-label', 'Åpne meny');
      menuToggle.innerHTML = '<span class="menu-icon" aria-hidden="true"><span></span><span></span><span></span></span>';
      header?.insertBefore(menuToggle, header.querySelector('[data-logout]'));

      const links = role === 'admin' ? [
        ['Oversikt', 'OV', 'admin/'],
        ['Gjøremål', 'GJ', 'admin/gjoremal/'],
        ['Brukere', 'BR', 'admin/brukere/'],
        ['Forslag', 'FO', 'admin/forslag/'],
        ['Perioder', 'PE', 'admin/perioder/'],
        ['Utbetalinger', 'UT', 'admin/utbetalinger/'],
        ['Registreringer', 'RE', 'admin/registreringer/'],
      ] : [
        ['Registrer', 'RE', 'registrer/'],
        ['Min oversikt', 'OV', 'min-oversikt/'],
        ['Historikk', 'HI', 'historikk/'],
      ];
      menu.replaceChildren(...links.map(([label, shortLabel, path]) => {
        const link = document.createElement('a');
        link.className = 'nav-link';
        link.href = root + path;
        link.textContent = label;
        link.dataset.shortLabel = shortLabel;
        link.setAttribute('aria-label', label);
        link.title = label;
        const currentPath = window.location.pathname.replace(/\/$/, '');
        const linkPath = new URL(link.href).pathname.replace(/\/$/, '');
        const isCurrent = currentPath === linkPath || (role === 'admin' && path === 'admin/brukere/' && currentPath.startsWith(linkPath + '/'));
        if (isCurrent) link.setAttribute('aria-current', 'page');
        return link;
      }));
      const logout = document.querySelector('[data-logout]');
      if (logout) {
        logout.classList.remove('button-secondary');
        logout.classList.add('nav-link', 'nav-logout');
        logout.dataset.shortLabel = 'LO';
        logout.setAttribute('aria-label', 'Logg ut');
        logout.title = 'Logg ut';
        menu.append(logout);
      }
    }

    const closeMobileMenu = ({ restoreFocus = false } = {}) => {
      document.body.removeAttribute('data-mobile-nav-open');
      backdrop.hidden = true;
      menuToggle?.setAttribute('aria-expanded', 'false');
      menuToggle?.setAttribute('aria-label', 'Åpne meny');
      if (restoreFocus) menuToggle?.focus();
    };
    menuToggle?.addEventListener('click', () => {
      const isOpen = document.body.dataset.mobileNavOpen === 'true';
      if (isOpen) {
        closeMobileMenu();
        return;
      }
      document.body.dataset.mobileNavOpen = 'true';
      backdrop.hidden = false;
      menuToggle.setAttribute('aria-expanded', 'true');
      menuToggle.setAttribute('aria-label', 'Lukk meny');
      navigation?.querySelector('.nav-link')?.focus();
    });
    navigation?.addEventListener('click', event => {
      if (event.target.closest('a.nav-link')) closeMobileMenu();
    });
    backdrop.addEventListener('click', () => closeMobileMenu());
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && document.body.dataset.mobileNavOpen === 'true') {
        closeMobileMenu({ restoreFocus: true });
      } else if (event.key === 'Tab' && document.body.dataset.mobileNavOpen === 'true') {
        const links = [...navigation.querySelectorAll('a.nav-link')];
        const first = menuToggle;
        const last = links.at(-1);
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last?.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first?.focus();
        }
      }
    });
    window.addEventListener('resize', () => {
      if (window.innerWidth > 680) closeMobileMenu();
    });
  }
  document.querySelectorAll('.nav-link').forEach((link) => { if (new URL(link.href, window.location.href).pathname === window.location.pathname) link.setAttribute('aria-current', 'page'); });
  document.addEventListener('click', async (event) => {
    if (!event.target.closest('[data-logout]')) return;
    try { await fetch(root + 'api/auth.php', { method:'POST', credentials:'same-origin', headers:{'Content-Type':'application/json'}, body:JSON.stringify({action:'logout'}) }); }
    finally { window.location.assign(root + (role === 'admin' ? 'admin/logg-inn/' : 'logg-inn/')); }
  });
})();
