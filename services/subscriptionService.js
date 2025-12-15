import { doc, getDoc, setDoc, updateDoc, Timestamp, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from './firebaseConfig';
import { SUBSCRIPTION_PLANS, getPlanConfig } from '../constants/pricing';
import { logger } from '../utils/logger';
import moment from 'moment';

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

    // Verificar si la suscripción expiró
    if (userData.subscription === SUBSCRIPTION_PLANS.PREMIUM && userData.subscriptionExpiry) {
      const now = Timestamp.now();

      if (userData.subscriptionExpiry.toMillis() < now.toMillis()) {
        // Suscripción expirada, revertir a FREE
        logger.warn('Subscription expired, reverting to FREE', { userId });

        await updateDoc(userRef, {
          subscription: SUBSCRIPTION_PLANS.FREE,
          subscriptionExpiry: null,
        });

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
 * Actualiza la suscripción del usuario
 * @param {string} userId - ID del usuario
 * @param {string} planType - 'FREE' o 'PREMIUM'
 * @param {number} durationMonths - Duración en meses (default: 1)
 * @returns {Promise<boolean>}
 */
export const updateUserSubscription = async (userId, planType, durationMonths = 1) => {
  try {
    const userRef = doc(db, 'users', userId);

    const updates = {
      subscription: planType,
      updatedAt: Timestamp.now(),
    };

    if (planType === SUBSCRIPTION_PLANS.PREMIUM) {
      const now = moment();
      const expiry = now.add(durationMonths, 'months');

      updates.subscriptionStartDate = Timestamp.now();
      updates.subscriptionExpiry = Timestamp.fromDate(expiry.toDate());

      logger.info('Subscription upgraded to PREMIUM', {
        userId,
        expiryDate: expiry.format('YYYY-MM-DD'),
      });
    } else {
      updates.subscriptionExpiry = null;
      updates.subscriptionStartDate = null;

      logger.info('Subscription reverted to FREE', { userId });
    }

    await updateDoc(userRef, updates);

    return true;
  } catch (error) {
    logger.error('Error updating user subscription', { userId, planType, error });
    return false;
  }
};

/**
 * Verifica si el usuario puede crear un medidor
 * @param {string} userId - ID del usuario
 * @returns {Promise<{canCreate: boolean, reason: string|null}>}
 */
export const canCreateMeter = async (userId) => {
  try {
    const { subscription } = await getUserSubscription(userId);
    const planConfig = getPlanConfig(subscription);

    // Obtener cantidad actual de medidores
    const metersRef = collection(db, 'users', userId, 'meters');
    const metersSnap = await getDocs(metersRef);
    const meterCount = metersSnap.size;

    if (meterCount >= planConfig.maxMeters) {
      return {
        canCreate: false,
        reason: `Has alcanzado el límite de ${planConfig.maxMeters} medidor(es) del plan ${planConfig.name}`,
      };
    }

    return { canCreate: true, reason: null };
  } catch (error) {
    logger.error('Error checking meter creation limit', { userId, error });
    return { canCreate: false, reason: 'Error al verificar límite' };
  }
};

/**
 * Verifica si el usuario puede crear una lectura este mes
 * @param {string} userId - ID del usuario
 * @param {string} meterId - ID del medidor
 * @returns {Promise<{canCreate: boolean, reason: string|null, count: number, limit: number}>}
 */
export const canCreateReading = async (userId, meterId) => {
  try {
    const { subscription } = await getUserSubscription(userId);
    const planConfig = getPlanConfig(subscription);

    // Si es Premium, ilimitado
    if (subscription === SUBSCRIPTION_PLANS.PREMIUM) {
      return {
        canCreate: true,
        reason: null,
        count: 0,
        limit: Infinity,
      };
    }

    // Para FREE, contar lecturas del mes actual
    const currentMonth = moment().format('YYYY-MM');
    const readingsRef = collection(db, 'users', userId, 'meters', meterId, 'readings');

    const readingsSnap = await getDocs(readingsRef);

    let monthReadingsCount = 0;
    readingsSnap.forEach(doc => {
      const reading = doc.data();
      const readingMonth = moment(reading.date.toDate()).format('YYYY-MM');

      if (readingMonth === currentMonth) {
        monthReadingsCount++;
      }
    });

    if (monthReadingsCount >= planConfig.maxReadingsPerMonth) {
      return {
        canCreate: false,
        reason: `Has alcanzado el límite de ${planConfig.maxReadingsPerMonth} lecturas mensuales del plan ${planConfig.name}`,
        count: monthReadingsCount,
        limit: planConfig.maxReadingsPerMonth,
      };
    }

    return {
      canCreate: true,
      reason: null,
      count: monthReadingsCount,
      limit: planConfig.maxReadingsPerMonth,
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
 * @param {string} userId - ID del usuario
 * @returns {Promise<boolean>}
 */
export const canTakePhotos = async (userId) => {
  try {
    const { subscription } = await getUserSubscription(userId);
    const planConfig = getPlanConfig(subscription);

    return planConfig.canTakePhotos;
  } catch (error) {
    logger.error('Error checking photo permission', { userId, error });
    return false;
  }
};

/**
 * Verifica si el usuario puede exportar datos
 * @param {string} userId - ID del usuario
 * @returns {Promise<boolean>}
 */
export const canExportData = async (userId) => {
  try {
    const { subscription } = await getUserSubscription(userId);
    const planConfig = getPlanConfig(subscription);

    return planConfig.canExport;
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
