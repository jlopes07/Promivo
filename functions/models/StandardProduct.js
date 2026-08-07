/**
 * Standard Product Model
 * Enforces a strict, normalized schema across all marketplace integrations.
 */
export class StandardProduct {
  constructor(data = {}) {
    this.id = String(data.id || '');
    this.marketplace = String(data.marketplace || 'Unknown');
    this.title = String(data.title || data.name || '');
    this.description = String(data.description || '');
    this.brand = String(data.brand || '');
    this.category = String(data.category || 'Geral');
    this.price = typeof data.price === 'number' ? data.price : parseFloat(data.price || 0);
    this.oldPrice = typeof data.oldPrice === 'number' ? data.oldPrice : (data.oldPrice ? parseFloat(data.oldPrice) : 0);
    
    // Auto-calculate discount if oldPrice is greater than price
    if (this.oldPrice > this.price && this.oldPrice > 0) {
      this.discount = Math.round(((this.oldPrice - this.price) / this.oldPrice) * 100);
    } else {
      this.discount = typeof data.discount === 'number' ? data.discount : 0;
    }

    this.currency = String(data.currency || 'BRL');
    this.images = Array.isArray(data.images) ? data.images : (data.imageUrl ? [data.imageUrl] : []);
    this.seller = String(data.seller || '');
    this.condition = String(data.condition || 'new');
    this.available = data.available !== false;
    this.url = String(data.url || data.productLink || '');
    this.affiliateUrl = String(data.affiliateUrl || data.url || '');
    this.createdAt = data.createdAt ? new Date(data.createdAt).toISOString() : new Date().toISOString();
  }

  toJSON() {
    return {
      id: this.id,
      marketplace: this.marketplace,
      title: this.title,
      description: this.description,
      brand: this.brand,
      category: this.category,
      price: this.price,
      oldPrice: this.oldPrice,
      discount: this.discount,
      currency: this.currency,
      images: this.images,
      seller: this.seller,
      condition: this.condition,
      available: this.available,
      url: this.url,
      affiliateUrl: this.affiliateUrl,
      createdAt: this.createdAt
    };
  }
}
