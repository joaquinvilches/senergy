import React, { Suspense, lazy } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useDarkMode } from '../utils/darkModeContext';

/**
 * Wrapper para cargar componentes de forma lazy (perezosa)
 *
 * Beneficios:
 * - Reduce el tamaño inicial del bundle
 * - Carga componentes solo cuando se necesitan
 * - Mejora el tiempo de carga inicial
 *
 * Uso:
 * const LazyStatsScreen = lazyLoad(() => import('../screens/StatsScreen'));
 *
 * <LazyStatsScreen {...props} />
 */

/**
 * Componente de loading por defecto
 */
export const DefaultLoadingComponent = () => {
  const { colors } = useDarkMode();

  return (
    <View style={[styles.loadingContainer, { backgroundColor: colors.BACKGROUND }]}>
      <ActivityIndicator size="large" color={colors.PRIMARY} />
    </View>
  );
};

/**
 * HOC para lazy loading de componentes
 * @param {Function} importFunc - Función que retorna import()
 * @param {Component} fallback - Componente de loading (opcional)
 */
export const lazyLoad = (importFunc, fallback = <DefaultLoadingComponent />) => {
  const LazyComponent = lazy(importFunc);

  return (props) => (
    <Suspense fallback={fallback}>
      <LazyComponent {...props} />
    </Suspense>
  );
};

/**
 * Wrapper con props personalizadas
 */
export const LazyLoadWrapper = ({ children, loading, LoadingComponent = DefaultLoadingComponent }) => {
  if (loading) {
    return <LoadingComponent />;
  }

  return <Suspense fallback={<LoadingComponent />}>{children}</Suspense>;
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default LazyLoadWrapper;
