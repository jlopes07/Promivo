const THEME_KEY = 'promivo_theme_manual';

export function getSystemTheme() {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function initTheme() {
  const savedManualTheme = localStorage.getItem(THEME_KEY);
  
  if (savedManualTheme) {
    applyTheme(savedManualTheme);
  } else {
    // Follow browser/OS setting dynamically
    applyTheme(getSystemTheme());
  }

  // Listen for browser/system theme changes dynamically
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    // Only auto-update if the user has NOT manually set a preference
    if (!localStorage.getItem(THEME_KEY)) {
      applyTheme(e.matches ? 'dark' : 'light');
    }
  });
}

export function applyTheme(themeName) {
  document.documentElement.setAttribute('data-theme', themeName);
  updateToggleIcon(themeName);
}

export function setTheme(themeName) {
  localStorage.setItem(THEME_KEY, themeName);
  applyTheme(themeName);
}

export function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute('data-theme') || getSystemTheme();
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  setTheme(newTheme);
  return newTheme;
}

export function getCurrentTheme() {
  return document.documentElement.getAttribute('data-theme') || getSystemTheme();
}

function updateToggleIcon(theme) {
  const toggleBtn = document.getElementById('themeToggleBtn');
  if (!toggleBtn) return;

  if (theme === 'dark') {
    toggleBtn.innerHTML = `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="4"></circle>
        <path d="M12 2v2"></path>
        <path d="M12 20v2"></path>
        <path d="m4.93 4.93 1.41 1.41"></path>
        <path d="m17.66 17.66 1.41 1.41"></path>
        <path d="M2 12h2"></path>
        <path d="M20 12h2"></path>
        <path d="m6.34 17.66-1.41 1.41"></path>
        <path d="m19.07 4.93-1.41 1.41"></path>
      </svg>
    `;
    toggleBtn.setAttribute('title', 'Mudar para modo claro');
  } else {
    toggleBtn.innerHTML = `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"></path>
      </svg>
    `;
    toggleBtn.setAttribute('title', 'Mudar para modo escuro');
  }
}

