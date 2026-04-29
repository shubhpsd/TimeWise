// TimeWise Popup Script

document.addEventListener('DOMContentLoaded', async () => {
  // Load and apply theme
  await loadSavedTheme();
  populateThemeSelect();

  // Load today's data
  await loadData();

  // Open dashboard button
  document.getElementById('openDashboard').addEventListener('click', () => {
    chrome.tabs.create({ url: chrome.runtime.getURL('dashboard/dashboard.html') });
  });

  // Theme switcher
  document.getElementById('themeSelect').addEventListener('change', (e) => {
    saveTheme(e.target.value);
  });
});

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

  // Set current theme
  chrome.storage.sync.get('theme', (result) => {
    select.value = result.theme || 'everforest-dark-hard';
  });
}

function formatTime(ms) {
  if (!ms || ms < 0) return '0m';
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);

  if (hours === 0 && minutes === 0) {
    return `${totalSeconds}s`;
  }
  if (hours === 0) return `${minutes}m`;
  return `${hours}h ${minutes}m`;
}

function formatTimeLong(ms) {
  if (!ms || ms < 0) return '0h 0m';
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  return `${hours}h ${minutes}m`;
}

function getCategoryColor(categoryId, categories) {
  const cat = categories.find(c => c.id === categoryId);
  if (!cat) return 'var(--text-tertiary)';
  return `var(${cat.color})`;
}

function getCategoryEmoji(categoryId, categories) {
  const cat = categories.find(c => c.id === categoryId);
  return cat ? cat.emoji : '❓';
}

async function loadData() {
  try {
    const response = await chrome.runtime.sendMessage({ type: 'GET_TODAY_DATA' });
    if (!response) return;

    const { dayData, domainRules, channelRules, categories, currentDomain, currentChannel } = response;

    // Total time
    const totalMs = Object.values(dayData.domains).reduce((sum, ms) => sum + ms, 0);
    document.getElementById('totalTime').textContent = formatTimeLong(totalMs);

    // Current site
    if (currentDomain) {
      document.getElementById('currentDomain').textContent = currentDomain;
      const currentCat = domainRules[currentDomain] || 'miscellaneous';
      populateCategorySelect('currentCategorySelect', categories, currentCat);

      // Domain categorization
      document.getElementById('currentCategorySelect').addEventListener('change', async (e) => {
        if (e.target.value) {
          await chrome.runtime.sendMessage({
            type: 'UPDATE_DOMAIN_RULE',
            domain: currentDomain,
            category: e.target.value
          });
        }
      });

      // Channel categorization
      if (currentChannel) {
        document.getElementById('channelSection').style.display = 'block';
        document.getElementById('currentChannel').textContent = `📺 ${currentChannel}`;
        
        const currentChannelCat = channelRules[currentChannel] || 'miscellaneous';
        populateCategorySelect('channelCategorySelect', categories, currentChannelCat);

        document.getElementById('channelCategorySelect').addEventListener('change', async (e) => {
          if (e.target.value) {
            await chrome.runtime.sendMessage({
              type: 'UPDATE_CHANNEL_RULE',
              channel: currentChannel,
              category: e.target.value
            });
          }
        });
      } else {
        document.getElementById('channelSection').style.display = 'none';
      }
    }

    // Category breakdown for chart
    const categoryTotals = {};
    categories.forEach(cat => { categoryTotals[cat.id] = 0; });

    Object.entries(dayData.domains).forEach(([domain, ms]) => {
      const catId = domainRules[domain] || 'miscellaneous';
      if (categoryTotals[catId] !== undefined) {
        categoryTotals[catId] += ms;
      } else {
        categoryTotals['miscellaneous'] = (categoryTotals['miscellaneous'] || 0) + ms;
      }
    });

    // Adjust for channel specific rules
    if (dayData.youtubeChannels) {
      Object.entries(dayData.youtubeChannels).forEach(([channel, ms]) => {
        const channelCatId = channelRules[channel];
        if (channelCatId && categoryTotals[channelCatId] !== undefined) {
          categoryTotals[channelCatId] += ms;
          
          const ytDomainCatId = domainRules['youtube.com'] || 'miscellaneous';
          if (categoryTotals[ytDomainCatId] !== undefined) {
            categoryTotals[ytDomainCatId] -= ms;
          }
        }
      });
    }

    renderChart(categoryTotals, categories);
    renderDomainList(dayData.domains, domainRules, categories);

  } catch (e) {
    console.error('Failed to load data:', e);
  }
}

