/**
 * Tamil Radio FM UI Controller & Equalizer
 */

(function () {
  const RADIO_FALLBACK_SVG = "data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120' viewBox='0 0 120 120'%3E%3Crect width='120' height='120' rx='20' fill='%231e293b'/%3E%3Ctext x='50%25' y='55%25' dominant-baseline='middle' text-anchor='middle' font-size='48'%3E📻%3C/text%3E%3C/svg%3E";

  window.handleRadioLogoFallback = function (img) {
    if (!img) return;
    img.onerror = null;
    img.src = RADIO_FALLBACK_SVG;
  };

  /**
   * Render Tamil Radio FM Directory Section
   */
  window.App.renderRadioSection = function (filter = 'all') {
    this.state.radioFilter = filter;
    const grid = document.getElementById('channels-grid');
    const emptyState = document.getElementById('channels-empty-state');
    const totalBadge = document.getElementById('directory-total-badge');
    const heading = document.getElementById('directory-heading');

    if (heading) heading.textContent = '📻 Tamil Online Radio FM (24/7 Live Music & Stations)';
    if (emptyState) emptyState.style.display = 'none';

    const rData = window.RADIO_DATA || { categories: [], stations: [] };
    const stations = rData.stations || [];

    if (totalBadge) {
      totalBadge.textContent = `${stations.length} Live Tamil Stations • 100% Free & Uninterrupted`;
    }

    if (!grid) return;
    grid.innerHTML = '';
    const container = document.createDocumentFragment();

    // 1. Radio Equalizer & Live Playing HUD Banner
    const currentPlaying = (window.Player && window.Player.currentChannel && window.Player.currentChannel.isRadio) 
      ? window.Player.currentChannel 
      : null;

    const banner = document.createElement('div');
    banner.className = 'radio-player-banner';
    banner.innerHTML = `
      <div class="radio-banner-left">
        <div class="radio-banner-avatar">
          <span class="radio-banner-icon">📻</span>
          <div class="radio-live-ping"></div>
        </div>
        <div class="radio-banner-meta">
          <div class="radio-banner-status">
            <span class="radio-pulse-indicator">● LIVE ON AIR</span>
            <span class="radio-freq-badge">${currentPlaying ? (currentPlaying.frequency || 'Live FM') : '24/7 Tamil Radio'}</span>
          </div>
          <h3 class="radio-banner-title">${currentPlaying ? currentPlaying.name : 'Select a Station to Listen Live'}</h3>
          <p class="radio-banner-desc">${currentPlaying ? (currentPlaying.tagline || currentPlaying.desc) : 'Stream uninterrupted All India Radio, Sri Lanka Sooriyan FM, Gulf 89.4 FM, AR Rahman 24x7, Ilayaraja Super Beats & SPB Hits.'}</p>
        </div>
      </div>
      <div class="radio-banner-right">
        <div class="radio-equalizer ${currentPlaying ? 'active' : ''}">
          <span class="bar bar-1"></span>
          <span class="bar bar-2"></span>
          <span class="bar bar-3"></span>
          <span class="bar bar-4"></span>
          <span class="bar bar-5"></span>
        </div>
      </div>
    `;
    container.appendChild(banner);

    // 2. Sub-filter Category Bar
    const filterBar = document.createElement('div');
    filterBar.className = 'sub-filter-bar';

    const filters = [
      { id: 'all', label: '🌟 All Stations', count: stations.length },
      { id: 'live_fm', label: '📡 Live FM Stations', count: stations.filter(s => s.category === 'live_fm').length },
      { id: 'legends', label: '🎼 Composer Legends', count: stations.filter(s => s.category === 'legends').length },
      { id: 'retro', label: '📼 80s 90s Melodies', count: stations.filter(s => s.category === 'retro').length },
      { id: 'devotional', label: '🛕 Devotional & Bakthi', count: stations.filter(s => s.category === 'devotional').length },
      { id: 'global', label: '🌏 Global Tamil FM', count: stations.filter(s => s.category === 'global').length }
    ];

    filters.forEach(f => {
      const btn = document.createElement('button');
      btn.className = `sub-filter-pill ${filter === f.id ? 'active' : ''}`;
      btn.innerHTML = `${f.label} <span style="font-size: 0.7rem; opacity: 0.7;">(${f.count})</span>`;
      btn.addEventListener('click', () => {
        this.renderRadioSection(f.id);
      });
      filterBar.appendChild(btn);
    });
    container.appendChild(filterBar);

    // 3. Search Filter Handling
    const query = (this.state.search || '').toLowerCase().trim();
    let filteredStations = stations;

    if (filter !== 'all') {
      filteredStations = stations.filter(s => s.category === filter);
    }

    if (query) {
      filteredStations = filteredStations.filter(s =>
        s.name.toLowerCase().includes(query) ||
        s.tagline.toLowerCase().includes(query) ||
        s.frequency.toLowerCase().includes(query) ||
        s.location.toLowerCase().includes(query) ||
        s.desc.toLowerCase().includes(query)
      );
    }

    // 4. Render Radio Station Cards
    if (filteredStations.length === 0) {
      const noResults = document.createElement('div');
      noResults.style.cssText = 'grid-column: 1 / -1; text-align: center; padding: 40px 20px; color: var(--text-dim);';
      noResults.innerHTML = `
        <div style="font-size: 2.5rem; margin-bottom: 8px;">📻</div>
        <h3>No radio stations found matching "${this.state.search}"</h3>
        <p style="font-size: 0.85rem; margin-top: 6px;">Try searching for "AIR", "Rahman", "Ilayaraja", "SPB", "Kodai", or "80s"</p>
      `;
      container.appendChild(noResults);
    } else {
      filteredStations.forEach(station => {
        const isCurrentlyPlaying = (currentPlaying && currentPlaying.id === station.id);
        const card = document.createElement('div');
        card.className = `radio-station-card ${isCurrentlyPlaying ? 'playing' : ''}`;
        card.innerHTML = `
          <div class="radio-card-header">
            <div class="radio-logo-wrap">
              <img class="radio-logo" src="${station.logo}" alt="${station.name}" loading="lazy" onerror="window.handleRadioLogoFallback(this);">
              <span class="radio-dot-live"></span>
            </div>
            <div class="radio-header-tags">
              <span class="radio-tag-freq">${station.frequency}</span>
              <span class="radio-tag-quality">${station.bitrate}</span>
            </div>
          </div>
          <div class="radio-card-body">
            <h4 class="radio-card-title">${station.name}</h4>
            <div class="radio-card-tagline">${station.tagline}</div>
            <div class="radio-card-location">📍 ${station.location}</div>
            <p class="radio-card-desc">${station.desc}</p>
          </div>
          <div class="radio-card-footer">
            <span class="radio-cat-pill">${station.categoryName}</span>
            <button class="radio-play-btn" title="Tune in live">
              <span class="radio-btn-icon">${isCurrentlyPlaying ? '⏸' : '▶'}</span>
              <span>${isCurrentlyPlaying ? 'Listening' : 'Listen Live'}</span>
            </button>
          </div>
        `;

        card.addEventListener('click', () => {
          if (window.Player) {
            window.Player.playChannel(station);
            window.scrollTo({ top: 0, behavior: 'smooth' });
            // Re-render to update the active playing visualizer
            setTimeout(() => {
              this.renderRadioSection(this.state.radioFilter || 'all');
            }, 300);
          }
        });

        container.appendChild(card);
      });
    }

    grid.appendChild(container);
  };
})();
