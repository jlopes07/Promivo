export function renderCategoryFilter(containerId, categories = [], onSelectCategory) {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.className = 'category-filter-bar';

  let selectedCategory = 'all';

  const renderChips = () => {
    container.innerHTML = `
      <button class="category-chip ${selectedCategory === 'all' ? 'active' : ''}" data-category="all">
        🔥 Todas as Ofertas
      </button>
      ${categories.map(cat => `
        <button class="category-chip ${selectedCategory === cat.name ? 'active' : ''}" data-category="${cat.name}">
          <span>${cat.icon || '🏷️'}</span>
          <span>${cat.name}</span>
        </button>
      `).join('')}
    `;

    // Attach click listeners
    const chips = container.querySelectorAll('.category-chip');
    chips.forEach(chip => {
      chip.addEventListener('click', () => {
        const catName = chip.getAttribute('data-category');
        selectedCategory = catName;
        renderChips();
        if (onSelectCategory) {
          onSelectCategory(catName);
        }
      });
    });
  };

  renderChips();
}
