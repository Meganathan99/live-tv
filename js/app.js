/**
 * Main Application Logic
 */
window.App = {
  state: {
    tab: 'all', // 'all' | 'favorites' | 'history'
    channels: [],
    totalChannels: 0,
    page: 1,
    limit: 60,
    totalPages: 1,
    search: '',
    category: 'All',
    country: 'ALL',
    quality: 'ALL',
    sort: 'default',
    favorites: new Set(),
    history: [],
    currentChannel: null,
    searchDebounce: null
  },

  async init() {
    this.loadPersistedData();
    this.initPlayer();
    this.setupUIEvents();
    this.setupKeyboardShortcuts();
    
    await this.fetchServerStatus();
    await this.fetchMetadata();
    await this.loadChannels();
  },

  loadPersistedData() {
    try {
      const favs = JSON.parse(localStorage.getItem('iptv_favorites') || '[]');
      this.state.favorites = new Set(favs);
      document.getElementById('nav-count-favs').textContent = this.state.favorites.size;

      const hist = JSON.parse(localStorage.getItem('iptv_history') || '[]');
      this.state.history = hist;
      document.getElementById('nav-count-history').textContent = hist.length;
    } catch (e) {
      console.warn('Error loading localStorage:', e);
    }
  },

  initPlayer() {
    Player.init({
      onPrevChannel: () => this.playPreviousChannel(),
      onNextChannel: () => this.playNextChannel()
    });
  },

  async fetchServerStatus() {
    try {
      const status = await API.getStatus();
      if (status) {
        document.getElementById('header-stats-text').textContent = 
          `${status.totalChannels.toLocaleString()} Channels • ${status.totalCountries} Countries`;
        document.getElementById('nav-count-all').textContent = status.totalChannels.toLocaleString();
        
        // Match preset selector
        const select = document.getElementById('playlist-preset-select');
        if (select && status.currentPresetId) {
          select.value = status.currentPresetId;
        }
      }
    } catch (err) {
      console.warn('Failed to fetch server status:', err);
    }
  },

  async fetchMetadata() {
    try {
      const [categories, countries] = await Promise.all([
        API.getCategories(),
        API.getCountries()
      ]);

      this.renderCategories(categories);
      this.renderCountries(countries);
    } catch (err) {
      console.warn('Failed to fetch metadata:', err);
    }
  },

  renderCategories(categories) {
    const list = document.getElementById('categories-pills-list');
    const summary = document.getElementById('categories-summary-count');
    if (!list) return;

    summary.textContent = `${categories.length} categories`;

    // Keep 'All' button
    list.innerHTML = `<button class="pill-filter ${this.state.category === 'All' ? 'active' : ''}" data-category="All">All</button>`;

    categories.forEach(cat => {
      const btn = document.createElement('button');
      btn.className = `pill-filter ${this.state.category === cat.name ? 'active' : ''}`;
      btn.dataset.category = cat.name;
      btn.dataset.name = cat.name.toLowerCase();
      btn.innerHTML = `${cat.name} <span style="font-size: 0.68rem; opacity: 0.7;">(${cat.count})</span>`;
      btn.addEventListener('click', () => {
        this.setCategoryFilter(cat.name);
      });
      list.appendChild(btn);
    });

    list.querySelector('[data-category="All"]').addEventListener('click', () => {
      this.setCategoryFilter('All');
    });
  },

  renderCountries(countries) {
    const list = document.getElementById('countries-pills-list');
    const summary = document.getElementById('countries-summary-count');
    if (!list) return;

    summary.textContent = `${countries.length} countries`;

    list.innerHTML = `<button class="pill-filter ${this.state.country === 'ALL' ? 'active' : ''}" data-country="ALL">🌐 All</button>`;

    countries.forEach(c => {
      const btn = document.createElement('button');
      btn.className = `pill-filter ${this.state.country === c.code ? 'active' : ''}`;
      btn.dataset.country = c.code || 'GLOBAL';
      btn.dataset.name = (c.name || '').toLowerCase();
      btn.innerHTML = `${c.flag || '🌐'} ${c.name || 'Global'} <span style="font-size: 0.68rem; opacity: 0.7;">(${c.count})</span>`;
      btn.addEventListener('click', () => {
        this.setCountryFilter(c.code || 'GLOBAL');
      });
      list.appendChild(btn);
    });

    list.querySelector('[data-country="ALL"]').addEventListener('click', () => {
      this.setCountryFilter('ALL');
    });
  },

  async loadChannels() {
    const grid = document.getElementById('channels-grid');
    const emptyState = document.getElementById('channels-empty-state');
    const pagination = document.getElementById('pagination-container');
    const totalBadge = document.getElementById('directory-total-badge');
    const heading = document.getElementById('directory-heading');

    grid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 40px; color: var(--text-dim);"><div class="spinner" style="margin: 0 auto 12px auto;"></div>Loading channels...</div>';
    emptyState.style.display = 'none';

    // Update Directory Heading based on state
    if (this.state.tab === 'favorites') {
      heading.textContent = '⭐ Favorite Channels';
    } else if (this.state.tab === 'history') {
      heading.textContent = '🕒 Watch History';
    } else if (this.state.search) {
      heading.textContent = `Search: "${this.state.search}"`;
    } else if (this.state.category !== 'All') {
      heading.textContent = `${this.state.category} Channels`;
    } else if (this.state.country !== 'ALL') {
      heading.textContent = `Channels in ${this.state.country}`;
    } else {
      heading.textContent = 'All Live Channels';
    }

    try {
      if (this.state.tab === 'favorites') {
        // Filter from favorites
        const favChannels = this.state.history.filter(c => this.state.favorites.has(c.id));
        this.state.channels = favChannels;
        this.state.totalChannels = favChannels.length;
        this.state.totalPages = 1;
        totalBadge.textContent = `${favChannels.length} favorites`;
        this.renderChannelCards(favChannels);
        pagination.style.display = 'none';
        return;
      }

      if (this.state.tab === 'history') {
        this.state.channels = this.state.history;
        this.state.totalChannels = this.state.history.length;
        this.state.totalPages = 1;
        totalBadge.textContent = `${this.state.history.length} watched`;
        this.renderChannelCards(this.state.history);
        pagination.style.display = 'none';
        return;
      }

      // Load from server API
      const result = await API.getChannels({
        page: this.state.page,
        limit: this.state.limit,
        search: this.state.search,
        category: this.state.category,
        country: this.state.country,
        quality: this.state.quality,
        sort: this.state.sort
      });

      this.state.channels = result.channels;
      this.state.totalChannels = result.total;
      this.state.totalPages = result.totalPages;

      totalBadge.textContent = `${result.total.toLocaleString()} channels`;

      if (result.channels.length === 0) {
        grid.innerHTML = '';
        emptyState.style.display = 'block';
        pagination.style.display = 'none';
      } else {
        emptyState.style.display = 'none';
        this.renderChannelCards(result.channels);
        this.updatePagination();
      }

      // If user hasn't selected a channel yet and channels exist, pick the first one as preview
      if (!this.state.currentChannel && result.channels.length > 0) {
        // Do not auto-play sound immediately to prevent browser autoplay blocks, just load preview
        Player.updatePlayerHUD(result.channels[0]);
        this.state.currentChannel = result.channels[0];
      }
    } catch (err) {
      console.error('Error loading channels:', err);
      grid.innerHTML = `<div style="grid-column: 1/-1; text-align: center; color: #ef4444; padding: 40px;">Failed to load channels: ${err.message}</div>`;
    }
  },

  renderChannelCards(channels) {
    const grid = document.getElementById('channels-grid');
    grid.innerHTML = '';

    const fragment = document.createDocumentFragment();

    channels.forEach((ch, idx) => {
      const card = document.createElement('div');
      card.className = `channel-card ${this.state.currentChannel && this.state.currentChannel.id === ch.id ? 'playing' : ''}`;
      card.dataset.id = ch.id;

      const isFav = this.state.favorites.has(ch.id);
      const initials = (ch.name || 'TV').trim().slice(0, 2).toUpperCase();

      card.innerHTML = `
        <div class="card-top">
          <div class="card-logo-wrap">
            <span class="card-fallback-logo" style="${ch.logo ? 'display: none;' : ''}">${initials}</span>
            ${ch.logo ? `<img class="card-logo" src="${ch.logo}" alt="${ch.name}" loading="lazy">` : ''}
          </div>
          <button class="card-favorite-btn ${isFav ? 'active' : ''}" title="Favorite" data-id="${ch.id}">
            <svg width="20" height="20" fill="${isFav ? 'currentColor' : 'none'}" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/>
            </svg>
          </button>
        </div>

        <div class="card-body">
          <div class="card-name" title="${ch.name}">${ch.name}</div>
          <div class="card-meta">
            <span>${ch.countryFlag || '🌐'} ${ch.countryName || 'Global'}</span>
            ${ch.language ? `<span>• ${ch.language.toUpperCase()}</span>` : ''}
          </div>
        </div>

        <div class="card-footer">
          <span class="card-category-pill">${ch.category || 'General'}</span>
          <span class="card-quality-pill">${ch.quality || 'Auto'}</span>
        </div>
      `;

      // Handle image load error
      const img = card.querySelector('.card-logo');
      if (img) {
        img.onerror = () => {
          img.style.display = 'none';
          const fallback = card.querySelector('.card-fallback-logo');
          if (fallback) fallback.style.display = 'flex';
        };
      }

      // Handle Favorite click
      const favBtn = card.querySelector('.card-favorite-btn');
      favBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.toggleFavorite(ch);
      });

      // Handle Channel Card click -> Play
      card.addEventListener('click', () => {
        this.selectChannel(ch);
      });

      fragment.appendChild(card);
    });

    grid.appendChild(fragment);
  },

  selectChannel(channel) {
    this.state.currentChannel = channel;

    // Highlight active card
    document.querySelectorAll('.channel-card').forEach(c => {
      c.classList.toggle('playing', c.dataset.id === channel.id);
    });

    // Add to history
    this.addToHistory(channel);

    // Play in Video Player
    Player.playChannel(channel);

    // Update active channel favorite icon
    this.updateActiveFavButton();

    // Scroll to player smoothly if on small screens
    if (window.innerWidth < 900) {
      document.getElementById('player-wrapper').scrollIntoView({ behavior: 'smooth' });
    }
  },

  toggleFavorite(channel) {
    const id = channel.id;
    if (this.state.favorites.has(id)) {
      this.state.favorites.delete(id);
      this.showToast(`Removed ${channel.name} from favorites`);
    } else {
      this.state.favorites.add(id);
      this.showToast(`Added ${channel.name} to favorites ⭐`);
    }

    localStorage.setItem('iptv_favorites', JSON.stringify([...this.state.favorites]));
    document.getElementById('nav-count-favs').textContent = this.state.favorites.size;

    // Update UI on cards
    document.querySelectorAll(`.card-favorite-btn[data-id="${id}"]`).forEach(btn => {
      const active = this.state.favorites.has(id);
      btn.classList.toggle('active', active);
      const svg = btn.querySelector('svg');
      if (svg) svg.setAttribute('fill', active ? 'currentColor' : 'none');
    });

    this.updateActiveFavButton();

    if (this.state.tab === 'favorites') {
      this.loadChannels();
    }
  },

  updateActiveFavButton() {
    const btn = document.getElementById('btn-favorite-active');
    const svg = document.getElementById('icon-fav-active');
    if (!btn || !svg || !this.state.currentChannel) return;

    const isFav = this.state.favorites.has(this.state.currentChannel.id);
    btn.classList.toggle('active', isFav);
    svg.setAttribute('fill', isFav ? '#fbbf24' : 'none');
    svg.style.color = isFav ? '#fbbf24' : 'inherit';
  },

  addToHistory(channel) {
    // Unique by id, place at front
    const filtered = this.state.history.filter(c => c.id !== channel.id);
    filtered.unshift(channel);
    if (filtered.length > 50) filtered.pop();

    this.state.history = filtered;
    localStorage.setItem('iptv_history', JSON.stringify(filtered));
    document.getElementById('nav-count-history').textContent = filtered.length;
  },

  playNextChannel() {
    const channels = this.state.channels;
    if (!channels || channels.length === 0) return;

    let idx = channels.findIndex(c => c.id === this.state.currentChannel?.id);
    idx = (idx + 1) % channels.length;
    this.selectChannel(channels[idx]);
  },

  playPreviousChannel() {
    const channels = this.state.channels;
    if (!channels || channels.length === 0) return;

    let idx = channels.findIndex(c => c.id === this.state.currentChannel?.id);
    idx = (idx - 1 + channels.length) % channels.length;
    this.selectChannel(channels[idx]);
  },

  updatePagination() {
    const container = document.getElementById('pagination-container');
    const prevBtn = document.getElementById('btn-page-prev');
    const nextBtn = document.getElementById('btn-page-next');
    const info = document.getElementById('pagination-info');

    if (this.state.totalPages <= 1) {
      container.style.display = 'none';
      return;
    }

    container.style.display = 'flex';
    info.textContent = `Page ${this.state.page} of ${this.state.totalPages}`;
    prevBtn.disabled = this.state.page <= 1;
    nextBtn.disabled = this.state.page >= this.state.totalPages;
  },

  setCategoryFilter(category) {
    this.state.category = category;
    this.state.page = 1;
    this.state.tab = 'all';

    // Update active tab buttons
    document.querySelectorAll('.nav-item-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tab === 'all');
    });

    // Update pills active
    document.querySelectorAll('#categories-pills-list .pill-filter').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.category === category);
    });

    this.updateClearFilterBtn();
    this.loadChannels();
  },

  setCountryFilter(country) {
    this.state.country = country;
    this.state.page = 1;
    this.state.tab = 'all';

    document.querySelectorAll('#countries-pills-list .pill-filter').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.country === country);
    });

    this.updateClearFilterBtn();
    this.loadChannels();
  },

  setQualityFilter(quality) {
    this.state.quality = quality;
    this.state.page = 1;

    document.querySelectorAll('#quality-pills-list .pill-filter').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.quality === quality);
    });

    this.updateClearFilterBtn();
    this.loadChannels();
  },

  resetFilters() {
    this.state.search = '';
    this.state.category = 'All';
    this.state.country = 'ALL';
    this.state.quality = 'ALL';
    this.state.sort = 'default';
    this.state.page = 1;
    this.state.tab = 'all';

    document.getElementById('global-search-input').value = '';
    document.getElementById('search-clear-btn').style.display = 'none';
    document.getElementById('sort-channels-select').value = 'default';

    document.querySelectorAll('.nav-item-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tab === 'all');
    });

    document.querySelectorAll('#categories-pills-list .pill-filter').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.category === 'All');
    });

    document.querySelectorAll('#countries-pills-list .pill-filter').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.country === 'ALL');
    });

    document.querySelectorAll('#quality-pills-list .pill-filter').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.quality === 'ALL');
    });

    this.updateClearFilterBtn();
    this.loadChannels();
  },

  updateClearFilterBtn() {
    const isFiltered = (
      this.state.search !== '' ||
      this.state.category !== 'All' ||
      this.state.country !== 'ALL' ||
      this.state.quality !== 'ALL'
    );
    const btn = document.getElementById('btn-clear-filters');
    if (btn) btn.style.display = isFiltered ? 'inline-flex' : 'none';
  },

  setupUIEvents() {
    // Brand click -> reset
    document.getElementById('brand-logo-btn')?.addEventListener('click', () => {
      this.resetFilters();
    });

    // Sidebar Mobile Toggle
    document.getElementById('btn-sidebar-toggle')?.addEventListener('click', () => {
      const sidebar = document.getElementById('app-sidebar');
      sidebar.classList.toggle('open');
    });

    // Navigation Tabs (All, Favorites, History)
    document.querySelectorAll('.nav-item-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const tab = btn.dataset.tab;
        this.state.tab = tab;
        this.state.page = 1;

        document.querySelectorAll('.nav-item-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        this.loadChannels();
      });
    });

    // Search Input with Debounce
    const searchInput = document.getElementById('global-search-input');
    const searchClear = document.getElementById('search-clear-btn');

    searchInput?.addEventListener('input', (e) => {
      const val = e.target.value.trim();
      searchClear.style.display = val ? 'block' : 'none';

      clearTimeout(this.state.searchDebounce);
      this.state.searchDebounce = setTimeout(() => {
        this.state.search = val;
        this.state.page = 1;
        this.updateClearFilterBtn();
        this.loadChannels();
      }, 350);
    });

    searchClear?.addEventListener('click', () => {
      searchInput.value = '';
      searchClear.style.display = 'none';
      this.state.search = '';
      this.state.page = 1;
      this.updateClearFilterBtn();
      this.loadChannels();
      searchInput.focus();
    });

    // Category Search inside Sidebar
    const catSearch = document.getElementById('category-filter-search');
    catSearch?.addEventListener('input', (e) => {
      const query = e.target.value.trim().toLowerCase();
      document.querySelectorAll('#categories-pills-list .pill-filter').forEach(pill => {
        if (pill.dataset.category === 'All') return;
        const name = pill.dataset.name || '';
        pill.style.display = name.includes(query) ? 'inline-flex' : 'none';
      });
    });

    // Country Search inside Sidebar
    const countrySearch = document.getElementById('country-filter-search');
    countrySearch?.addEventListener('input', (e) => {
      const query = e.target.value.trim().toLowerCase();
      document.querySelectorAll('#countries-pills-list .pill-filter').forEach(pill => {
        if (pill.dataset.country === 'ALL') return;
        const name = pill.dataset.name || '';
        const code = (pill.dataset.country || '').toLowerCase();
        pill.style.display = (name.includes(query) || code.includes(query)) ? 'inline-flex' : 'none';
      });
    });

    // Quality Filter Pills
    document.querySelectorAll('#quality-pills-list .pill-filter').forEach(btn => {
      btn.addEventListener('click', () => {
        this.setQualityFilter(btn.dataset.quality);
      });
    });

    // Clear filters button
    document.getElementById('btn-clear-filters')?.addEventListener('click', () => this.resetFilters());
    document.getElementById('btn-empty-reset')?.addEventListener('click', () => this.resetFilters());

    // Sort Channels
    document.getElementById('sort-channels-select')?.addEventListener('change', (e) => {
      this.state.sort = e.target.value;
      this.state.page = 1;
      this.loadChannels();
    });

    // Pagination buttons
    document.getElementById('btn-page-prev')?.addEventListener('click', () => {
      if (this.state.page > 1) {
        this.state.page--;
        this.loadChannels();
        document.querySelector('.directory-section').scrollIntoView({ behavior: 'smooth' });
      }
    });

    document.getElementById('btn-page-next')?.addEventListener('click', () => {
      if (this.state.page < this.state.totalPages) {
        this.state.page++;
        this.loadChannels();
        document.querySelector('.directory-section').scrollIntoView({ behavior: 'smooth' });
      }
    });

    // Playlist Presets Select
    const presetSelect = document.getElementById('playlist-preset-select');
    presetSelect?.addEventListener('change', async (e) => {
      const val = e.target.value;
      if (val === 'custom') {
        this.openCustomPlaylistModal();
      } else {
        this.showToast(`Loading playlist preset...`);
        await API.loadPlaylist(val, null, false);
        this.resetFilters();
        await this.fetchServerStatus();
        await this.fetchMetadata();
      }
    });

    // Refresh Current Playlist Button
    document.getElementById('btn-refresh-playlist')?.addEventListener('click', async () => {
      this.showToast('Refreshing playlist from source...');
      await API.loadPlaylist(presetSelect.value, null, true);
      this.resetFilters();
      await this.fetchServerStatus();
      await this.fetchMetadata();
      this.showToast('Playlist refreshed!');
    });

    // Active Channel Favorite button
    document.getElementById('btn-favorite-active')?.addEventListener('click', () => {
      if (this.state.currentChannel) {
        this.toggleFavorite(this.state.currentChannel);
      }
    });

    // Modals
    document.getElementById('btn-help-shortcuts')?.addEventListener('click', () => {
      document.getElementById('modal-shortcuts').classList.add('open');
    });
    document.getElementById('modal-close-shortcuts')?.addEventListener('click', () => {
      document.getElementById('modal-shortcuts').classList.remove('open');
    });

    document.getElementById('modal-close-playlist')?.addEventListener('click', () => {
      document.getElementById('modal-custom-playlist').classList.remove('open');
    });
    document.getElementById('btn-cancel-custom-playlist')?.addEventListener('click', () => {
      document.getElementById('modal-custom-playlist').classList.remove('open');
    });

    document.getElementById('btn-submit-custom-playlist')?.addEventListener('click', async () => {
      const url = document.getElementById('custom-playlist-input').value.trim();
      if (!url) return;
      document.getElementById('modal-custom-playlist').classList.remove('open');
      this.showToast('Fetching custom M3U playlist...');
      await API.loadPlaylist(null, url, true);
      this.resetFilters();
      await this.fetchServerStatus();
      await this.fetchMetadata();
      this.showToast('Custom playlist loaded!');
    });

    // Close modals on background click
    document.querySelectorAll('.modal-backdrop').forEach(b => {
      b.addEventListener('click', (e) => {
        if (e.target === b) b.classList.remove('open');
      });
    });
  },

  openCustomPlaylistModal() {
    document.getElementById('modal-custom-playlist').classList.add('open');
    document.getElementById('custom-playlist-input').focus();
  },

  setupKeyboardShortcuts() {
    window.addEventListener('keydown', (e) => {
      // Don't trigger shortcuts if typing inside an input
      if (['INPUT', 'SELECT', 'TEXTAREA'].includes(document.activeElement.tagName)) {
        if (e.key === 'Escape') {
          document.activeElement.blur();
        }
        return;
      }

      switch (e.key) {
        case ' ':
          e.preventDefault();
          Player.togglePlay();
          break;
        case 'f':
        case 'F':
          e.preventDefault();
          Player.toggleFullscreen();
          break;
        case 'm':
        case 'M':
          e.preventDefault();
          Player.video.muted = !Player.video.muted;
          Player.updateVolumeIcons();
          break;
        case 't':
        case 'T':
          e.preventDefault();
          Player.toggleTheaterMode();
          break;
        case 'p':
        case 'P':
          e.preventDefault();
          Player.togglePiP();
          break;
        case '/':
          e.preventDefault();
          document.getElementById('global-search-input')?.focus();
          break;
        case ']':
          e.preventDefault();
          this.playNextChannel();
          break;
        case '[':
          e.preventDefault();
          this.playPreviousChannel();
          break;
        case 'ArrowUp':
          e.preventDefault();
          if (Player.video) {
            Player.video.volume = Math.min(1, Player.video.volume + 0.1);
            document.getElementById('ctrl-volume-slider').value = Player.video.volume;
            localStorage.setItem('iptv_volume', Player.video.volume);
          }
          break;
        case 'ArrowDown':
          e.preventDefault();
          if (Player.video) {
            Player.video.volume = Math.max(0, Player.video.volume - 0.1);
            document.getElementById('ctrl-volume-slider').value = Player.video.volume;
            localStorage.setItem('iptv_volume', Player.video.volume);
          }
          break;
        case '?':
          e.preventDefault();
          document.getElementById('modal-shortcuts').classList.toggle('open');
          break;
        case 'Escape':
          document.querySelectorAll('.modal-backdrop').forEach(b => b.classList.remove('open'));
          break;
      }
    });
  },

  showToast(message, duration = 3000) {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `
      <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
      <span>${message}</span>
    `;

    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, duration);
  }
};

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.App.init();
});
