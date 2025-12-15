import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import Constants from 'expo-constants';

/**
 * Solicita permisos de cámara al usuario
 * @returns {Promise<boolean>} true si se otorgó permiso, false si se denegó
 */
export const requestCameraPermission = async () => {
  try {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    return status === 'granted';
  } catch (error) {
    console.error('Error requesting camera permission:', error);
    return false;
  }
};

/**
 * Verifica si tenemos permiso de cámara
 * @returns {Promise<boolean>} true si tenemos permiso
 */
export const hasCameraPermission = async () => {
  try {
    const { status } = await ImagePicker.getCameraPermissionsAsync();
    return status === 'granted';
  } catch (error) {
    console.error('Error checking camera permission:', error);
    return false;
  }
};

/**
 * Captura una foto con la cámara (solo cámara, NO galería)
 * @returns {Promise<Object|null>} Objeto con uri de la foto o null si canceló
 */
export const capturePhoto = async () => {
  try {
    // Verificar permiso
    const hasPermission = await hasCameraPermission();
    if (!hasPermission) {
      const granted = await requestCameraPermission();
      if (!granted) {
        throw new Error('Permiso de cámara denegado');
      }
    }

    // Lanzar cámara
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: 'images',
      allowsEditing: true, // Permite recortar/ajustar
      aspect: [4, 3], // Aspecto de pantalla de medidor
      quality: 0.8, // Calidad inicial 80% (antes de compresión)
      exif: true, // Incluir metadata EXIF
    });

    if (result.canceled) {
      return null;
    }

    return {
      uri: result.assets[0].uri,
      width: result.assets[0].width,
      height: result.assets[0].height,
      exif: result.assets[0].exif,
    };
  } catch (error) {
    console.error('Error capturing photo:', error);
    throw error;
  }
};

/**
 * Comprime una imagen para reducir tamaño (~70% reducción)
 * @param {string} uri - URI de la imagen original
 * @param {number} maxWidth - Ancho máximo (default: 1024px)
 * @param {number} quality - Calidad JPEG 0-1 (default: 0.7)
 * @returns {Promise<Object>} Objeto con uri de imagen comprimida
 */
export const compressImage = async (uri, maxWidth = 1024, quality = 0.7) => {
  try {
    const manipResult = await ImageManipulator.manipulateAsync(
      uri,
      [
        // Redimensionar si es mayor al ancho máximo
        { resize: { width: maxWidth } }
      ],
      {
        compress: quality, // Compresión JPEG 70%
        format: ImageManipulator.SaveFormat.JPEG,
        base64: false, // No necesitamos base64
      }
    );

    return {
      uri: manipResult.uri,
      width: manipResult.width,
      height: manipResult.height,
    };
  } catch (error) {
    console.error('Error compressing image:', error);
    throw error;
  }
};

/**
 * Sube una foto a Cloudinary
 * @param {string} imageUri - URI local de la imagen
 * @param {string} userId - ID del usuario
 * @param {string} meterId - ID del medidor
 * @param {string} readingId - ID de la lectura
 * @returns {Promise<string>} URL de descarga de la imagen
 */
export const uploadMeterPhoto = async (imageUri, userId, meterId, readingId) => {
  try {
    const cloudName = Constants.expoConfig?.extra?.cloudinaryCloudName;
    const uploadPreset = Constants.expoConfig?.extra?.cloudinaryUploadPreset;

    if (!cloudName || !uploadPreset) {
      throw new Error('Cloudinary configuration missing. Check your .env file.');
    }

    // Crear FormData para el upload
    const formData = new FormData();

    // Agregar la imagen
    const timestamp = Date.now();
    const fileName = `meter_photo_${timestamp}.jpg`;

    formData.append('file', {
      uri: imageUri,
      type: 'image/jpeg',
      name: fileName,
    });

    formData.append('upload_preset', uploadPreset);

    // Agregar metadata como contexto (para organización)
    formData.append('folder', `senergy/${userId}/${meterId}/${readingId}`);
    formData.append('context', `userId=${userId}|meterId=${meterId}|readingId=${readingId}|uploadedAt=${new Date().toISOString()}`);

    // Upload a Cloudinary
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Cloudinary upload failed: ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();

    // Retornar la URL segura de la imagen
    return data.secure_url;
  } catch (error) {
    console.error('Error uploading photo to Cloudinary:', error);
    throw error;
  }
};

/**
 * Elimina una foto de Cloudinary usando Firebase Cloud Function
 * NOTA: Requiere que la función 'deleteCloudinaryImage' esté desplegada.
 * Ver /functions/cloudinaryDelete.js para setup.
 *
 * @param {string} photoURL - URL de descarga de la foto
 * @returns {Promise<boolean>} true si se eliminó correctamente
 */
export const deleteMeterPhoto = async (photoURL) => {
  try {
    if (!photoURL) return false;

    // Importar dinámicamente para evitar circular dependencies
    const { getFunctions, httpsCallable } = await import('firebase/functions');
    const { functions } = await import('./firebaseConfig');

    // Llamar a la Cloud Function
    const deleteImage = httpsCallable(functions, 'deleteCloudinaryImage');
    const result = await deleteImage({ photoURL });

    if (result.data.success) {
      console.info('Photo deleted from Cloudinary successfully:', photoURL);
      return true;
    } else {
      console.warn('Photo deletion from Cloudinary failed:', result.data);
      return false;
    }
  } catch (error) {
    console.error('Error deleting photo from Cloudinary:', error);
    // No lanzar error para no bloquear la eliminación de la lectura
    // La foto quedará huérfana en Cloudinary, pero no es crítico
    return false;
  }
};

/**
 * Flujo completo: capturar, comprimir y subir foto
 * @param {string} userId - ID del usuario
 * @param {string} meterId - ID del medidor
 * @param {string} readingId - ID de la lectura
 * @returns {Promise<string|null>} URL de descarga o null si canceló
 */
export const captureAndUploadMeterPhoto = async (userId, meterId, readingId) => {
  try {
    // 1. Capturar foto
    const photo = await capturePhoto();
    if (!photo) return null; // Usuario canceló

    // 2. Comprimir foto (~70% reducción)
    const compressed = await compressImage(photo.uri, 1024, 0.7);

    // 3. Subir a Firebase Storage
    const photoURL = await uploadMeterPhoto(compressed.uri, userId, meterId, readingId);

    return photoURL;
  } catch (error) {
    console.error('Error in capture and upload flow:', error);
    throw error;
  }
};
