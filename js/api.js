/**
 * Universal StreamOrbit API Client
 * Supports BOTH:
 * 1. Static GitHub Pages deployment (Client-side fast M3U parsing & metadata)
 * 2. Local Node.js Express server deployment (Backend caching & streaming proxy)
 */

const PRESETS_MAP = {
  index: 'https://iptv-org.github.io/iptv/index.m3u',
  news: 'https://iptv-org.github.io/iptv/categories/news.m3u',
  sports: 'https://iptv-org.github.io/iptv/categories/sports.m3u',
  movies: 'https://iptv-org.github.io/iptv/categories/movies.m3u',
  animation: 'https://iptv-org.github.io/iptv/categories/animation.m3u',
  music: 'https://iptv-org.github.io/iptv/categories/music.m3u',
  entertainment: 'https://iptv-org.github.io/iptv/categories/entertainment.m3u',
  kids: 'https://iptv-org.github.io/iptv/categories/kids.m3u',
  us: 'https://iptv-org.github.io/iptv/countries/us.m3u',
  uk: 'https://iptv-org.github.io/iptv/countries/uk.m3u',
  in: 'https://iptv-org.github.io/iptv/countries/in.m3u',
  ca: 'https://iptv-org.github.io/iptv/countries/ca.m3u',
  fr: 'https://iptv-org.github.io/iptv/countries/fr.m3u',
  de: 'https://iptv-org.github.io/iptv/countries/de.m3u',
  es: 'https://iptv-org.github.io/iptv/countries/es.m3u'
};

