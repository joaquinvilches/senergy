/**
 * Firebase Cloud Function para eliminar fotos de Cloudinary de forma segura
 *
 * Esta función se ejecuta cuando se elimina una lectura que tiene foto.
 * Extrae el public_id de la URL de Cloudinary y elimina la foto usando el API Secret.
 *
 * Setup:
 * 1. Instalar dependencias en /functions:
 *    npm install cloudinary
 *
 * 2. Configurar variables de entorno en Firebase:
 *    firebase functions:config:set cloudinary.cloud_name="your_cloud_name"
 *    firebase functions:config:set cloudinary.api_key="your_api_key"
 *    firebase functions:config:set cloudinary.api_secret="your_api_secret"
 *
 * 3. Deploy:
 *    firebase deploy --only functions:deleteCloudinaryImage
 *
 * Uso desde el cliente:
 * import { httpsCallable } from 'firebase/functions';
 * const deleteImage = httpsCallable(functions, 'deleteCloudinaryImage');
 * await deleteImage({ photoURL: 'https://res.cloudinary.com/...' });
 */

const functions = require('firebase-functions');
const { v2: cloudinary } = require('cloudinary');

// Configurar Cloudinary con credenciales de Functions Config
cloudinary.config({
  cloud_name: functions.config().cloudinary.cloud_name,
  api_key: functions.config().cloudinary.api_key,
  api_secret: functions.config().cloudinary.api_secret,
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
