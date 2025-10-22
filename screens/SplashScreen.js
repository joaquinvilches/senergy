import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { COLORS } from '../utils/constants';

export const SplashScreen = () => {
  // Animaciones
  const fadeAnim = new Animated.Value(0);
  const scaleAnim = new Animated.Value(0.5);
  const moveUpAnim = new Animated.Value(50);
  const rotateAnim = new Animated.Value(0);
  const pulsateAnim = new Animated.Value(1);

  useEffect(() => {
    // Animación principal de entrada
    Animated.parallel([
      // Fade in
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      // Scale
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 5,
        tension: 40,
        useNativeDriver: true,
      }),
      // Move up
      Animated.timing(moveUpAnim, {
        toValue: 0,
        duration: 1000,
        useNativeDriver: true,
      }),
    ]).start();

    // Animación de rotación continua del logo
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 3000,
        useNativeDriver: true,
      })
    ).start();

    // Animación de pulsación
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulsateAnim, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulsateAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  // Interpolaciones
  const rotateInterpolate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const logoAnimations = {
    opacity: fadeAnim,
    transform: [
      { scale: Animated.multiply(scaleAnim, pulsateAnim) },
      { rotate: rotateInterpolate },
    ],
  };

  const titleAnimations = {
    opacity: fadeAnim,
    transform: [
      { translateY: moveUpAnim },
    ],
  };

  return (
    <View style={styles.container}>
      {/* Fondo degradado */}
      <View style={styles.background}>
        <View style={styles.gradientTop} />
        <View style={styles.gradientBottom} />
      </View>

      {/* Contenido animado */}
      <View style={styles.content}>
        {/* Logo animado con rotación */}
        <Animated.View style={[styles.logoContainer, logoAnimations]}>
          <Text style={styles.logo}>⚡</Text>
        </Animated.View>

        {/* Hojas decorativas */}
        <Animated.View
          style={[
            styles.leaf1,
            {
              opacity: fadeAnim,
            },
          ]}
        >
          <Text style={styles.leafText}>🌿</Text>
        </Animated.View>

        <Animated.View
          style={[
            styles.leaf2,
            {
              opacity: fadeAnim,
            },
          ]}
        >
          <Text style={styles.leafText}>🍃</Text>
        </Animated.View>

        {/* Título principal animado */}
        <Animated.View style={[styles.titleContainer, titleAnimations]}>
          <Text style={styles.title}>SENERGY</Text>
          <Text style={styles.subtitle}>Controla tu energía</Text>
        </Animated.View>

        {/* Descripción */}
        <Animated.View
          style={[
            styles.descriptionContainer,
            {
              opacity: fadeAnim,
            },
          ]}
        >
          <Text style={styles.description}>
            Monitorea tu consumo eléctrico en tiempo real
          </Text>
        </Animated.View>

        {/* Indicador de carga */}
        <View style={styles.loaderContainer}>
          <View style={styles.loaderBar} />
          <Text style={styles.loaderText}>Iniciando...</Text>
        </View>
      </View>

      {/* Pie de página */}
      <Animated.View
        style={[
          styles.footer,
          {
            opacity: fadeAnim,
          },
        ]}
      >
        <Text style={styles.footerText}>v1.0.0</Text>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
    justifyContent: 'center',
    alignItems: 'center',
  },
  background: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  gradientTop: {
    position: 'absolute',
    top: -100,
    left: -100,
    width: 400,
    height: 400,
    borderRadius: 200,
    backgroundColor: COLORS.PRIMARY,
    opacity: 0.05,
  },
  gradientBottom: {
    position: 'absolute',
    bottom: -150,
    right: -150,
    width: 500,
    height: 500,
    borderRadius: 250,
    backgroundColor: COLORS.ACCENT,
    opacity: 0.08,
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  logoContainer: {
    marginBottom: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    fontSize: 80,
    textAlign: 'center',
  },
  leaf1: {
    position: 'absolute',
    top: 60,
    left: 30,
  },
  leaf2: {
    position: 'absolute',
    bottom: 200,
    right: 30,
  },
  leafText: {
    fontSize: 40,
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    color: COLORS.PRIMARY,
    letterSpacing: 3,
    marginBottom: 10,
    textShadowColor: 'rgba(27, 125, 74, 0.1)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.SECONDARY,
    fontWeight: '600',
    letterSpacing: 1,
  },
  descriptionContainer: {
    marginBottom: 50,
    paddingHorizontal: 16,
  },
  description: {
    fontSize: 14,
    color: COLORS.TEXT_LIGHT,
    textAlign: 'center',
    lineHeight: 20,
    fontStyle: 'italic',
  },
  loaderContainer: {
    alignItems: 'center',
    marginTop: 40,
  },
  loaderBar: {
    width: 120,
    height: 3,
    backgroundColor: COLORS.ACCENT,
    borderRadius: 2,
    marginBottom: 12,
    shadowColor: COLORS.ACCENT,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  loaderText: {
    fontSize: 12,
    color: COLORS.TEXT_LIGHT,
    fontWeight: '500',
    letterSpacing: 0.5,
  },
  footer: {
    position: 'absolute',
    bottom: 40,
  },
  footerText: {
    fontSize: 11,
    color: COLORS.PRIMARY,
    fontWeight: '600',
    opacity: 0.6,
  },
});