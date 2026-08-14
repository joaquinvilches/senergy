const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { v2: cloudinary } = require('cloudinary');

admin.initializeApp();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Extrae el public_id de una URL de Cloudinary
 * @param {string} photoURL - URL completa de Cloudinary
 * @returns {string} public_id
 *
 * Ejemplo:
 * Input: https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg
 * Output: sample
 */
function extractPublicId(photoURL) {
  try {
    // URL format: https://res.cloudinary.com/{cloud_name}/image/upload/v{version}/{folder}/{public_id}.{format}
    const urlParts = photoURL.split('/');

    // Encontrar el índice de 'upload'
    const uploadIndex = urlParts.indexOf('upload');

    if (uploadIndex === -1) {
      throw new Error('Invalid Cloudinary URL');
    }

    // Todo después de 'upload/v{version}/' es el path del asset
    const assetPath = urlParts.slice(uploadIndex + 2).join('/');

    // Remover la extensión del archivo
    const publicId = assetPath.replace(/\.[^/.]+$/, '');

    return publicId;
  } catch (error) {
    throw new Error(`Failed to extract public_id: ${error.message}`);
  }
}

/**
 * Función callable para eliminar imagen de Cloudinary
 */
exports.deleteCloudinaryImage = functions.https.onCall(async (data, context) => {
  // Verificar autenticación
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'The function must be called while authenticated.'
    );
  }

  const { photoURL } = data;

  if (!photoURL) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'The function must be called with photoURL.'
    );
  }

  try {
    // Extraer public_id
    const publicId = extractPublicId(photoURL);

    functions.logger.info('Attempting to delete Cloudinary image', {
      userId: context.auth.uid,
      photoURL,
      publicId,
    });

    // Eliminar de Cloudinary
    const result = await cloudinary.uploader.destroy(publicId);

    if (result.result === 'ok') {
      functions.logger.info('Cloudinary image deleted successfully', {
        userId: context.auth.uid,
        publicId,
        result,
      });

      return {
        success: true,
        message: 'Image deleted successfully',
        result,
      };
    } else if (result.result === 'not found') {
      // La imagen no existe (tal vez ya fue eliminada)
      functions.logger.warn('Cloudinary image not found', {
        userId: context.auth.uid,
        publicId,
        result,
      });

      return {
        success: true,
        message: 'Image not found (possibly already deleted)',
        result,
      };
    } else {
      // Otro error
      throw new Error(`Cloudinary returned: ${result.result}`);
    }
  } catch (error) {
    functions.logger.error('Error deleting Cloudinary image', {
      userId: context.auth.uid,
      photoURL,
      error: error.message,
      stack: error.stack,
    });

    throw new functions.https.HttpsError(
      'internal',
      `Failed to delete image: ${error.message}`
    );
  }
});

/**
 * Webhook de RevenueCat: única fuente de verdad para el estado de suscripción.
 * Configurar en RevenueCat → Project Settings → Integrations → Webhooks
 * con el header Authorization: Bearer <REVENUECAT_WEBHOOK_SECRET>
 *
 * El cliente (app) YA NO puede escribir 'subscription'/'subscriptionExpiry' en
 * Firestore (bloqueado en firestore.rules) para evitar que un usuario se
 * autoasigne Premium sin pagar. Solo este webhook, vía Admin SDK, puede hacerlo.
 */
const PREMIUM_EVENT_TYPES = new Set([
  'INITIAL_PURCHASE',
  'RENEWAL',
  'UNCANCELLATION',
  'PRODUCT_CHANGE',
]);
const FREE_EVENT_TYPES = new Set(['EXPIRATION']);

exports.revenuecatWebhook = functions.https.onRequest(async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).send('Method Not Allowed');
    return;
  }

  const authHeader = req.get('Authorization') || '';
  const expected = `Bearer ${process.env.REVENUECAT_WEBHOOK_SECRET}`;
  if (!process.env.REVENUECAT_WEBHOOK_SECRET || authHeader !== expected) {
    functions.logger.warn('RevenueCat webhook: unauthorized request');
    res.status(401).send('Unauthorized');
    return;
  }

  const event = req.body?.event;
  const userId = event?.app_user_id;

  if (!event || !userId) {
    res.status(400).send('Invalid payload');
    return;
  }

  try {
    const userRef = admin.firestore().doc(`users/${userId}`);

    if (PREMIUM_EVENT_TYPES.has(event.type)) {
      const expiryMs = event.expiration_at_ms;
      await userRef.set(
        {
          subscription: 'PREMIUM',
          subscriptionExpiry: expiryMs ? admin.firestore.Timestamp.fromMillis(expiryMs) : null,
          subscriptionStartDate: admin.firestore.FieldValue.serverTimestamp(),
        },
        { merge: true }
      );
      functions.logger.info('Subscription activated via RevenueCat webhook', {
        userId,
        eventType: event.type,
      });
    } else if (FREE_EVENT_TYPES.has(event.type)) {
      await userRef.set(
        {
          subscription: 'FREE',
          subscriptionExpiry: null,
        },
        { merge: true }
      );
      functions.logger.info('Subscription reverted to FREE via RevenueCat webhook', {
        userId,
        eventType: event.type,
      });
    } else {
      // CANCELLATION (sigue con acceso hasta expirar), BILLING_ISSUE, TRANSFER, etc.
      // No se actúa: RevenueCat enviará EXPIRATION cuando el acceso deba terminar.
      functions.logger.info('RevenueCat webhook event ignored', { userId, eventType: event.type });
    }

    res.status(200).send('OK');
  } catch (error) {
    functions.logger.error('Error processing RevenueCat webhook', {
      userId,
      eventType: event.type,
      error: error.message,
    });
    res.status(500).send('Internal error');
  }
});

/**
 * Función disparada automáticamente cuando se elimina una lectura con foto
 * (Opcional - requiere configurar Firestore trigger)
 */
exports.onReadingDeleted = functions.firestore
  .document('users/{userId}/meters/{meterId}/readings/{readingId}')
  .onDelete(async (snap, context) => {
    const reading = snap.data();
    const { photoURL } = reading;

    // Si no tiene foto, no hacer nada
    if (!photoURL) {
      return null;
    }

    try {
      const publicId = extractPublicId(photoURL);

      functions.logger.info('Auto-deleting Cloudinary image on reading deletion', {
        userId: context.params.userId,
        meterId: context.params.meterId,
        readingId: context.params.readingId,
        publicId,
      });

      const result = await cloudinary.uploader.destroy(publicId);

      functions.logger.info('Cloudinary image auto-deleted', {
        readingId: context.params.readingId,
        result,
      });

      return result;
    } catch (error) {
      // No fallar si la eliminación de Cloudinary falla
      functions.logger.error('Error auto-deleting Cloudinary image', {
        readingId: context.params.readingId,
        error: error.message,
      });

      return null;
    }
  });