function populateCategorySelect(selectId, categories, currentValue) {
  const select = document.getElementById(selectId);
  select.innerHTML = '<option value="">Select category...</option>';
  categories.forEach(cat => {
    const option = document.createElement('option');
    option.value = cat.id;
    option.textContent = `${cat.emoji} ${cat.name}`;
    if (cat.id === currentValue) option.selected = true;
    select.appendChild(option);
  });
}

let chartInstance = null;

function renderChart(categoryTotals, categories) {
  const canvas = document.getElementById('categoryChart');
  const ctx = canvas.getContext('2d');
  const legendEl = document.getElementById('chartLegend');

  const activeCategories = categories.filter(cat => (categoryTotals[cat.id] || 0) > 0);

  if (activeCategories.length === 0) {
    // No data — show empty state
    legendEl.innerHTML = '<div class="empty-state" style="font-size:11px;">No data yet</div>';
    canvas.style.display = 'none';
    return;
  }

  canvas.style.display = 'block';

  const style = getComputedStyle(document.documentElement);
  const labels = activeCategories.map(c => c.name);
  const data = activeCategories.map(c => categoryTotals[c.id] || 0);
  const colors = activeCategories.map(c => style.getPropertyValue(c.color).trim());

  if (chartInstance) chartInstance.destroy();

  chartInstance = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels,
      datasets: [{
        data,
        backgroundColor: colors,
        borderWidth: 0,
        hoverOffset: 4
      }]
    },
    options: {
      responsive: false,
      maintainAspectRatio: true,
      cutout: '65%',
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: style.getPropertyValue('--bg-tertiary').trim(),
          titleColor: style.getPropertyValue('--text-primary').trim(),
          bodyColor: style.getPropertyValue('--text-secondary').trim(),
          borderColor: style.getPropertyValue('--border-color').trim(),
          borderWidth: 1,
          cornerRadius: 8,
          padding: 8,
          callbacks: {
            label: function(context) {
              return ` ${formatTime(context.raw)}`;
            }
          }
        }
      }
    }
  });

  // Custom legend
  legendEl.innerHTML = '';
  activeCategories.forEach(cat => {
    const color = style.getPropertyValue(cat.color).trim();
    const time = categoryTotals[cat.id] || 0;
    const div = document.createElement('div');
    div.className = 'legend-item';
    div.innerHTML = `
      <span class="legend-dot" style="background:${color}"></span>
      <span class="legend-label">${cat.emoji} ${cat.name}</span>
      <span class="legend-time">${formatTime(time)}</span>
    `;
    legendEl.appendChild(div);
  });
}

function renderDomainList(domains, domainRules, categories) {
  const container = document.getElementById('domainList');

  // Sort by time spent, top 5
  const sorted = Object.entries(domains)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  if (sorted.length === 0) {
    container.innerHTML = '<div class="empty-state">No browsing data yet</div>';
    return;
  }

  const style = getComputedStyle(document.documentElement);

  container.innerHTML = '';
  sorted.forEach(([domain, ms], index) => {
    const catId = domainRules[domain] || 'miscellaneous';
    const cat = categories.find(c => c.id === catId);
    const color = cat ? style.getPropertyValue(cat.color).trim() : '#666';

    const div = document.createElement('div');
    div.className = 'domain-item';
    div.innerHTML = `
      <span class="domain-rank">${index + 1}</span>
      <span class="domain-category-dot" style="background:${color}"></span>
      <span class="domain-name">${domain}</span>
      <span class="domain-time">${formatTime(ms)}</span>
    `;
    container.appendChild(div);
  });
}
