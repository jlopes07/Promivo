import { db } from '../firebase/config.js';
import { 
  collection, 
  getDocs, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  serverTimestamp 
} from 'firebase/firestore';

export const INITIAL_CATEGORIES = [
  { name: 'Suplementos', slug: 'suplementos', icon: '💪', isInitial: true },
  { name: 'Mercado', slug: 'mercado', icon: '🛒', isInitial: true },
  { name: 'Peças de computador', slug: 'pecas-de-computador', icon: '🖥️', isInitial: true },
  { name: 'Games', slug: 'games', icon: '🎮', isInitial: true },
  { name: 'Livros', slug: 'livros', icon: '📚', isInitial: true },
  { name: 'Perfumes', slug: 'perfumes', icon: '✨', isInitial: true },
  { name: 'Cosméticos', slug: 'cosmetics', icon: '💄', isInitial: true },
  { name: 'Produtos fitness', slug: 'produtos-fitness', icon: '🏋️', isInitial: true },
  // Extended support categories
  { name: 'Smartphones', slug: 'smartphones', icon: '📱', isInitial: false },
  { name: 'Informática', slug: 'informatica', icon: '💻', isInitial: false },
  { name: 'Eletrônicos', slug: 'eletronicos', icon: '🔌', isInitial: false },
  { name: 'Eletrodomésticos', slug: 'eletrodomesticos', icon: '🏠', isInitial: false },
  { name: 'Casa e Cozinha', slug: 'casa-e-cozinha', icon: '🍳', isInitial: false },
  { name: 'Ferramentas', slug: 'ferramentas', icon: '🔧', isInitial: false },
  { name: 'Papelaria', slug: 'papelaria', icon: '✏️', isInitial: false },
  { name: 'Brinquedos', slug: 'brinquedos', icon: '🧸', isInitial: false },
  { name: 'Moda', slug: 'moda', icon: '👕', isInitial: false },
  { name: 'Calçados', slug: 'calcados', icon: '👟', isInitial: false },
  { name: 'Bebidas', slug: 'bebidas', icon: '🍾', isInitial: false },
  { name: 'Pet Shop', slug: 'pet-shop', icon: '🐶', isInitial: false },
  { name: 'Móveis', slug: 'moveis', icon: '🪑', isInitial: false },
  { name: 'Automotivo', slug: 'automotivo', icon: '🚗', isInitial: false }
];

export async function getCategories() {
  try {
    const categoriesRef = collection(db, 'categories');
    const snapshot = await getDocs(categoriesRef);
    
    if (snapshot.empty) {
      // Seed initial categories
      await seedInitialCategories();
      return INITIAL_CATEGORIES;
    }

    const categories = [];
    snapshot.forEach(doc => {
      categories.push({ id: doc.id, ...doc.data() });
    });

    return categories.sort((a, b) => a.name.localeCompare(b.name));
  } catch (error) {
    console.warn('Usando categorias em memória devido a restrição no Firestore:', error);
    return INITIAL_CATEGORIES;
  }
}

export async function addCategory(categoryData) {
  const categoriesRef = collection(db, 'categories');
  const docRef = await addDoc(categoriesRef, {
    name: categoryData.name,
    slug: categoryData.name.toLowerCase().replace(/\s+/g, '-'),
    icon: categoryData.icon || '🏷️',
    createdAt: serverTimestamp()
  });
  return { id: docRef.id, ...categoryData };
}

async function seedInitialCategories() {
  try {
    const categoriesRef = collection(db, 'categories');
    for (const cat of INITIAL_CATEGORIES) {
      await addDoc(categoriesRef, {
        name: cat.name,
        slug: cat.slug,
        icon: cat.icon,
        createdAt: serverTimestamp()
      });
    }
  } catch (err) {
    console.error('Erro no seeding de categorias:', err);
  }
}
