// TimeWise Theme Engine
// All theme definitions + apply/save/export logic

const THEMES = {
  // ==================== EVERFOREST ====================
  'everforest-dark-hard': {
    name: 'Everforest Dark Hard',
    group: 'Everforest',
    type: 'dark',
    colors: {
      '--bg-primary': '#272e33',
      '--bg-secondary': '#2e383c',
      '--bg-tertiary': '#374145',
      '--bg-input': '#414b50',
      '--text-primary': '#d3c6aa',
      '--text-secondary': '#9da9a0',
      '--text-tertiary': '#7a8478',
      '--accent-primary': '#a7c080',
      '--accent-hover': '#b8d49a',
      '--accent-muted': 'rgba(167,192,128,0.15)',
      '--color-green': '#a7c080',
      '--color-blue': '#7fbbb3',
      '--color-yellow': '#dbbc7f',
      '--color-red': '#e67e80',
      '--color-purple': '#d699b6',
      '--color-orange': '#e69875',
      '--color-aqua': '#83c092',
      '--border-color': 'rgba(211,198,170,0.1)',
      '--border-hover': 'rgba(211,198,170,0.2)',
      '--shadow': '0 2px 8px rgba(0,0,0,0.3)',
      '--card-radius': '12px',
      '--chart-1': '#a7c080', '--chart-2': '#7fbbb3', '--chart-3': '#dbbc7f',
      '--chart-4': '#e67e80', '--chart-5': '#d699b6', '--chart-6': '#e69875', '--chart-7': '#83c092'
    }
  },
  'everforest-dark-medium': {
    name: 'Everforest Dark Medium',
    group: 'Everforest',
    type: 'dark',
    colors: {
      '--bg-primary': '#2d353b',
      '--bg-secondary': '#343f44',
      '--bg-tertiary': '#3d484d',
      '--bg-input': '#475258',
      '--text-primary': '#d3c6aa',
      '--text-secondary': '#9da9a0',
      '--text-tertiary': '#7a8478',
      '--accent-primary': '#a7c080',
      '--accent-hover': '#b8d49a',
      '--accent-muted': 'rgba(167,192,128,0.15)',
      '--color-green': '#a7c080',
      '--color-blue': '#7fbbb3',
      '--color-yellow': '#dbbc7f',
      '--color-red': '#e67e80',
      '--color-purple': '#d699b6',
      '--color-orange': '#e69875',
      '--color-aqua': '#83c092',
      '--border-color': 'rgba(211,198,170,0.1)',
      '--border-hover': 'rgba(211,198,170,0.2)',
      '--shadow': '0 2px 8px rgba(0,0,0,0.3)',
      '--card-radius': '12px',
      '--chart-1': '#a7c080', '--chart-2': '#7fbbb3', '--chart-3': '#dbbc7f',
      '--chart-4': '#e67e80', '--chart-5': '#d699b6', '--chart-6': '#e69875', '--chart-7': '#83c092'
    }
  },
  'everforest-dark-soft': {
    name: 'Everforest Dark Soft',
    group: 'Everforest',
    type: 'dark',
    colors: {
      '--bg-primary': '#333c43',
      '--bg-secondary': '#3a464c',
      '--bg-tertiary': '#434f55',
      '--bg-input': '#4d5960',
      '--text-primary': '#d3c6aa',
      '--text-secondary': '#9da9a0',
      '--text-tertiary': '#7a8478',
      '--accent-primary': '#a7c080',
      '--accent-hover': '#b8d49a',
      '--accent-muted': 'rgba(167,192,128,0.15)',
      '--color-green': '#a7c080',
      '--color-blue': '#7fbbb3',
      '--color-yellow': '#dbbc7f',
      '--color-red': '#e67e80',
      '--color-purple': '#d699b6',
      '--color-orange': '#e69875',
      '--color-aqua': '#83c092',
      '--border-color': 'rgba(211,198,170,0.1)',
      '--border-hover': 'rgba(211,198,170,0.2)',
      '--shadow': '0 2px 8px rgba(0,0,0,0.25)',
      '--card-radius': '12px',
      '--chart-1': '#a7c080', '--chart-2': '#7fbbb3', '--chart-3': '#dbbc7f',
      '--chart-4': '#e67e80', '--chart-5': '#d699b6', '--chart-6': '#e69875', '--chart-7': '#83c092'
    }
  },
  'everforest-light-hard': {
    name: 'Everforest Light Hard',
    group: 'Everforest',
    type: 'light',
    colors: {
      '--bg-primary': '#fff9e8',
      '--bg-secondary': '#f5eddc',
      '--bg-tertiary': '#ece4d3',
      '--bg-input': '#e5dece',
      '--text-primary': '#5c6a72',
      '--text-secondary': '#708089',
      '--text-tertiary': '#939f91',
      '--accent-primary': '#8da101',
      '--accent-hover': '#7a8e00',
      '--accent-muted': 'rgba(141,161,1,0.12)',
      '--color-green': '#8da101',
      '--color-blue': '#3a94c5',
      '--color-yellow': '#dfa000',
      '--color-red': '#f85552',
      '--color-purple': '#df69ba',
      '--color-orange': '#f57d26',
      '--color-aqua': '#35a77c',
      '--border-color': 'rgba(92,106,114,0.12)',
      '--border-hover': 'rgba(92,106,114,0.22)',
      '--shadow': '0 2px 8px rgba(0,0,0,0.08)',
      '--card-radius': '12px',
      '--chart-1': '#8da101', '--chart-2': '#3a94c5', '--chart-3': '#dfa000',
      '--chart-4': '#f85552', '--chart-5': '#df69ba', '--chart-6': '#f57d26', '--chart-7': '#35a77c'
    }
  },
  'everforest-light-medium': {
    name: 'Everforest Light Medium',
    group: 'Everforest',
    type: 'light',
    colors: {
      '--bg-primary': '#fdf6e3',
      '--bg-secondary': '#f0e9d7',
      '--bg-tertiary': '#e6dfce',
      '--bg-input': '#ddd7c8',
      '--text-primary': '#5c6a72',
      '--text-secondary': '#708089',
      '--text-tertiary': '#939f91',
      '--accent-primary': '#8da101',
      '--accent-hover': '#7a8e00',
      '--accent-muted': 'rgba(141,161,1,0.12)',
      '--color-green': '#8da101',
      '--color-blue': '#3a94c5',
      '--color-yellow': '#dfa000',
      '--color-red': '#f85552',
      '--color-purple': '#df69ba',
      '--color-orange': '#f57d26',
      '--color-aqua': '#35a77c',
      '--border-color': 'rgba(92,106,114,0.12)',
      '--border-hover': 'rgba(92,106,114,0.22)',
      '--shadow': '0 2px 8px rgba(0,0,0,0.06)',
      '--card-radius': '12px',
      '--chart-1': '#8da101', '--chart-2': '#3a94c5', '--chart-3': '#dfa000',
      '--chart-4': '#f85552', '--chart-5': '#df69ba', '--chart-6': '#f57d26', '--chart-7': '#35a77c'
    }
  },
  'everforest-light-soft': {
    name: 'Everforest Light Soft',
    group: 'Everforest',
    type: 'light',
    colors: {
      '--bg-primary': '#f3ead3',
      '--bg-secondary': '#e9e0c8',
      '--bg-tertiary': '#dfd6bf',
      '--bg-input': '#d5ccb6',
      '--text-primary': '#5c6a72',
      '--text-secondary': '#708089',
      '--text-tertiary': '#939f91',
      '--accent-primary': '#8da101',
      '--accent-hover': '#7a8e00',
      '--accent-muted': 'rgba(141,161,1,0.12)',
      '--color-green': '#8da101',
      '--color-blue': '#3a94c5',
      '--color-yellow': '#dfa000',
      '--color-red': '#f85552',
      '--color-purple': '#df69ba',
      '--color-orange': '#f57d26',
      '--color-aqua': '#35a77c',
      '--border-color': 'rgba(92,106,114,0.12)',
      '--border-hover': 'rgba(92,106,114,0.22)',
      '--shadow': '0 2px 8px rgba(0,0,0,0.06)',
      '--card-radius': '12px',
      '--chart-1': '#8da101', '--chart-2': '#3a94c5', '--chart-3': '#dfa000',
      '--chart-4': '#f85552', '--chart-5': '#df69ba', '--chart-6': '#f57d26', '--chart-7': '#35a77c'
    }
  },

  // ==================== GRUVBOX ====================
  'gruvbox-dark-hard': {
    name: 'Gruvbox Dark Hard',
    group: 'Gruvbox',
    type: 'dark',
    colors: {
      '--bg-primary': '#1d2021',
      '--bg-secondary': '#282828',
      '--bg-tertiary': '#3c3836',
      '--bg-input': '#504945',
      '--text-primary': '#ebdbb2',
      '--text-secondary': '#a89984',
      '--text-tertiary': '#7c6f64',
      '--accent-primary': '#b8bb26',
      '--accent-hover': '#c9cc3c',
      '--accent-muted': 'rgba(184,187,38,0.15)',
      '--color-green': '#b8bb26',
      '--color-blue': '#83a598',
      '--color-yellow': '#fabd2f',
      '--color-red': '#fb4934',
      '--color-purple': '#d3869b',
      '--color-orange': '#fe8019',
      '--color-aqua': '#8ec07c',
      '--border-color': 'rgba(235,219,178,0.1)',
      '--border-hover': 'rgba(235,219,178,0.2)',
      '--shadow': '0 2px 8px rgba(0,0,0,0.4)',
      '--card-radius': '12px',
      '--chart-1': '#b8bb26', '--chart-2': '#83a598', '--chart-3': '#fabd2f',
      '--chart-4': '#fb4934', '--chart-5': '#d3869b', '--chart-6': '#fe8019', '--chart-7': '#8ec07c'
    }
  },
  'gruvbox-dark-medium': {
    name: 'Gruvbox Dark Medium',
    group: 'Gruvbox',
    type: 'dark',
    colors: {
      '--bg-primary': '#282828',
      '--bg-secondary': '#3c3836',
      '--bg-tertiary': '#504945',
      '--bg-input': '#665c54',
      '--text-primary': '#ebdbb2',
      '--text-secondary': '#a89984',
      '--text-tertiary': '#7c6f64',
      '--accent-primary': '#b8bb26',
      '--accent-hover': '#c9cc3c',
      '--accent-muted': 'rgba(184,187,38,0.15)',
      '--color-green': '#b8bb26',
      '--color-blue': '#83a598',
      '--color-yellow': '#fabd2f',
      '--color-red': '#fb4934',
      '--color-purple': '#d3869b',
      '--color-orange': '#fe8019',
      '--color-aqua': '#8ec07c',
      '--border-color': 'rgba(235,219,178,0.1)',
      '--border-hover': 'rgba(235,219,178,0.2)',
      '--shadow': '0 2px 8px rgba(0,0,0,0.35)',
      '--card-radius': '12px',
      '--chart-1': '#b8bb26', '--chart-2': '#83a598', '--chart-3': '#fabd2f',
      '--chart-4': '#fb4934', '--chart-5': '#d3869b', '--chart-6': '#fe8019', '--chart-7': '#8ec07c'
    }
  },
  'gruvbox-dark-soft': {
    name: 'Gruvbox Dark Soft',
    group: 'Gruvbox',
    type: 'dark',
    colors: {
      '--bg-primary': '#32302f',
      '--bg-secondary': '#3c3836',
      '--bg-tertiary': '#504945',
      '--bg-input': '#665c54',
      '--text-primary': '#ebdbb2',
      '--text-secondary': '#a89984',
      '--text-tertiary': '#7c6f64',
      '--accent-primary': '#b8bb26',
      '--accent-hover': '#c9cc3c',
      '--accent-muted': 'rgba(184,187,38,0.15)',
      '--color-green': '#b8bb26',
      '--color-blue': '#83a598',
      '--color-yellow': '#fabd2f',
      '--color-red': '#fb4934',
      '--color-purple': '#d3869b',
      '--color-orange': '#fe8019',
      '--color-aqua': '#8ec07c',
      '--border-color': 'rgba(235,219,178,0.1)',
      '--border-hover': 'rgba(235,219,178,0.2)',
      '--shadow': '0 2px 8px rgba(0,0,0,0.3)',
      '--card-radius': '12px',
      '--chart-1': '#b8bb26', '--chart-2': '#83a598', '--chart-3': '#fabd2f',
      '--chart-4': '#fb4934', '--chart-5': '#d3869b', '--chart-6': '#fe8019', '--chart-7': '#8ec07c'
    }
  },
  'gruvbox-light-hard': {
    name: 'Gruvbox Light Hard',
    group: 'Gruvbox',
    type: 'light',
    colors: {
      '--bg-primary': '#f9f5d7',
      '--bg-secondary': '#f2e5bc',
      '--bg-tertiary': '#ebdbb2',
      '--bg-input': '#d5c4a1',
      '--text-primary': '#3c3836',
      '--text-secondary': '#504945',
      '--text-tertiary': '#7c6f64',
      '--accent-primary': '#79740e',
      '--accent-hover': '#6a6504',
      '--accent-muted': 'rgba(121,116,14,0.12)',
      '--color-green': '#79740e',
      '--color-blue': '#076678',
      '--color-yellow': '#b57614',
      '--color-red': '#9d0006',
      '--color-purple': '#8f3f71',
      '--color-orange': '#af3a03',
      '--color-aqua': '#427b58',
      '--border-color': 'rgba(60,56,54,0.12)',
      '--border-hover': 'rgba(60,56,54,0.22)',
      '--shadow': '0 2px 8px rgba(0,0,0,0.08)',
      '--card-radius': '12px',
      '--chart-1': '#79740e', '--chart-2': '#076678', '--chart-3': '#b57614',
      '--chart-4': '#9d0006', '--chart-5': '#8f3f71', '--chart-6': '#af3a03', '--chart-7': '#427b58'
    }
  },
  'gruvbox-light-medium': {
    name: 'Gruvbox Light Medium',
    group: 'Gruvbox',
    type: 'light',
    colors: {
      '--bg-primary': '#fbf1c7',
      '--bg-secondary': '#f2e5bc',
      '--bg-tertiary': '#ebdbb2',
      '--bg-input': '#d5c4a1',
      '--text-primary': '#3c3836',
      '--text-secondary': '#504945',
      '--text-tertiary': '#7c6f64',
      '--accent-primary': '#79740e',
      '--accent-hover': '#6a6504',
      '--accent-muted': 'rgba(121,116,14,0.12)',
      '--color-green': '#79740e',
      '--color-blue': '#076678',
      '--color-yellow': '#b57614',
      '--color-red': '#9d0006',
      '--color-purple': '#8f3f71',
      '--color-orange': '#af3a03',
      '--color-aqua': '#427b58',
      '--border-color': 'rgba(60,56,54,0.12)',
      '--border-hover': 'rgba(60,56,54,0.22)',
      '--shadow': '0 2px 8px rgba(0,0,0,0.06)',
      '--card-radius': '12px',
      '--chart-1': '#79740e', '--chart-2': '#076678', '--chart-3': '#b57614',
      '--chart-4': '#9d0006', '--chart-5': '#8f3f71', '--chart-6': '#af3a03', '--chart-7': '#427b58'
    }
  },
  'gruvbox-light-soft': {
    name: 'Gruvbox Light Soft',
    group: 'Gruvbox',
    type: 'light',
    colors: {
      '--bg-primary': '#f2e5bc',
      '--bg-secondary': '#ebdbb2',
      '--bg-tertiary': '#d5c4a1',
      '--bg-input': '#ceb991',
      '--text-primary': '#3c3836',
      '--text-secondary': '#504945',
      '--text-tertiary': '#7c6f64',
      '--accent-primary': '#79740e',
      '--accent-hover': '#6a6504',
      '--accent-muted': 'rgba(121,116,14,0.12)',
      '--color-green': '#79740e',
      '--color-blue': '#076678',
      '--color-yellow': '#b57614',
      '--color-red': '#9d0006',
      '--color-purple': '#8f3f71',
      '--color-orange': '#af3a03',
      '--color-aqua': '#427b58',
      '--border-color': 'rgba(60,56,54,0.12)',
      '--border-hover': 'rgba(60,56,54,0.22)',
      '--shadow': '0 2px 8px rgba(0,0,0,0.06)',
      '--card-radius': '12px',
      '--chart-1': '#79740e', '--chart-2': '#076678', '--chart-3': '#b57614',
      '--chart-4': '#9d0006', '--chart-5': '#8f3f71', '--chart-6': '#af3a03', '--chart-7': '#427b58'
    }
  },

  // ==================== CATPPUCCIN MOCHA ====================
  'catppuccin-mocha': {
    name: 'Catppuccin Mocha',
    group: 'Catppuccin',
    type: 'dark',
    colors: {
      '--bg-primary': '#1e1e2e',
      '--bg-secondary': '#313244',
      '--bg-tertiary': '#45475a',
      '--bg-input': '#585b70',
      '--text-primary': '#cdd6f4',
      '--text-secondary': '#a6adc8',
      '--text-tertiary': '#6c7086',
      '--accent-primary': '#cba6f7',
      '--accent-hover': '#d8b4fe',
      '--accent-muted': 'rgba(203,166,247,0.15)',
      '--color-green': '#a6e3a1',
      '--color-blue': '#89b4fa',
      '--color-yellow': '#f9e2af',
      '--color-red': '#f38ba8',
      '--color-purple': '#cba6f7',
      '--color-orange': '#fab387',
      '--color-aqua': '#94e2d5',
      '--border-color': 'rgba(205,214,244,0.1)',
      '--border-hover': 'rgba(205,214,244,0.2)',
      '--shadow': '0 2px 8px rgba(0,0,0,0.35)',
      '--card-radius': '12px',
      '--chart-1': '#a6e3a1', '--chart-2': '#89b4fa', '--chart-3': '#f9e2af',
      '--chart-4': '#f38ba8', '--chart-5': '#cba6f7', '--chart-6': '#fab387', '--chart-7': '#94e2d5'
    }
  },

  // ==================== NORD ====================
  'nord': {
    name: 'Nord',
    group: 'Nord',
    type: 'dark',
    colors: {
      '--bg-primary': '#2e3440',
      '--bg-secondary': '#3b4252',
      '--bg-tertiary': '#434c5e',
      '--bg-input': '#4c566a',
      '--text-primary': '#eceff4',
      '--text-secondary': '#d8dee9',
      '--text-tertiary': '#7b88a1',
      '--accent-primary': '#88c0d0',
      '--accent-hover': '#8fbcbb',
      '--accent-muted': 'rgba(136,192,208,0.15)',
      '--color-green': '#a3be8c',
      '--color-blue': '#81a1c1',
      '--color-yellow': '#ebcb8b',
      '--color-red': '#bf616a',
      '--color-purple': '#b48ead',
      '--color-orange': '#d08770',
      '--color-aqua': '#88c0d0',
      '--border-color': 'rgba(236,239,244,0.1)',
      '--border-hover': 'rgba(236,239,244,0.2)',
      '--shadow': '0 2px 8px rgba(0,0,0,0.3)',
      '--card-radius': '12px',
      '--chart-1': '#a3be8c', '--chart-2': '#81a1c1', '--chart-3': '#ebcb8b',
      '--chart-4': '#bf616a', '--chart-5': '#b48ead', '--chart-6': '#d08770', '--chart-7': '#88c0d0'
    }
  }
};

