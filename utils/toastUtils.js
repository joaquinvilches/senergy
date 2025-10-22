// src/utils/toastUtils.js
import React from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { useDarkMode } from './darkModeContext';

let toastRef;

/** Guarda la ref del Toast para poder dispararlo desde cualquier lado */
export const setToastRef = (ref) => {
  toastRef = ref;
};

/** Muestra un toast: type = 'success' | 'error' | 'warning' | 'info' */
export const showToast = (message, type = 'success', duration = 3000) => {
  if (toastRef) {
    toastRef.show(message, type, duration);
  }
};

export const Toast = React.forwardRef(({}, ref) => {
  const [visible, setVisible] = React.useState(false);
  const [message, setMessage] = React.useState('');
  const [type, setType] = React.useState('success');

  // Evita recrear en cada render
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  const { colors } = useDarkMode();

  React.useImperativeHandle(ref, () => ({
    show: (msg, toastType = 'success', duration = 3000) => {
      setMessage(msg);
      setType(toastType);
      setVisible(true);

      Animated.timing(fadeAnim, { toValue: 1, duration: 250, useNativeDriver: true }).start();

      setTimeout(() => {
        Animated.timing(fadeAnim, { toValue: 0, duration: 250, useNativeDriver: true }).start(() => {
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
      case 'info':    return '#3B82F6';
      default:        return colors.SUCCESS; // success
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'error':   return '❌';
      case 'warning': return '⚠️';
      case 'info':    return 'ℹ️';
      default:        return '✅';
    }
  };

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <View style={[styles.toast, { backgroundColor: getBackgroundColor(), shadowColor: colors.TEXT_DARK }]}>
        <Text style={[styles.icon, { color: colors.WHITE }]}>{getIcon()}</Text>
        <Text style={[styles.message, { color: colors.WHITE }]}>{message}</Text>
      </View>
    </Animated.View>
  );
});

Toast.displayName = 'Toast';

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 60,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 9999,
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    marginHorizontal: 16,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  icon: { fontSize: 18, marginRight: 12 },
  message: { flex: 1, fontSize: 14, fontWeight: '500' },
});

export default Toast;
