import { ApiService } from './apiService.js';
import { db } from '../firebase/config.js';
import { 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  serverTimestamp 
} from 'firebase/firestore';
import { calculateDiscount } from '../utils/formatters.js';

export async function getPublicOffers({ category = 'all', searchQuery = '', sortBy = 'newest' } = {}) {
  try {
    // Primary: Try fetching from Promivo API (/api/offers)
    const apiRes = await ApiService.getOffers(category, searchQuery);
    if (apiRes && apiRes.success && Array.isArray(apiRes.data)) {
      let offers = apiRes.data;

      // Sort
      if (sortBy === 'newest') {
        offers.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
      } else if (sortBy === 'discount') {
        offers.sort((a, b) => (b.discountPercent || 0) - (a.discountPercent || 0));
      } else if (sortBy === 'price-asc') {
        offers.sort((a, b) => (a.currentPrice || 0) - (b.currentPrice || 0));
      } else if (sortBy === 'price-desc') {
        offers.sort((a, b) => (b.currentPrice || 0) - (a.currentPrice || 0));
      }

      return offers;
    }
  } catch (apiErr) {
    console.warn('API backend em nuvem indisponível localmente, buscando diretamente do Firestore SDK:', apiErr.message);
  }

  // Fallback: Client-side Firestore SDK
  try {
    const offersRef = collection(db, 'offers');
    const snapshot = await getDocs(offersRef);
    
    let offers = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      if (data.active !== false) {
        offers.push({ id: doc.id, ...data });
      }
    });

    if (category && category !== 'all') {
      offers = offers.filter(o => (o.category || '').toLowerCase() === category.toLowerCase());
    }

    if (searchQuery && searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase().trim();
      offers = offers.filter(o => 
        (o.name || '').toLowerCase().includes(q) ||
        (o.store || '').toLowerCase().includes(q)
      );
    }

    if (sortBy === 'newest') {
      offers.sort((a, b) => (b.createdAt?.toMillis ? b.createdAt.toMillis() : 0) - (a.createdAt?.toMillis ? a.createdAt.toMillis() : 0));
    } else if (sortBy === 'discount') {
      offers.sort((a, b) => (b.discountPercent || 0) - (a.discountPercent || 0));
    }

    return offers;
  } catch (error) {
    console.error('Erro ao buscar ofertas:', error);
    return [];
  }
}

export async function createOffer(offerData, userId = 'anonymous') {
  const offersRef = collection(db, 'offers');

  const discountPercent = calculateDiscount(offerData.currentPrice, offerData.oldPrice);

  const newOffer = {
    name: offerData.name,
    category: offerData.category,
    store: offerData.store || '',
    productLink: offerData.productLink || '',
    affiliateLink: offerData.affiliateLink,
    currentPrice: parseFloat(offerData.currentPrice) || 0,
    oldPrice: offerData.oldPrice ? parseFloat(offerData.oldPrice) : null,
    discountPercent,
    coupon: offerData.coupon || '',
    shipping: offerData.shipping || '',
    notes: offerData.notes || '',
    imageUrl: offerData.imageUrl || 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=500&auto=format&fit=crop&q=60',
    featured: offerData.featured || false,
    active: true,
    createdBy: userId,
    createdAt: serverTimestamp()
  };

  const docRef = await addDoc(offersRef, newOffer);
  return { id: docRef.id, ...newOffer };
}

export async function getAllOffersForAdmin() {
  try {
    const offersRef = collection(db, 'offers');
    const snapshot = await getDocs(offersRef);
    const offers = [];
    snapshot.forEach(doc => {
      offers.push({ id: doc.id, ...doc.data() });
    });
    return offers;
  } catch (err) {
    console.error('Erro ao carregar todas as ofertas para painel:', err);
    return [];
  }
}

export async function deleteOffer(offerId) {
  const offerRef = doc(db, 'offers', offerId);
  await deleteDoc(offerRef);
}

export async function toggleOfferStatus(offerId, currentActiveState) {
  const offerRef = doc(db, 'offers', offerId);
  await updateDoc(offerRef, { active: !currentActiveState });
}
