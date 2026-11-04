/**
 * Cricket Live, Match Highlights & OTT Platform Hub Data
 * Verified streams, direct player links, and official OTT streaming endpoints
 */

const CRICKET_DATA = {
  // Live Score Ticker
  liveMatches: [
    {
      id: "live-ind-aus",
      status: "LIVE / RECENT",
      badge: "LIVE",
      tournament: "Border-Gavaskar Trophy • 1st Test, Perth",
      team1: { name: "India", score: "150 & 487/6d", flag: "🇮🇳" },
      team2: { name: "Australia", score: "104 & 238", flag: "🇦🇺" },
      summary: "India won by 295 runs! Bumrah 8 wkts, Jaiswal 161, Kohli 100*",
      streamChannelId: "DDSportsHDLive"
    },
    {
      id: "live-ind-sa",
      status: "T20I SERIES",
      badge: "T20I",
      tournament: "India vs South Africa 4th T20I • Wanderers",
      team1: { name: "India", score: "283/1 (20 ov)", flag: "🇮🇳" },
      team2: { name: "South Africa", score: "148/10 (18.2 ov)", flag: "🇿🇦" },
      summary: "India won by 135 runs! Sanju Samson 109*, Tilak Varma 120*",
      streamChannelId: "CricketGold247"
    },
    {
      id: "live-ipl-csk-mi",
      status: "IPL CLASH",
      badge: "IPL",
      tournament: "IPL El Clásico • MA Chidambaram Stadium, Chennai",
      team1: { name: "Chennai Super Kings", score: "206/4 (20 ov)", flag: "🦁" },
      team2: { name: "Mumbai Indians", score: "186/6 (20 ov)", flag: "💙" },
      summary: "CSK won by 20 runs! Dhoni 20* (4 balls), Rohit Sharma 105*",
      streamChannelId: "WillowTVFastLive"
    }
  ],

  // 24/7 Verified Live Cricket Streams
  liveChannels: [
    {
      id: "CricketGold247",
      name: "Cricket Gold HD (24/7 Live & Archives)",
      category: "Cricket Live",
      country: "Global",
      logo: "https://i.imgur.com/kQK80gB.png",
      url: "https://streams2.sofast.tv/ptnr-yupptv/title-cricketgold/v1/master/611d79b11b77e2f571934fd80ca1413453772ac7/b2048bb8-1686-4432-aa50-647245383e0c/manifest.m3u8",
      quality: "1080p",
      desc: "Official 24/7 Cricket Gold live stream broadcasting classic matches, world cup moments, and tournament highlights."
    },
    {
      id: "DDSportsHDLive",
      name: "DD Sports HD (Live India Matches)",
      category: "Cricket Live",
      country: "IN",
      logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/63/DD_Sports_logo.png/220px-DD_Sports_logo.png",
      url: "https://cdn.pishow.tv/ott/live/1161/master.m3u8",
      quality: "1080p",
      desc: "Official national sports broadcaster telecasting live Indian bilateral matches, ICC events, and multi-sport tournaments."
    },
    {
      id: "WillowTVFastLive",
      name: "Willow TV FAST (Cricket Live)",
      category: "Cricket Live",
      country: "US",
      logo: "https://upload.wikimedia.org/wikipedia/en/thumb/0/07/Willow_TV_Logo.png/220px-Willow_TV_Logo.png",
      url: "https://amg01269-amg01269c1-sportstribal-emea-5204.playouts.now.amagi.tv/ts-eu-w1-n2/playlist/amg01269-willowtvfast-willowplus-sportstribalemea/playlist.m3u8",
      quality: "1080p",
      desc: "North America's premier cricket broadcaster featuring live cricket leagues, CPL, MLC, and international fixtures."
    },
    {
      id: "WillowPlusFastLive",
      name: "Willow Plus HD (Live Cricket Playout)",
      category: "Cricket Live",
      country: "US",
      logo: "https://upload.wikimedia.org/wikipedia/en/thumb/0/07/Willow_TV_Logo.png/220px-Willow_TV_Logo.png",
      url: "https://streams2.sofast.tv/scheduler/scheduleMaster/418.m3u8",
      quality: "720p",
      desc: "Dedicated Willow cricket feed featuring back-to-back cricket matches and league action."
    },
    {
      id: "StarSports1HindiLive",
      name: "Star Sports 1 (Live Satellite Feed)",
      category: "Cricket Live",
      country: "IN",
      logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/Star_Sports_1_logo.png/220px-Star_Sports_1_logo.png",
      url: "https://real-vk.proxy.nellaiiptv.com/SDMEDIA/index.m3u8",
      quality: "720p",
      desc: "Live Star Sports cricket feed with Hindi & regional commentary."
    },
    {
      id: "SonySportsTen1Live",
      name: "Sony Sports Ten 1 (Live Satellite Feed)",
      category: "Cricket Live",
      country: "IN",
      logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/30/Sony_Sports_Ten_1_logo.png/220px-Sony_Sports_Ten_1_logo.png",
      url: "http://103.185.24.134:3001/SonyTenSports1/index.m3u8",
      quality: "720p",
      desc: "Sony Sports network cricket & international sports feed."
    }
  ],

  // Curated High-Definition Cricket Highlights ("View Highlights / Hilete")
  highlights: [
    {
      id: "hl-t20-wc-final-2024",
      title: "ICC T20 World Cup 2024 Final: India vs South Africa",
      type: "worldcup",
      duration: "15:42",
      teams: "India vs South Africa",
      tournament: "ICC T20 World Cup Final 2024",
      heroMoments: "Suryakumar Yadav boundary catch, Hardik Pandya final over defence, Rohit Sharma emotional win!",
      date: "June 29, 2024",
      thumb: "https://images.icc-cricket.com/image/upload/t_ratio16_9-size30/prd/assets/events/t20-world-cup/2024/news/final_moments.jpg",
      fallbackThumb: "data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='338' viewBox='0 0 600 338'%3E%3Crect width='600' height='338' fill='%230f172a'/%3E%3Ctext x='50%25' y='45%25' dominant-baseline='middle' text-anchor='middle' font-size='56'%3E🏏%3C/text%3E%3Ctext x='50%25' y='65%25' dominant-baseline='middle' text-anchor='middle' fill='%2334d399' font-family='sans-serif' font-size='18' font-weight='700'%3ECRICKET HIGHLIGHTS%3C/text%3E%3C/svg%3E",
      videoId: "m3_9_w8UoDk",
      embedUrl: "https://www.youtube-nocookie.com/embed/m3_9_w8UoDk?autoplay=1"
    },
    {
      id: "hl-kohli-mcg-82",
      title: "Virat Kohli 82* vs Pakistan: The Greatest T20I Knock of All Time",
      type: "classics",
      duration: "14:18",
      teams: "India vs Pakistan",
      tournament: "ICC Men's T20 World Cup 2022 • MCG",
      heroMoments: "Unbelievable back-foot straight six off Haris Rauf, 16 needed off 6 balls, iconic MCG chase!",
      date: "Oct 23, 2022",
      thumb: "https://images.unsplash.com/photo-1531415074868-036b107e775a?w=800&q=80",
      fallbackThumb: "data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='338' viewBox='0 0 600 338'%3E%3Crect width='600' height='338' fill='%230f172a'/%3E%3Ctext x='50%25' y='45%25' dominant-baseline='middle' text-anchor='middle' font-size='56'%3E🏏%3C/text%3E%3Ctext x='50%25' y='65%25' dominant-baseline='middle' text-anchor='middle' fill='%2334d399' font-family='sans-serif' font-size='18' font-weight='700'%3ECRICKET HIGHLIGHTS%3C/text%3E%3C/svg%3E",
      videoId: "5jX0rKfZvL0",
      embedUrl: "https://www.youtube-nocookie.com/embed/5jX0rKfZvL0?autoplay=1"
    },
    {
      id: "hl-rohit-92-aus",
      title: "Rohit Sharma's 92 (41) Carnage vs Australia",
      type: "worldcup",
      duration: "10:25",
      teams: "India vs Australia",
      tournament: "T20 World Cup 2024 Super 8",
      heroMoments: "29 runs in one over off Mitchell Starc, 8 massive sixes, fastest fifty of the tournament!",
      date: "June 24, 2024",
      thumb: "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=800&q=80",
      fallbackThumb: "data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='338' viewBox='0 0 600 338'%3E%3Crect width='600' height='338' fill='%230f172a'/%3E%3Ctext x='50%25' y='45%25' dominant-baseline='middle' text-anchor='middle' font-size='56'%3E🏏%3C/text%3E%3Ctext x='50%25' y='65%25' dominant-baseline='middle' text-anchor='middle' fill='%2334d399' font-family='sans-serif' font-size='18' font-weight='700'%3ECRICKET HIGHLIGHTS%3C/text%3E%3C/svg%3E",
      videoId: "v6C3O_x3aX0",
      embedUrl: "https://www.youtube-nocookie.com/embed/v6C3O_x3aX0?autoplay=1"
    },
    {
      id: "hl-rinku-5-sixes",
      title: "Rinku Singh 5 Sixes in 5 Balls: KKR vs GT Historic IPL Thriller",
      type: "ipl",
      duration: "09:30",
      teams: "Kolkata Knight Riders vs Gujarat Titans",
      tournament: "IPL Historic Finish",
      heroMoments: "28 needed off 5 balls, Rinku Singh hits 6, 6, 6, 6, 6 to pull off the greatest finish in T20 history!",
      date: "April 9, 2023",
      thumb: "https://images.unsplash.com/photo-1517649763962-0c623266ddc0?w=800&q=80",
      fallbackThumb: "data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='338' viewBox='0 0 600 338'%3E%3Crect width='600' height='338' fill='%230f172a'/%3E%3Ctext x='50%25' y='45%25' dominant-baseline='middle' text-anchor='middle' font-size='56'%3E🏏%3C/text%3E%3Ctext x='50%25' y='65%25' dominant-baseline='middle' text-anchor='middle' fill='%2334d399' font-family='sans-serif' font-size='18' font-weight='700'%3ECRICKET HIGHLIGHTS%3C/text%3E%3C/svg%3E",
      videoId: "pXl8xUeG_1w",
      embedUrl: "https://www.youtube-nocookie.com/embed/pXl8xUeG_1w?autoplay=1"
    },
    {
      id: "hl-pant-gabba-2021",
      title: "The Gabba Miracle: India Breach Australia's 32-Year Fortress",
      type: "classics",
      duration: "18:45",
      teams: "India vs Australia",
      tournament: "Border-Gavaskar Trophy Test 4",
      heroMoments: "Rishabh Pant 89* on Day 5, Shubman Gill 91, chasing 328 to seal historic 2-1 series victory!",
      date: "Jan 19, 2021",
      thumb: "https://images.unsplash.com/photo-1587280501635-68a0e82cd5ff?w=800&q=80",
      fallbackThumb: "data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='338' viewBox='0 0 600 338'%3E%3Crect width='600' height='338' fill='%230f172a'/%3E%3Ctext x='50%25' y='45%25' dominant-baseline='middle' text-anchor='middle' font-size='56'%3E🏏%3C/text%3E%3Ctext x='50%25' y='65%25' dominant-baseline='middle' text-anchor='middle' fill='%2334d399' font-family='sans-serif' font-size='18' font-weight='700'%3ECRICKET HIGHLIGHTS%3C/text%3E%3C/svg%3E",
      videoId: "QnO7vT4K1qY",
      embedUrl: "https://www.youtube-nocookie.com/embed/QnO7vT4K1qY?autoplay=1"
    },
    {
      id: "hl-dhoni-vintage-csk-mi",
      title: "MS Dhoni 16 Runs off 4 Balls vs MI: Vintage Finisher",
      type: "ipl",
      duration: "07:50",
      teams: "Chennai Super Kings vs Mumbai Indians",
      tournament: "IPL El Clásico",
      heroMoments: "6, 4, 2, 4 off Jaydev Unadkat in the final over, Dhoni takes CSK over the line!",
      date: "April 21, 2022",
      thumb: "https://images.unsplash.com/photo-1531415074868-036b107e775a?w=800&q=80",
      fallbackThumb: "data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='338' viewBox='0 0 600 338'%3E%3Crect width='600' height='338' fill='%230f172a'/%3E%3Ctext x='50%25' y='45%25' dominant-baseline='middle' text-anchor='middle' font-size='56'%3E🏏%3C/text%3E%3Ctext x='50%25' y='65%25' dominant-baseline='middle' text-anchor='middle' fill='%2334d399' font-family='sans-serif' font-size='18' font-weight='700'%3ECRICKET HIGHLIGHTS%3C/text%3E%3C/svg%3E",
      videoId: "LkJ7hG2p3Q8",
      embedUrl: "https://www.youtube-nocookie.com/embed/LkJ7hG2p3Q8?autoplay=1"
    },
    {
      id: "hl-bumrah-6-19-england",
      title: "Jasprit Bumrah's Deadly 6/19 vs England at The Oval",
      type: "classics",
      duration: "11:15",
      teams: "India vs England",
      tournament: "1st ODI • London",
      heroMoments: "Swinging yorkers, dismissing Roy, Root, Bairstow for ducks, skittling England for 110!",
      date: "July 12, 2022",
      thumb: "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=800&q=80",
      fallbackThumb: "data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='338' viewBox='0 0 600 338'%3E%3Crect width='600' height='338' fill='%230f172a'/%3E%3Ctext x='50%25' y='45%25' dominant-baseline='middle' text-anchor='middle' font-size='56'%3E🏏%3C/text%3E%3Ctext x='50%25' y='65%25' dominant-baseline='middle' text-anchor='middle' fill='%2334d399' font-family='sans-serif' font-size='18' font-weight='700'%3ECRICKET HIGHLIGHTS%3C/text%3E%3C/svg%3E",
      videoId: "YmB7nK4p9Qw",
      embedUrl: "https://www.youtube-nocookie.com/embed/YmB7nK4p9Qw?autoplay=1"
    },
    {
      id: "hl-sachin-175-aus",
      title: "Sachin Tendulkar's Masterpiece 175 vs Australia",
      type: "classics",
      duration: "16:20",
      teams: "India vs Australia",
      tournament: "Hyderabad ODI Classic",
      heroMoments: "Chasing 351 against Australia's peak bowling line-up, unforgettable solo masterclass!",
      date: "Nov 5, 2009",
      thumb: "https://images.unsplash.com/photo-1517649763962-0c623266ddc0?w=800&q=80",
      fallbackThumb: "data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='338' viewBox='0 0 600 338'%3E%3Crect width='600' height='338' fill='%230f172a'/%3E%3Ctext x='50%25' y='45%25' dominant-baseline='middle' text-anchor='middle' font-size='56'%3E🏏%3C/text%3E%3Ctext x='50%25' y='65%25' dominant-baseline='middle' text-anchor='middle' fill='%2334d399' font-family='sans-serif' font-size='18' font-weight='700'%3ECRICKET HIGHLIGHTS%3C/text%3E%3C/svg%3E",
      videoId: "D8_u_6WJ1m0",
      embedUrl: "https://www.youtube-nocookie.com/embed/D8_u_6WJ1m0?autoplay=1"
    }
  ]
};

