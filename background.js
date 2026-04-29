// TimeWise — Background Service Worker
// Core time tracking engine

const DEFAULT_CATEGORIES = [
  { id: 'study', name: 'Study', emoji: '📚', color: '--color-green' },
  { id: 'productive', name: 'Productive', emoji: '💼', color: '--color-blue' },
  { id: 'consumption', name: 'Consumption', emoji: '🍿', color: '--color-yellow' },
  { id: 'wasted', name: 'Wasted', emoji: '🗑️', color: '--color-red' },
  { id: 'miscellaneous', name: 'Miscellaneous', emoji: '❓', color: '--color-aqua' }
];

const DEFAULT_SETTINGS = {
  idleTimeoutMinutes: 2,
  dataRetention: 'forever',
  theme: 'everforest-dark-hard'
};

// =============== STATE ===============
let currentTabId = null;
let currentDomain = null;
let currentYoutubeChannel = null;
let startTime = null;
let isTracking = false;
let isPaused = false;
let tabChannels = {}; // Store channels per tab ID

// =============== INITIALIZATION ===============
chrome.runtime.onInstalled.addListener(async (details) => {
  if (details.reason === 'install') {
    await chrome.storage.local.set({
      categories: DEFAULT_CATEGORIES,
      settings: DEFAULT_SETTINGS,
      domainRules: {},
      channelRules: {}
    });
  }
  // Set up daily cleanup alarm
  chrome.alarms.create('dataCleanup', { periodInMinutes: 1440 });
  // Set idle detection interval
  const settings = await getSettings();
  try { chrome.idle.setDetectInterval(settings.idleTimeoutMinutes * 60); } catch(e) { console.log('idle.setDetectInterval not supported'); }
});

chrome.runtime.onStartup.addListener(async () => {
  const settings = await getSettings();
  try { chrome.idle.setDetectInterval(settings.idleTimeoutMinutes * 60); } catch(e) {}
  chrome.alarms.create('dataCleanup', { periodInMinutes: 1440 });
});

// =============== HELPERS ===============
function getDomain(url) {
  try {
    const u = new URL(url);
    if (u.protocol !== 'http:' && u.protocol !== 'https:') return null;
    return u.hostname.replace(/^www\./, '');
  } catch {
    return null;
  }
}

