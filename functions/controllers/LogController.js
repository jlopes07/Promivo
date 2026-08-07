import { getFirestore } from 'firebase-admin/firestore';

export class LogController {
  static async list(req, res, next) {
    try {
      const db = getFirestore();
      const limit = parseInt(req.query.limit || '100', 10);
      
      const snapshot = await db.collection('logs')
        .orderBy('createdAt', 'desc')
        .limit(limit)
        .get();

      const logs = [];
      snapshot.forEach(doc => {
        const data = doc.data();
        logs.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : data.createdAt
        });
      });

      return res.json({
        success: true,
        count: logs.length,
        data: logs
      });
    } catch (error) {
      next(error);
    }
  }
}