const OTT_DATA = {
  platforms: [
    {
      id: "netflix",
      name: "Netflix",
      color: "#e50914",
      bgGradient: "linear-gradient(135deg, rgba(229,9,20,0.2) 0%, rgba(10,10,12,0.9) 100%)",
      borderColor: "rgba(229,9,20,0.4)",
      badgeColor: "#e50914",
      icon: "🔴",
      officialUrl: "https://www.netflix.com",
      appScheme: "netflix://",
      desc: "Stream exclusive Netflix Originals, global blockbuster series, award-winning movies, and Indian regional cinema."
    },
    {
      id: "hotstar",
      name: "Disney+ Hotstar",
      color: "#0c54e0",
      bgGradient: "linear-gradient(135deg, rgba(12,84,224,0.2) 0%, rgba(10,10,12,0.9) 100%)",
      borderColor: "rgba(12,84,224,0.4)",
      badgeColor: "#1d4ed8",
      icon: "🔷",
      officialUrl: "https://www.hotstar.com",
      appScheme: "hotstar://",
      desc: "Home of Live Cricket, ICC Tournaments, Hotstar Specials, Tamil serials, Disney, Pixar, Marvel, and Star Wars."
    },
    {
      id: "prime",
      name: "Amazon Prime Video",
      color: "#00a8e1",
      bgGradient: "linear-gradient(135deg, rgba(0,168,225,0.2) 0%, rgba(10,10,12,0.9) 100%)",
      borderColor: "rgba(0,168,225,0.4)",
      badgeColor: "#0284c7",
      icon: "🔵",
      officialUrl: "https://www.primevideo.com",
      appScheme: "primevideo://",
      desc: "Watch Prime Original series, latest theatrical blockbusters in Tamil/Hindi/English, and Amazon Originals."
    },
    {
      id: "free_ott",
      name: "Free FAST Movie Channels",
      color: "#10b981",
      bgGradient: "linear-gradient(135deg, rgba(16,185,129,0.2) 0%, rgba(10,10,12,0.9) 100%)",
      borderColor: "rgba(16,185,129,0.4)",
      badgeColor: "#10b981",
      icon: "🆓",
      officialUrl: "#",
      desc: "Watch 100% free streaming movie and series channels that play live in the built-in video player with zero subscription!"
    }
  ],

  // Curated Top OTT Movies & Series Catalog with Trailers & Watch Links
  titles: [
    // Netflix
    {
      id: "ott-squidgame-2",
      platform: "netflix",
      platformName: "Netflix",
      title: "Squid Game (Season 2)",
      year: "2024",
      rating: "9.0 ★",
      language: "Korean / Hindi / Tamil Dub",
      genres: ["Thriller", "Survival", "Mystery"],
      poster: "https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=600&q=80",
      overview: "Player 456 Seong Gi-hun returns to dismantle the deadly games once and for all as new high-stakes games begin.",
      videoId: "bB8h_7s3cOw",
      watchUrl: "https://www.netflix.com/title/81040344"
    },
    {
      id: "ott-leo-bloody-sweet",
      platform: "netflix",
      platformName: "Netflix",
      title: "Leo (Bloody Sweet)",
      year: "2023",
      rating: "8.1 ★",
      language: "Tamil / Telugu / Hindi",
      genres: ["Action", "Crime Thriller", "Lokesh Cinematic Universe"],
      poster: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=600&q=80",
      overview: "Thalapathy Vijay stars as Parthiban, a mild-mannered cafe owner in Kashmir whose mysterious past catches up with him.",
      videoId: "Po3jStA673E",
      watchUrl: "https://www.netflix.com/title/81639324"
    },
    {
      id: "ott-stranger-things",
      platform: "netflix",
      platformName: "Netflix",
      title: "Stranger Things",
      year: "2024",
      rating: "8.7 ★",
      language: "English / Hindi / Tamil Dub",
      genres: ["Sci-Fi", "Mystery", "Horror"],
      poster: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=600&q=80",
      overview: "When a young boy vanishes, a small town uncovers a mystery involving secret experiments, terrifying supernatural forces and one strange little girl.",
      videoId: "b9EkMc79ZSU",
      watchUrl: "https://www.netflix.com/title/80057281"
    },
    {
      id: "ott-chamkila",
      platform: "netflix",
      platformName: "Netflix",
      title: "Amar Singh Chamkila",
      year: "2024",
      rating: "8.4 ★",
      language: "Hindi / Punjabi",
      genres: ["Biography", "Music", "Drama"],
      poster: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&q=80",
      overview: "Imtiaz Ali directs Diljit Dosanjh and Parineeti Chopra in the true story of Punjab's legendary original rockstar.",
      videoId: "gG4sB5cEov4",
      watchUrl: "https://www.netflix.com/title/81432229"
    },

    // Disney+ Hotstar
    {
      id: "ott-live-cricket-hotstar",
      platform: "hotstar",
      platformName: "Disney+ Hotstar",
      title: "Live Cricket & ICC Tournaments",
      year: "2024/25",
      rating: "LIVE 🔴",
      language: "Tamil / English / Hindi / Telugu",
      genres: ["Sports", "Live Cricket", "Bilateral Series"],
      poster: "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=600&q=80",
      overview: "Stream live international cricket matches, ICC events, bilateral tours, and high-definition cricket studio shows.",
      videoId: "m3_9_w8UoDk",
      watchUrl: "https://www.hotstar.com/sports/cricket"
    },
    {
      id: "ott-heart-beat-tamil",
      platform: "hotstar",
      platformName: "Disney+ Hotstar",
      title: "Heart Beat (Tamil Hotstar Special)",
      year: "2024",
      rating: "8.8 ★",
      language: "Tamil",
      genres: ["Medical Drama", "Romance", "Emotional"],
      poster: "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=600&q=80",
      overview: "Reena joins RK Multispeciality Hospital as an intern and faces intense personal and medical battles that redefine her life.",
      videoId: "P2T3z6X9xWw",
      watchUrl: "https://www.hotstar.com"
    },
    {
      id: "ott-shogun",
      platform: "hotstar",
      platformName: "Disney+ Hotstar",
      title: "Shōgun (18x Emmy Winner)",
      year: "2024",
      rating: "9.0 ★",
      language: "Japanese / English / Hindi",
      genres: ["Historical Drama", "War", "Action"],
      poster: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600&q=80",
      overview: "In feudal Japan in 1600, Lord Yoshii Toranaga discovers secrets from a stranded European ship that could shift the balance of power.",
      videoId: "yFNbJ_m3eLw",
      watchUrl: "https://www.hotstar.com"
    },
    {
      id: "ott-special-ops",
      platform: "hotstar",
      platformName: "Disney+ Hotstar",
      title: "Special Ops 1.5: The Himmat Story",
      year: "2023",
      rating: "8.6 ★",
      language: "Hindi / Tamil / Telugu",
      genres: ["Espionage", "Action", "Thriller"],
      poster: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=600&q=80",
      overview: "Neeraj Pandey's espionage thriller follows Himmat Singh as a young intelligence officer on a mission that shapes his career.",
      videoId: "K7x9Z8wLj3c",
      watchUrl: "https://www.hotstar.com"
    },

    // Amazon Prime Video
    {
      id: "ott-mirzapur-3",
      platform: "prime",
      platformName: "Prime Video",
      title: "Mirzapur (Season 3)",
      year: "2024",
      rating: "8.5 ★",
      language: "Hindi / Tamil / Telugu Dub",
      genres: ["Crime", "Action", "Drama"],
      poster: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=600&q=80",
      overview: "Guddu Pandit and Golu clash for control of the throne of Mirzapur in a brutal fight for power, vengeance, and family.",
      videoId: "q3M4pYj7w8E",
      watchUrl: "https://www.primevideo.com"
    },
    {
      id: "ott-the-boys-4",
      platform: "prime",
      platformName: "Prime Video",
      title: "The Boys (Season 4)",
      year: "2024",
      rating: "8.7 ★",
      language: "English / Hindi / Tamil Dub",
      genres: ["Action", "Sci-Fi", "Dark Satire"],
      poster: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=600&q=80",
      overview: "Victoria Neuman nears the Oval Office under Homelander's thumb as Butcher with only months to live finds one last way to save the world.",
      videoId: "EzFXDvDV-FA",
      watchUrl: "https://www.primevideo.com"
    },
    {
      id: "ott-panchayat-3",
      platform: "prime",
      platformName: "Prime Video",
      title: "Panchayat (Season 3)",
      year: "2024",
      rating: "9.0 ★",
      language: "Hindi / Tamil / Telugu",
      genres: ["Comedy", "Drama", "Village Life"],
      poster: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&q=80",
      overview: "Abhishek Tripathi continues his journey as the secretary of Phulera panchayat amid village politics, humor, and heart.",
      videoId: "mK9Z8v7xW1L",
      watchUrl: "https://www.primevideo.com"
    },
    {
      id: "ott-suzhal-vortex",
      platform: "prime",
      platformName: "Prime Video",
      title: "Suzhal: The Vortex (Tamil Thriller)",
      year: "2023",
      rating: "8.3 ★",
      language: "Tamil / Telugu / Hindi",
      genres: ["Crime Mystery", "Investigation", "Tamil Thriller"],
      poster: "https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=600&q=80",
      overview: "In a small South Indian town, the disappearance of a young girl during a local festival unravels dark and twisted secrets.",
      videoId: "8Jk9Zw7xL3Q",
      watchUrl: "https://www.primevideo.com"
    },
    {
      id: "ott-captain-miller",
      platform: "prime",
      platformName: "Prime Video",
      title: "Captain Miller (Tamil Blockbuster)",
      year: "2024",
      rating: "7.9 ★",
      language: "Tamil / Telugu / Hindi",
      genres: ["Period Action", "Rebellion", "War"],
      poster: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=600&q=80",
      overview: "Dhanush stars as a former British Army soldier who turns into a revolutionary warrior fighting for his oppressed people.",
      videoId: "zL9X8w7mK1J",
      watchUrl: "https://www.primevideo.com"
    }
  ],

  // FAST Free Movie Channels (Instant Playable inside Player)
  freeFastChannels: [
    {
      id: "fast-thiraitv-movies",
      name: "Thirai TV HD (24/7 Tamil Cinema)",
      platform: "free_ott",
      platformName: "Free OTT",
      category: "Movies",
      logo: "https://live.apcloud.in/thiraitv/thiraitvhd/logo.png",
      url: "https://live.apcloud.in/thiraitv/thiraitvhd/index.m3u8?origin=github.com/amazeyourself",
      quality: "1080p",
      desc: "Free 24/7 Tamil blockbuster movies streaming non-stop with zero subscription required."
    },
    {
      id: "fast-rajdigital-movies",
      name: "Raj Digital Plus (Tamil Cinema HD)",
      platform: "free_ott",
      platformName: "Free OTT",
      category: "Movies",
      logo: "https://upload.wikimedia.org/wikipedia/en/thumb/8/82/Raj_Digital_Plus_logo.png/220px-Raj_Digital_Plus_logo.png",
      url: "https://livestream.rajtv.tv/hlslive/Admin/px08241087/live/RajTV_Digital_plus/master_1.m3u8",
      quality: "1080p",
      desc: "Free Tamil movies live broadcast from Raj Television network."
    },
    {
      id: "fast-thalaatv-cinema",
      name: "Thalaa TV (Tamil Cinema)",
      platform: "free_ott",
      platformName: "Free OTT",
      category: "Movies",
      logo: "https://streams2.sofast.tv/assets/channel_logos/thalaa_tv.png",
      url: "https://streams2.sofast.tv/v1/master/611d79b11b77e2f571934fd80ca1413453772ac7/2069c593-3c07-4d62-9d44-746be5c3a5d6/manifest.m3u8",
      quality: "1080p",
      desc: "Non-stop free Tamil cinema broadcast from Sofast TV."
    },
    {
      id: "fast-peppers-classics",
      name: "Peppers TV (Classic Entertainment)",
      platform: "free_ott",
      platformName: "Free OTT",
      category: "Movies",
      logo: "https://upload.wikimedia.org/wikipedia/en/e/eb/Peppers_TV_logo.png",
      url: "https://cdn.pishow.tv/ott/live/1383/master.m3u8",
      quality: "720p",
      desc: "Classic South Indian cinema, entertainment, and golden vintage cinema."
    }
  ]
};

// Export for browser
if (typeof window !== 'undefined') {
  window.CRICKET_DATA = CRICKET_DATA;
  window.OTT_DATA = OTT_DATA;
}

if (typeof module !== 'undefined') {
  module.exports = { CRICKET_DATA, OTT_DATA };
}
