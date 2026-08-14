/**
 * Componente de Banner Publicitario
 * Muestra anuncios solo a usuarios FREE
 *
 * NOTA: AdMob NO funciona en Expo Go, solo en development builds o producción
 */

import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { useSubscription } from '../hooks/useSubscription';
import { logger } from '../utils/logger';
import { useDarkMode } from '../utils/darkModeContext';

// Importar condicionalmente AdMob (solo funciona en builds nativos)
let BannerAd, BannerAdSize, AD_UNIT_IDS, shouldShowAds;
try {
  const ads = require('react-native-google-mobile-ads');
  BannerAd = ads.BannerAd;
  BannerAdSize = ads.BannerAdSize;
  const adsService = require('../services/adsService');
  AD_UNIT_IDS = adsService.AD_UNIT_IDS;
  shouldShowAds = adsService.shouldShowAds;
} catch (error) {
  logger.warn('AdMob not available (running in Expo Go?)', { error: error.message });
}

/**
 * Componente AdBanner
 * @param {Object} props
 * @param {string} props.adUnitId - ID del unit de anuncio (opcional, usa HOME por defecto)
 * @param {string} props.size - Tamaño del banner (opcional, usa ANCHORED_ADAPTIVE_BANNER por defecto)
 */
export const AdBanner = ({ adUnitId, size }) => {
  const { subscription } = useSubscription();
  const { colors } = useDarkMode();
  const [isAdLoaded, setIsAdLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  // Si AdMob no está disponible (Expo Go), no renderizar nada
  if (!BannerAd || !shouldShowAds) {
    return null;
  }

  // Determinar si debe mostrar el anuncio
  const showAd = shouldShowAds(subscription);

  // Si es Premium, no renderizar nada
  if (!showAd) {
    return null;
  }

  // Si hubo error cargando el ad, no mostrar nada (fail silently)
  if (hasError) {
    return null;
  }

  // Usar tamaño por defecto si no se especifica
  const bannerSize = size || BannerAdSize?.ANCHORED_ADAPTIVE_BANNER;

  // Determinar el adUnitId a usar
  const unitId = adUnitId || AD_UNIT_IDS.BANNER_HOME;

  const handleAdLoaded = () => {
    setIsAdLoaded(true);
    logger.debug('Ad loaded successfully', { unitId });
  };

  const handleAdFailedToLoad = (error) => {
    setHasError(true);
    logger.warn('Ad failed to load', { error: error.message, unitId });
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.BACKGROUND }]}>
      <BannerAd
        unitId={unitId}
        size={bannerSize}
        requestOptions={{
          requestNonPersonalizedAdsOnly: false, // Cambiar a true si no quieres anuncios personalizados
        }}
        onAdLoaded={handleAdLoaded}
        onAdFailedToLoad={handleAdFailedToLoad}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
});
