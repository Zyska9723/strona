import { sections, movies } from './anime_data.js';

const malUrl = (title) => `https://myanimelist.net/anime.php?q=${encodeURIComponent(title)}&cat=anime`;

const PALETTES = [
  { from: '#1a0b2e', via: '#3b0764', to: '#7e22ce', accent: '#c084fc', glow: '#a855f7' },
  { from: '#0c0a1f', via: '#1e1b4b', to: '#4338ca', accent: '#818cf8', glow: '#6366f1' },
  { from: '#1a0a0a', via: '#7c2d12', to: '#ea580c', accent: '#fb923c', glow: '#f97316' },
  { from: '#0a1a1f', via: '#0c4a6e', to: '#0891b2', accent: '#22d3ee', glow: '#06b6d4' },
  { from: '#1a0a14', via: '#831843', to: '#db2777', accent: '#f472b6', glow: '#ec4899' },
  { from: '#0a1a0f', via: '#064e3b', to: '#059669', accent: '#34d399', glow: '#10b981' },
  { from: '#1f1a0a', via: '#78350f', to: '#d97706', accent: '#fbbf24', glow: '#f59e0b' },
  { from: '#0a0a1f', via: '#1e293b', to: '#475569', accent: '#94a3b8', glow: '#64748b' },
  { from: '#150a1f', via: '#581c87', to: '#9333ea', accent: '#d8b4fe', glow: '#a855f7' },
  { from: '#1f0a1a', via: '#9f1239', to: '#e11d48', accent: '#fda4af', glow: '#f43f5e' }
];

const GLYPHS = ['桜','刀','龍','炎','月','星','風','雷','花','夢','闇','光','心','魂','戦','愛','空','海','神','侍','姫','忍','鬼','虎','狼'];

function hashCode(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) - h) + str.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

function escapeXml(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
}

