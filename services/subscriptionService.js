import { doc, getDoc, setDoc, Timestamp } from 'firebase/firestore';
import { db } from './firebaseConfig';
import { SUBSCRIPTION_PLANS, getPlanConfig } from '../constants/pricing';
import { logger } from '../utils/logger';

/**
 * Servicio de Suscripciones SENERGY
 */

/**
 * Obtiene la suscripción del usuario
 * @param {string} userId - ID del usuario
 * @returns {Promise<Object>} Datos de suscripción
 */
export const getUserSubscription = async (userId) => {
  try {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      // Usuario no existe, crear con plan FREE
      const defaultSubscription = {
        subscription: SUBSCRIPTION_PLANS.FREE,
        subscriptionExpiry: null,
        subscriptionStartDate: null,
      };

      await setDoc(userRef, {
        uid: userId,
        ...defaultSubscription,
        createdAt: Timestamp.now(),
      }, { merge: true });

      return defaultSubscription;
    }

    const userData = userSnap.data();

    // Verificar si la suscripción expiró.
    // NOTA: el cliente ya no puede escribir estos campos (ver firestore.rules);
    // el webhook de RevenueCat (functions/index.js) es quien revierte a FREE
    // en Firestore cuando llega el evento EXPIRATION. Aquí solo reflejamos el
    // estado correcto para la UI mientras ese evento llega.
    if (userData.subscription === SUBSCRIPTION_PLANS.PREMIUM && userData.subscriptionExpiry) {
      const now = Timestamp.now();

      if (userData.subscriptionExpiry.toMillis() < now.toMillis()) {
        logger.warn('Subscription expired locally, showing as FREE pending webhook sync', { userId });

        return {
          subscription: SUBSCRIPTION_PLANS.FREE,
          subscriptionExpiry: null,
          subscriptionStartDate: userData.subscriptionStartDate || null,
        };
      }
    }

    return {
      subscription: userData.subscription || SUBSCRIPTION_PLANS.FREE,
      subscriptionExpiry: userData.subscriptionExpiry || null,
      subscriptionStartDate: userData.subscriptionStartDate || null,
    };
  } catch (error) {
    logger.error('Error getting user subscription', { userId, error });
    // En caso de error, asumir FREE
    return {
      subscription: SUBSCRIPTION_PLANS.FREE,
      subscriptionExpiry: null,
      subscriptionStartDate: null,
    };
  }
};

/**
 * Verifica si el usuario puede crear un medidor
 * NOTA: Ahora todos los planes tienen medidores ilimitados
 * @param {string} userId - ID del usuario
 * @returns {Promise<{canCreate: boolean, reason: string|null}>}
 */
export const canCreateMeter = async (userId) => {
  try {
    // Con el nuevo modelo, todos los usuarios tienen medidores ilimitados
    return { canCreate: true, reason: null };
  } catch (error) {
    logger.error('Error checking meter creation limit', { userId, error });
    return { canCreate: false, reason: 'Error al verificar límite' };
  }
};

/**
 * Verifica si el usuario puede crear una lectura este mes
 * NOTA: Ahora todos los planes tienen lecturas ilimitadas
 * @param {string} userId - ID del usuario
 * @param {string} meterId - ID del medidor
 * @returns {Promise<{canCreate: boolean, reason: string|null, count: number, limit: number}>}
 */
export const canCreateReading = async (userId, meterId) => {
  try {
    // Con el nuevo modelo, todos los usuarios tienen lecturas ilimitadas
    return {
      canCreate: true,
      reason: null,
      count: 0,
      limit: Infinity,
    };
  } catch (error) {
    logger.error('Error checking reading creation limit', { userId, meterId, error });
    return {
      canCreate: false,
      reason: 'Error al verificar límite',
      count: 0,
      limit: 0,
    };
  }
};

/**
 * Verifica si el usuario puede tomar fotos
 * Función exclusiva del plan Premium (evidencia de respaldo para reclamos)
 * @param {string} userId - ID del usuario
 * @returns {Promise<boolean>}
 */
export const canTakePhotos = async (userId) => {
  try {
    const { subscription } = await getUserSubscription(userId);
    return getPlanConfig(subscription).canTakePhotos;
  } catch (error) {
    logger.error('Error checking photo permission', { userId, error });
    return false;
  }
};

/**
 * Verifica si el usuario puede exportar datos
 * NOTA: Ahora todos los usuarios pueden exportar
 * @param {string} userId - ID del usuario
 * @returns {Promise<boolean>}
 */
export const canExportData = async (userId) => {
  try {
    // Con el nuevo modelo, todos los usuarios pueden exportar
    return true;
  } catch (error) {
    logger.error('Error checking export permission', { userId, error });
    return false;
  }
};

/**
 * Obtiene información completa del plan del usuario
 * @param {string} userId - ID del usuario
 * @returns {Promise<Object>}
 */
export const getUserPlanInfo = async (userId) => {
  try {
    const subscriptionData = await getUserSubscription(userId);
    const planConfig = getPlanConfig(subscriptionData.subscription);

    return {
      ...subscriptionData,
      ...planConfig,
      isPremium: subscriptionData.subscription === SUBSCRIPTION_PLANS.PREMIUM,
      isFree: subscriptionData.subscription === SUBSCRIPTION_PLANS.FREE,
    };
  } catch (error) {
    logger.error('Error getting user plan info', { userId, error });
    return {
      subscription: SUBSCRIPTION_PLANS.FREE,
      ...getPlanConfig(SUBSCRIPTION_PLANS.FREE),
      isPremium: false,
      isFree: true,
    };
  }
};
