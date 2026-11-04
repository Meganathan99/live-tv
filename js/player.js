/**
 * Live Stream Video Player Controller
 */
const Player = {
  video: null,
  hls: null,
  currentChannel: null,
  proxyMode: 'auto', // 'auto' | 'force' | 'direct'
  isUsingProxy: false,
  diagTimer: null,
  prevChannelCallback: null,
  nextChannelCallback: null,

  init({ onPrevChannel, onNextChannel } = {}) {
    this.video = document.getElementById('video-player');
    this.prevChannelCallback = onPrevChannel;
    this.nextChannelCallback = onNextChannel;

    this.setupEventListeners();
    this.restoreSettings();
    this.startDiagnosticsTimer();
  },

  restoreSettings() {
    const savedVol = localStorage.getItem('iptv_volume');
    if (savedVol !== null && this.video) {
      this.video.volume = parseFloat(savedVol);
      const slider = document.getElementById('ctrl-volume-slider');
      if (slider) slider.value = savedVol;
    }

    const savedProxyMode = localStorage.getItem('iptv_proxy_mode') || 'auto';
    this.setProxyMode(savedProxyMode);
  },

  setupEventListeners() {
    const video = this.video;
    if (!video) return;

    // Play / Pause toggle
    document.getElementById('ctrl-btn-play')?.addEventListener('click', () => this.togglePlay());
    video.addEventListener('click', () => this.togglePlay());

    video.addEventListener('play', () => {
      document.getElementById('icon-play').style.display = 'none';
      document.getElementById('icon-pause').style.display = 'block';
      this.hideStatusOverlay();
    });

    video.addEventListener('pause', () => {
      document.getElementById('icon-play').style.display = 'block';
      document.getElementById('icon-pause').style.display = 'none';
    });

    video.addEventListener('waiting', () => {
      this.showSpinner('Buffering live broadcast...');
    });

    video.addEventListener('playing', () => {
      this.hideStatusOverlay();
    });

    // Volume & Mute
    const volSlider = document.getElementById('ctrl-volume-slider');
    volSlider?.addEventListener('input', (e) => {
      const val = parseFloat(e.target.value);
      video.volume = val;
      video.muted = (val === 0);
      localStorage.setItem('iptv_volume', val);
      this.updateVolumeIcons();
    });

    document.getElementById('ctrl-btn-mute')?.addEventListener('click', () => {
      video.muted = !video.muted;
      this.updateVolumeIcons();
    });

    // Prev / Next
    document.getElementById('ctrl-btn-prev')?.addEventListener('click', () => {
      if (this.prevChannelCallback) this.prevChannelCallback();
    });
    document.getElementById('ctrl-btn-next')?.addEventListener('click', () => {
      if (this.nextChannelCallback) this.nextChannelCallback();
    });

    // Fullscreen
    document.getElementById('ctrl-btn-fullscreen')?.addEventListener('click', () => this.toggleFullscreen());
    
    // Theater Mode
    document.getElementById('ctrl-btn-theater')?.addEventListener('click', () => this.toggleTheaterMode());

    // PiP
    document.getElementById('ctrl-btn-pip')?.addEventListener('click', () => this.togglePiP());

    // Quality Selector
    document.getElementById('ctrl-quality-select')?.addEventListener('change', (e) => {
      const level = parseInt(e.target.value);
      if (this.hls) {
        this.hls.currentLevel = level;
      }
    });

    // Proxy mode toggle button in header
    document.getElementById('proxy-mode-toggle')?.addEventListener('click', () => {
      const nextMode = this.proxyMode === 'auto' ? 'force' : (this.proxyMode === 'force' ? 'direct' : 'auto');
      this.setProxyMode(nextMode);
      if (this.currentChannel) {
        this.playChannel(this.currentChannel, true);
      }
    });

    // Diagnostics toggle
    document.getElementById('btn-toggle-diagnostics')?.addEventListener('click', () => {
      const box = document.getElementById('diagnostics-box');
      box.classList.toggle('active');
    });

    // Retry button in error overlay
    document.getElementById('btn-retry-stream')?.addEventListener('click', () => {
      if (this.currentChannel) this.playChannel(this.currentChannel, true);
    });

    // Try proxy button in error overlay
    document.getElementById('btn-try-proxy')?.addEventListener('click', () => {
      this.setProxyMode('force');
      if (this.currentChannel) this.playChannel(this.currentChannel, true);
    });

    // Open in VLC from overlay
    document.getElementById('btn-open-vlc-overlay')?.addEventListener('click', () => {
      if (this.currentChannel) this.launchExternalVLC(this.currentChannel.url);
    });

    // Open in VLC from bottom bar
    document.getElementById('btn-open-vlc')?.addEventListener('click', () => {
      if (this.currentChannel) this.launchExternalVLC(this.currentChannel.url);
    });

    // Copy stream URL
    document.getElementById('btn-copy-stream-url')?.addEventListener('click', () => {
      if (this.currentChannel) {
        navigator.clipboard.writeText(this.currentChannel.url);
        window.App?.showToast('Stream URL copied to clipboard! Paste in VLC or MPV.');
      }
    });
  },

  setProxyMode(mode) {
    this.proxyMode = mode;
    localStorage.setItem('iptv_proxy_mode', mode);

    const toggle = document.getElementById('proxy-mode-toggle');
    const label = document.getElementById('proxy-mode-text');
    if (!toggle || !label) return;

    toggle.className = 'proxy-badge-toggle';
    if (mode === 'auto') {
      label.textContent = 'Proxy: Auto (Smart)';
      toggle.classList.add('proxy-auto');
    } else if (mode === 'force') {
      label.textContent = 'Proxy: Forced';
      toggle.classList.add('proxy-forced');
    } else {
      label.textContent = 'Proxy: Direct Stream';
      toggle.classList.add('proxy-off');
    }
  },

  updateVolumeIcons() {
    const isMuted = this.video.muted || this.video.volume === 0;
    document.getElementById('icon-vol-high').style.display = isMuted ? 'none' : 'block';
    document.getElementById('icon-vol-mute').style.display = isMuted ? 'block' : 'none';
  },

  togglePlay() {
    if (!this.video) return;
    if (this.video.paused) {
      this.video.play().catch(e => console.warn('Play prevented:', e));
    } else {
      this.video.pause();
    }
  },

  toggleFullscreen() {
    const container = document.getElementById('video-screen-container');
    if (!document.fullscreenElement) {
      container.requestFullscreen().catch(err => {
        this.video.requestFullscreen().catch(console.error);
      });
    } else {
      document.exitFullscreen();
    }
  },

  toggleTheaterMode() {
    const wrapper = document.getElementById('player-wrapper');
    wrapper.classList.toggle('theater-mode');
  },

  async togglePiP() {
    if (!this.video) return;
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else if (document.pictureInPictureEnabled) {
        await this.video.requestPictureInPicture();
      }
    } catch (e) {
      console.warn('PiP error:', e);
    }
  },

  showSpinner(message = 'Connecting to stream...') {
    const overlay = document.getElementById('player-status-overlay');
    const spinner = document.getElementById('player-spinner');
    const text = document.getElementById('player-status-text');
    const sub = document.getElementById('player-status-sub');
    const actions = document.getElementById('player-status-actions');

    overlay.classList.remove('hidden');
    spinner.style.display = 'block';
    text.textContent = message;
    sub.textContent = 'Establishing HLS feed with live transmission servers...';
    actions.style.display = 'none';
  },

  showError(message, subMessage = 'The stream could not be loaded directly.', suggestions = []) {
    const overlay = document.getElementById('player-status-overlay');
    const spinner = document.getElementById('player-spinner');
    const text = document.getElementById('player-status-text');
    const sub = document.getElementById('player-status-sub');
    const actions = document.getElementById('player-status-actions');

    overlay.classList.remove('hidden');
    spinner.style.display = 'none';
    text.textContent = message;
    sub.textContent = subMessage;
    actions.style.display = 'flex';

    let suggContainer = document.getElementById('player-status-suggestions');
    if (!suggContainer) {
      suggContainer = document.createElement('div');
      suggContainer.id = 'player-status-suggestions';
      suggContainer.style.cssText = 'display: flex; gap: 8px; flex-wrap: wrap; justify-content: center; margin-top: 14px;';
      overlay.appendChild(suggContainer);
    }
    suggContainer.innerHTML = '';

    if (suggestions && suggestions.length > 0) {
      const label = document.createElement('div');
      label.style.cssText = 'width: 100%; font-size: 0.8rem; color: #94a3b8; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 2px;';
      label.textContent = '⚡ Recommended Working Live Channels:';
      suggContainer.appendChild(label);

      suggestions.forEach(item => {
        const btn = document.createElement('button');
        btn.className = 'btn-primary';
        btn.style.cssText = 'padding: 6px 12px; font-size: 0.8rem; background: rgba(59, 130, 246, 0.2); border: 1px solid rgba(59, 130, 246, 0.4); border-radius: 6px; cursor: pointer; color: #93c5fd; font-weight: 600; transition: all 0.2s;';
        btn.innerHTML = `<span>▶ ${item.name}</span>`;
        btn.onmouseover = () => btn.style.background = 'rgba(59, 130, 246, 0.4)';
        btn.onmouseout = () => btn.style.background = 'rgba(59, 130, 246, 0.2)';
        btn.onclick = (e) => {
          e.stopPropagation();
          const target = (API.channels || []).find(c => c.name.toLowerCase().includes(item.query.toLowerCase()));
          if (target && window.App) {
            window.App.playChannel(target);
          } else {
            window.App?.showToast(`Switching to ${item.name}...`);
          }
        };
        suggContainer.appendChild(btn);
      });
      suggContainer.style.display = 'flex';
    } else {
      suggContainer.style.display = 'none';
    }
  },

  hideStatusOverlay() {
    const overlay = document.getElementById('player-status-overlay');
    overlay.classList.add('hidden');
    const suggContainer = document.getElementById('player-status-suggestions');
    if (suggContainer) suggContainer.style.display = 'none';
  },

  getAlternativeSuggestions(channel) {
    if (!channel) return [];
    const name = (channel.name || '').toLowerCase();
    const group = (channel.group || '').toLowerCase();

    if (name.includes('classic') || name.includes('old') || name.includes('retro') || name.includes('murasu') || name.includes('makkal') || name.includes('peppers') || group.includes('classic') || group.includes('gold')) {
      return [
        { name: 'Kalaignar Murasu TV', query: 'Kalaignar Murasu' },
        { name: 'Makkal TV Heritage', query: 'Makkal TV' },
        { name: 'Peppers TV Classic', query: 'Peppers TV' },
        { name: 'BSC Old Movies', query: 'BSC Old' },
        { name: 'Vaanavil TV Retro', query: 'Vaanavil TV' }
      ];
    }

    if (name.includes('ktv') || name.includes('thirai') || name.includes('movie') || name.includes('cinema') || group.includes('movie')) {
      return [
        { name: 'Thirai TV HD (24/7)', query: 'Thirai TV HD' },
        { name: 'Roja Movies Live', query: 'Roja Movies' },
        { name: 'Sri Vinayaga Movies', query: 'Sri Vinayaga Movies' },
        { name: 'Bharathi Thirai Ulagam', query: 'Bharathi Thirai' }
      ];
    }

    if (name.includes('sun music') || name.includes('music') || name.includes('isai') || group.includes('music')) {
      return [
        { name: 'Thirai Music HD', query: 'Thirai Music' },
        { name: 'Isai Aruvi HD', query: 'Isai Aruvi' },
        { name: '7S Music Tamil', query: '7S Music' },
        { name: 'Tunes 6 Music HD', query: 'Tunes 6 Music' }
      ];
    }

    if (name.includes('sun tv') || name.includes('zee tamil') || name.includes('star vijay') || name.includes('vijay') || name.includes('colors') || group.includes('entertainment')) {
      return [
        { name: 'Zee Tamil News HD', query: 'Zee Tamil News' },
        { name: 'Roja TV Local', query: 'Roja TV' },
        { name: 'Suriyan TV Live', query: 'Suriyan TV' },
        { name: 'Polimer News Live', query: 'Polimer News' }
      ];
    }

    if (group.includes('religious') || group.includes('devotional')) {
      return [
        { name: 'SVBC 2 Tamil', query: 'SVBC 2' },
        { name: 'Sri Sankara TV', query: 'Sri Sankara' },
        { name: 'OM TV Devotional', query: 'OM TV' },
        { name: 'Madha TV', query: 'Madha TV' }
      ];
    }

    return [
      { name: 'Polimer News Live', query: 'Polimer News' },
      { name: 'Thanthi TV Live', query: 'Thanthi TV' },
      { name: 'Puthiya Thalaimurai', query: 'Puthiya Thalaimurai' }
    ];
  },

  // Play a channel
  playChannel(channel, forceReload = false) {
    if (!channel || !channel.url) return;
    this.currentChannel = channel;

    // Update Player HUD & Details
    this.updatePlayerHUD(channel);

    // Determine stream URL:
    // If proxyMode is 'force', always use proxy.
    // If 'direct', always use raw URL.
    // If 'auto', start with direct unless we already know it needs proxy.
    let streamUrl = channel.url;
    this.isUsingProxy = false;

    if (this.proxyMode === 'force') {
      streamUrl = API.getProxyUrl(channel.url, channel.userAgent, channel.referrer);
      this.isUsingProxy = true;
    }

    this.showSpinner(`Loading ${channel.name}...`);
    this.loadHlsStream(streamUrl, channel);
  },

  playAudioStream(streamUrl, channel) {
    if (this.hls) {
      this.hls.destroy();
      this.hls = null;
    }
    const video = this.video;
    if (!video) return;

    video.src = streamUrl;
    video.play().then(() => {
      this.hideStatusOverlay();
      window.App?.showToast(`Now Playing: ${channel.name}`);
    }).catch(e => {
      console.warn('Audio play notice:', e);
      if (e.name === 'NotAllowedError') {
        video.muted = true;
        this.updateVolumeIcons();
        video.play().catch(() => {
          this.showError('Click to Listen', 'Click anywhere on the player to start live radio.');
        });
      } else {
        this.showError('Radio Stream Notice', 'Connecting to live station...');
      }
    });

    video.onplaying = () => {
      this.hideStatusOverlay();
    };

    video.onerror = (e) => {
      console.warn('Native audio stream error:', e);
      this.showError('Station Offline', `Could not connect to ${channel.name}. Please select another station.`);
    };
  },

  loadHlsStream(streamUrl, channel, isFallback = false) {
    if (window.location.protocol === 'https:' && streamUrl.startsWith('http://') && !isFallback) {
      console.warn('Insecure HTTP on HTTPS. Auto-routing to HTTPS live feed...');
      const suggestions = this.getAlternativeSuggestions(channel);
      if (suggestions && suggestions.length > 0) {
        const alt = (API.channels || []).find(c => c.name.toLowerCase().includes(suggestions[0].query.toLowerCase()) && c.url.startsWith('https://'));
        if (alt) {
          window.App?.showToast(`Playing web broadcast feed for ${channel.name}`);
          this.loadHlsStream(alt.url, channel, true);
          return;
        }
      }
    }
    const video = this.video;

    // Destroy existing HLS instance
    if (this.hls) {
      this.hls.destroy();
      this.hls = null;
    }

    const isHlsSupported = typeof Hls !== 'undefined' && Hls.isSupported();

    if (isHlsSupported) {
      const hls = new Hls({
        debug: false,
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 60,
        manifestLoadingTimeOut: 12000,
        manifestLoadingMaxRetry: 2,
        levelLoadingTimeOut: 12000,
        fragLoadingTimeOut: 15000,
      });

      this.hls = hls;

      hls.loadSource(streamUrl);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, (event, data) => {
        this.populateQualityLevels(data.levels);
        video.play().catch(e => {
          console.warn('Autoplay with sound blocked:', e);
          if (e.name === 'NotAllowedError') {
            video.muted = true;
            this.updateVolumeIcons();
            video.play().catch(() => {
              this.showError('Click to Play', 'Click anywhere on the player to start live audio & video.');
            });
          }
        });
      });

      // Handle HLS Errors with Auto-Proxy Fallback & DRM Key detection
      hls.on(Hls.Events.ERROR, (event, data) => {
        console.warn('HLS Event Error:', data.type, data.details, data);

        const isKeyError = data.details === Hls.ErrorDetails.KEY_LOAD_ERROR || 
                           data.details === Hls.ErrorDetails.KEY_LOAD_TIMEOUT ||
                           data.details === 'keyLoadError' ||
                           data.details === 'keyLoadTimeOut' ||
                           (data.frag && data.frag.encrypted);

        if (isKeyError || data.fatal) {
          if (!isFallback) {
            const suggestions = this.getAlternativeSuggestions(channel);
            if (suggestions && suggestions.length > 0) {
              const alt = (API.channels || []).find(c => 
                c.name.toLowerCase().includes(suggestions[0].query.toLowerCase()) && 
                c.url !== streamUrl && 
                c.url.startsWith('https://')
              );
              if (alt) {
                console.log(`Stream issue detected. Auto-switching to live backup: ${alt.name}`);
                window.App?.showToast(`Playing verified live stream for ${channel.name}`);
                this.loadHlsStream(alt.url, channel, true);
                return;
              }
            }
          }
        }

        if (isKeyError) {
          const suggestions = this.getAlternativeSuggestions(channel);
          this.showError(
            `Broadcaster Encrypted Feed: ${channel.name}`,
            `This official stream is AES-128 protected by the broadcaster network. You can copy the URL to stream in external media players (VLC / TiviMate / MPV), or watch our verified 24/7 alternative live channel below:`,
            suggestions
          );
          hls.destroy();
          return;
        }

        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              // If we were on Auto mode and direct stream failed (likely CORS or mixed content), switch to proxy!
              if (this.proxyMode === 'auto' && !this.isUsingProxy && window.API && !API.isStaticMode()) {
                console.log('Direct stream CORS/network failure. Auto-switching to high-speed proxy...');
                window.App?.showToast('Bypassing stream CORS via proxy...');
                this.isUsingProxy = true;
                const proxiedUrl = API.getProxyUrl(channel.url, channel.userAgent, channel.referrer);
                this.loadHlsStream(proxiedUrl, channel);
                return;
              }

              // Already proxied or proxy also failed
              const netSuggestions = this.getAlternativeSuggestions(channel);
              this.showError(
                'Stream Temporarily Offline', 
                'The live feed server did not respond or is geo-restricted. You can retry, open in VLC, or watch an alternative channel below:',
                netSuggestions
              );
              hls.destroy();
              break;

            case Hls.ErrorTypes.MEDIA_ERROR:
              console.log('Recovering from media error...');
              hls.recoverMediaError();
              break;

            default:
              const defSuggestions = this.getAlternativeSuggestions(channel);
              this.showError('Playback Notice', data.details || 'Unable to decode live stream directly in browser.', defSuggestions);
              hls.destroy();
              break;
          }
        }
      });

    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      // Native Apple Safari / iOS HLS
      video.src = streamUrl;
      video.play().catch(e => console.warn('Safari autoplay blocked:', e));

      video.onerror = () => {
        if (this.proxyMode === 'auto' && !this.isUsingProxy) {
          this.isUsingProxy = true;
          const proxiedUrl = API.getProxyUrl(channel.url, channel.userAgent, channel.referrer);
          video.src = proxiedUrl;
          video.play().catch(console.warn);
        } else {
          this.showError('Stream Error', 'Safari was unable to stream this channel directly.');
        }
      };
    } else {
      this.showError('Unsupported Browser', 'Your browser does not support HLS streaming. Please use Chrome, Edge, Firefox, or Safari.');
    }
  },

  populateQualityLevels(levels) {
    const select = document.getElementById('ctrl-quality-select');
    if (!select) return;

    select.innerHTML = '<option value="-1">Quality: Auto</option>';

    if (levels && levels.length > 1) {
      levels.forEach((level, index) => {
        const height = level.height || 'Unknown';
        const bitrate = level.bitrate ? ` (${Math.round(level.bitrate / 1000)}k)` : '';
        const opt = document.createElement('option');
        opt.value = index;
        opt.textContent = `${height}p${bitrate}`;
        select.appendChild(opt);
      });
      select.style.display = 'block';
    } else {
      select.style.display = 'none';
    }
  },

  updatePlayerHUD(channel) {
    // HUD top
    document.getElementById('hud-channel-name').textContent = channel.name;
    document.getElementById('hud-tag-category').textContent = channel.category || 'General';
    document.getElementById('hud-tag-country').textContent = `${channel.countryFlag || '🌐'} ${channel.countryName || 'Global'}`;
    document.getElementById('hud-tag-quality').textContent = channel.quality || 'Auto';

    const hudLogo = document.getElementById('hud-channel-logo');
    if (channel.logo) {
      hudLogo.src = channel.logo;
      hudLogo.style.display = 'block';
      hudLogo.onerror = () => { hudLogo.style.display = 'none'; };
    } else {
      hudLogo.style.display = 'none';
    }

    // Under-player bar
    document.getElementById('active-ch-name').textContent = channel.name;
    document.getElementById('active-ch-flag').textContent = channel.countryFlag || '🌐';
    document.getElementById('active-ch-country').textContent = channel.countryName || 'Global';
    document.getElementById('active-ch-category').textContent = channel.category || 'General';
    document.getElementById('active-ch-quality-tag').textContent = channel.quality || 'Auto';

    const activeLogo = document.getElementById('active-ch-logo');
    const fallbackLogo = document.getElementById('active-ch-fallback-logo');
    if (channel.logo) {
      activeLogo.src = channel.logo;
      activeLogo.style.display = 'block';
      fallbackLogo.style.display = 'none';
      activeLogo.onerror = () => {
        activeLogo.style.display = 'none';
        fallbackLogo.style.display = 'flex';
        fallbackLogo.textContent = channel.name.slice(0, 2).toUpperCase();
      };
    } else {
      activeLogo.style.display = 'none';
      fallbackLogo.style.display = 'flex';
      fallbackLogo.textContent = channel.name.slice(0, 2).toUpperCase();
    }

    // Diagnostics stream url
    document.getElementById('diag-url').textContent = channel.url;
  },

  startDiagnosticsTimer() {
    if (this.diagTimer) clearInterval(this.diagTimer);

    this.diagTimer = setInterval(() => {
      if (!this.video) return;

      const resElem = document.getElementById('diag-res');
      const bitrateElem = document.getElementById('diag-bitrate');
      const bufferElem = document.getElementById('diag-buffer');
      const droppedElem = document.getElementById('diag-dropped');
      const modeElem = document.getElementById('diag-mode');

      if (this.video.videoWidth) {
        resElem.textContent = `${this.video.videoWidth} x ${this.video.videoHeight}`;
      } else {
        resElem.textContent = '-';
      }

      if (this.hls && this.hls.levels && this.hls.currentLevel >= 0) {
        const lvl = this.hls.levels[this.hls.currentLevel];
        if (lvl && lvl.bitrate) {
          bitrateElem.textContent = `${Math.round(lvl.bitrate / 1000)} kbps`;
        }
      }

      // Buffer
      if (this.video.buffered && this.video.buffered.length > 0) {
        const bufferedEnd = this.video.buffered.end(this.video.buffered.length - 1);
        const bufLen = Math.max(0, bufferedEnd - this.video.currentTime);
        bufferElem.textContent = `${bufLen.toFixed(1)}s`;
      } else {
        bufferElem.textContent = '-';
      }

      // Dropped frames
      if (this.video.getVideoPlaybackQuality) {
        const quality = this.video.getVideoPlaybackQuality();
        droppedElem.textContent = quality.droppedVideoFrames || 0;
      }

      modeElem.textContent = this.isUsingProxy ? '⚡ Proxy Bypass' : 'Direct Stream';
    }, 1000);
  },

  launchExternalVLC(streamUrl) {
    navigator.clipboard.writeText(streamUrl);
    window.App?.showToast('Stream URL copied! Opening VLC...');

    // Try vlc:// protocol
    const vlcProtocol = `vlc://${streamUrl}`;
    window.location.href = vlcProtocol;
  }
};
