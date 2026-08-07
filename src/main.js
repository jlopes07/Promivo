import { initTheme } from './utils/theme.js';
import { renderHeader } from './components/Header.js';
import { renderCategoryFilter } from './components/CategoryFilter.js';
import { createProductCard } from './components/ProductCard.js';
import { getCategories } from './services/categoriesService.js';
import { getPublicOffers } from './services/offersService.js';

let currentCategory = 'all';
let currentSearch = '';
let currentSort = 'newest';

document.addEventListener('DOMContentLoaded', async () => {
  // Initialize theme mode
  initTheme();

  // Render header
  renderHeader('appHeader', { showSearch: true, title: 'Promivo' });

  // Attach search input listener
  const searchInput = document.getElementById('searchInput');
  if (searchInput) {
    let debounceTimer;
    searchInput.addEventListener('input', (e) => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        currentSearch = e.target.value;
        loadOffers();
      }, 250);
    });
  }

  // Attach sort select listener
  const sortSelect = document.getElementById('sortSelect');
  if (sortSelect) {
    sortSelect.addEventListener('change', (e) => {
      currentSort = e.target.value;
      loadOffers();
    });
  }

  // Fetch categories & render filter bar
  const categories = await getCategories();
  renderCategoryFilter('categoriesBar', categories, (selectedCat) => {
    currentCategory = selectedCat;
    const titleEl = document.getElementById('offersSectionTitle');
    if (titleEl) {
      titleEl.textContent = selectedCat === 'all' ? 'Todas as Ofertas' : `Ofertas em ${selectedCat}`;
    }
    loadOffers();
  });

  // Load initial offers
  loadOffers();
});

async function loadOffers() {
  const grid = document.getElementById('offersGrid');
  if (!grid) return;

  grid.innerHTML = `
    <div style="grid-column: 1 / -1; text-align: center; padding: 3rem 0; color: var(--text-muted);">
      <svg class="animate-spin" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M21 12a9 9 0 1 1-6.219-8.56"></path>
      </svg>
      <p style="margin-top: 0.5rem; font-size: 0.9rem;">Carregando ofertas recentes...</p>
    </div>
  `;

  const offers = await getPublicOffers({
    category: currentCategory,
    searchQuery: currentSearch,
    sortBy: currentSort
  });

  grid.innerHTML = '';

  if (offers.length === 0) {
    grid.innerHTML = `
      <div style="grid-column: 1 / -1;" class="empty-state">
        <div class="empty-state-icon">🔎</div>
        <h3 class="empty-state-title">Nenhuma oferta encontrada</h3>
        <p class="empty-state-desc">Tente alterar os termos da busca ou selecionar outra categoria.</p>
      </div>
    `;
    return;
  }

  offers.forEach(offer => {
    const card = createProductCard(offer);
    grid.appendChild(card);
  });
}
