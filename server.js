const express = require('express');
const cors = require('cors');
const compression = require('compression');
const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const { URL } = require('url');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(compression());
app.use(express.json());
app.use(express.static(__dirname));

// Cache directories
const CACHE_DIR = path.join(__dirname, 'cache');
if (!fs.existsSync(CACHE_DIR)) {
  fs.mkdirSync(CACHE_DIR, { recursive: true });
}

// Known Presets from iptv-org
const PRESETS = [
  { id: 'tamil', name: '🌺 Tamil Live TV (Local & Devotional)', url: path.join(__dirname, 'tamil.m3u'), isDefault: true },
  { id: 'index', name: 'Main (All Channels)', url: 'https://iptv-org.github.io/iptv/index.m3u' },
  { id: 'index.category', name: 'Grouped by Category', url: 'https://iptv-org.github.io/iptv/index.category.m3u' },
  { id: 'index.country', name: 'Grouped by Country', url: 'https://iptv-org.github.io/iptv/index.country.m3u' },
  { id: 'index.language', name: 'Grouped by Language', url: 'https://iptv-org.github.io/iptv/index.language.m3u' },
  { id: 'news', name: 'News Channels', url: 'https://iptv-org.github.io/iptv/categories/news.m3u' },
  { id: 'movies', name: 'Movies Channels', url: 'https://iptv-org.github.io/iptv/categories/movies.m3u' },
  { id: 'sports', name: 'Sports Channels', url: 'https://iptv-org.github.io/iptv/categories/sports.m3u' },
  { id: 'music', name: 'Music Channels', url: 'https://iptv-org.github.io/iptv/categories/music.m3u' },
  { id: 'animation', name: 'Animation Channels', url: 'https://iptv-org.github.io/iptv/categories/animation.m3u' },
  { id: 'documentary', name: 'Documentary Channels', url: 'https://iptv-org.github.io/iptv/categories/documentary.m3u' },
  { id: 'entertainment', name: 'Entertainment Channels', url: 'https://iptv-org.github.io/iptv/categories/entertainment.m3u' },
  { id: 'kids', name: 'Kids Channels', url: 'https://iptv-org.github.io/iptv/categories/kids.m3u' },
  { id: 'us', name: 'United States', url: 'https://iptv-org.github.io/iptv/countries/us.m3u' },
  { id: 'uk', name: 'United Kingdom', url: 'https://iptv-org.github.io/iptv/countries/uk.m3u' },
  { id: 'in', name: 'India', url: 'https://iptv-org.github.io/iptv/countries/in.m3u' },
  { id: 'ca', name: 'Canada', url: 'https://iptv-org.github.io/iptv/countries/ca.m3u' },
  { id: 'fr', name: 'France', url: 'https://iptv-org.github.io/iptv/countries/fr.m3u' },
  { id: 'de', name: 'Germany', url: 'https://iptv-org.github.io/iptv/countries/de.m3u' },
  { id: 'es', name: 'Spain', url: 'https://iptv-org.github.io/iptv/countries/es.m3u' },
  { id: 'it', name: 'Italy', url: 'https://iptv-org.github.io/iptv/countries/it.m3u' },
  { id: 'br', name: 'Brazil', url: 'https://iptv-org.github.io/iptv/countries/br.m3u' },
  { id: 'jp', name: 'Japan', url: 'https://iptv-org.github.io/iptv/countries/jp.m3u' },
  { id: 'au', name: 'Australia', url: 'https://iptv-org.github.io/iptv/countries/au.m3u' }
];

// In-Memory state
let currentSource = 'https://iptv-org.github.io/iptv/index.m3u';
let currentPresetId = 'index';
let channels = [];
let categoriesMap = {};
let countriesMap = {};
let metadata = {
  countries: {},
  categories: {}
};
let isLoaded = false;
let isLoading = false;
let lastUpdated = null;

