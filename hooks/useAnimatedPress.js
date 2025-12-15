import { useRef, useCallback } from 'react';
import { Animated } from 'react-native';

/**
 * Hook useAnimatedPress - Micro-interacción estándar para botones
 *
 * Proporciona animación de scale down/up al presionar elementos
 *
 * @param {number} pressedScale - Escala al presionar (default: 0.95)
 * @param {number} normalScale - Escala normal (default: 1)
 * @returns {object} { scaleAnim, handlePressIn, handlePressOut, animatedStyle }
 */
const useAnimatedPress = (pressedScale = 0.95, normalScale = 1) => {
  const scaleAnim = useRef(new Animated.Value(normalScale)).current;

  const handlePressIn = useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: pressedScale,
      friction: 3,
      tension: 40,
      useNativeDriver: true,
    }).start();
  }, [scaleAnim, pressedScale]);

  const handlePressOut = useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: normalScale,
      friction: 3,
      tension: 40,
      useNativeDriver: true,
    }).start();
  }, [scaleAnim, normalScale]);

  const animatedStyle = {
    transform: [{ scale: scaleAnim }],
  };

  return {
    scaleAnim,
    handlePressIn,
    handlePressOut,
    animatedStyle,
  };
};

export default useAnimatedPress;
