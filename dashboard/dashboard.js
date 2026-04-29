// TimeWise Dashboard Script

let currentRange = 'today';
let cachedData = null;
let donutChart = null;
let trendChart = null;

// =============== INIT ===============
document.addEventListener('DOMContentLoaded', async () => {
  await loadSavedTheme();
  populateThemeSelect();
  setupEventListeners();
  await loadDashboard();
});

// =============== HELPERS ===============
function formatTime(ms) {
  if (!ms || ms < 0) return '0m';
  const s = Math.floor(ms / 1000);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  if (h === 0 && m === 0) return `${s}s`;
  if (h === 0) return `${m}m`;
  return `${h}h ${m}m`;
}

function formatTimeLong(ms) {
  if (!ms || ms < 0) return '0h 0m';
  const s = Math.floor(ms / 1000);
  return `${Math.floor(s / 3600)}h ${Math.floor((s % 3600) / 60)}m`;
}

function getDateStr(date) {
  const d = date || new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function getDateRange(range) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  let start = new Date(today);

  switch (range) {
    case 'today':
      return { start: getDateStr(today), end: getDateStr(today) };
    case 'week':
      start.setDate(today.getDate() - today.getDay());
      return { start: getDateStr(start), end: getDateStr(today) };
    case 'month':
      start.setDate(1);
      return { start: getDateStr(start), end: getDateStr(today) };
    default:
      return { start: getDateStr(today), end: getDateStr(today) };
  }
}

// =============== THEME ===============
function populateThemeSelect() {
  const select = document.getElementById('themeSelect');
  const groups = getThemeList();

  Object.entries(groups).forEach(([groupName, themes]) => {
    const optgroup = document.createElement('optgroup');
    optgroup.label = groupName;
    themes.forEach(theme => {
      const option = document.createElement('option');
      option.value = theme.id;
      option.textContent = theme.name;
      optgroup.appendChild(option);
    });
    select.appendChild(optgroup);
  });

  chrome.storage.sync.get('theme', (result) => {
    select.value = result.theme || 'everforest-dark-hard';
  });
}

// =============== EVENT LISTENERS ===============
function setupEventListeners() {
  // Date range buttons
  document.querySelectorAll('.range-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      document.querySelectorAll('.range-btn').forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
      const range = e.target.dataset.range;

      if (range === 'custom') {
        document.getElementById('customDateInputs').style.display = 'flex';
      } else {
        document.getElementById('customDateInputs').style.display = 'none';
        currentRange = range;
        loadDashboard();
      }
    });
  });

  // Custom date range
  document.getElementById('applyCustomRange').addEventListener('click', () => {
    currentRange = 'custom';
    loadDashboard();
  });

  // Theme
  document.getElementById('themeSelect').addEventListener('change', async (e) => {
    await saveTheme(e.target.value);
    // Re-render dashboard with new colors
    if (cachedData) renderDashboard(cachedData);
  });

  // Settings
  document.getElementById('settingsBtn').addEventListener('click', openSettings);
  document.getElementById('closeSettings').addEventListener('click', closeSettings);
  document.getElementById('settingsOverlay').addEventListener('click', (e) => {
    if (e.target === e.currentTarget) closeSettings();
  });

  // Category management
  document.getElementById('addCategoryBtn').addEventListener('click', () => {
    document.getElementById('addCategoryForm').style.display = 'flex';
  });

  document.getElementById('cancelCategoryBtn').addEventListener('click', () => {
    document.getElementById('addCategoryForm').style.display = 'none';
  });

  document.getElementById('saveCategoryBtn').addEventListener('click', saveNewCategory);
  document.getElementById('restoreDefaultsBtn').addEventListener('click', restoreDefaultCategories);

  // Idle slider
  document.getElementById('idleSlider').addEventListener('input', (e) => {
    document.getElementById('idleValue').textContent = `${e.target.value} min`;
  });

  document.getElementById('idleSlider').addEventListener('change', async (e) => {
    await chrome.runtime.sendMessage({
      type: 'UPDATE_SETTINGS',
      settings: { idleTimeoutMinutes: parseInt(e.target.value) }
    });
  });

  // Data retention
  document.getElementById('retentionSelect').addEventListener('change', async (e) => {
    await chrome.runtime.sendMessage({
      type: 'UPDATE_SETTINGS',
      settings: { dataRetention: e.target.value }
    });
  });

  // Export
  document.getElementById('exportBtn').addEventListener('click', exportData);

  // Import
  document.getElementById('importFile').addEventListener('change', importData);

  // Clear
  document.getElementById('clearBtn').addEventListener('click', () => {
    showConfirmModal(
      'Clear All Data?',
      'This will delete all your browsing time data. Your categories and settings will be kept. This cannot be undone.',
      async () => {
        await chrome.runtime.sendMessage({ type: 'CLEAR_DATA' });
        await loadDashboard();
      }
    );
  });

  // Search
  document.getElementById('domainSearch').addEventListener('input', (e) => {
    filterDomainTable(e.target.value);
  });

  document.getElementById('channelSearch').addEventListener('input', (e) => {
    filterChannelTable(e.target.value);
  });
}