function escapeHtml(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function wrapTitle(title, maxCharsPerLine = 14) {
  const words = title.split(' ');
  const lines = [];
  let current = '';
  for (const w of words) {
    if ((current + ' ' + w).trim().length <= maxCharsPerLine) {
      current = (current + ' ' + w).trim();
    } else {
      if (current) lines.push(current);
      current = w;
    }
  }
  if (current) lines.push(current);
  return lines.slice(0, 4);
}

function generatePosterSVG(title, mustWatch) {
  const seed = hashCode(title);
  const palette = PALETTES[seed % PALETTES.length];
  const glyph = GLYPHS[seed % GLYPHS.length];
  const titleLines = wrapTitle(title);
  const lineHeight = 36;
  const startY = 320 - ((titleLines.length - 1) * lineHeight) / 2;

  const titleSvg = titleLines.map((line, i) =>
    `<text x="200" y="${startY + i * lineHeight}" font-family="Montserrat, Inter, sans-serif" font-size="28" font-weight="800" fill="#ffffff" text-anchor="middle" letter-spacing="0.5">${escapeXml(line)}</text>`
  ).join('');

  const star = mustWatch ? `
    <g transform="translate(200, 90)">
      <circle r="26" fill="${palette.glow}" opacity="0.3"/>
      <text y="10" font-size="32" text-anchor="middle">⭐</text>
    </g>` : '';

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 600" preserveAspectRatio="xMidYMid slice">
    <defs>
      <linearGradient id="bg${seed}" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${palette.from}"/>
        <stop offset="50%" stop-color="${palette.via}"/>
        <stop offset="100%" stop-color="${palette.to}"/>
      </linearGradient>
      <radialGradient id="glow${seed}" cx="50%" cy="40%" r="60%">
        <stop offset="0%" stop-color="${palette.accent}" stop-opacity="0.35"/>
        <stop offset="100%" stop-color="${palette.accent}" stop-opacity="0"/>
      </radialGradient>
      <linearGradient id="bottom${seed}" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#000000" stop-opacity="0"/>
        <stop offset="100%" stop-color="#000000" stop-opacity="0.6"/>
      </linearGradient>
      <filter id="blur${seed}">
        <feGaussianBlur stdDeviation="3"/>
      </filter>
    </defs>
    <rect width="400" height="600" fill="url(#bg${seed})"/>
    <circle cx="80" cy="120" r="140" fill="url(#glow${seed})"/>
    <circle cx="340" cy="450" r="180" fill="url(#glow${seed})" opacity="0.6"/>
    <text x="200" y="250" font-family="serif" font-size="220" fill="${palette.accent}" opacity="0.18" text-anchor="middle" filter="url(#blur${seed})">${glyph}</text>
    <text x="200" y="240" font-family="serif" font-size="200" fill="${palette.accent}" opacity="0.28" text-anchor="middle">${glyph}</text>
    <rect x="0" y="400" width="400" height="200" fill="url(#bottom${seed})"/>
    <line x1="60" y1="${startY - 50}" x2="340" y2="${startY - 50}" stroke="${palette.accent}" stroke-width="2" opacity="0.5"/>
    ${titleSvg}
    <line x1="120" y1="${startY + (titleLines.length - 1) * lineHeight + 30}" x2="280" y2="${startY + (titleLines.length - 1) * lineHeight + 30}" stroke="${palette.accent}" stroke-width="2" opacity="0.5"/>
    <text x="200" y="${startY + (titleLines.length - 1) * lineHeight + 60}" font-family="Montserrat, Inter, sans-serif" font-size="11" font-weight="500" fill="${palette.accent}" text-anchor="middle" letter-spacing="6" opacity="0.85">ANIME</text>
    ${star}
    <rect x="2" y="2" width="396" height="596" fill="none" stroke="${palette.accent}" stroke-width="1" opacity="0.2" rx="4"/>
  </svg>`;

  return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
}

function createCard(anime, category, index = 0) {
  const card = document.createElement('div');
  card.className = 'anime-card reveal-card';
  card.dataset.title = anime.title.toLowerCase();
  card.dataset.genres = anime.genres.map(g => g.toLowerCase()).join('|');
  card.dataset.category = category.toLowerCase();
  card.style.transitionDelay = `${Math.min(index * 45, 350)}ms`;

  const poster = anime.image;

  card.innerHTML = `
    ${anime.mustWatch ? '<span class="must-badge">⭐ MUST WATCH</span>' : ''}
    <div class="poster-wrap">
      <img src="${poster}" alt="${escapeHtml(anime.title)}" loading="lazy" />
      <div class="overlay">
        <div class="overlay-text">Kliknij aby zobaczyć szczegóły →</div>
      </div>
      <div class="glow-ring"></div>
    </div>
    <div class="info">
      <div class="title">${escapeHtml(anime.title)}</div>
      <div class="category">${escapeHtml(category)}</div>
    </div>
  `;
  card.addEventListener('click', () => openModal(anime, category));
  return card;
}

function renderSections() {
  const mustWatchGrid = document.getElementById('must-watch-grid');
  const sectionsContainer = document.getElementById('sections');
  const moviesGrid = document.getElementById('movies-grid');

  const allMustWatch = [];

  sections.forEach(section => {
    const block = document.createElement('section');
    block.id = section.id;
    block.className = 'section-block reveal';
    block.innerHTML = `
      <h2 class="section-title font-display"><span class="section-emoji">${section.emoji}</span>${section.title}</h2>
      <p class="section-subtitle">${section.subtitle}</p>
      <div class="grid-cards"></div>
    `;
    const grid = block.querySelector('.grid-cards');
    section.items.forEach((item, i) => {
      grid.appendChild(createCard(item, section.title, i));
      if (item.mustWatch) allMustWatch.push({ ...item, _category: section.title });
    });
    sectionsContainer.appendChild(block);
  });

  movies.forEach((item, i) => {
    moviesGrid.appendChild(createCard(item, "Film Anime", i));
    if (item.mustWatch) allMustWatch.push({ ...item, _category: "Film Anime" });
  });

  allMustWatch.forEach((item, i) => {
    mustWatchGrid.appendChild(createCard(item, item._category, i));
  });
}

function buildStatsBadges(stats) {
  if (!stats) return '';
  const badges = [];
  if (stats.seasons && stats.seasons > 0) {
    badges.push(`<div class="stat-badge"><i data-lucide="layers" class="w-3.5 h-3.5"></i><span><strong>${stats.seasons}</strong> ${stats.seasons === 1 ? 'Sezon' : 'Sezony'}</span></div>`);
  }
  if (stats.episodes) {
    badges.push(`<div class="stat-badge"><i data-lucide="tv" class="w-3.5 h-3.5"></i><span><strong>${stats.episodes}</strong> odc.</span></div>`);
  }
  if (stats.movies && stats.movies > 0) {
    badges.push(`<div class="stat-badge"><i data-lucide="film" class="w-3.5 h-3.5"></i><span><strong>${stats.movies}</strong> ${stats.movies === 1 ? 'Film' : 'Filmy'}</span></div>`);
  }
  if (stats.ovas && stats.ovas > 0) {
    badges.push(`<div class="stat-badge"><i data-lucide="disc" class="w-3.5 h-3.5"></i><span><strong>${stats.ovas}</strong> OVA</span></div>`);
  }
  if (stats.runtime) {
    badges.push(`<div class="stat-badge"><i data-lucide="clock" class="w-3.5 h-3.5"></i><span>${stats.runtime}</span></div>`);
  }
  if (badges.length === 0) return '';
  return `<div class="stats-row">${badges.join('')}</div>`;
}

function openModal(anime, category) {
  const modal = document.getElementById('modal');
  const body = document.getElementById('modal-body');
  const poster = anime.image;
  const statsHtml = buildStatsBadges(anime.stats);

  body.innerHTML = `
    <div class="modal-poster-col">
      <img src="${poster}" alt="${escapeHtml(anime.title)}" class="modal-poster" />
      ${anime.mustWatch ? '<div class="modal-must-badge">⭐ MUST WATCH</div>' : ''}
    </div>
    <div class="modal-info-col">
      <div class="modal-category">${escapeHtml(category)}</div>
      <h3 class="modal-title font-display">${escapeHtml(anime.title)}</h3>
      ${statsHtml}
      <div class="modal-genres">
        ${anime.genres.map(g => `<span class="genre-tag">${escapeHtml(g)}</span>`).join('')}
      </div>
      <div class="modal-section">
        <div class="modal-section-label">📖 Opis</div>
        <p class="modal-desc">${escapeHtml(anime.desc)}</p>
      </div>
      <div class="recommend-box">
        <div class="recommend-label">💡 Dlaczego warto obejrzeć</div>
        <p class="recommend-text">${escapeHtml(anime.why)}</p>
      </div>
      <a href="${malUrl(anime.title)}" target="_blank" rel="noopener noreferrer" class="mal-button">
        <i data-lucide="external-link" class="w-4 h-4"></i>
        Zobacz na MyAnimeList
        <i data-lucide="arrow-right" class="w-4 h-4 ml-1"></i>
      </a>
    </div>
  `;
  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
  lucide.createIcons();
}

function closeModal() {
  const modal = document.getElementById('modal');
  modal.classList.remove('active');
  document.body.style.overflow = '';
}

function setupSearch() {
  const search = document.getElementById('search');
  const noResults = document.getElementById('no-results');

  const performSearch = (q) => {
    const query = q.toLowerCase().trim();
    let visibleCount = 0;

    document.querySelectorAll('.anime-card').forEach(card => {
      if (!query) {
        card.style.display = '';
        visibleCount++;
        return;
      }
      const title = card.dataset.title || '';
      const genres = card.dataset.genres || '';
      const category = card.dataset.category || '';
      const match = title.includes(query) || genres.includes(query) || category.includes(query);
      card.style.display = match ? '' : 'none';
      if (match) visibleCount++;
    });

    document.querySelectorAll('.section-block, #must-watch, #movies').forEach(sec => {
      const visibleCards = Array.from(sec.querySelectorAll('.anime-card')).filter(c => c.style.display !== 'none');
      sec.style.display = visibleCards.length === 0 && query ? 'none' : '';
    });

    noResults.classList.toggle('hidden', visibleCount > 0 || !query);
  };

  search.addEventListener('input', (e) => performSearch(e.target.value));
}

function setupModal() {
  document.getElementById('modal-close').addEventListener('click', closeModal);
  document.getElementById('modal').addEventListener('click', (e) => {
    if (e.target.id === 'modal' || e.target.classList.contains('modal-backdrop')) closeModal();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
  });
}

function setupReveal() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.reveal, .reveal-card').forEach(el => observer.observe(el));
}

function setupSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (href.length > 1) {
        const target = document.querySelector(href);
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    });
  });
}

renderSections();
setupSearch();
setupModal();
setupReveal();
setupSmoothScroll();
lucide.createIcons();