function getDateKey(date) {
  const d = date || new Date();
  return `time_${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

async function getSettings() {
  const result = await chrome.storage.local.get('settings');
  return result.settings || DEFAULT_SETTINGS;
}

async function getDayData(dateKey) {
  const result = await chrome.storage.local.get(dateKey);
  const data = result[dateKey] || { total: 0, domains: {}, youtubeChannels: {} };
  if (!data.youtubeChannels) data.youtubeChannels = {};
  if (!data.domains) data.domains = {};
  return data;
}

// =============== CORE TRACKING ===============
async function saveTimeSpent() {
  if (!isTracking || isPaused || !startTime || !currentDomain) return;

  const now = Date.now();
  const duration = now - startTime;
  startTime = now;

  // Ignore very short durations (< 1 second) or impossibly long ones (> 2 hours without event)
  if (duration < 1000 || duration > 7200000) return;

  const dateKey = getDateKey();
  const dayData = await getDayData(dateKey);

  // Save domain time
  if (!dayData.domains[currentDomain]) {
    dayData.domains[currentDomain] = 0;
  }
  dayData.domains[currentDomain] += duration;

  // Save YouTube channel time if applicable
  if (currentDomain === 'youtube.com' && currentYoutubeChannel) {
    if (!dayData.youtubeChannels[currentYoutubeChannel]) {
      dayData.youtubeChannels[currentYoutubeChannel] = 0;
    }
    dayData.youtubeChannels[currentYoutubeChannel] += duration;

    // Auto-assign new channels to miscellaneous
    const { channelRules = {} } = await chrome.storage.local.get('channelRules');
    if (!channelRules[currentYoutubeChannel]) {
      channelRules[currentYoutubeChannel] = 'miscellaneous';
      await chrome.storage.local.set({ channelRules });
    }
  }

  // Auto-assign new domains to miscellaneous
  const { domainRules = {} } = await chrome.storage.local.get('domainRules');
  if (!domainRules[currentDomain]) {
    domainRules[currentDomain] = 'miscellaneous';
    await chrome.storage.local.set({ domainRules });
  }

  await chrome.storage.local.set({ [dateKey]: dayData });
}

function startTracking(tabId, domain) {
  currentTabId = tabId;
  currentDomain = domain;
  startTime = Date.now();
  isTracking = true;
  isPaused = false;
}

async function stopTracking() {
  const p = saveTimeSpent();
  isTracking = false;
  currentDomain = null;
  currentYoutubeChannel = null;
  await p;
}

function pauseTracking() {
  if (isTracking && !isPaused) {
    saveTimeSpent();
    isPaused = true;
  }
}

function resumeTracking() {
  if (isPaused) {
    startTime = Date.now();
    isPaused = false;
  }
}

// =============== EVENT LISTENERS ===============

// Tab activated (switched to)
chrome.tabs.onActivated.addListener(async (activeInfo) => {
  const p = saveTimeSpent();
  currentTabId = activeInfo.tabId;
  
  try {
    const tab = await chrome.tabs.get(activeInfo.tabId);
    
    // Instantly wipe channel if we know the new tab is not a video page
    if (tab.url) {
      try {
        const u = new URL(tab.url);
        if (u.hostname.includes('youtube.com') && u.pathname !== '/watch' && !u.pathname.startsWith('/shorts/')) {
          delete tabChannels[activeInfo.tabId];
        }
      } catch {}
    }
    
    currentYoutubeChannel = tabChannels[activeInfo.tabId] || null;

    const domain = getDomain(tab.url);
    if (domain) {
      startTracking(activeInfo.tabId, domain);
    } else {
      stopTracking();
    }
  } catch {
    stopTracking();
  }
  await p;
});

// Tab URL changed (navigation within tab)
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (tabId !== currentTabId || !changeInfo.url) return;

  const p = saveTimeSpent();
  
  // Instantly wipe channel if we know the new URL is not a video page
  try {
    const u = new URL(changeInfo.url);
    if (u.hostname.includes('youtube.com') && u.pathname !== '/watch' && !u.pathname.startsWith('/shorts/')) {
      delete tabChannels[tabId];
    }
  } catch {}

  currentYoutubeChannel = tabChannels[tabId] || null;

  const domain = getDomain(changeInfo.url);
  if (domain) {
    startTracking(tabId, domain);
  } else {
    stopTracking();
  }
});

// Tab closed
chrome.tabs.onRemoved.addListener(async (tabId) => {
  if (tabId === currentTabId) {
    await saveTimeSpent();
    isTracking = false;
    currentTabId = null;
    currentDomain = null;
    currentYoutubeChannel = null;
    delete tabChannels[tabId];
  }
});

// Window focus changed (user left Chrome or switched windows)
chrome.windows.onFocusChanged.addListener(async (windowId) => {
  if (windowId === chrome.windows.WINDOW_ID_NONE) {
    // User left Chrome
    await saveTimeSpent();
    isPaused = true;
  } else {
    // User came back to Chrome
    try {
      const [tab] = await chrome.tabs.query({ active: true, windowId });
      if (tab) {
        if (tab.id === currentTabId) {
          // Same tab, just resume
          resumeTracking();
        } else {
          // Different tab/window
          await saveTimeSpent();
          currentTabId = tab.id;
          currentYoutubeChannel = tabChannels[tab.id] || null;
          const domain = getDomain(tab.url);
          if (domain) {
            startTracking(tab.id, domain);
          } else {
            stopTracking();
          }
        }
      } else {
        stopTracking();
        currentTabId = null;
      }
    } catch {
      // Window might be devtools or special window
      stopTracking();
    }
  }
});

// Idle state changed — SMART idle with audio detection
chrome.idle.onStateChanged.addListener(async (state) => {
  if (state === 'locked') {
    // Screen locked — always pause
    pauseTracking();
  } else if (state === 'idle') {
    // No input — but check if active tab is playing audio
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tab && tab.audible) {
        // Audio playing (lecture, video, music) — keep counting
        return;
      }
    } catch {}
    // No audio — user probably walked away
    pauseTracking();
  } else if (state === 'active') {
    resumeTracking();
  }
});

// YouTube channel detection from content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'YOUTUBE_CHANNEL') {
    if (sender.tab) {
      tabChannels[sender.tab.id] = message.channelName;
      if (currentTabId === sender.tab.id) {
        currentYoutubeChannel = message.channelName;
      }
    } else {
      currentYoutubeChannel = message.channelName;
    }
    sendResponse({ received: true });
  }

  if (message.type === 'GET_TODAY_DATA') {
    (async () => {
      const dateKey = getDateKey();
      const dayData = await getDayData(dateKey);
      const { domainRules = {} } = await chrome.storage.local.get('domainRules');
      const { channelRules = {} } = await chrome.storage.local.get('channelRules');
      const { categories = DEFAULT_CATEGORIES } = await chrome.storage.local.get('categories');

      // Flush current tracking before returning data
      if (isTracking && !isPaused && startTime && currentDomain) {
        const now = Date.now();
        const duration = now - startTime;
        if (duration >= 1000 && duration <= 7200000) {
          if (!dayData.domains[currentDomain]) dayData.domains[currentDomain] = 0;
          dayData.domains[currentDomain] += duration;
          if (currentDomain === 'youtube.com' && currentYoutubeChannel) {
            if (!dayData.youtubeChannels[currentYoutubeChannel]) dayData.youtubeChannels[currentYoutubeChannel] = 0;
            dayData.youtubeChannels[currentYoutubeChannel] += duration;
          }
        }
      }

      sendResponse({
        dayData,
        domainRules,
        channelRules,
        categories,
        currentDomain,
        currentChannel: currentYoutubeChannel
      });
    })();
    return true; // Keep message channel open for async response
  }

  if (message.type === 'GET_RANGE_DATA') {
    (async () => {
      const { startDate, endDate } = message;
      const data = {};
      const start = new Date(startDate);
      const end = new Date(endDate);

      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        const key = getDateKey(d);
        data[key] = await getDayData(key);
      }

      const { domainRules = {} } = await chrome.storage.local.get('domainRules');
      const { channelRules = {} } = await chrome.storage.local.get('channelRules');
      const { categories = DEFAULT_CATEGORIES } = await chrome.storage.local.get('categories');
      const settings = await getSettings();

      sendResponse({ data, domainRules, channelRules, categories, settings });
    })();
    return true;
  }

  if (message.type === 'UPDATE_DOMAIN_RULE') {
    (async () => {
      const { domainRules = {} } = await chrome.storage.local.get('domainRules');
      domainRules[message.domain] = message.category;
      await chrome.storage.local.set({ domainRules });
      sendResponse({ success: true });
    })();
    return true;
  }

  if (message.type === 'UPDATE_CHANNEL_RULE') {
    (async () => {
      const { channelRules = {} } = await chrome.storage.local.get('channelRules');
      channelRules[message.channel] = message.category;
      await chrome.storage.local.set({ channelRules });
      sendResponse({ success: true });
    })();
    return true;
  }

  if (message.type === 'UPDATE_CATEGORIES') {
    (async () => {
      await chrome.storage.local.set({ categories: message.categories });
      sendResponse({ success: true });
    })();
    return true;
  }

  if (message.type === 'UPDATE_SETTINGS') {
    (async () => {
      const settings = await getSettings();
      const newSettings = { ...settings, ...message.settings };
      await chrome.storage.local.set({ settings: newSettings });
      if (message.settings.idleTimeoutMinutes) {
        try { chrome.idle.setDetectInterval(message.settings.idleTimeoutMinutes * 60); } catch(e) {}
      }
      sendResponse({ success: true });
    })();
    return true;
  }

  if (message.type === 'EXPORT_DATA') {
    (async () => {
      const allData = await chrome.storage.local.get(null);
      sendResponse({ data: allData });
    })();
    return true;
  }

  if (message.type === 'IMPORT_DATA') {
    (async () => {
      await chrome.storage.local.clear();
      await chrome.storage.local.set(message.data);
      sendResponse({ success: true });
    })();
    return true;
  }

  if (message.type === 'CLEAR_DATA') {
    (async () => {
      // Keep settings, categories, rules — only clear time data
      const { categories, settings, domainRules, channelRules } = await chrome.storage.local.get([
        'categories', 'settings', 'domainRules', 'channelRules'
      ]);
      await chrome.storage.local.clear();
      await chrome.storage.local.set({
        categories: categories || DEFAULT_CATEGORIES,
        settings: settings || DEFAULT_SETTINGS,
        domainRules: domainRules || {},
        channelRules: channelRules || {}
      });
      sendResponse({ success: true });
    })();
    return true;
  }

  if (message.type === 'RESTORE_DEFAULT_CATEGORIES') {
    (async () => {
      await chrome.storage.local.set({ categories: DEFAULT_CATEGORIES });
      sendResponse({ success: true, categories: DEFAULT_CATEGORIES });
    })();
    return true;
  }
});

// =============== DATA RETENTION CLEANUP ===============
chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name !== 'dataCleanup') return;

  const settings = await getSettings();
  if (settings.dataRetention === 'forever') return;

  const retentionDays = {
    '1month': 30,
    '3months': 90,
    '6months': 180,
    '1year': 365
  };

  const days = retentionDays[settings.dataRetention];
  if (!days) return;

  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);

  const allData = await chrome.storage.local.get(null);
  const keysToDelete = Object.keys(allData).filter(key => {
    if (!key.startsWith('time_')) return false;
    const dateStr = key.replace('time_', '');
    const date = new Date(dateStr);
    return date < cutoff;
  });

  if (keysToDelete.length > 0) {
    await chrome.storage.local.remove(keysToDelete);
    console.log(`TimeWise: Cleaned up ${keysToDelete.length} old entries`);
  }
});