// =============== LOAD DATA ===============
async function loadDashboard() {
  let startDate, endDate;

  if (currentRange === 'custom') {
    startDate = document.getElementById('customStart').value;
    endDate = document.getElementById('customEnd').value;
    if (!startDate || !endDate) return;
  } else {
    const range = getDateRange(currentRange);
    startDate = range.start;
    endDate = range.end;
  }

  try {
    const response = await chrome.runtime.sendMessage({
      type: 'GET_RANGE_DATA',
      startDate,
      endDate
    });

    if (!response) return;
    cachedData = response;
    renderDashboard(response);
  } catch (e) {
    console.error('Failed to load dashboard:', e);
  }
}

// =============== RENDER ===============
function renderDashboard(response) {
  const { data, domainRules, channelRules, categories, settings } = response;

  // Aggregate totals
  let totalMs = 0;
  const domainTotals = {};
  const channelTotals = {};
  const dailyData = {};

  Object.entries(data).forEach(([dateKey, dayData]) => {
    const date = dateKey.replace('time_', '');
    dailyData[date] = { total: 0, categories: {} };

    Object.entries(dayData.domains || {}).forEach(([domain, ms]) => {
      if (domain === 'null' || !domain) return; // Ignore corrupted database entries
      totalMs += ms;
      domainTotals[domain] = (domainTotals[domain] || 0) + ms;
      dailyData[date].total += ms;

      const catId = domainRules[domain] || 'miscellaneous';
      dailyData[date].categories[catId] = (dailyData[date].categories[catId] || 0) + ms;
    });

    Object.entries(dayData.youtubeChannels || {}).forEach(([channel, ms]) => {
      channelTotals[channel] = (channelTotals[channel] || 0) + ms;
      
      const channelCatId = channelRules[channel];
      if (channelCatId) {
        // Add to specific channel category
        dailyData[date].categories[channelCatId] = (dailyData[date].categories[channelCatId] || 0) + ms;
        
        // Subtract from youtube domain category so we don't double count
        const ytDomainCatId = domainRules['youtube.com'] || 'miscellaneous';
        if (dailyData[date].categories[ytDomainCatId]) {
          dailyData[date].categories[ytDomainCatId] -= ms;
        }
      }
    });
  });

  // Total time
  document.getElementById('totalTimeBig').textContent = formatTimeLong(totalMs);

  const days = Object.keys(data).length;
  if (days > 1) {
    const avg = totalMs / days;
    document.getElementById('totalTimeSub').textContent = `Avg: ${formatTimeLong(avg)}/day over ${days} days`;
  } else {
    document.getElementById('totalTimeSub').textContent = '';
  }

  // Category totals
  const categoryTotals = {};
  categories.forEach(c => { categoryTotals[c.id] = 0; });

  Object.entries(domainTotals).forEach(([domain, ms]) => {
    const catId = domainRules[domain] || 'miscellaneous';
    if (categoryTotals[catId] !== undefined) {
      categoryTotals[catId] += ms;
    } else {
      categoryTotals['miscellaneous'] = (categoryTotals['miscellaneous'] || 0) + ms;
    }
  });

  // Adjust overall category totals for channel rules
  Object.entries(channelTotals).forEach(([channel, ms]) => {
    const channelCatId = channelRules[channel];
    if (channelCatId && categoryTotals[channelCatId] !== undefined) {
      categoryTotals[channelCatId] += ms;
      
      const ytDomainCatId = domainRules['youtube.com'] || 'miscellaneous';
      if (categoryTotals[ytDomainCatId] !== undefined) {
        categoryTotals[ytDomainCatId] -= ms;
      }
    }
  });

  renderCharts({ categories, categoryTotals, dailyData, totalMs });
  renderDomainTable(domainTotals, domainRules, categories);
  renderChannelTable(channelTotals, channelRules, categories);
}