// Load static metadata
function loadStaticMetadata() {
  try {
    const countriesPath = path.join(CACHE_DIR, 'countries.json');
    if (fs.existsSync(countriesPath)) {
      const data = JSON.parse(fs.readFileSync(countriesPath, 'utf8'));
      data.forEach(c => {
        metadata.countries[c.code.toUpperCase()] = c;
      });
      console.log(`Loaded ${Object.keys(metadata.countries).length} country entries from cache.`);
    }

    const categoriesPath = path.join(CACHE_DIR, 'categories.json');
    if (fs.existsSync(categoriesPath)) {
      const data = JSON.parse(fs.readFileSync(categoriesPath, 'utf8'));
      data.forEach(c => {
        metadata.categories[c.id.toLowerCase()] = c;
      });
      console.log(`Loaded ${Object.keys(metadata.categories).length} category entries from cache.`);
    }
  } catch (err) {
    console.warn('Error loading static metadata:', err.message);
  }
}

// Simple string hash
function simpleHash(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash).toString(36);
}

// Detect quality tag from channel title
function extractQuality(name) {
  const lower = name.toLowerCase();
  if (lower.includes('4k') || lower.includes('2160p') || lower.includes('uhd')) return '4K';
  if (lower.includes('1080p') || lower.includes('fhd') || lower.includes('full hd')) return '1080p';
  if (lower.includes('720p') || lower.includes('hd')) return '720p';
  if (lower.includes('480p') || lower.includes('sd')) return '480p';
  return 'Auto';
}

// Parse M3U content
function parseM3U(m3uText) {
  const lines = m3uText.split(/\r?\n/);
  const parsedChannels = [];
  let current = null;
  const cats = {};
  const cntrs = {};

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
      let rawName = commaIdx !== -1 ? line.substring(commaIdx + 1).trim() : 'Unknown Channel';
      if (!rawName) rawName = 'Live Stream';

      const tvgId = idMatch ? idMatch[1] : '';
      let countryCode = countryMatch ? countryMatch[1].toUpperCase() : '';

      // Infer country code from tvgId if not set (e.g. Channel.us@SD -> US)
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

      const quality = extractQuality(rawName);

      // Clean name for display if contains bracketed quality
      const cleanName = rawName
        .replace(/\s*\(\d+p\)/gi, '')
        .replace(/\s*\[\d+p\]/gi, '')
        .trim() || rawName;

      // Look up enriched country info
      const countryInfo = metadata.countries[countryCode] || null;

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
        quality: quality,
      };
    } else if (line.startsWith('#EXTVLCOPT:http-user-agent=')) {
      if (current) current.userAgent = line.replace('#EXTVLCOPT:http-user-agent=', '').trim();
    } else if (line.startsWith('#EXTVLCOPT:http-referrer=')) {
      if (current) current.referrer = line.replace('#EXTVLCOPT:http-referrer=', '').trim();
    } else if (!line.startsWith('#')) {
      if (current) {
        current.url = line;
        current.id = current.tvgId || `ch_${simpleHash(current.rawName + current.url)}`;
        
        parsedChannels.push(current);

        // Count category
        cats[current.category] = (cats[current.category] || 0) + 1;

        // Count country
        const cKey = current.countryCode || 'GLOBAL';
        cntrs[cKey] = cntrs[cKey] || {
          code: current.countryCode,
          name: current.countryName,
          flag: current.countryFlag,
          count: 0
        };
        cntrs[cKey].count++;

        current = null;
      }
    }
  }

  return { channels: parsedChannels, categories: cats, countries: cntrs };
}