const API = {
  isNodeServer: (
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') &&
    window.location.port !== '' &&
    window.location.protocol.startsWith('http')
  ),

  // Static in-memory cache
  staticChannels: [],
  staticCategories: [],
  staticCountries: [],
  countriesMeta: {},
  currentPresetId: 'index',
  currentSource: 'https://iptv-org.github.io/iptv/index.m3u',
  isLoaded: false,

  async initStaticMetadata() {
    if (Object.keys(this.countriesMeta).length > 0) return;
    try {
      const res = await fetch('https://iptv-org.github.io/api/countries.json');
      if (res.ok) {
        const countries = await res.json();
        countries.forEach(c => {
          if (c.code) this.countriesMeta[c.code.toUpperCase()] = c;
        });
      }
    } catch (e) {
      console.warn('Metadata fetch warning:', e.message);
    }
  },

  async getStatus() {
    if (this.isNodeServer) {
      try {
        const res = await fetch('/api/status');
        if (res.ok) return await res.json();
      } catch (e) {
        this.isNodeServer = false;
      }
    }

    return {
      status: this.isLoaded ? 'ready' : 'loading',
      currentPresetId: this.currentPresetId,
      currentSource: this.currentSource,
      totalChannels: this.staticChannels.length,
      totalCategories: this.staticCategories.length,
      totalCountries: this.staticCountries.length,
      isStatic: true
    };
  },

  async loadPlaylist(presetId = 'index', customUrl = null, forceRefresh = false) {
    let targetUrl = 'https://iptv-org.github.io/iptv/index.m3u';

    if (presetId && PRESETS_MAP[presetId]) {
      targetUrl = PRESETS_MAP[presetId];
      this.currentPresetId = presetId;
    } else if (customUrl) {
      targetUrl = customUrl;
      this.currentPresetId = 'custom';
    }

    this.currentSource = targetUrl;

    if (this.isNodeServer) {
      try {
        const res = await fetch('/api/load-playlist', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ presetId, customUrl, forceRefresh })
        });
        if (res.ok) return await res.json();
      } catch (e) {
        this.isNodeServer = false;
      }
    }

    // Static client-side fetch & parse
    await this.initStaticMetadata();
    const res = await fetch(targetUrl);
    if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to fetch playlist`);
    const m3uText = await res.text();
    this.parseClientM3U(m3uText);

    return {
      success: true,
      presetId: this.currentPresetId,
      source: targetUrl,
      totalChannels: this.staticChannels.length
    };
  },

  parseClientM3U(m3uText) {
    const lines = m3uText.split(/\r?\n/);
    const parsed = [];
    const catMap = {};
    const cntrMap = {};
    let current = null;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      if (line.startsWith('#EXTINF:')) {
        const logoMatch = line.match(/tvg-logo="([^"]*)"/);
        const idMatch = line.match(/tvg-id="([^"]*)"/);
        const countryMatch = line.match(/tvg-country="([^"]*)"/);
        const languageMatch = line.match(/tvg-language="([^"]*)"/);
        const groupMatch = line.match(/group-title="([^"]*)"/);

        const commaIdx = line.lastIndexOf(',');
        let rawName = commaIdx !== -1 ? line.substring(commaIdx + 1).trim() : 'Live Channel';

        const tvgId = idMatch ? idMatch[1] : '';
        let countryCode = countryMatch ? countryMatch[1].toUpperCase() : '';

        if (!countryCode && tvgId) {
          const dotParts = tvgId.split('.');
          if (dotParts.length > 1) {
            const afterDot = dotParts[1].split('@')[0];
            if (afterDot && afterDot.length === 2) {
              countryCode = afterDot.toUpperCase();
            }
          }
        }

        let category = groupMatch ? groupMatch[1].trim() : 'General';
        if (!category || category === 'Undefined' || category === ';') {
          category = 'General';
        }

        // Quality detection
        let quality = 'Auto';
        const lower = rawName.toLowerCase();
        if (lower.includes('4k') || lower.includes('2160p') || lower.includes('uhd')) quality = '4K';
        else if (lower.includes('1080p') || lower.includes('fhd')) quality = '1080p';
        else if (lower.includes('720p') || lower.includes('hd')) quality = '720p';
        else if (lower.includes('480p') || lower.includes('sd')) quality = '480p';

        const cleanName = rawName
          .replace(/\s*\(\d+p\)/gi, '')
          .replace(/\s*\[\d+p\]/gi, '')
          .trim() || rawName;

        const countryInfo = this.countriesMeta[countryCode] || null;

        current = {
          name: cleanName,
          rawName: rawName,
          tvgId: tvgId,
          logo: logoMatch ? logoMatch[1] : '',
          category: category,
          countryCode: countryCode,
          countryName: countryInfo ? countryInfo.name : (countryCode || 'Global'),
          countryFlag: countryInfo ? countryInfo.flag : '🌐',
          language: languageMatch ? languageMatch[1] : '',
          quality: quality
        };
      } else if (line.startsWith('#EXTVLCOPT:http-user-agent=')) {
        if (current) current.userAgent = line.replace('#EXTVLCOPT:http-user-agent=', '').trim();
      } else if (line.startsWith('#EXTVLCOPT:http-referrer=')) {
        if (current) current.referrer = line.replace('#EXTVLCOPT:http-referrer=', '').trim();
      } else if (!line.startsWith('#') && current) {
        current.url = line;
        current.id = current.tvgId || `ch_${Math.abs(this.hashCode(current.rawName + current.url)).toString(36)}`;
        parsed.push(current);

        catMap[current.category] = (catMap[current.category] || 0) + 1;

        const cKey = current.countryCode || 'GLOBAL';
        cntrMap[cKey] = cntrMap[cKey] || {
          code: current.countryCode,
          name: current.countryName,
          flag: current.countryFlag,
          count: 0
        };
        cntrMap[cKey].count++;

        current = null;
      }
    }

    this.staticChannels = parsed;
    this.staticCategories = Object.entries(catMap)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    this.staticCountries = Object.values(cntrMap)
      .sort((a, b) => b.count - a.count);

    this.isLoaded = true;
  },

  hashCode(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash) + str.charCodeAt(i);
      hash |= 0;
    }
    return hash;
  },

  async getCategories() {
    if (this.isNodeServer) {
      try {
        const res = await fetch('/api/categories');
        if (res.ok) return await res.json();
      } catch (e) {
        this.isNodeServer = false;
      }
    }
    return this.staticCategories;
  },

  async getCountries() {
    if (this.isNodeServer) {
      try {
        const res = await fetch('/api/countries');
        if (res.ok) return await res.json();
      } catch (e) {
        this.isNodeServer = false;
      }
    }
    return this.staticCountries;
  },

  async getChannels({ page = 1, limit = 60, search = '', category = '', country = '', quality = '', sort = 'default' } = {}) {
    if (this.isNodeServer) {
      try {
        const params = new URLSearchParams();
        if (page) params.append('page', page);
        if (limit) params.append('limit', limit);
        if (search) params.append('search', search);
        if (category && category !== 'All') params.append('category', category);
        if (country && country !== 'ALL') params.append('country', country);
        if (quality && quality !== 'ALL') params.append('quality', quality);
        if (sort) params.append('sort', sort);

        const res = await fetch(`/api/channels?${params.toString()}`);
        if (res.ok) return await res.json();
      } catch (e) {
        this.isNodeServer = false;
      }
    }

    // Client-side filtering & pagination
    let list = this.staticChannels;

    if (category && category !== 'All') {
      const lower = category.toLowerCase();
      list = list.filter(c => c.category.toLowerCase() === lower);
    }

    if (country && country !== 'ALL') {
      if (country === 'GLOBAL') {
        list = list.filter(c => !c.countryCode || c.countryCode === 'GLOBAL');
      } else {
        list = list.filter(c => c.countryCode === country);
      }
    }

    if (quality && quality !== 'ALL') {
      list = list.filter(c => c.quality === quality);
    }

    if (search) {
      const q = search.toLowerCase();
      list = list.filter(c => (
        c.name.toLowerCase().includes(q) ||
        c.rawName.toLowerCase().includes(q) ||
        c.category.toLowerCase().includes(q) ||
        c.countryName.toLowerCase().includes(q) ||
        (c.countryCode && c.countryCode.toLowerCase().includes(q))
      ));
    }

    if (sort === 'name_asc') {
      list = [...list].sort((a, b) => a.name.localeCompare(b.name));
    } else if (sort === 'name_desc') {
      list = [...list].sort((a, b) => b.name.localeCompare(a.name));
    }

    const total = list.length;
    if (limit <= 0) {
      return { total, page: 1, limit: total, totalPages: 1, channels: list };
    }

    const totalPages = Math.ceil(total / limit) || 1;
    const startIndex = (page - 1) * limit;
    const paginated = list.slice(startIndex, startIndex + limit);

    return {
      total,
      page,
      limit,
      totalPages,
      channels: paginated
    };
  },

  getProxyUrl(rawUrl, userAgent = '', referer = '') {
    if (this.isNodeServer) {
      const params = new URLSearchParams({ url: rawUrl });
      if (userAgent) params.append('ua', userAgent);
      if (referer) params.append('ref', referer);
      return `/api/proxy?${params.toString()}`;
    }

    // Static GitHub Pages public CORS proxy fallback
    return `https://api.allorigins.win/raw?url=${encodeURIComponent(rawUrl)}`;
  }
};
