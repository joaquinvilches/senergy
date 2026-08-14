import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AuthNavigator } from './navigation/AuthNavigator';
import { AppNavigator } from './navigation/AppNavigator';
import { SplashScreen } from './screens/SplashScreen';
import { onAuthChange } from './services/authService';
import { DarkModeProvider, useDarkMode } from './utils/darkModeContext';
import { Toast, setToastRef } from './utils/toastUtils';
import { registerForPushNotificationsAsync } from './services/notificationService';
import { ErrorBoundary } from './components/ErrorBoundary';
import { logger } from './utils/logger';
import { initializeAds } from './services/adsService';
import { initRevenueCat } from './services/revenueCatService';

// Captura errores no manejados que ocurren fuera del árbol de React (event
// handlers, promesas, setTimeout) — el ErrorBoundary de abajo NO los detecta.
// Sin esto, un throw en ese contexto cierra la app sin dejar ningún rastro.
if (global.ErrorUtils) {
  const defaultGlobalHandler = global.ErrorUtils.getGlobalHandler();
  global.ErrorUtils.setGlobalHandler((error, isFatal) => {
    logger.fatal('Unhandled global error', {
      message: error?.message,
      stack: error?.stack,
      isFatal,
    });
    defaultGlobalHandler(error, isFatal);
  });
}

function AppContent() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showSplash, setShowSplash] = useState(true);
  const toastRef = React.useRef();
  const { colors } = useDarkMode();

  useEffect(() => {
    // Esto es CRÍTICO: registrar el toast ref
    setToastRef(toastRef);
  }, [toastRef]);

  useEffect(() => {
    logger.info('App starting');

    initializeAds().catch((error) => {
      logger.error('Error al inicializar AdMob', { error });
    });

    const splashTimer = setTimeout(() => {
      setShowSplash(false);
      logger.debug('Splash screen hidden');
    }, 6000);

    const unsubscribe = onAuthChange((currentUser) => {
      if (currentUser) {
        logger.info('User authenticated', { userId: currentUser.uid });
      } else {
        logger.info('User not authenticated');
      }
      setUser(currentUser);
      setLoading(false);
    });

    return () => {
      clearTimeout(splashTimer);
      unsubscribe();
    };
  }, []);

  // Inicializar servicios cuando el usuario inicia sesión
  useEffect(() => {
    if (user) {
      registerForPushNotificationsAsync().catch((error) => {
        logger.error('Error al registrar notificaciones', { error });
      });
      initRevenueCat(user.uid).catch((error) => {
        logger.error('Error al inicializar RevenueCat', { error });
      });
    }
  }, [user]);

  if (showSplash) {
    return <SplashScreen />;
  }

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.BACKGROUND }}>
        <ActivityIndicator size="large" color={colors.PRIMARY} />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <NavigationContainer>
          {user ? <AppNavigator /> : <AuthNavigator />}
        </NavigationContainer>
        <Toast ref={toastRef} />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <DarkModeProvider>
        <AppContent />
      </DarkModeProvider>
    </ErrorBoundary>
  );
}
