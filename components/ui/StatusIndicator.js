import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';
import { useDarkMode } from '../../utils/darkModeContext';

/**
 * StatusIndicator - Reemplazo profesional de emojis 🔴🟡🟢
 *
 * @param {string} status - 'success', 'warning', 'error', 'info'
 * @param {string} variant - 'dot', 'ring', 'pulse' (default: 'dot')
 * @param {number} size - Tamaño del indicador (default: 10)
 * @param {boolean} animated - Activar animación pulse (default: false)
 */
const StatusIndicator = ({
  status = 'success',
  variant = 'dot',
  size = 10,
  animated = false,
  style
}) => {
  const { colors } = useDarkMode();
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Colores según status
  const getColor = () => {
    switch (status) {
      case 'success':
        return colors.SUCCESS;
      case 'warning':
        return colors.WARNING;
      case 'error':
        return colors.ERROR;
      case 'info':
        return colors.INFO;
      default:
        return colors.SUCCESS;
    }
  };

  const color = getColor();

  // Animación pulse
  useEffect(() => {
    if (animated && variant === 'pulse') {
      const animation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.3,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      );
      animation.start();
      return () => animation.stop();
    }
  }, [animated, variant]);

  // Dot variant
  if (variant === 'dot') {
    return (
      <View
        style={[
          styles.dot,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: color,
          },
          style
        ]}
      />
    );
  }

  // Ring variant
  if (variant === 'ring') {
    return (
      <View
        style={[
          styles.ring,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            borderColor: color,
            borderWidth: size / 5,
          },
          style
        ]}
      />
    );
  }

  // Pulse variant
  if (variant === 'pulse') {
    return (
      <View style={[styles.pulseContainer, style]}>
        {/* Outer pulse */}
        <Animated.View
          style={[
            styles.pulseOuter,
            {
              width: size * 2,
              height: size * 2,
              borderRadius: size,
              backgroundColor: color,
              opacity: pulseAnim.interpolate({
                inputRange: [1, 1.3],
                outputRange: [0.3, 0],
              }),
              transform: [{ scale: pulseAnim }],
            },
          ]}
        />
        {/* Inner dot */}
        <View
          style={[
            styles.pulseDot,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              backgroundColor: color,
            },
          ]}
        />
      </View>
    );
  }

  return null;
};

const styles = StyleSheet.create({
  dot: {
    // All styles are dynamic
  },
  ring: {
    backgroundColor: 'transparent',
  },
  pulseContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  pulseOuter: {
    position: 'absolute',
  },
  pulseDot: {
    // All styles are dynamic
  },
});

export default StatusIndicator;
