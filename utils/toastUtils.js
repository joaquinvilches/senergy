// src/utils/toastUtils.js
import React from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { useDarkMode } from './darkModeContext';
import { SPACING, RADIUS, TYPOGRAPHY, ELEVATION } from '../constants/theme';
import Icon from '../components/Icon';

let toastRef;

/** Guarda la ref del Toast para poder dispararlo desde cualquier lado */
export const setToastRef = (ref) => {
  toastRef = ref;
};

/** Muestra un toast: type = 'success' | 'error' | 'warning' | 'info' */
export const showToast = (message, type = 'success', duration = 3000) => {
  if (toastRef && toastRef.current && typeof toastRef.current.show === 'function') {
    toastRef.current.show(message, type, duration);
  } else {
    // Fallback: mostrar en consola si el toast no está disponible
    if (type === 'error') {
      console.error(`[TOAST] ${message}`);
    } else {
      console.warn(`[TOAST] ${message}`);
    }
  }
};

export const Toast = React.forwardRef(({}, ref) => {
  const [visible, setVisible] = React.useState(false);
  const [message, setMessage] = React.useState('');
  const [type, setType] = React.useState('success');

  // Evita recrear en cada render
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const slideAnim = React.useRef(new Animated.Value(-100)).current;

  const { colors } = useDarkMode();

  React.useImperativeHandle(ref, () => ({
    show: (msg, toastType = 'success', duration = 3000) => {
      setMessage(msg);
      setType(toastType);
      setVisible(true);

      // Animación de entrada
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
      ]).start();

      // Animación de salida
      setTimeout(() => {
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 250,
            useNativeDriver: true
          }),
          Animated.timing(slideAnim, {
            toValue: -100,
            duration: 250,
            useNativeDriver: true,
          }),
        ]).start(() => {
          setVisible(false);
        });
      }, duration);
    },
  }));

  if (!visible) return null;

  const getBackgroundColor = () => {
    switch (type) {
      case 'error':   return colors.ERROR;
      case 'warning': return colors.WARNING;
      case 'info':    return colors.INFO;
      default:        return colors.SUCCESS;
    }
  };

  const getIconName = () => {
    switch (type) {
      case 'error':   return 'close-circle';
      case 'warning': return 'alert-circle';
      case 'info':    return 'information';
      default:        return 'check-circle';
    }
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        }
      ]}
    >
      <View style={[styles.toast, { backgroundColor: getBackgroundColor() }]}>
        <Icon
          name={getIconName()}
          size={20}
          color="#FFFFFF"
          style={styles.icon}
        />
        <Text style={styles.message}>{message}</Text>
      </View>
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 60,
    left: SPACING.lg,
    right: SPACING.lg,
    zIndex: 9999,
    alignItems: 'center',
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: RADIUS.lg,
    ...ELEVATION.lg,
    maxWidth: '100%',
  },
  icon: {
    marginRight: SPACING.sm,
  },
  message: {
    color: '#FFFFFF',
    fontSize: TYPOGRAPHY.sizes.base,
    fontWeight: TYPOGRAPHY.weights.medium,
    flex: 1,
  },
});
