import { toggleTheme } from '../utils/theme.js';

export function renderHeader(containerId, options = {}) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const { showSearch = true, title = 'Promivo' } = options;

  container.className = 'header';
  container.innerHTML = `
    <div class="app-container">
      <div class="header-inner">
        <a href="/" class="logo">
          <div class="logo-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
            </svg>
          </div>
          <span>${title}</span>
        </a>

        ${showSearch ? `
          <div class="search-container">
            <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <input type="text" id="searchInput" class="search-input" placeholder="Buscar produtos, lojas ou categorias..." />
          </div>
        ` : ''}

        <div class="header-actions">
          <button id="themeToggleBtn" class="theme-toggle-btn" aria-label="Alternar tema">
            <!-- Icon rendered by theme.js -->
          </button>
        </div>
      </div>
    </div>
  `;

  // Attach theme toggle listener
  const toggleBtn = container.querySelector('#themeToggleBtn');
  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      toggleTheme();
    });
  }
}
