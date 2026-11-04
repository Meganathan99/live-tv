# 📺 StreamOrbit Live TV

[![Deploy to GitHub Pages](https://github.com/Meganathan99/live-tv/actions/workflows/deploy.yml/badge.svg)](https://github.com/Meganathan99/live-tv/actions/workflows/deploy.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![IPTV Channels](https://img.shields.io/badge/Channels-11%2C400%2B-red.svg)](https://github.com/iptv-org/iptv)

A modern, responsive, high-performance Online Live TV Streaming platform powered by [iptv-org/iptv](https://github.com/iptv-org/iptv) and the official `https://iptv-org.github.io/iptv/index.m3u` playlist.

🔗 **Live Website**: [https://meganathan99.github.io/live-tv/](https://meganathan99.github.io/live-tv/)

---

## ✨ Features

- 🌐 **11,400+ Global TV Channels**: Stream live television from 180+ countries across 180+ categories.
- ⚡ **Universal CORS & Stream Bypass**:
  - Automatically handles stream playback, CORS restrictions, and mixed content.
  - Smart fallback to high-speed public CORS proxies when needed.
- 📁 **Smart Filtering & Organization**:
  - **Category Pills**: News, Sports, Movies, Animation, Music, Entertainment, Kids, Documentary, etc.
  - **180+ Countries**: Searchable country list with flags and channel counts.
  - **Video Quality Filter**: 4K / UHD, 1080p Full HD, 720p HD, SD.
  - **Instant Search**: Search by channel name, category, country, or language in real time.
- 🎥 **Pro Video Player**:
  - Built with **Hls.js** with Apple Safari native HLS fallback.
  - Custom HUD overlay showing channel logo, live indicator, and quality tags.
  - Multi-bitrate quality selector, Picture-in-Picture (PiP), and Cinema Theater Mode.
  - Real-time Technical Stream Diagnostics (bitrate, resolution, buffer length, dropped frames).
  - External Player Launch: One-click "Open in VLC" (`vlc://`) or copy stream link.
- ⭐ **Favorites & History**:
  - Star your favorite channels with local storage persistence.
  - Quick-access "Recently Watched" history tracker.
- 🔄 **Playlist Presets**:
  - Main (`index.m3u` - 11,400+ channels)
  - Categories & Countries
  - Custom M3U / M3U8 URL loader.

---

## 🚀 How to Enable GitHub Pages Deployment

1. On GitHub, navigate to your repository: **`https://github.com/Meganathan99/live-tv`**
2. Click **Settings** (top navigation tab) → **Pages** (in the left sidebar).
3. Under **Build and deployment > Source**:
   - **Option 1 (Recommended)**: Select **GitHub Actions**. The included `.github/workflows/deploy.yml` workflow will automatically build and deploy the site!
   - **Option 2**: Select **Deploy from a branch** → Branch: **`main`** → Folder: **`/ (root)`** → Click **Save**.
4. Your site will be live at:
   ```
   https://meganathan99.github.io/live-tv/
   ```

---

## 💻 Local Development

You can also run the application locally with the Node.js Express server:

```bash
# Clone the repository
git clone https://github.com/Meganathan99/live-tv.git
cd live-tv

# Install dependencies
npm install

# Start local server
npm start
```

Visit `http://localhost:3000` in your browser.

---

## ⌨️ Keyboard Shortcuts

| Key | Action |
| :--- | :--- |
| <kbd>Space</kbd> | Play / Pause |
| <kbd>F</kbd> | Fullscreen toggle |
| <kbd>M</kbd> | Mute / Unmute |
| <kbd>T</kbd> | Cinema Theater Mode |
| <kbd>P</kbd> | Picture-in-Picture |
| <kbd>/</kbd> | Focus Search Bar |
| <kbd>]</kbd> / <kbd>[</kbd> | Next / Previous Channel |
| <kbd>↑</kbd> / <kbd>↓</kbd> | Volume Up / Down |
| <kbd>?</kbd> | Shortcuts cheat sheet |

---

## ⚖️ Legal & Attribution

- Channel streams and playlist data are provided by the [iptv-org/iptv](https://github.com/iptv-org/iptv) project under CC0-1.0.
- No video content or media files are hosted on this repository.
- Licensed under the [MIT License](LICENSE).
