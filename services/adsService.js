/**
 * Servicio de Anuncios SENERGY
 * Gestión de Google AdMob
 *
 * NOTA: react-native-google-mobile-ads requiere un build nativo.
 * NO funciona en Expo Go. Se usa importación dinámica con try-catch
 * para que la app no crashee en entornos sin el módulo nativo.
 */

import { logger } from '../utils/logger';
import { Platform } from 'react-native';

// Importación dinámica para evitar crash en Expo Go
let mobileAds = null;
let MaxAdContentRating = null;
let BannerAd = null;
let BannerAdSize = null;
let TestIds = null;
let _adsAvailable = false;

try {
  const adsModule = require('react-native-google-mobile-ads');
  mobileAds = adsModule.default;
  MaxAdContentRating = adsModule.MaxAdContentRating;
  BannerAd = adsModule.BannerAd;
  BannerAdSize = adsModule.BannerAdSize;
  TestIds = adsModule.TestIds;
  _adsAvailable = true;
} catch (error) {
  // AdMob no disponible (Expo Go o entorno sin módulo nativo)
  logger.warn('AdMob not available (running in Expo Go or native module missing)', {
    error: error.message,
  });
}

/**
 * Indica si AdMob está disponible en el entorno actual
 */
export const isAdsAvailable = () => _adsAvailable;

/**
 * Inicializa Google AdMob
 * NOTA: Llamar esto al inicio de la app (App.js)
 */
export const initializeAds = async () => {
  if (!_adsAvailable || !mobileAds) {
    logger.warn('AdMob not available, skipping initialization');
    return false;
  }

  try {
    await mobileAds().initialize();

    // Configuración opcional: Clasificación de contenido
    await mobileAds().setRequestConfiguration({
      maxAdContentRating: MaxAdContentRating.G, // Contenido General (apto para todos)
      tagForChildDirectedTreatment: false,
      tagForUnderAgeOfConsent: false,
    });

    logger.info('AdMob initialized successfully');
    return true;
  } catch (error) {
    logger.error('Error initializing AdMob', { error });
    return false;
  }
};

/**
 * IDs de anuncios
 * CONFIGURADO: IDs reales de AdMob integrados
 * App: SENERGY (ca-app-pub-4937459209805273~6427921284)
 */
export const AD_UNIT_IDS = {
  // Banner IDs (usar TestIds en desarrollo)
  BANNER_HOME: _adsAvailable && TestIds
    ? (__DEV__
      ? TestIds.BANNER
      : Platform.select({
          ios: 'ca-app-pub-4937459209805273/7039646444',
          android: 'ca-app-pub-4937459209805273/7039646444', // SENERGY - BANNER
        }))
    : null,

  BANNER_STATS: _adsAvailable && TestIds
    ? (__DEV__
      ? TestIds.BANNER
      : Platform.select({
          ios: 'ca-app-pub-4937459209805273/8100095609',
          android: 'ca-app-pub-4937459209805273/8100095609', // Senergy - Stats Banner
        }))
    : null,

  BANNER_PROFILE: _adsAvailable && TestIds
    ? (__DEV__
      ? TestIds.BANNER
      : Platform.select({
          ios: 'ca-app-pub-4937459209805273/7417569323',
          android: 'ca-app-pub-4937459209805273/7417569323', // Profile Screen
        }))
    : null,
};

/**
 * Verifica si el usuario debe ver anuncios
 * @param {string} subscription - Plan del usuario ('FREE' o 'PREMIUM')
 * @returns {boolean}
 */
export const shouldShowAds = (subscription) => {
  // Solo mostrar anuncios a usuarios FREE y si AdMob está disponible
  return _adsAvailable && subscription === 'FREE';
};

/**
 * Obtiene el tamaño de banner recomendado
 * @returns {string|null} BannerAdSize o null si no está disponible
 */
export const getBannerSize = () => {
  if (!BannerAdSize) return null;
  // Banner adaptativo (recomendado por Google)
  return BannerAdSize.ANCHORED_ADAPTIVE_BANNER;
};

export { BannerAd, BannerAdSize, TestIds };
