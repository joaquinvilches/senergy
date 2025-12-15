import { useState, useEffect, useCallback } from 'react';
import { getCurrentUser } from '../services/authService';
import {
  getUserSubscription,
  canCreateMeter,
  canCreateReading,
  canTakePhotos,
  canExportData,
  getUserPlanInfo,
} from '../services/subscriptionService';
import { SUBSCRIPTION_PLANS } from '../constants/pricing';
import { logger } from '../utils/logger';

/**
 * Hook para manejar suscripciones y restricciones
 *
 * Uso:
 * const { isPremium, canCreate, checkCanTakePhoto, planInfo, loading } = useSubscription();
 */
export const useSubscription = () => {
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState(SUBSCRIPTION_PLANS.FREE);
  const [subscriptionData, setSubscriptionData] = useState(null);
  const [planInfo, setPlanInfo] = useState(null);

  /**
   * Carga la suscripción del usuario
   */
  const loadSubscription = useCallback(async () => {
    try {
      setLoading(true);

      const user = getCurrentUser();
      if (!user) {
        setSubscription(SUBSCRIPTION_PLANS.FREE);
        setLoading(false);
        return;
      }

      const subData = await getUserSubscription(user.uid);
      const info = await getUserPlanInfo(user.uid);

      setSubscription(subData.subscription);
      setSubscriptionData(subData);
      setPlanInfo(info);

      logger.debug('Subscription loaded', {
        userId: user.uid,
        subscription: subData.subscription,
      });
    } catch (error) {
      logger.error('Error loading subscription', { error });
      setSubscription(SUBSCRIPTION_PLANS.FREE);
    } finally {
      setLoading(false);
    }
  }, []);

  // Cargar al montar
  useEffect(() => {
    loadSubscription();
  }, [loadSubscription]);

  /**
   * Verifica si puede crear un medidor
   */
  const checkCanCreateMeter = useCallback(async () => {
    const user = getCurrentUser();
    if (!user) return { canCreate: false, reason: 'No autenticado' };

    return await canCreateMeter(user.uid);
  }, []);

  /**
   * Verifica si puede crear una lectura
   */
  const checkCanCreateReading = useCallback(async (meterId) => {
    const user = getCurrentUser();
    if (!user) return { canCreate: false, reason: 'No autenticado' };

    return await canCreateReading(user.uid, meterId);
  }, []);

  /**
   * Verifica si puede tomar fotos
   */
  const checkCanTakePhoto = useCallback(async () => {
    const user = getCurrentUser();
    if (!user) return false;

    return await canTakePhotos(user.uid);
  }, []);

  /**
   * Verifica si puede exportar
   */
  const checkCanExport = useCallback(async () => {
    const user = getCurrentUser();
    if (!user) return false;

    return await canExportData(user.uid);
  }, []);

  /**
   * Refresca la suscripción (útil después de comprar)
   */
  const refreshSubscription = useCallback(async () => {
    await loadSubscription();
  }, [loadSubscription]);

  return {
    // Estado
    loading,
    subscription,
    subscriptionData,
    planInfo,

    // Helpers
    isPremium: subscription === SUBSCRIPTION_PLANS.PREMIUM,
    isFree: subscription === SUBSCRIPTION_PLANS.FREE,

    // Funciones de verificación
    checkCanCreateMeter,
    checkCanCreateReading,
    checkCanTakePhoto,
    checkCanExport,

    // Acciones
    refreshSubscription,
  };
};

export default useSubscription;
