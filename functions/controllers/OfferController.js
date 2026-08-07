import { getFirestore, FieldValue } from 'firebase-admin/firestore';

export class OfferController {
  static async list(req, res, next) {
    try {
      const db = getFirestore();
      const category = req.query.category;
      const search = req.query.q;
      const limit = parseInt(req.query.limit || '50', 10);

      const snapshot = await db.collection('offers').where('active', '==', true).get();
      let offers = [];
      snapshot.forEach(doc => {
        offers.push({ id: doc.id, ...doc.data() });
      });

      if (category && category !== 'all') {
        offers = offers.filter(o => (o.category || '').toLowerCase() === category.toLowerCase());
      }

      if (search) {
        const q = search.toLowerCase();
        offers = offers.filter(o => (o.name || o.title || '').toLowerCase().includes(q));
      }

      return res.json({
        success: true,
        count: offers.length,
        data: offers.slice(0, limit)
      });
    } catch (error) {
      next(error);
    }
  }

  static async latest(req, res, next) {
    try {
      const db = getFirestore();
      const snapshot = await db.collection('offers')
        .where('active', '==', true)
        .limit(10)
        .get();

      const offers = [];
      snapshot.forEach(doc => offers.push({ id: doc.id, ...doc.data() }));

      return res.json({
        success: true,
        count: offers.length,
        data: offers
      });
    } catch (error) {
      next(error);
    }
  }

  static async highlights(req, res, next) {
    try {
      const db = getFirestore();
      const snapshot = await db.collection('offers')
        .where('active', '==', true)
        .get();

      const offers = [];
      snapshot.forEach(doc => offers.push({ id: doc.id, ...doc.data() }));
      
      // Sort by highest discount
      offers.sort((a, b) => (b.discountPercent || 0) - (a.discountPercent || 0));

      return res.json({
        success: true,
        count: Math.min(offers.length, 10),
        data: offers.slice(0, 10)
      });
    } catch (error) {
      next(error);
    }
  }

  static async create(req, res, next) {
    try {
      const db = getFirestore();
      const offerData = req.body;

      if (!offerData.name && !offerData.title) {
        return res.status(400).json({ success: false, error: { message: 'Nome da oferta é obrigatório.' } });
      }

      const docRef = await db.collection('offers').add({
        ...offerData,
        active: true,
        createdAt: FieldValue.serverTimestamp()
      });

      return res.status(201).json({
        success: true,
        data: { id: docRef.id, ...offerData }
      });
    } catch (error) {
      next(error);
    }
  }

  static async update(req, res, next) {
    try {
      const { id } = req.params;
      const db = getFirestore();
      await db.collection('offers').doc(id).update(req.body);

      return res.json({
        success: true,
        message: 'Oferta atualizada com sucesso.'
      });
    } catch (error) {
      next(error);
    }
  }

  static async remove(req, res, next) {
    try {
      const { id } = req.params;
      const db = getFirestore();
      await db.collection('offers').doc(id).delete();

      return res.json({
        success: true,
        message: 'Oferta removida com sucesso.'
      });
    } catch (error) {
      next(error);
    }
  }
}