// Fetch and load a playlist
async function loadPlaylist(sourceUrl, forceRefresh = false) {
  if (isLoading) return;
  isLoading = true;
  console.log(`Loading playlist: ${sourceUrl} (refresh: ${forceRefresh})`);

  const cacheFilename = 'playlist_' + simpleHash(sourceUrl) + '.m3u';
  const cachePath = path.join(CACHE_DIR, cacheFilename);

  let m3uData = null;

  try {
    if (!forceRefresh && fs.existsSync(cachePath)) {
      const stats = fs.statSync(cachePath);
      // Cache valid for 12 hours
      const ageHours = (Date.now() - stats.mtimeMs) / (1000 * 60 * 60);
      if (ageHours < 12) {
        console.log(`Using cached playlist from ${cachePath} (${(stats.size / 1024 / 1024).toFixed(2)} MB)`);
        m3uData = fs.readFileSync(cachePath, 'utf8');
      }
    }

    if (!m3uData) {
      if (fs.existsSync(sourceUrl)) {
        console.log(`Loading local playlist file from: ${sourceUrl}`);
        m3uData = fs.readFileSync(sourceUrl, 'utf8');
      } else {
        console.log(`Downloading fresh playlist from: ${sourceUrl}...`);
      const response = await fetch(sourceUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });
      if (!response.ok) {
        throw new Error(`Failed to download playlist: HTTP ${response.status} ${response.statusText}`);
      }
      m3uData = await response.text();
      fs.writeFileSync(cachePath, m3uData, 'utf8');
      console.log(`Cached playlist saved to ${cachePath} (${(m3uData.length / 1024 / 1024).toFixed(2)} MB)`);
      }
    }

    console.time('parseM3U');
    const result = parseM3U(m3uData);
    console.timeEnd('parseM3U');

    channels = result.channels;
    categoriesMap = result.categories;
    countriesMap = result.countries;
    currentSource = sourceUrl;
    lastUpdated = new Date().toISOString();
    isLoaded = true;

    console.log(`Successfully parsed ${channels.length} channels across ${Object.keys(categoriesMap).length} categories!`);
  } catch (err) {
    console.error('Error loading playlist:', err);
    // If download failed but cache exists, fallback
    if (fs.existsSync(cachePath)) {
      console.log('Falling back to existing cache despite error...');
      m3uData = fs.readFileSync(cachePath, 'utf8');
      const result = parseM3U(m3uData);
      channels = result.channels;
      categoriesMap = result.categories;
      countriesMap = result.countries;
      isLoaded = true;
    }
  } finally {
    isLoading = false;
  }
}

// ------------------- API ENDPOINTS ------------------- //

// Server status
app.get('/api/status', (req, res) => {
  res.json({
    status: isLoaded ? 'ready' : (isLoading ? 'loading' : 'idle'),
    currentPresetId,
    currentSource,
    totalChannels: channels.length,
    totalCategories: Object.keys(categoriesMap).length,
    totalCountries: Object.keys(countriesMap).length,
    lastUpdated
  });
});

// Available playlist presets
app.get('/api/playlists', (req, res) => {
  res.json({
    currentPresetId,
    currentSource,
    presets: PRESETS
  });
});

// Switch or reload playlist
app.post('/api/load-playlist', async (req, res) => {
  const { presetId, customUrl, forceRefresh } = req.body;
  let targetUrl = 'https://iptv-org.github.io/iptv/index.m3u';

  if (presetId) {
    const preset = PRESETS.find(p => p.id === presetId);
    if (preset) {
      targetUrl = preset.url;
      currentPresetId = preset.id;
    }
  } else if (customUrl) {
    targetUrl = customUrl;
    currentPresetId = 'custom';
  }

  await loadPlaylist(targetUrl, Boolean(forceRefresh));

  res.json({
    success: true,
    presetId: currentPresetId,
    source: targetUrl,
    totalChannels: channels.length
  });
});

// Get Categories list with counts
app.get('/api/categories', (req, res) => {
  const list = Object.entries(categoriesMap)
    .map(([name, count]) => ({
      name,
      count
    }))
    .sort((a, b) => b.count - a.count);

  res.json(list);
});

// Get Countries list with counts and flags
app.get('/api/countries', (req, res) => {
  const list = Object.values(countriesMap)
    .filter(c => c.count > 0)
    .sort((a, b) => b.count - a.count);

  res.json(list);
});

