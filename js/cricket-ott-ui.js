/**
 * Cricket Live & Highlights + OTT Hub UI Controller
 * Extends window.App with interactive Cricket & OTT views and Cinema Video Modal
 */

(function () {
  const CRICKET_THUMB_SVG = "data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='338' viewBox='0 0 600 338'%3E%3Crect width='600' height='338' fill='%230f172a'/%3E%3Ctext x='50%25' y='45%25' dominant-baseline='middle' text-anchor='middle' font-size='56'%3E🏏%3C/text%3E%3Ctext x='50%25' y='65%25' dominant-baseline='middle' text-anchor='middle' fill='%2334d399' font-family='sans-serif' font-size='18' font-weight='700'%3ECRICKET HIGHLIGHTS%3C/text%3E%3C/svg%3E";
  const OTT_POSTER_SVG = "data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='250' viewBox='0 0 400 250'%3E%3Crect width='400' height='250' fill='%23111827'/%3E%3Ctext x='50%25' y='45%25' dominant-baseline='middle' text-anchor='middle' font-size='48'%3E🎬%3C/text%3E%3Ctext x='50%25' y='65%25' dominant-baseline='middle' text-anchor='middle' fill='%23c4b5fd' font-family='sans-serif' font-size='16' font-weight='700'%3EOTT TITLE%3C/text%3E%3C/svg%3E";

  window.handleImgFallback = function (img, type) {
    if (!img) return;
    img.onerror = null;
    img.src = (type === 'ott') ? OTT_POSTER_SVG : CRICKET_THUMB_SVG;
  };

  window.handleLogoFallback = function (img) {
    if (!img) return;
    img.onerror = null;
    img.style.display = 'none';
    if (img.previousElementSibling) {
      img.previousElementSibling.style.display = 'flex';
    }
  };
  if (typeof window === "undefined") return;

  // Initialize Modal and Keyboard events when DOM is ready
  document.addEventListener('DOMContentLoaded', () => {
    const modalViewer = document.getElementById('modal-video-viewer');
    const closeBtn = document.getElementById('modal-close-video-viewer');

    closeBtn?.addEventListener('click', () => {
      window.App?.closeVideoModal();
    });

    modalViewer?.addEventListener('click', (e) => {
      if (e.target === modalViewer) {
        window.App?.closeVideoModal();
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modalViewer?.classList.contains('open')) {
        window.App?.closeVideoModal();
      }
    });
  });

  // Ensure window.App exists
  window.App = window.App || {};

  /**
   * Render Cricket Live Matches & Match Highlights
   */
  window.App.renderCricketSection = function (filter = 'all') {
    this.state.cricketFilter = filter;
    const grid = document.getElementById('channels-grid');
    const emptyState = document.getElementById('channels-empty-state');
    const totalBadge = document.getElementById('directory-total-badge');
    const heading = document.getElementById('directory-heading');

    if (heading) heading.textContent = '🏏 Cricket Live Matches & Match Highlights';
    if (emptyState) emptyState.style.display = 'none';

    const cData = window.CRICKET_DATA || { liveMatches: [], liveChannels: [], highlights: [] };
    if (totalBadge) {
      totalBadge.textContent = `${cData.liveChannels.length} Live Channels • ${cData.highlights.length} Match Highlights`;
    }

    if (!grid) return;
    grid.innerHTML = '';
    const container = document.createDocumentFragment();

    // 1. Live Match Scores Ticker Banner
    const scoreSection = document.createElement('div');
    scoreSection.className = 'cricket-banner-section';
    scoreSection.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 2px;">
        <div style="display: flex; align-items: center; gap: 8px;">
          <span style="font-size: 1.1rem;">⚡</span>
          <span style="font-weight: 800; font-size: 0.95rem; text-transform: uppercase; letter-spacing: 0.05em; color: #34d399;">Live Match Scores & Fixtures</span>
        </div>
        <span class="live-pill"><span class="live-pulse-dot"></span> REALTIME FEEDS</span>
      </div>
      <div class="cricket-score-ticker">
        ${cData.liveMatches.map(m => `
          <div class="score-card">
            <div class="score-card-header">
              <span class="score-badge ${m.badge === 'LIVE' ? 'live-pulse' : ''}">${m.badge}</span>
              <span>${m.tournament}</span>
            </div>
            <div class="score-teams-row">
              <div class="score-team-item">
                <span class="score-team-name">${m.team1.flag} ${m.team1.name}</span>
                <span class="score-team-runs">${m.team1.score}</span>
              </div>
              <div class="score-vs-divider">VS</div>
              <div class="score-team-item" style="text-align: right; align-items: flex-end;">
                <span class="score-team-name">${m.team2.flag} ${m.team2.name}</span>
                <span class="score-team-runs">${m.team2.score}</span>
              </div>
            </div>
            <div class="score-card-footer">
              <span style="display: -webkit-box; -webkit-line-clamp: 1; -webkit-box-orient: vertical; overflow: hidden; max-width: 65%;">${m.summary}</span>
              <button class="score-watch-btn" data-channel-id="${m.streamChannelId}">
                <span>▶ Watch Live</span>
              </button>
            </div>
          </div>
        `).join('')}
      </div>
    `;

    // Click handler for Live Stream from score card
    scoreSection.querySelectorAll('.score-watch-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const chId = btn.dataset.channelId;
        const targetCh = cData.liveChannels.find(c => c.id === chId) || cData.liveChannels[0];
        if (targetCh && window.Player) {
          window.Player.playChannel(targetCh);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      });
    });

    container.appendChild(scoreSection);

    // 2. Sub-filter Bar
    const filterBar = document.createElement('div');
    filterBar.className = 'sub-filter-bar';
    const filters = [
      { id: 'all', label: '🌟 All Cricket', count: cData.liveChannels.length + cData.highlights.length },
      { id: 'live', label: '🔴 Live Matches & Streams', count: cData.liveChannels.length },
      { id: 'highlights', label: '🎬 All Highlights (Video)', count: cData.highlights.length },
      { id: 'worldcup', label: '🏆 World Cup Thrillers', count: cData.highlights.filter(h => h.type === 'worldcup').length },
      { id: 'ipl', label: '🦁 IPL Thrillers', count: cData.highlights.filter(h => h.type === 'ipl').length },
      { id: 'classics', label: '👑 Vintage Classics', count: cData.highlights.filter(h => h.type === 'classics').length }
    ];

    filters.forEach(f => {
      const btn = document.createElement('button');
      btn.className = `sub-filter-pill ${filter === f.id ? 'active' : ''}`;
      btn.innerHTML = `${f.label} <span style="font-size: 0.7rem; opacity: 0.7;">(${f.count})</span>`;
      btn.addEventListener('click', () => {
        this.renderCricketSection(f.id);
      });
      filterBar.appendChild(btn);
    });
    container.appendChild(filterBar);

    // 3. Render Channels and Video Highlights
    const showLive = (filter === 'all' || filter === 'live');
    const showHighlights = (filter !== 'live');

    // Live Channels
    if (showLive) {
      cData.liveChannels.forEach(ch => {
        const card = document.createElement('div');
        card.className = 'channel-card';
        card.innerHTML = `
          <div class="card-top-row">
            <div class="card-logo-wrap">
              <span class="card-fallback-logo">🏏</span>
              <img class="card-logo" src="${ch.logo}" alt="${ch.name}" loading="lazy" onerror="window.handleLogoFallback(this);">
            </div>
            <div class="card-badges-wrap">
              <span class="tag-badge" style="background: rgba(239, 68, 68, 0.2); color: #ef4444; border: 1px solid rgba(239,68,68,0.4);">LIVE</span>
              <span class="tag-badge">${ch.quality || '1080p'}</span>
            </div>
          </div>
          <div class="card-info-wrap">
            <h4 class="card-name" title="${ch.name}">${ch.name}</h4>
            <div class="card-meta">
              <span>${ch.country === 'IN' ? '🇮🇳 India' : '🌐 Global'}</span>
              <span>•</span>
              <span style="color: #34d399; font-weight: 600;">24/7 Cricket Stream</span>
            </div>
          </div>
          <div class="card-actions-row">
            <span style="font-size: 0.72rem; color: var(--text-dim); display: -webkit-box; -webkit-line-clamp: 1; -webkit-box-orient: vertical; overflow: hidden;">${ch.desc || 'Live Cricket'}</span>
            <button class="card-play-btn" title="Stream Live">
              <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
            </button>
          </div>
        `;
        card.addEventListener('click', () => {
          if (window.Player) {
            window.Player.playChannel(ch);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }
        });
        container.appendChild(card);
      });
    }

    // Match Highlights
    if (showHighlights) {
      let filteredHighlights = cData.highlights;
      if (filter === 'worldcup' || filter === 'ipl' || filter === 'classics') {
        filteredHighlights = cData.highlights.filter(h => h.type === filter);
      }

      filteredHighlights.forEach(hl => {
        const card = document.createElement('div');
        card.className = 'highlight-card';
        card.innerHTML = `
          <div class="highlight-thumb-box">
            <img class="highlight-thumb" src="${hl.thumb}" alt="${hl.title}" loading="lazy" onerror="window.handleImgFallback(this, 'cricket');">
            <div class="highlight-play-overlay">
              <div class="highlight-play-btn-circle">
                <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
              </div>
            </div>
            <span class="highlight-tag-badge">${hl.type.toUpperCase()}</span>
            <span class="highlight-duration-tag">⏱ ${hl.duration}</span>
          </div>
          <div class="highlight-info-body">
            <h4 class="highlight-title" title="${hl.title}">${hl.title}</h4>
            <div class="highlight-desc">${hl.heroMoments}</div>
            <div class="highlight-meta-row">
              <span style="color: #34d399; font-weight: 700;">${hl.teams}</span>
              <span>${hl.date}</span>
            </div>
          </div>
        `;

        card.addEventListener('click', () => {
          this.openVideoModal({
            title: hl.title,
            badge: 'CRICKET MATCH HIGHLIGHT',
            badgeColor: '#10b981',
            embedUrl: hl.embedUrl,
            videoId: hl.videoId,
            desc: `<strong>${hl.tournament}</strong> — ${hl.heroMoments} (${hl.teams}, ${hl.date})`,
            actionLabel: '🔴 Watch Live Cricket Channel',
            onAction: () => {
              this.closeVideoModal();
              if (window.Player && cData.liveChannels.length > 0) {
                window.Player.playChannel(cData.liveChannels[0]);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }
            }
          });
        });

        container.appendChild(card);
      });
    }

    grid.appendChild(container);
  };

  /**
   * Render 100% Legal OTT Hub & Free Movies Section
   */
  window.App.renderOTTSection = function (filter = 'all') {
    this.state.ottFilter = filter;
    const grid = document.getElementById('channels-grid');
    const emptyState = document.getElementById('channels-empty-state');
    const totalBadge = document.getElementById('directory-total-badge');
    const heading = document.getElementById('directory-heading');

    if (heading) heading.textContent = '🎬 Public & Legal Cinema Hub (Free Full Movies & OTT)';
    if (emptyState) emptyState.style.display = 'none';

    const oData = window.OTT_DATA || { platforms: [], legalMovies: [], titles: [], freeFastChannels: [] };
    const legalMovies = oData.legalMovies || [];
    const titles = oData.titles || [];
    const freeFastChannels = oData.freeFastChannels || [];
    const totalCount = legalMovies.length + titles.length + freeFastChannels.length;

    if (totalBadge) {
      totalBadge.textContent = `${legalMovies.length} Free Full Movies • ${freeFastChannels.length} FAST Live Cinema • OTT Hub`;
    }

    if (!grid) return;
    grid.innerHTML = '';
    const container = document.createDocumentFragment();

    // 1. Legal Hub Transparency Banner
    const banner = document.createElement('div');
    banner.className = 'legal-hub-banner';
    banner.innerHTML = `
      <div class="legal-hub-badge">🛡️ 100% LEGAL & LICENSED</div>
      <div class="legal-hub-content">
        <h4>Public & Legal Cinema Hub</h4>
        <p>Stream officially licensed full-length Tamil movies from verified studios (AP International, Saregama Tamil, Rajshri Tamil, Ayngaran), 24/7 FAST broadcast channels, and official OTT streaming portals.</p>
      </div>
    `;
    container.appendChild(banner);

    // 2. OTT Launchers Header
    const launcherHeader = document.createElement('div');
    launcherHeader.className = 'ott-hub-header';
    launcherHeader.innerHTML = `
      <a href="https://www.netflix.com" target="_blank" rel="noopener noreferrer" class="ott-launcher-card netflix">
        <div class="ott-launcher-left">
          <div class="ott-launcher-title"><span>🔴</span> Netflix Hub</div>
          <div class="ott-launcher-subtitle">Leo, Squid Game, Stranger Things & Originals</div>
        </div>
        <span class="ott-launch-action-btn">Launch Netflix ↗</span>
      </a>

      <a href="https://www.hotstar.com" target="_blank" rel="noopener noreferrer" class="ott-launcher-card hotstar">
        <div class="ott-launcher-left">
          <div class="ott-launcher-title"><span>🔷</span> Disney+ Hotstar</div>
          <div class="ott-launcher-subtitle">Live Cricket, Shōgun, Marvel & Tamil Specials</div>
        </div>
        <span class="ott-launch-action-btn">Launch Hotstar ↗</span>
      </a>

      <a href="https://www.primevideo.com" target="_blank" rel="noopener noreferrer" class="ott-launcher-card prime">
        <div class="ott-launcher-left">
          <div class="ott-launcher-title"><span>🔵</span> Amazon Prime Video</div>
          <div class="ott-launcher-subtitle">Captain Miller, Suzhal, Mirzapur & The Boys</div>
        </div>
        <span class="ott-launch-action-btn">Launch Prime ↗</span>
      </a>

      <a href="https://www.aha.video" target="_blank" rel="noopener noreferrer" class="ott-launcher-card aha">
        <div class="ott-launcher-left">
          <div class="ott-launcher-title"><span>🟠</span> Aha Tamil</div>
          <div class="ott-launcher-subtitle">100% Tamil OTT: Irai, Raththam, Sardar & Cinema</div>
        </div>
        <span class="ott-launch-action-btn">Launch Aha ↗</span>
      </a>

      <a href="https://www.zee5.com" target="_blank" rel="noopener noreferrer" class="ott-launcher-card zee5">
        <div class="ott-launcher-left">
          <div class="ott-launcher-title"><span>🟣</span> Zee5 Tamil</div>
          <div class="ott-launcher-subtitle">Ayali, Sengalam, Valimai & Exclusive Series</div>
        </div>
        <span class="ott-launch-action-btn">Launch Zee5 ↗</span>
      </a>

      <a href="https://www.jiocinema.com" target="_blank" rel="noopener noreferrer" class="ott-launcher-card jiocinema">
        <div class="ott-launcher-left">
          <div class="ott-launcher-title"><span>💖</span> JioCinema</div>
          <div class="ott-launcher-subtitle">Free Movies, Blockbusters & Live Digital Sports</div>
        </div>
        <span class="ott-launch-action-btn">Launch JioCinema ↗</span>
      </a>
    `;
    container.appendChild(launcherHeader);

    // 3. Sub-filter Bar
    const filterBar = document.createElement('div');
    filterBar.className = 'sub-filter-bar';
    const filters = [
      { id: 'all', label: '🌟 All Legal Titles', count: totalCount },
      { id: 'legal_movies', label: '🍿 Free Full Movies', count: legalMovies.length },
      { id: 'free_ott', label: '📡 24/7 Live Movie Channels', count: freeFastChannels.length },
      { id: 'netflix', label: '🔴 Netflix', count: titles.filter(t => t.platform === 'netflix').length },
      { id: 'hotstar', label: '🔷 Disney+ Hotstar', count: titles.filter(t => t.platform === 'hotstar').length },
      { id: 'prime', label: '🔵 Prime Video', count: titles.filter(t => t.platform === 'prime').length },
      { id: 'regional', label: '🟡 Aha & Zee5', count: titles.filter(t => t.platform === 'regional').length }
    ];

    filters.forEach(f => {
      const btn = document.createElement('button');
      btn.className = `sub-filter-pill ${filter === f.id ? 'active' : ''}`;
      btn.innerHTML = `${f.label} <span style="font-size: 0.7rem; opacity: 0.7;">(${f.count})</span>`;
      btn.addEventListener('click', () => {
        this.renderOTTSection(f.id);
      });
      filterBar.appendChild(btn);
    });
    container.appendChild(filterBar);

    // Filter by search query if user typed into global search input
    const query = (this.state.search || '').toLowerCase().trim();

    // 4. Render Legal Full Movies
    const showMovies = (filter === 'all' || filter === 'legal_movies');
    if (showMovies) {
      let filteredMovies = legalMovies;
      if (query) {
        filteredMovies = filteredMovies.filter(m =>
          m.title.toLowerCase().includes(query) ||
          m.cast.toLowerCase().includes(query) ||
          m.director.toLowerCase().includes(query) ||
          m.distributor.toLowerCase().includes(query) ||
          m.genres.some(g => g.toLowerCase().includes(query))
        );
      }

      filteredMovies.forEach(m => {
        const card = document.createElement('div');
        card.className = 'ott-card';
        card.innerHTML = `
          <div class="ott-poster-wrap">
            <img class="ott-poster" src="${m.thumb}" alt="${m.title}" loading="lazy" onerror="window.handleImgFallback(this, 'ott');">
            <span class="ott-platform-badge" style="background: #10b981;">✅ 100% LEGAL & FREE</span>
            <span class="ott-duration-badge">${m.duration}</span>
            <span class="ott-rating-badge">${m.rating}</span>
          </div>
          <div class="ott-body">
            <h4 class="ott-title">${m.title}</h4>
            <div class="ott-genres-row">
              ${m.genres.map(g => `<span class="ott-genre-tag">${g}</span>`).join('')}
              <span class="ott-genre-tag" style="color: #6ee7b7;">${m.year}</span>
            </div>
            <div class="ott-cast-line"><strong>Cast:</strong> ${m.cast}</div>
            <div class="ott-director-line"><strong>Dir:</strong> ${m.director}</div>
            <div class="ott-distributor-badge">🏢 <span>${m.distributor}</span></div>
            <div class="ott-overview">${m.overview}</div>
            <div class="ott-actions-row">
              <button class="ott-btn-play-movie">
                <span>▶ Watch Full Movie</span>
              </button>
              <a href="${m.watchUrl}" target="_blank" rel="noopener noreferrer" class="ott-btn-watch" style="background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.18); flex: 0.8;" title="Open on official rights holder's channel">
                <span>↗ Studio</span>
              </a>
            </div>
          </div>
        `;

        // Click to play full movie in Cinema Modal
        card.querySelector('.ott-btn-play-movie')?.addEventListener('click', (e) => {
          e.stopPropagation();
          this.openVideoModal({
            title: `${m.title} (${m.year}) — Full Movie`,
            badge: '100% LEGAL & FREE FULL MOVIE',
            badgeColor: '#10b981',
            embedUrl: m.embedUrl,
            videoId: m.videoId,
            desc: `<strong>${m.title} (${m.year})</strong><br><span style="color: #34d399; font-weight: 600;">⭐ ${m.rating}</span> • ⏱ ${m.duration} • 🔊 ${m.language}<br><strong>🎭 Cast:</strong> ${m.cast}<br><strong>🎬 Director:</strong> ${m.director}<br><strong>🏢 Official Distributor:</strong> ${m.distributor}<br><p style="margin-top: 8px; color: var(--text-dim); font-size: 0.8rem;">${m.overview}</p>`,
            actionLabel: '↗ Open on YouTube',
            onAction: () => {
              window.open(m.watchUrl, '_blank');
            }
          });
        });

        container.appendChild(card);
      });
    }

    // 5. Render 24/7 FAST Free Movie Channels
    if (filter === 'all' || filter === 'free_ott') {
      let filteredChannels = freeFastChannels;
      if (query) {
        filteredChannels = filteredChannels.filter(c =>
          c.name.toLowerCase().includes(query) ||
          c.desc.toLowerCase().includes(query)
        );
      }

      filteredChannels.forEach(ch => {
        const card = document.createElement('div');
        card.className = 'channel-card';
        card.innerHTML = `
          <div class="card-top-row">
            <div class="card-logo-wrap">
              <span class="card-fallback-logo">🎬</span>
              <img class="card-logo" src="${ch.logo}" alt="${ch.name}" loading="lazy" onerror="window.handleLogoFallback(this);">
            </div>
            <div class="card-badges-wrap">
              <span class="tag-badge" style="background: rgba(16, 185, 129, 0.2); color: #34d399; border: 1px solid rgba(16,185,129,0.4);">FREE FAST</span>
              <span class="tag-badge">${ch.quality}</span>
            </div>
          </div>
          <div class="card-info-wrap">
            <h4 class="card-name" title="${ch.name}">${ch.name}</h4>
            <div class="card-meta">
              <span>Free Cinema</span>
              <span>•</span>
              <span style="color: #34d399; font-weight: 600;">24/7 Movie Stream</span>
            </div>
          </div>
          <div class="card-actions-row">
            <span style="font-size: 0.72rem; color: var(--text-dim); display: -webkit-box; -webkit-line-clamp: 1; -webkit-box-orient: vertical; overflow: hidden;">${ch.desc}</span>
            <button class="card-play-btn" title="Stream Movie Channel">
              <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
            </button>
          </div>
        `;
        card.addEventListener('click', () => {
          if (window.Player) {
            window.Player.playChannel(ch);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }
        });
        container.appendChild(card);
      });
    }

    // 6. Render Curated OTT Titles
    const showOTT = (filter === 'all' || filter === 'netflix' || filter === 'hotstar' || filter === 'prime' || filter === 'regional');
    if (showOTT) {
      let filteredTitles = titles;
      if (filter !== 'all') {
        filteredTitles = titles.filter(t => t.platform === filter);
      }
      if (query) {
        filteredTitles = filteredTitles.filter(t =>
          t.title.toLowerCase().includes(query) ||
          t.platformName.toLowerCase().includes(query) ||
          t.genres.some(g => g.toLowerCase().includes(query))
        );
      }

      filteredTitles.forEach(item => {
        const card = document.createElement('div');
        card.className = 'ott-card';
        card.innerHTML = `
          <div class="ott-poster-wrap">
            <img class="ott-poster" src="${item.poster}" alt="${item.title}" loading="lazy" onerror="window.handleImgFallback(this, 'ott');">
            <span class="ott-platform-badge ${item.platform}">${item.platformName}</span>
            <span class="ott-rating-badge">${item.rating}</span>
          </div>
          <div class="ott-body">
            <h4 class="ott-title">${item.title}</h4>
            <div class="ott-genres-row">
              ${item.genres.map(g => `<span class="ott-genre-tag">${g}</span>`).join('')}
              <span class="ott-genre-tag" style="color: #6ee7b7;">${item.year}</span>
            </div>
            <div class="ott-overview">${item.overview}</div>
            <div class="ott-actions-row">
              <button class="ott-btn-trailer" data-video-id="${item.videoId}">
                <span>▶ Trailer</span>
              </button>
              <a href="${item.watchUrl}" target="_blank" rel="noopener noreferrer" class="ott-btn-watch" style="background: ${item.platform === 'netflix' ? '#e50914' : (item.platform === 'hotstar' ? '#0c54e0' : (item.platform === 'regional' ? '#ff5200' : '#00a8e1'))};">
                <span>🚀 Stream ↗</span>
              </a>
            </div>
          </div>
        `;

        card.querySelector('.ott-btn-trailer')?.addEventListener('click', (e) => {
          e.stopPropagation();
          this.openVideoModal({
            title: `${item.title} — Official Trailer`,
            badge: item.platformName.toUpperCase(),
            badgeColor: item.platform === 'netflix' ? '#e50914' : (item.platform === 'hotstar' ? '#0c54e0' : (item.platform === 'regional' ? '#ff5200' : '#00a8e1')),
            videoId: item.videoId,
            embedUrl: `https://www.youtube-nocookie.com/embed/${item.videoId}?autoplay=1`,
            desc: `<strong>${item.title} (${item.year})</strong> — ${item.overview}<br><span style="color: var(--text-muted); font-size: 0.78rem;">Audio: ${item.language} • Rating: ${item.rating}</span>`,
            actionLabel: `🚀 Open on ${item.platformName}`,
            onAction: () => {
              window.open(item.watchUrl, '_blank');
            }
          });
        });

        container.appendChild(card);
      });
    }

    grid.appendChild(container);
  };

  /**
   * Cinema Video Highlights & Trailer Modal Controllers
   */
  window.App.openVideoModal = function (options = {}) {
    const modal = document.getElementById('modal-video-viewer');
    const badge = document.getElementById('modal-video-badge');
    const title = document.getElementById('modal-video-title');
    const embedBox = document.getElementById('modal-video-embed-box');
    const descBox = document.getElementById('modal-video-desc');
    const actionsBox = document.getElementById('modal-video-actions');
    if (!modal) return;

    if (badge) {
      badge.textContent = options.badge || 'HIGHLIGHT';
      badge.style.background = options.badgeColor || 'var(--accent-primary)';
    }
    if (title) title.textContent = options.title || 'Video Player';

    const embedUrl = options.embedUrl || (options.videoId ? `https://www.youtube-nocookie.com/embed/${options.videoId}?autoplay=1` : '');
    if (embedBox) {
      embedBox.innerHTML = `<iframe src="${embedUrl}" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>`;
    }

    if (descBox) descBox.innerHTML = options.desc || '';
    if (actionsBox) actionsBox.innerHTML = '';

    if (options.actionLabel && actionsBox) {
      const actBtn = document.createElement('button');
      actBtn.className = 'btn-primary';
      actBtn.style.padding = '8px 16px';
      actBtn.style.fontSize = '0.85rem';
      actBtn.textContent = options.actionLabel;
      actBtn.addEventListener('click', () => {
        if (options.onAction) options.onAction();
      });
      actionsBox.appendChild(actBtn);
    }

    if (actionsBox) {
      const closeBtn = document.createElement('button');
      closeBtn.className = 'btn-primary';
      closeBtn.style.background = 'rgba(255, 255, 255, 0.1)';
      closeBtn.style.padding = '8px 16px';
      closeBtn.style.fontSize = '0.85rem';
      closeBtn.textContent = 'Close';
      closeBtn.addEventListener('click', () => this.closeVideoModal());
      actionsBox.appendChild(closeBtn);
    }

    modal.classList.add('open');
    modal.classList.add('active');
  };

  window.App.closeVideoModal = function () {
    const modal = document.getElementById('modal-video-viewer');
    const embedBox = document.getElementById('modal-video-embed-box');
    if (!modal) return;
    modal.classList.remove('open');
    modal.classList.remove('active');
    // Clear iframe to terminate audio playback immediately
    if (embedBox) embedBox.innerHTML = '';
  };
})();