function renderCharts({ categories, categoryTotals, dailyData, totalMs }) {
  const style = getComputedStyle(document.documentElement);
  const activeCategories = categories.filter(c => (categoryTotals[c.id] || 0) > 0);

  // Donut chart
  const donutCanvas = document.getElementById('categoryDonut');
  const donutCtx = donutCanvas.getContext('2d');

  if (donutChart) donutChart.destroy();

  if (activeCategories.length === 0) {
    donutCanvas.style.display = 'none';
  } else {
    donutCanvas.style.display = 'block';
    const labels = activeCategories.map(c => `${c.emoji} ${c.name}`);
    const data = activeCategories.map(c => categoryTotals[c.id] || 0);
    const colors = activeCategories.map(c => style.getPropertyValue(c.color).trim());

    donutChart = new Chart(donutCtx, {
      type: 'doughnut',
      data: {
        labels,
        datasets: [{ data, backgroundColor: colors, borderWidth: 0, hoverOffset: 6 }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        cutout: '60%',
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: style.getPropertyValue('--bg-tertiary').trim(),
            titleColor: style.getPropertyValue('--text-primary').trim(),
            bodyColor: style.getPropertyValue('--text-secondary').trim(),
            borderColor: style.getPropertyValue('--border-color').trim(),
            borderWidth: 1,
            cornerRadius: 8,
            callbacks: {
              label: (ctx) => ` ${formatTime(ctx.raw)} (${Math.round(ctx.raw / totalMs * 100)}%)`
            }
          }
        }
      }
    });
  }

  // Category bars
  const barsEl = document.getElementById('categoryBars');
  barsEl.innerHTML = '';

  categories.forEach(cat => {
    const ms = categoryTotals[cat.id] || 0;
    if (ms === 0 && activeCategories.length > 0) return;

    const pct = totalMs > 0 ? (ms / totalMs * 100) : 0;
    const color = style.getPropertyValue(cat.color).trim();

    const row = document.createElement('div');
    row.className = 'cat-bar-row';
    row.innerHTML = `
      <span class="cat-bar-label">${cat.emoji} ${cat.name}</span>
      <div class="cat-bar-track">
        <div class="cat-bar-fill" style="width:${pct}%;background:${color}"></div>
      </div>
      <span class="cat-bar-time">${formatTime(ms)}</span>
    `;
    barsEl.appendChild(row);
  });

  // Daily trend chart
  const trendCanvas = document.getElementById('dailyTrend');
  const trendCtx = trendCanvas.getContext('2d');

  if (trendChart) trendChart.destroy();

  const dates = Object.keys(dailyData).sort();
  if (dates.length === 0) return;

  const datasets = categories.map(cat => {
    const color = style.getPropertyValue(cat.color).trim();
    return {
      label: cat.name,
      data: dates.map(d => Math.round((dailyData[d]?.categories?.[cat.id] || 0) / 60000)), // minutes
      backgroundColor: color,
      borderRadius: 4,
      borderSkipped: false,
    };
  }).filter(ds => ds.data.some(v => v > 0));

  trendChart = new Chart(trendCtx, {
    type: 'bar',
    data: { labels: dates.map(d => formatDateLabel(d)), datasets },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          stacked: true,
          grid: { display: false },
          ticks: { color: style.getPropertyValue('--text-tertiary').trim(), font: { size: 11 } }
        },
        y: {
          stacked: true,
          grid: { color: style.getPropertyValue('--border-color').trim() },
          ticks: {
            color: style.getPropertyValue('--text-tertiary').trim(),
            font: { size: 11 },
            callback: (v) => v >= 60 ? `${Math.floor(v / 60)}h` : `${v}m`
          }
        }
      },
      plugins: {
        legend: {
          display: true,
          position: 'bottom',
          labels: {
            color: style.getPropertyValue('--text-secondary').trim(),
            font: { size: 11, family: 'Inter' },
            padding: 12,
            usePointStyle: true,
            pointStyle: 'circle'
          }
        },
        tooltip: {
          backgroundColor: style.getPropertyValue('--bg-tertiary').trim(),
          titleColor: style.getPropertyValue('--text-primary').trim(),
          bodyColor: style.getPropertyValue('--text-secondary').trim(),
          borderColor: style.getPropertyValue('--border-color').trim(),
          borderWidth: 1,
          cornerRadius: 8,
          callbacks: {
            label: (ctx) => {
              const mins = ctx.raw;
              return ` ${ctx.dataset.label}: ${mins >= 60 ? `${Math.floor(mins / 60)}h ${mins % 60}m` : `${mins}m`}`;
            }
          }
        }
      }
    }
  });
}