// Search & Filter Channels with Pagination
app.get('/api/channels', (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = req.query.limit !== undefined ? parseInt(req.query.limit) : 60;
  const search = (req.query.search || '').trim().toLowerCase();
  const category = (req.query.category || '').trim();
  const country = (req.query.country || '').trim().toUpperCase();
  const quality = (req.query.quality || '').trim().toUpperCase();
  const sort = req.query.sort || 'default';

  let filtered = channels;

  // Filter by category
  if (category && category !== 'All') {
    filtered = filtered.filter(c => c.category.toLowerCase() === category.toLowerCase());
  }

  // Filter by country
  if (country && country !== 'ALL') {
    if (country === 'GLOBAL') {
      filtered = filtered.filter(c => !c.countryCode || c.countryCode === 'GLOBAL');
    } else {
      filtered = filtered.filter(c => c.countryCode === country);
    }
  }

  // Filter by quality
  if (quality && quality !== 'ALL') {
    filtered = filtered.filter(c => c.quality === quality);
  }

  // Search filter
  if (search) {
    filtered = filtered.filter(c => {
      return (
        c.name.toLowerCase().includes(search) ||
        c.rawName.toLowerCase().includes(search) ||
        c.category.toLowerCase().includes(search) ||
        c.countryName.toLowerCase().includes(search) ||
        (c.countryCode && c.countryCode.toLowerCase().includes(search)) ||
        (c.language && c.language.toLowerCase().includes(search))
      );
    });
  }

  // Sorting
  if (sort === 'name_asc') {
    filtered = [...filtered].sort((a, b) => a.name.localeCompare(b.name));
  } else if (sort === 'name_desc') {
    filtered = [...filtered].sort((a, b) => b.name.localeCompare(a.name));
  }

  const total = filtered.length;

  if (limit <= 0) {
    return res.json({
      total,
      page: 1,
      limit: total,
      totalPages: 1,
      channels: filtered
    });
  }

  const totalPages = Math.ceil(total / limit) || 1;
  const startIndex = (page - 1) * limit;
  const paginated = filtered.slice(startIndex, startIndex + limit);

  res.json({
    total,
    page,
    limit,
    totalPages,
    channels: paginated
  });
});

// Single Channel Info
app.get('/api/channel/:id', (req, res) => {
  const ch = channels.find(c => c.id === req.params.id);
  if (!ch) return res.status(404).json({ error: 'Channel not found' });
  res.json(ch);
});

// Fast stream probe / health check
app.get('/api/check-stream', async (req, res) => {
  const streamUrl = req.query.url;
  if (!streamUrl) return res.status(400).json({ error: 'url is required' });

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);

    const check = await fetch(streamUrl, {
      method: 'HEAD',
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    clearTimeout(timeout);

    res.json({
      online: check.ok || (check.status >= 200 && check.status < 400),
      status: check.status,
      contentType: check.headers.get('content-type')
    });
  } catch (err) {
    res.json({ online: false, error: err.message });
  }
});

// ------------------- STREAMING CORS PROXY & M3U8 REWRITER ------------------- //

function fetchStreamResource(targetUrl, reqHeaders = {}, depth = 0) {
  if (depth > 6) return Promise.reject(new Error('Too many redirects in proxy'));

  return new Promise((resolve, reject) => {
    let parsed;
    try {
      parsed = new URL(targetUrl);
    } catch (e) {
      return reject(new Error('Invalid URL'));
    }

    const isHttps = parsed.protocol === 'https:';
    const client = isHttps ? https : http;

    const outgoingHeaders = {
      'User-Agent': reqHeaders['user-agent'] || 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
      'Accept': '*/*',
      'Accept-Encoding': 'gzip, deflate, br',
      'Connection': 'keep-alive',
      ...(reqHeaders['range'] ? { 'Range': reqHeaders['range'] } : {}),
      ...(reqHeaders['referer'] ? { 'Referer': reqHeaders['referer'] } : {})
    };

    const req = client.request(parsed, {
      method: 'GET',
      headers: outgoingHeaders
    }, res => {
      // Handle redirect
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        const redirected = new URL(res.headers.location, targetUrl).href;
        return resolve(fetchStreamResource(redirected, reqHeaders, depth + 1));
      }
      resolve({ upstreamRes: res, finalUrl: targetUrl });
    });

    req.on('error', reject);
    req.setTimeout(12000, () => {
      req.destroy();
      reject(new Error('Proxy request timeout'));
    });
    req.end();
  });
}

function rewriteM3U8(content, baseUrl, proxyBase) {
  const lines = content.split(/\r?\n/);
  const rewritten = lines.map(line => {
    const trimmed = line.trim();
    if (!trimmed) return line;

    // Handle M3U tags that contain URI attributes
    if (trimmed.startsWith('#')) {
      if (
        trimmed.startsWith('#EXT-X-MEDIA:') ||
        trimmed.startsWith('#EXT-X-KEY:') ||
        trimmed.startsWith('#EXT-X-MAP:') ||
        trimmed.startsWith('#EXT-X-PRELOAD-HINT:')
      ) {
        return trimmed.replace(/URI="([^"]+)"/g, (match, uri) => {
          try {
            const abs = new URL(uri, baseUrl).href;
            return `URI="${proxyBase}?url=${encodeURIComponent(abs)}"`;
          } catch (e) {
            return match;
          }
        });
      }
      return line;
    }

    // Segment or Variant playlist URI
    try {
      const abs = new URL(trimmed, baseUrl).href;
      return `${proxyBase}?url=${encodeURIComponent(abs)}`;
    } catch (e) {
      return line;
    }
  });

  return rewritten.join('\n');
}

