import { Platform } from 'react-native';
import { logger } from '../utils/logger';

const ANDROID_API_KEY = 'goog_BYVxDSXgILzAqOCEwguwvZnwTAs';
const IOS_API_KEY = null; // Agregar cuando se cree la app iOS en RevenueCat

let _Purchases = null;
let _initialized = false;

const getPurchases = () => {
  if (_Purchases) return _Purchases;
  try {
    _Purchases = require('react-native-purchases').default;
    return _Purchases;
  } catch {
    return null;
  }
};

export const initRevenueCat = async (userId) => {
  try {
    const Purchases = getPurchases();
    if (!Purchases) {
      logger.warn('RevenueCat no disponible (Expo Go o build sin módulo nativo)');
      return;
    }

    const apiKey = Platform.OS === 'ios' ? IOS_API_KEY : ANDROID_API_KEY;
    if (!apiKey) {
      logger.warn('RevenueCat: sin API key para esta plataforma');
      return;
    }

    await Purchases.configure({ apiKey, appUserID: userId });
    _initialized = true;
    logger.info('RevenueCat inicializado', { userId, platform: Platform.OS });
  } catch (error) {
    logger.error('Error inicializando RevenueCat', { error });
  }
};

export const getAvailablePackage = async () => {
  try {
    const Purchases = getPurchases();
    if (!Purchases || !_initialized) return null;

    const offerings = await Purchases.getOfferings();
    return offerings?.current?.availablePackages?.[0] ?? null;
  } catch (error) {
    logger.error('Error obteniendo ofertas', { error });
    return null;
  }
};

export const purchasePremium = async () => {
  const Purchases = getPurchases();
  if (!Purchases || !_initialized) {
    throw new Error('REVENUECAT_NOT_READY');
  }

  const pkg = await getAvailablePackage();
  if (!pkg) {
    throw new Error('NO_PRODUCTS');
  }

  const { customerInfo } = await Purchases.purchasePackage(pkg);
  const isPremium = !!customerInfo.entitlements.active['premium'];
  return { success: isPremium };
};

export const restorePurchases = async () => {
  try {
    const Purchases = getPurchases();
    if (!Purchases || !_initialized) return false;

    const customerInfo = await Purchases.restorePurchases();
    return !!customerInfo.entitlements.active['premium'];
  } catch (error) {
    logger.error('Error restaurando compras', { error });
    return false;
  }
};

export const isRevenueCatReady = () => !!getPurchases() && _initialized;