function formatDateLabel(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${days[d.getDay()]} ${months[d.getMonth()]} ${d.getDate()}`;
}

// =============== DOMAIN TABLE ===============
function renderDomainTable(domainTotals, domainRules, categories) {
  const container = document.getElementById('domainTable');
  const sorted = Object.entries(domainTotals).sort(([, a], [, b]) => b - a);

  if (sorted.length === 0) {
    container.innerHTML = '<div class="empty-state">No data for this period</div>';
    return;
  }

  const style = getComputedStyle(document.documentElement);
  container.innerHTML = '';

  sorted.forEach(([domain, ms]) => {
    const catId = domainRules[domain] || 'miscellaneous';
    const cat = categories.find(c => c.id === catId);
    const color = cat ? style.getPropertyValue(cat.color).trim() : '#666';
    const isUncat = catId === 'miscellaneous';

    const row = document.createElement('div');
    row.className = `table-row${isUncat ? ' uncategorized' : ''}`;
    row.dataset.domain = domain.toLowerCase();

    const select = document.createElement('select');
    select.className = 'table-category-select';
    categories.forEach(c => {
      const opt = document.createElement('option');
      opt.value = c.id;
      opt.textContent = `${c.emoji} ${c.name}`;
      if (c.id === catId) opt.selected = true;
      select.appendChild(opt);
    });

    select.addEventListener('change', async (e) => {
      await chrome.runtime.sendMessage({
        type: 'UPDATE_DOMAIN_RULE',
        domain,
        category: e.target.value
      });
      // Update visual
      const newCat = categories.find(c => c.id === e.target.value);
      const dot = row.querySelector('.cat-dot');
      if (dot && newCat) {
        dot.style.background = style.getPropertyValue(newCat.color).trim();
      }
      row.classList.toggle('uncategorized', e.target.value === 'miscellaneous');
    });

    row.innerHTML = `
      <span class="cat-dot" style="background:${color}"></span>
      <span class="table-domain">${domain}</span>
      <span class="table-time">${formatTime(ms)}</span>
    `;
    row.appendChild(select);
    container.appendChild(row);
  });
}

function filterDomainTable(query) {
  const rows = document.querySelectorAll('#domainTable .table-row');
  const q = query.toLowerCase();
  rows.forEach(row => {
    row.style.display = row.dataset.domain.includes(q) ? 'flex' : 'none';
  });
}

// =============== CHANNEL TABLE ===============
function renderChannelTable(channelTotals, channelRules, categories) {
  const container = document.getElementById('channelTable');
  const sorted = Object.entries(channelTotals).sort(([, a], [, b]) => b - a);

  if (sorted.length === 0) {
    container.innerHTML = '<div class="empty-state">No YouTube data yet</div>';
    document.getElementById('uncategorizedBanner').style.display = 'none';
    return;
  }

  const style = getComputedStyle(document.documentElement);
  const uncatCount = sorted.filter(([ch]) => (channelRules[ch] || 'miscellaneous') === 'miscellaneous').length;

  if (uncatCount > 0) {
    document.getElementById('uncategorizedBanner').style.display = 'flex';
    document.getElementById('uncategorizedCount').textContent = uncatCount;
  } else {
    document.getElementById('uncategorizedBanner').style.display = 'none';
  }

  container.innerHTML = '';

  // Sort: uncategorized first
  const sortedWithUncat = sorted.sort(([a], [b]) => {
    const aUncat = (channelRules[a] || 'miscellaneous') === 'miscellaneous';
    const bUncat = (channelRules[b] || 'miscellaneous') === 'miscellaneous';
    if (aUncat && !bUncat) return -1;
    if (!aUncat && bUncat) return 1;
    return 0;
  });

  sortedWithUncat.forEach(([channel, ms]) => {
    const catId = channelRules[channel] || 'miscellaneous';
    const cat = categories.find(c => c.id === catId);
    const color = cat ? style.getPropertyValue(cat.color).trim() : '#666';
    const isUncat = catId === 'miscellaneous';

    const row = document.createElement('div');
    row.className = `table-row${isUncat ? ' uncategorized' : ''}`;
    row.dataset.channel = channel.toLowerCase();

    const select = document.createElement('select');
    select.className = 'table-category-select';
    categories.forEach(c => {
      const opt = document.createElement('option');
      opt.value = c.id;
      opt.textContent = `${c.emoji} ${c.name}`;
      if (c.id === catId) opt.selected = true;
      select.appendChild(opt);
    });

    select.addEventListener('change', async (e) => {
      await chrome.runtime.sendMessage({
        type: 'UPDATE_CHANNEL_RULE',
        channel,
        category: e.target.value
      });
      const newCat = categories.find(c => c.id === e.target.value);
      const dot = row.querySelector('.cat-dot');
      if (dot && newCat) {
        dot.style.background = style.getPropertyValue(newCat.color).trim();
      }
      row.classList.toggle('uncategorized', e.target.value === 'miscellaneous');
      // Update uncategorized count
      const uncatRows = document.querySelectorAll('#channelTable .table-row.uncategorized');
      const count = uncatRows.length;
      document.getElementById('uncategorizedCount').textContent = count;
      document.getElementById('uncategorizedBanner').style.display = count > 0 ? 'flex' : 'none';
    });

    row.innerHTML = `
      <span class="cat-dot" style="background:${color}"></span>
      <span class="table-channel">📺 ${channel}</span>
      <span class="table-time">${formatTime(ms)}</span>
    `;
    row.appendChild(select);
    container.appendChild(row);
  });
}

function filterChannelTable(query) {
  const rows = document.querySelectorAll('#channelTable .table-row');
  const q = query.toLowerCase();
  rows.forEach(row => {
    row.style.display = row.dataset.channel.includes(q) ? 'flex' : 'none';
  });
}

// =============== SETTINGS ===============
function openSettings() {
  document.getElementById('settingsOverlay').classList.add('open');
  loadSettingsData();
}

function closeSettings() {
  document.getElementById('settingsOverlay').classList.remove('open');
}

async function loadSettingsData() {
  const response = await chrome.runtime.sendMessage({
    type: 'GET_RANGE_DATA',
    startDate: getDateStr(),
    endDate: getDateStr()
  });

  if (!response) return;

  const { categories, settings } = response;

  // Render category list
  renderCategoryList(categories);

  // Idle slider
  document.getElementById('idleSlider').value = settings.idleTimeoutMinutes || 2;
  document.getElementById('idleValue').textContent = `${settings.idleTimeoutMinutes || 2} min`;

  // Data retention
  document.getElementById('retentionSelect').value = settings.dataRetention || 'forever';
}

function renderCategoryList(categories) {
  const container = document.getElementById('categoryList');
  const style = getComputedStyle(document.documentElement);
  container.innerHTML = '';

  categories.forEach((cat, index) => {
    const item = document.createElement('div');
    item.className = 'category-item';

    const colorValue = cat.color.startsWith('--')
      ? style.getPropertyValue(cat.color).trim()
      : cat.color;

    item.innerHTML = `
      <span class="category-item-color" style="background:${colorValue}"></span>
      <span class="category-item-emoji">${cat.emoji}</span>
      <span class="category-item-name">${cat.name}</span>
    `;

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'btn-delete-cat';
    deleteBtn.textContent = '×';
    deleteBtn.addEventListener('click', () => deleteCategory(cat.id, categories));
    item.appendChild(deleteBtn);

    container.appendChild(item);
  });
}

async function saveNewCategory() {
  const name = document.getElementById('newCatName').value.trim();
  const emoji = document.getElementById('newCatEmoji').value.trim() || '📌';
  const color = document.getElementById('newCatColor').value;

  if (!name) return;

  const id = name.toLowerCase().replace(/[^a-z0-9]/g, '_');

  const response = await chrome.runtime.sendMessage({
    type: 'GET_RANGE_DATA',
    startDate: getDateStr(),
    endDate: getDateStr()
  });

  const categories = response.categories || [];
  categories.push({ id, name, emoji, color });

  await chrome.runtime.sendMessage({ type: 'UPDATE_CATEGORIES', categories });

  // Reset form
  document.getElementById('newCatName').value = '';
  document.getElementById('newCatEmoji').value = '';
  document.getElementById('addCategoryForm').style.display = 'none';

  renderCategoryList(categories);
  await loadDashboard();
}

async function deleteCategory(catId, categories) {
  showConfirmModal(
    'Delete Category?',
    'Domains and channels in this category will be moved to Miscellaneous.',
    async () => {
      const newCategories = categories.filter(c => c.id !== catId);
      await chrome.runtime.sendMessage({ type: 'UPDATE_CATEGORIES', categories: newCategories });

      // Move all rules with this category to miscellaneous
      const response = await chrome.runtime.sendMessage({
        type: 'GET_RANGE_DATA',
        startDate: getDateStr(),
        endDate: getDateStr()
      });

      const { domainRules, channelRules } = response;

      Object.entries(domainRules).forEach(([domain, cat]) => {
        if (cat === catId) domainRules[domain] = 'miscellaneous';
      });
      Object.entries(channelRules).forEach(([channel, cat]) => {
        if (cat === catId) channelRules[channel] = 'miscellaneous';
      });

      // Save updated rules
      for (const [domain, cat] of Object.entries(domainRules)) {
        if (cat === 'miscellaneous') {
          await chrome.runtime.sendMessage({ type: 'UPDATE_DOMAIN_RULE', domain, category: 'miscellaneous' });
        }
      }
      for (const [channel, cat] of Object.entries(channelRules)) {
        if (cat === 'miscellaneous') {
          await chrome.runtime.sendMessage({ type: 'UPDATE_CHANNEL_RULE', channel, category: 'miscellaneous' });
        }
      }

      renderCategoryList(newCategories);
      await loadDashboard();
    }
  );
}

async function restoreDefaultCategories() {
  showConfirmModal(
    'Restore Default Categories?',
    'This will reset categories to defaults. Custom categories will be removed.',
    async () => {
      const response = await chrome.runtime.sendMessage({ type: 'RESTORE_DEFAULT_CATEGORIES' });
      renderCategoryList(response.categories);
      await loadDashboard();
    }
  );
}

// =============== DATA MANAGEMENT ===============
async function exportData() {
  const response = await chrome.runtime.sendMessage({ type: 'EXPORT_DATA' });
  const blob = new Blob([JSON.stringify(response.data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `timewise-export-${getDateStr()}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

async function importData(e) {
  const file = e.target.files[0];
  if (!file) return;

  showConfirmModal(
    'Import Data?',
    'This will replace ALL current data with the imported file. This cannot be undone.',
    async () => {
      const text = await file.text();
      try {
        const data = JSON.parse(text);
        await chrome.runtime.sendMessage({ type: 'IMPORT_DATA', data });
        await loadDashboard();
      } catch (err) {
        alert('Invalid JSON file');
      }
    }
  );

  e.target.value = '';
}

// =============== MODAL ===============
function showConfirmModal(title, message, onConfirm) {
  const modal = document.getElementById('confirmModal');
  document.getElementById('modalTitle').textContent = title;
  document.getElementById('modalMessage').textContent = message;
  modal.style.display = 'flex';

  const confirmBtn = document.getElementById('modalConfirm');
  const cancelBtn = document.getElementById('modalCancel');

  const cleanup = () => {
    modal.style.display = 'none';
    confirmBtn.replaceWith(confirmBtn.cloneNode(true));
    cancelBtn.replaceWith(cancelBtn.cloneNode(true));
  };

  document.getElementById('modalConfirm').addEventListener('click', () => {
    cleanup();
    onConfirm();
  });

  document.getElementById('modalCancel').addEventListener('click', cleanup);
}
