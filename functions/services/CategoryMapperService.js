/**
 * Category Mapper Service
 * Maps external marketplace categories (e.g. Mercado Livre MLB categories, Amazon categories)
 * to standard internal Promivo categories.
 */
export const INTERNAL_CATEGORIES = [
  'Suplementos',
  'Mercado',
  'Peças de computador',
  'Games',
  'Livros',
  'Perfumes',
  'Cosméticos',
  'Produtos fitness',
  'Smartphones',
  'Informática',
  'Eletrônicos',
  'Casa e Cozinha',
  'Ferramentas',
  'Papelaria',
  'Moda',
  'Brinquedos',
  'Automotivo',
  'Pet Shop'
];

const CATEGORY_MAP = {
  // Mercado Livre Categories (MLB)
  'mlb1051': 'Smartphones',          // Celulares e Telefones
  'mlb1648': 'Informática',          // Informática
  'mlb1652': 'Peças de computador',  // Componentes para PC
  'mlb1144': 'Games',                // Games
  'mlb3025': 'Livros',               // Livros, Revistas e Comics
  'mlb1276': 'Perfumes',             // Perfumes
  'mlb1246': 'Cosméticos',           // Beleza e Cuidado Pessoal
  'mlb1271': 'Produtos fitness',     // Esportes e Fitness
  'mlb1403': 'Suplementos',          // Suplementos Alimentares
  'mlb1404': 'Mercado',              // Alimentos e Bebidas
  'mlb1000': 'Eletrônicos',          // Eletrônicos, Áudio e Vídeo
  'mlb1574': 'Casa e Cozinha',       // Casa, Móveis e Decoração
  'mlb1499': 'Moda',                 // Calçados, Roupas e Bolsas
  'mlb1132': 'Brinquedos',           // Brinquedos e Hobbies
  'mlb5726': 'Automotivo',           // Acessórios para Veículos
  'mlb1071': 'Pet Shop'              // Animais / Pet Shop
};

export class CategoryMapperService {
  static mapToInternalCategory(externalCategory, marketplace = 'mercadolivre') {
    if (!externalCategory) return 'Geral';

    const normalizedKey = String(externalCategory).toLowerCase().trim();

    // Check direct ID map
    if (CATEGORY_MAP[normalizedKey]) {
      return CATEGORY_MAP[normalizedKey];
    }

    // Keyword matching fallback
    if (normalizedKey.includes('celular') || normalizedKey.includes('phone') || normalizedKey.includes('smartphone')) return 'Smartphones';
    if (normalizedKey.includes('game') || normalizedKey.includes('jogo') || normalizedKey.includes('playstation') || normalizedKey.includes('xbox')) return 'Games';
    if (normalizedKey.includes('placa') || normalizedKey.includes('processador') || normalizedKey.includes('memoria') || normalizedKey.includes('fonte')) return 'Peças de computador';
    if (normalizedKey.includes('suplemento') || normalizedKey.includes('whey') || normalizedKey.includes('creatina')) return 'Suplementos';
    if (normalizedKey.includes('livro') || normalizedKey.includes('book')) return 'Livros';
    if (normalizedKey.includes('perfume') || normalizedKey.includes('fragran')) return 'Perfumes';
    if (normalizedKey.includes('beleza') || normalizedKey.includes('skincare') || normalizedKey.includes('cosmetico')) return 'Cosméticos';
    if (normalizedKey.includes('fitness') || normalizedKey.includes('treino') || normalizedKey.includes('academia')) return 'Produtos fitness';
    if (normalizedKey.includes('mercado') || normalizedKey.includes('alimento') || normalizedKey.includes('bebida')) return 'Mercado';
    if (normalizedKey.includes('notebook') || normalizedKey.includes('computador') || normalizedKey.includes('informatica')) return 'Informática';

    // Match exact internal category name if already valid
    const matchedCategory = INTERNAL_CATEGORIES.find(c => c.toLowerCase() === normalizedKey);
    if (matchedCategory) return matchedCategory;

    return 'Geral';
  }
}