// Proxy endpoint
app.get('/api/proxy', async (req, res) => {
  const targetUrl = req.query.url;
  if (!targetUrl) {
    return res.status(400).send('Missing "url" parameter');
  }

  // Set universal CORS headers
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
  res.header('Access-Control-Allow-Headers', '*');
  res.header('Access-Control-Expose-Headers', 'Content-Length, Content-Range, Content-Type, Accept-Ranges');

  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }

  try {
    const customHeaders = {
      ...(req.headers['range'] ? { 'range': req.headers['range'] } : {}),
      ...(req.query.ua ? { 'user-agent': req.query.ua } : {}),
      ...(req.query.ref ? { 'referer': req.query.ref } : {})
    };

    const { upstreamRes, finalUrl } = await fetchStreamResource(targetUrl, customHeaders);

    const contentType = (upstreamRes.headers['content-type'] || '').toLowerCase();
    const isM3U8 = contentType.includes('mpegurl') ||
                   targetUrl.includes('.m3u8') ||
                   targetUrl.includes('.m3u') ||
                   contentType.includes('text/plain');

    // Forward status code (including 206 Partial Content)
    res.status(upstreamRes.statusCode);

    // Forward caching and range headers
    if (upstreamRes.headers['content-range']) res.header('Content-Range', upstreamRes.headers['content-range']);
    if (upstreamRes.headers['accept-ranges']) res.header('Accept-Ranges', upstreamRes.headers['accept-ranges']);

    // Check compression
    const encoding = upstreamRes.headers['content-encoding'];
    let stream = upstreamRes;
    if (encoding === 'gzip') {
      stream = upstreamRes.pipe(zlib.createGunzip());
    } else if (encoding === 'deflate') {
      stream = upstreamRes.pipe(zlib.createInflate());
    } else if (encoding === 'br') {
      stream = upstreamRes.pipe(zlib.createBrotliDecompress());
    }

    if (isM3U8) {
      // Manifest needs rewriting: buffer text
      const chunks = [];
      stream.on('data', chunk => chunks.push(chunk));
      stream.on('end', () => {
        const body = Buffer.concat(chunks).toString('utf8');
        if (body.startsWith('#EXTM3U') || body.includes('#EXT-X-')) {
          res.header('Content-Type', 'application/vnd.apple.mpegurl');
          res.header('Cache-Control', 'no-cache, no-store, must-revalidate');
          const rewritten = rewriteM3U8(body, finalUrl, '/api/proxy');
          res.send(rewritten);
        } else {
          // Not an M3U8 after all (e.g. binary TS chunk disguised as plain/text)
          res.header('Content-Type', upstreamRes.headers['content-type'] || 'video/MP2T');
          res.send(Buffer.concat(chunks));
        }
      });
      stream.on('error', err => {
        if (!res.headersSent) res.status(502).send('Error decompressing manifest');
      });
    } else {
      // Binary video/audio segment chunk: stream directly
      res.header('Content-Type', upstreamRes.headers['content-type'] || 'video/MP2T');
      if (upstreamRes.headers['content-length'] && !encoding) {
        res.header('Content-Length', upstreamRes.headers['content-length']);
      }
      stream.pipe(res);
    }
  } catch (err) {
    console.error(`Proxy error for ${targetUrl}:`, err.message);
    if (!res.headersSent) {
      res.status(502).json({ error: 'Proxy upstream failed', message: err.message });
    }
  }
});

// Single Page App fallback
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Start Server & Initial Load
async function start() {
  loadStaticMetadata();

  app.listen(PORT, () => {
    console.log(`\n======================================================`);
    console.log(`  📺 IPTV Live Stream Site is running!`);
    console.log(`  🌐 URL: http://localhost:${PORT}`);
    console.log(`  📂 Source: https://iptv-org.github.io/iptv/index.m3u`);
    console.log(`======================================================\n`);
  });

  // Load the default playlist (index.m3u) in background
  await loadPlaylist(currentSource, false);
}

start();
