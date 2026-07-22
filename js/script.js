document.addEventListener('DOMContentLoaded', () => {

  /* =========================================================
     1. Render de tarjetas de videojuegos en los carruseles
     ========================================================= */
  function heartsHTML(rating){
    // rating de 0 a 5, en pasos de .5
    const full = Math.floor(rating);
    const half = rating % 1 !== 0;
    const empty = 5 - full - (half ? 1 : 0);
    let html = '♥'.repeat(full);
    if (half) html += '♥'; // representamos el medio corazón como lleno visualmente atenuado
    html += `<span class="empty">${'♥'.repeat(empty)}</span>`;
    return html;
  }

  function renderGameCard(game){
    const article = document.createElement('article');
    article.className = 'game-card';

    const initials = game.title
      .split(' ')
      .slice(0, 3)
      .join(' ');

    article.innerHTML = `
      <div class="game-cover" style="background:${game.gradient}">
        ${game.cover
          ? `<img src="${game.cover}" alt="Carátula de ${game.title}" loading="lazy">`
          : `<span class="cover-fallback">${initials}</span>`}
      </div>
      <p class="game-title">${game.title}</p>
      <p class="game-rating" aria-label="Calificación ${game.rating} de 5">${heartsHTML(game.rating)}</p>
    `;
    return article;
  }

  function fillTrack(trackId, games){
    const track = document.getElementById(trackId);
    if (!track) return;
    games.forEach((game, index) => {
      const card = renderGameCard(game);
      card.querySelector('.game-cover').addEventListener('click', () => {
        openLightbox(games, index);
      });
      track.appendChild(card);
    });
  }

  fillTrack('popularesTrack', POPULARES);
  fillTrack('fansTrack', FANS);

  /* =========================================================
     1b. Lightbox: abrir carátula en grande con navegación
     ========================================================= */
  const lightbox      = document.getElementById('lightbox');
  const lbCover       = document.getElementById('lightboxCover');
  const lbTitle       = document.getElementById('lightboxTitle');
  const lbRating      = document.getElementById('lightboxRating');
  const lbClose       = document.getElementById('lightboxClose');
  const lbPrev        = document.getElementById('lightboxPrev');
  const lbNext        = document.getElementById('lightboxNext');

  let currentList = [];
  let currentIndex = 0;
  let lastFocusedEl = null;

  function renderLightboxGame(game){
    lbCover.style.background = game.gradient || 'var(--bg-card)';
    lbCover.innerHTML = game.cover
      ? `<img src="${game.cover}" alt="Carátula de ${game.title}">`
      : `<span class="cover-fallback">${game.title}</span>`;
    lbTitle.textContent = game.title;
    lbRating.innerHTML = heartsHTML(game.rating);
    lbRating.setAttribute('aria-label', `Calificación ${game.rating} de 5`);
  }

  function openLightbox(list, index){
    currentList = list;
    currentIndex = index;
    lastFocusedEl = document.activeElement;
    renderLightboxGame(currentList[currentIndex]);
    lightbox.hidden = false;
    document.body.style.overflow = 'hidden';
    lbClose.focus();
  }

  function closeLightbox(){
    lightbox.hidden = true;
    document.body.style.overflow = '';
    lastFocusedEl?.focus();
  }

  function showRelative(step){
    if (!currentList.length) return;
    currentIndex = (currentIndex + step + currentList.length) % currentList.length;
    renderLightboxGame(currentList[currentIndex]);
  }

  lbClose.addEventListener('click', closeLightbox);
  lbPrev.addEventListener('click', () => showRelative(-1));
  lbNext.addEventListener('click', () => showRelative(1));

  lightbox.querySelectorAll('[data-close]').forEach(el =>
    el.addEventListener('click', closeLightbox)
  );

  document.addEventListener('keydown', (e) => {
    if (lightbox.hidden) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') showRelative(-1);
    if (e.key === 'ArrowRight') showRelative(1);
  });

  /* =========================================================
     2. Controles de carrusel (flechas)
     ========================================================= */
  document.querySelectorAll('.carousel-arrow').forEach(btn => {
    btn.addEventListener('click', () => {
      const track = document.getElementById(btn.dataset.target);
      if (!track) return;
      const card = track.querySelector('.game-card');
      const step = card ? card.getBoundingClientRect().width + 18 : 300; // ancho + gap
      const amount = btn.classList.contains('left') ? -step * 2 : step * 2;
      track.scrollBy({ left: amount, behavior: 'smooth' });
    });
  });

  // Permite arrastrar los carruseles con el mouse (desktop)
  document.querySelectorAll('.carousel-track').forEach(track => {
    let isDown = false;
    let startX, scrollLeft;

    track.addEventListener('mousedown', (e) => {
      isDown = true;
      track.classList.add('dragging');
      startX = e.pageX - track.offsetLeft;
      scrollLeft = track.scrollLeft;
    });
    ['mouseleave', 'mouseup'].forEach(evt =>
      track.addEventListener(evt, () => { isDown = false; track.classList.remove('dragging'); })
    );
    track.addEventListener('mousemove', (e) => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - track.offsetLeft;
      const walk = (x - startX) * 1.2;
      track.scrollLeft = scrollLeft - walk;
    });
  });

  /* =========================================================
     3. Header: menú móvil y buscador
     ========================================================= */
  const navToggle = document.getElementById('navToggle');
  const mainNav = document.getElementById('mainNav');
  navToggle?.addEventListener('click', () => {
    const isOpen = mainNav.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', isOpen);
  });

  const searchToggle = document.getElementById('searchToggle');
  const searchBar = document.getElementById('searchBar');
  searchToggle?.addEventListener('click', () => {
    const isOpen = searchBar.classList.toggle('open');
    if (isOpen) searchBar.querySelector('input')?.focus();
  });

  /* =========================================================
     4. Header con sombra al hacer scroll
     ========================================================= */
  const header = document.getElementById('siteHeader');
  const onScroll = () => {
    header.style.boxShadow = window.scrollY > 8
      ? '0 8px 24px rgba(0,0,0,.35)'
      : 'none';
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* =========================================================
     5. Cerrar menú móvil al navegar
     ========================================================= */
  mainNav?.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      mainNav.classList.remove('open');
      navToggle?.setAttribute('aria-expanded', 'false');
    });
  });

});
