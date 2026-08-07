import { formatCurrency, calculateDiscount, sanitizeUrl } from '../utils/formatters.js';

export function createProductCard(offer) {
  const {
    name = 'Produto sem nome',
    category = 'Geral',
    store = 'Loja Online',
    currentPrice = 0,
    oldPrice = null,
    discountPercent: rawDiscount = null,
    affiliateLink = '#',
    imageUrl = 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=500&auto=format&fit=crop&q=60',
    coupon = '',
    shipping = ''
  } = offer;

  const currentPriceFormatted = formatCurrency(currentPrice);
  const oldPriceFormatted = oldPrice ? formatCurrency(oldPrice) : null;
  const discount = rawDiscount || calculateDiscount(currentPrice, oldPrice);
  const safeLink = sanitizeUrl(affiliateLink);

  const card = document.createElement('article');
  card.className = 'product-card';

  card.innerHTML = `
    <div class="product-image-wrap">
      <img src="${imageUrl}" alt="${name}" class="product-image" loading="lazy" onerror="this.src='https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=500&auto=format&fit=crop&q=60';" />
      ${store ? `<span class="store-badge">${store}</span>` : ''}
      ${discount > 0 ? `<span class="discount-badge">-${discount}%</span>` : ''}
    </div>
    
    <div class="product-body">
      <span class="product-category-tag">${category}</span>
      <h3 class="product-title" title="${name}">${name}</h3>
      
      <div class="price-container">
        <span class="current-price">${currentPriceFormatted}</span>
        ${oldPriceFormatted ? `<span class="old-price">${oldPriceFormatted}</span>` : ''}
      </div>

      ${(coupon || shipping) ? `
        <div class="coupon-shipping-bar">
          ${coupon ? `<span class="tag-badge tag-coupon">🎟️ ${coupon}</span>` : ''}
          ${shipping ? `<span class="tag-badge tag-shipping">🚚 ${shipping}</span>` : ''}
        </div>
      ` : ''}

      <a href="${safeLink}" target="_blank" rel="noopener noreferrer" class="btn-offer">
        Ver Oferta
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
          <polyline points="15 3 21 3 21 9"></polyline>
          <line x1="10" y1="14" x2="21" y2="3"></line>
        </svg>
      </a>
    </div>
  `;

  return card;
}