const DEFAULT_THEME = 'everforest-dark-hard';

// Apply a theme to the document
function applyTheme(themeId) {
  const theme = THEMES[themeId];
  if (!theme) return;
  const root = document.documentElement;
  root.setAttribute('data-theme', themeId);
  Object.entries(theme.colors).forEach(([prop, value]) => {
    root.style.setProperty(prop, value);
  });
}

// Get list of all themes grouped
function getThemeList() {
  const groups = {};
  Object.entries(THEMES).forEach(([id, theme]) => {
    if (!groups[theme.group]) groups[theme.group] = [];
    groups[theme.group].push({ id, ...theme });
  });
  return groups;
}

// Get a flat list of all theme IDs
function getThemeIds() {
  return Object.keys(THEMES);
}

// Get theme colors for Chart.js
function getChartColors() {
  const style = getComputedStyle(document.documentElement);
  return [
    style.getPropertyValue('--chart-1').trim(),
    style.getPropertyValue('--chart-2').trim(),
    style.getPropertyValue('--chart-3').trim(),
    style.getPropertyValue('--chart-4').trim(),
    style.getPropertyValue('--chart-5').trim(),
    style.getPropertyValue('--chart-6').trim(),
    style.getPropertyValue('--chart-7').trim(),
  ];
}

// Load and apply saved theme
async function loadSavedTheme() {
  try {
    const result = await chrome.storage.sync.get('theme');
    const themeId = result.theme || DEFAULT_THEME;
    applyTheme(themeId);
    return themeId;
  } catch (e) {
    applyTheme(DEFAULT_THEME);
    return DEFAULT_THEME;
  }
}

// Save theme preference
async function saveTheme(themeId) {
  applyTheme(themeId);
  try {
    await chrome.storage.sync.set({ theme: themeId });
  } catch (e) {
    console.error('Failed to save theme:', e);
  }
}
