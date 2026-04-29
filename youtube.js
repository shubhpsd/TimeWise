// TimeWise — YouTube Content Script
// Detects the current YouTube channel name and sends it to the service worker

(function() {
  'use strict';

  let lastChannel = null;
  let debounceTimer = null;
  let hasSentInitial = false;

  // Extract channel name from the DOM
  function getChannelName() {
    // If it's a Short, just group them all under one pseudo-channel
    if (window.location.pathname.startsWith('/shorts/')) {
      return 'YouTube Shorts';
    }

    // Selectors for standard videos
    const selectors = [
      'ytd-watch-metadata #owner ytd-channel-name #text a',
      'ytd-watch-metadata ytd-channel-name yt-formatted-string a',
      '#owner-name a',
      'ytd-video-owner-renderer #channel-name a',
      '.ytd-channel-name a'
    ];

    for (const selector of selectors) {
      const el = document.querySelector(selector);
      if (el && el.textContent.trim()) {
        return el.textContent.trim();
      }
    }

    // Fallback: try to extract from the avatar link title or img alt (Standard)
    const activeAvatar = document.querySelector('#avatar a[title]');
    if (activeAvatar) {
      const title = activeAvatar.getAttribute('title') || activeAvatar.getAttribute('alt');
      if (title && title.toLowerCase() !== 'avatar' && title.trim().length > 0) {
        return title.trim();
      }
    }

    // Fallback: try meta tag
    const metaEl = document.querySelector('span[itemprop="author"] link[itemprop="name"]');
    if (metaEl) {
      return metaEl.getAttribute('content');
    }

    return null;
  }

  // Send channel name to service worker
  function sendChannelName(channelName) {
    if (hasSentInitial && channelName === lastChannel) return;
    hasSentInitial = true;
    lastChannel = channelName;

    try {
      chrome.runtime.sendMessage(
        { type: 'YOUTUBE_CHANNEL', channelName },
        () => {
          if (chrome.runtime.lastError) {
            // Service worker might be inactive, that's okay
          }
        }
      );
    } catch (e) {
      // Extension context invalidated
    }
  }

  // Debounced check for channel name
  function checkForChannel() {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      const path = window.location.pathname;
      if (path === '/watch' || path.startsWith('/shorts/')) {
        const channelName = getChannelName();
        if (channelName) {
          sendChannelName(channelName);
        }
      } else {
        // Not on a video page, clear the channel
        sendChannelName(null);
      }
    }, 500);
  }

  // Listen for YouTube SPA navigation
  document.addEventListener('yt-navigate-finish', () => {
    checkForChannel();
  });

  // MutationObserver for initial load and dynamic content
  const observer = new MutationObserver((mutations) => {
    const path = window.location.pathname;
    if (path === '/watch' || path.startsWith('/shorts/')) {
      checkForChannel();
    } else if (lastChannel !== null) {
      checkForChannel(); // Triggers sendChannelName(null)
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });

  // Re-check when tab becomes visible (fixes alt-tabbing to already open tabs)
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      lastChannel = null; // Force update
      const path = window.location.pathname;
      if (path === '/watch' || path.startsWith('/shorts/')) {
        checkForChannel();
      }
    }
  });

  window.addEventListener('focus', () => {
    lastChannel = null; // Force update
    const path = window.location.pathname;
    if (path === '/watch' || path.startsWith('/shorts/')) {
      checkForChannel();
    }
  });

  // Initial check
  checkForChannel();
})();
