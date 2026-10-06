/* ==========================================================================
   Portfolio renderer. You shouldn't need to edit this file to add projects:
   edit data/projects.json and data/site.json instead.
   ========================================================================== */
(() => {
  const $ = (id) => document.getElementById(id);
  const els = {
    first: $('name-first'), last: $('name-last'), projects: $('projects'),
    caption: $('caption'), about: $('about'), aboutLink: $('about-link'),
    instagram: $('instagram-link'),behance: $('behance-link'), contact: $('contact-link'),
    stage: $('stage'), arrows: $('arrows'),
    prev: $('prev'), next: $('next'),
  };

  let site = {};
  let projects = [];
  let state = { p: 0, i: 0, about: false };
  let renderToken = 0;

  // ---------- Load data ----------
  async function load() {
    try {
      const [s, p] = await Promise.all([
        fetch('data/site.json').then((r) => r.json()),
        fetch('data/projects.json').then((r) => r.json()),
      ]);
      site = s;
      projects = (p.projects || p).filter((x) => !x.hidden).map(normalise);
    } catch (err) {
      els.stage.innerHTML = '<div class="slide-error">Could not load data/*.json.<br>If you opened index.html directly, run a local server instead (see README).</div>';
      console.error(err);
      return;
    }
    buildChrome();
    buildNav();
    window.addEventListener('hashchange', route);
    route();
  }

  // Allow images to be plain strings or { src, alt, caption } objects
  function normalise(project) {
    const slug = project.slug || slugify(project.title);
    const images = (project.images || []).map((img) =>
      typeof img === 'string' ? { src: img } : img
    );
    return { ...project, slug, images };
  }
  function slugify(s = '') {
    return s.toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  }

  // ---------- Static chrome (name, footer) ----------
  function buildChrome() {
    const n = site.name || {};
    els.first.textContent = n.first || '';
    els.last.textContent = n.last || '';
    const full = [n.first, n.last].filter(Boolean).join(' ');
    site.title = site.title || full;

    if (site.instagram) els.instagram.href = site.instagram; else els.instagram.remove();
    if (site.behance) els.behance.href = site.behance; else els.behance.remove();
    if (site.email) els.contact.href = 'mailto:' + site.email; else els.contact.remove();
    if (!site.about) els.aboutLink.remove();
    els.about.textContent = site.about || '';
  }

  function buildNav() {
    els.projects.innerHTML = '';
    projects.forEach((p) => {
      const a = document.createElement('a');
      a.href = '#' + p.slug;
      a.textContent = p.title;
      a.dataset.slug = p.slug;
      els.projects.appendChild(a);
    });
  }

  // ---------- Routing: #slug  |  #slug/3  |  #about ----------
  function route() {
    const hash = decodeURIComponent(location.hash.replace(/^#/, ''));
    if (hash === 'about' && site.about) {
      state.about = true;
      render(false);
      return;
    }
    state.about = false;
    const [slug, num] = hash.split('/');
    let p = projects.findIndex((x) => x.slug === slug);
    if (p < 0) p = 0;
    let i = parseInt(num, 10) - 1;
    if (!(i >= 0 && i < (projects[p]?.images.length || 0))) i = 0;
    state.p = p; state.i = i;
    render(true);
  }

  function go(p, i) {
    const slug = projects[p].slug;
    const target = '#' + slug + (i > 0 ? '/' + (i + 1) : '');
    // replace, not push, when just flicking through images so Back leaves the project
    if (p === state.p) history.replaceState(null, '', target);
    else history.pushState(null, '', target);
    state.p = p; state.i = i;
    state.about = false;
    render(true);
  }

  // ---------- Render ----------
  function render(swapImage) {
    const project = projects[state.p];
    if (!project) return;
    const image = project.images[state.i];

    // nav highlight
    els.projects.querySelectorAll('a').forEach((a) => {
      const on = !state.about && a.dataset.slug === project.slug;
      if (on) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current');
    });
    if (state.about) els.aboutLink.setAttribute('aria-current', 'true');
    else els.aboutLink.removeAttribute('aria-current');

    // caption / about
    els.about.hidden = !state.about;
    els.caption.hidden = state.about;
    els.caption.textContent = (image && image.caption) || project.caption || '';

    // arrows
    els.arrows.hidden = project.images.length < 2;

    // title
    document.title = state.about
      ? `About \u2013 ${site.title}`
      : `${project.title} \u2013 ${site.title}`;

    if (swapImage && image) showImage(image, project.title);
    preloadNeighbours(project);
  }

  function showImage(image, title) {
    const token = ++renderToken;
    const img = new Image();
    img.className = 'slide';
    img.alt = image.alt || title;
    img.decoding = 'async';
    img.onload = () => {
      if (token !== renderToken) return img.remove();
      const old = [...els.stage.children].filter((c) => c !== img);
      requestAnimationFrame(() => img.classList.add('in'));
      old.forEach((o) => o.classList.remove('in'));
      setTimeout(() => old.forEach((o) => o.remove()), 400);
    };
    img.onerror = () => {
      if (token !== renderToken) return;
      els.stage.innerHTML = `<div class="slide-error">Image not found:<br>${image.src}</div>`;
    };
    img.src = image.src;
    els.stage.appendChild(img);
  }

  function preloadNeighbours(project) {
    [state.i + 1, state.i - 1].forEach((k) => {
      const im = project.images[(k + project.images.length) % project.images.length];
      if (im) new Image().src = im.src;
    });
  }

  // ---------- Prev / next ----------
  function step(dir) {
    const project = projects[state.p];
    const n = project.images.length;
    if (n < 2 || state.about) return;
    go(state.p, (state.i + dir + n) % n);
  }
  els.prev.addEventListener('click', () => step(-1));
  els.next.addEventListener('click', () => step(1));

  document.addEventListener('keydown', (e) => {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    if (e.key === 'ArrowRight') step(1);
    if (e.key === 'ArrowLeft') step(-1);
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      const d = e.key === 'ArrowDown' ? 1 : -1;
      const next = (state.p + d + projects.length) % projects.length;
      if (document.activeElement === document.body) { e.preventDefault(); go(next, 0); }
    }
  });

  // Swipe on touch screens, click left/right half of the image
  let touchX = null;
  els.stage.addEventListener('touchstart', (e) => { touchX = e.touches[0].clientX; }, { passive: true });
  els.stage.addEventListener('touchend', (e) => {
    if (touchX === null) return;
    const dx = e.changedTouches[0].clientX - touchX;
    if (Math.abs(dx) > 40) step(dx < 0 ? 1 : -1);
    touchX = null;
  });
  els.stage.addEventListener('click', (e) => {
    const r = els.stage.getBoundingClientRect();
    step(e.clientX - r.left > r.width / 2 ? 1 : -1);
  });

  // Clicking the big first name goes home (first project)
  els.first.addEventListener('click', (e) => {
    e.preventDefault();
    if (projects.length) go(0, 0);
  });

  load();
})();
