import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { logger } from '../utils/logger.js';

export class AuditLogger {
  static async log(req, { action, targetId = '', targetEmail = '', details = {}, status = 'SUCCESS' }) {
    try {
      const db = getFirestore();
      
      const userId = req?.user?.uid || 'system';
      const userEmail = req?.user?.email || 'system';
      const userRole = req?.userProfile?.role || 'unknown';

      const clientIp = req ? (req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown') : 'unknown';
      const userAgent = req ? (req.headers['user-agent'] || 'unknown') : 'unknown';

      const logDoc = {
        userId,
        userEmail,
        userRole,
        action,
        targetId,
        targetEmail,
        details,
        status,
        ip: clientIp,
        userAgent,
        createdAt: FieldValue.serverTimestamp()
      };

      await db.collection('logs').add(logDoc);
      logger.info(`[Audit Log] ${action} by ${userEmail} (${status})`);
    } catch (err) {
      logger.error(`[Audit Log Failure] ${action}: ${err.message}`);
    }
  }
}
