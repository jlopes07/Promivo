import { formatCurrency, calculateDiscount } from './formatters.js';

/**
 * Generate multi-channel promotional copies for an offer.
 * ALWAYS uses affiliateLink in generated copy text.
 */
export function generateCopies(offerData) {
  const {
    name = '',
    category = '',
    store = '',
    affiliateLink = '',
    currentPrice = 0,
    oldPrice = 0,
    coupon = '',
    shipping = '',
    notes = ''
  } = offerData;

  const currentPriceFormatted = formatCurrency(currentPrice);
  const oldPriceFormatted = oldPrice ? formatCurrency(oldPrice) : '';
  const discountPercent = calculateDiscount(currentPrice, oldPrice);

  // Discount badge string
  const discountStr = discountPercent > 0 ? `🔥 ${discountPercent}% DE DESCONTO!` : '🔥 SUPER OFERTA!';

  // Store string
  const storeStr = store ? `na ${store}` : '';

  // Coupon line
  const couponStr = coupon ? `🎟️ Cupom: ${coupon.toUpperCase()}\n` : '';

  // Shipping line
  const shippingStr = shipping ? `🚚 Frete: ${shipping}\n` : '';

  // Notes line
  const notesStr = notes ? `ℹ️ Observação: ${notes}\n` : '';

  // Category hashtags map
  const categoryHashtagsMap = {
    'suplementos': '#suplementos #fit #academia #ofertas #desconto',
    'mercado': '#mercado #compras #promo #desconto #economizar',
    'peças de computador': '#setup #hardware #pcgamer #promo #tecnologia',
    'games': '#games #gamer #playstation #xbox #nintendo #steam',
    'livros': '#livros #leitura #promo #desconto #booktok',
    'perfumes': '#perfumes #importados #cheiroso #beleza #oferta',
    'cosméticos': '#skincare #beleza #cosmeticos #cuidados #promo',
    'produtos fitness': '#fitness #treino #saude #vidaSaudavel #desconto',
    'smartphones': '#smartphone #celular #iphone #samsung #xiaomi #promo',
    'informática': '#informática #notebook #tecnologia #work #promo'
  };

  const defaultHashtags = '#oferta #promoção #desconto #cupom #economizar #achadinhos';
  const categoryLower = (category || '').toLowerCase();
  const hashtags = categoryHashtagsMap[categoryLower] || defaultHashtags;

  // 1. Title
  const title = discountPercent > 0 
    ? `🚨 IMPERDÍVEL: ${name} com ${discountPercent}% OFF ${storeStr}`
    : `⚡ OFERTA: ${name} ${storeStr}`;

  // 2. Call To Action (CTA)
  const cta = `👉 Garantir Oferta Agora: ${affiliateLink}`;

  // 3. WhatsApp Copy (using WhatsApp markdown formatting *bold*)
  const whatsapp = 
`🚨 *OFERTA IMPERDÍVEL* 🚨

*${name}* ${storeStr ? `_(${store})_` : ''}

${discountPercent > 0 ? `❌ De: ~${oldPriceFormatted}~\n` : ''}✅ *Por apenas: ${currentPriceFormatted}* ${discountPercent > 0 ? `_(${discountPercent}% OFF)_` : ''}

${couponStr}${shippingStr}${notesStr}
🛒 *COMPRE AQUI:*
${affiliateLink}

⚠️ _Preço sujeito a alteração a qualquer momento!_`;

  // 4. Telegram Copy (Standard Markdown)
  const telegram = 
`🔥 **MEGA PROMOÇÃO ${store ? `NA ${store.toUpperCase()}` : ''}**

**${name}**

${discountPercent > 0 ? `~~De: ${oldPriceFormatted}~~\n` : ''}💰 **Por apenas: ${currentPriceFormatted}** ${discountPercent > 0 ? `(${discountPercent}% OFF)` : ''}

${couponStr}${shippingStr}${notesStr}
🔗 **Link para Comprar:**
${affiliateLink}

⚡️ Corre antes que termine o estoque!`;

  // 5. Instagram Caption
  const instagram = 
`😱 PROMOÇÃO BOMBÁSTICA!

${name} ${storeStr} está saindo por apenas ${currentPriceFormatted}!

${oldPriceFormatted ? `De ${oldPriceFormatted} por apenas ${currentPriceFormatted}` : `Por apenas ${currentPriceFormatted}`}

${coupon ? `🎟️ Utilize o cupom: ${coupon}\n` : ''}${shipping ? `🚚 Frete: ${shipping}\n` : ''}
🔗 LINK NA BIO OU DIGITE "EU QUERO" QUE TE MANDO O LINK NO DIRECT!

Link direto: ${affiliateLink}

${hashtags}`;

  // 6. Facebook Caption
  const facebook = 
`📢 Achadinho imperdível!

${name} ${storeStr} com preço surreal!

💰 Apenas ${currentPriceFormatted} ${oldPriceFormatted ? `(De ${oldPriceFormatted})` : ''}
${coupon ? `🎟️ Cupom: ${coupon}\n` : ''}${shipping ? `🚚 ${shipping}\n` : ''}
Aproveite enquanto dura o estoque através do link oficial:
👉 ${affiliateLink}

${hashtags}`;

  // 7. Short Message
  const shortMessage = `🔥 ${name} por apenas ${currentPriceFormatted}! Garanta já o seu no link: ${affiliateLink}`;

  // 8. Long Message
  const longMessage = 
`💥 ATENÇÃO! Encontramos uma das melhores ofertas do dia!

Produto: ${name}
${store ? `Loja Responsável: ${store}` : ''}
Preço Promocional: ${currentPriceFormatted} ${oldPriceFormatted ? `(Preço Normal: ${oldPriceFormatted} - Economia de ${discountPercent}%)` : ''}
${coupon ? `Cupom de Desconto: ${coupon}` : ''}
${shipping ? `Condição de Frete: ${shipping}` : ''}
${notes ? `Observações Adicionais: ${notes}` : ''}

Esta é uma excelente oportunidade para adquirir este item com super desconto. Não deixe para depois pois os estoques costumam esgotar rapidamente!

Acesse pelo link de afiliado oficial para garantir esta condição especial:
👉 ${affiliateLink}`;

  // 9. Promotional Text
  const promotionalText = `Economize até ${discountPercent > 0 ? `${discountPercent}%` : 'muito'} em ${name}! Oferta por tempo limitado ${storeStr}. De ${oldPriceFormatted || 'preço normal'} por apenas ${currentPriceFormatted}.`;

  // 10. List of Benefits
  const benefitsList = 
`✨ Principais vantagens desta oferta:
• Desconto exclusivo de ${discountPercent > 0 ? `${discountPercent}%` : 'alta economia'}
• ${store ? `Compra 100% segura na ${store}` : 'Compra segura no link oficial'}
${coupon ? `• Economia extra com o cupom ${coupon}\n` : ''}${shipping ? `• Vantagem especial: ${shipping}\n` : ''}• Preço imbatível no mercado atual`;

  return {
    title,
    whatsapp,
    telegram,
    instagram,
    facebook,
    shortMessage,
    longMessage,
    promotionalText,
    benefitsList,
    hashtags,
    cta,
    affiliateLink
  };
}
