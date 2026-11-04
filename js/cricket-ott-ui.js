/**
 * Cricket Live & Highlights + OTT Hub UI Controller
 * Extends window.App with interactive Cricket & OTT views and Cinema Video Modal
 */

(function () {
  if (typeof window === 'undefined') return;

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
              <img class="card-logo" src="${ch.logo}" alt="${ch.name}" loading="lazy" onerror="this.style.display='none'; this.previousElementSibling.style.display='flex';">
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
            <img class="highlight-thumb" src="${hl.thumb}" alt="${hl.title}" loading="lazy" onerror="this.src='${hl.fallbackThumb}';">
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
   * Render OTT Hub (Netflix, Disney+ Hotstar, Amazon Prime Video)
   */
  window.App.renderOTTSection = function (filter = 'all') {
    this.state.ottFilter = filter;
    const grid = document.getElementById('channels-grid');
    const emptyState = document.getElementById('channels-empty-state');
    const totalBadge = document.getElementById('directory-total-badge');
    const heading = document.getElementById('directory-heading');

    if (heading) heading.textContent = '🎬 OTT Hub (Netflix, Disney+ Hotstar, Amazon Prime Video)';
    if (emptyState) emptyState.style.display = 'none';

    const oData = window.OTT_DATA || { platforms: [], titles: [], freeFastChannels: [] };
    if (totalBadge) {
      totalBadge.textContent = 'Netflix • Hotstar • Prime Video • Free OTT Cinema';
    }

    if (!grid) return;
    grid.innerHTML = '';
    const container = document.createDocumentFragment();

    // 1. OTT Launchers Header
    const launcherHeader = document.createElement('div');
    launcherHeader.className = 'ott-hub-header';
    launcherHeader.innerHTML = `
      <a href="https://www.netflix.com" target="_blank" rel="noopener noreferrer" class="ott-launcher-card netflix">
        <div class="ott-launcher-left">
          <div class="ott-launcher-title"><span>🔴</span> Netflix Hub</div>
          <div class="ott-launcher-subtitle">Squid Game, Leo, Stranger Things & Originals</div>
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
          <div class="ott-launcher-subtitle">Mirzapur, The Boys, Panchayat & Blockbusters</div>
        </div>
        <span class="ott-launch-action-btn">Launch Prime ↗</span>
      </a>
    `;
    container.appendChild(launcherHeader);

    // 2. Sub-filter Bar
    const filterBar = document.createElement('div');
    filterBar.className = 'sub-filter-bar';
    const filters = [
      { id: 'all', label: '🌟 All OTT Titles', count: oData.titles.length + oData.freeFastChannels.length },
      { id: 'netflix', label: '🔴 Netflix', count: oData.titles.filter(t => t.platform === 'netflix').length },
      { id: 'hotstar', label: '🔷 Disney+ Hotstar', count: oData.titles.filter(t => t.platform === 'hotstar').length },
      { id: 'prime', label: '🔵 Prime Video', count: oData.titles.filter(t => t.platform === 'prime').length },
      { id: 'free_ott', label: '🆓 Free Live Movies', count: oData.freeFastChannels.length }
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

    // 3. Render OTT Content Cards
    let filteredTitles = oData.titles;
    if (filter === 'netflix' || filter === 'hotstar' || filter === 'prime') {
      filteredTitles = oData.titles.filter(t => t.platform === filter);
    } else if (filter === 'free_ott') {
      filteredTitles = [];
    }

    filteredTitles.forEach(item => {
      const card = document.createElement('div');
      card.className = 'ott-card';
      card.innerHTML = `
        <div class="ott-poster-wrap">
          <img class="ott-poster" src="${item.poster}" alt="${item.title}" loading="lazy">
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
              <span>▶ Watch Trailer</span>
            </button>
            <a href="${item.watchUrl}" target="_blank" rel="noopener noreferrer" class="ott-btn-watch" style="background: ${item.platform === 'netflix' ? '#e50914' : (item.platform === 'hotstar' ? '#0c54e0' : '#00a8e1')};">
              <span>🚀 Stream ↗</span>
            </a>
          </div>
        </div>
      `;

      // Trailer button
      card.querySelector('.ott-btn-trailer')?.addEventListener('click', (e) => {
        e.stopPropagation();
        this.openVideoModal({
          title: `${item.title} — Official Trailer`,
          badge: item.platformName.toUpperCase(),
          badgeColor: item.platform === 'netflix' ? '#e50914' : (item.platform === 'hotstar' ? '#0c54e0' : '#00a8e1'),
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

    // Also show Free Movie Channels if 'all' or 'free_ott'
    if (filter === 'all' || filter === 'free_ott') {
      oData.freeFastChannels.forEach(ch => {
        const card = document.createElement('div');
        card.className = 'channel-card';
        card.innerHTML = `
          <div class="card-top-row">
            <div class="card-logo-wrap">
              <span class="card-fallback-logo">🎬</span>
              <img class="card-logo" src="${ch.logo}" alt="${ch.name}" loading="lazy" onerror="this.style.display='none'; this.previousElementSibling.style.display='flex';">
            </div>
            <div class="card-badges-wrap">
              <span class="tag-badge" style="background: rgba(16, 185, 129, 0.2); color: #34d399; border: 1px solid rgba(16,185,129,0.4);">FREE OTT</span>
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
