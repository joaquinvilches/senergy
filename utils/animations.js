import { Animated } from 'react-native';

/**
 * Configuraciones de animaciones estándar para SENERGY
 */

// Fade in animation
export const fadeIn = (animatedValue, duration = 300) => {
  return Animated.timing(animatedValue, {
    toValue: 1,
    duration,
    useNativeDriver: true,
  });
};

// Fade out animation
export const fadeOut = (animatedValue, duration = 300) => {
  return Animated.timing(animatedValue, {
    toValue: 0,
    duration,
    useNativeDriver: true,
  });
};

// Scale press animation
export const scalePress = (animatedValue, toValue = 0.95, duration = 100) => {
  return Animated.spring(animatedValue, {
    toValue,
    friction: 3,
    tension: 40,
    useNativeDriver: true,
  });
};

// Slide up animation
export const slideUp = (animatedValue, duration = 400) => {
  return Animated.timing(animatedValue, {
    toValue: 0,
    duration,
    useNativeDriver: true,
  });
};

// Slide down animation
export const slideDown = (animatedValue, toValue = 100, duration = 400) => {
  return Animated.timing(animatedValue, {
    toValue,
    duration,
    useNativeDriver: true,
  });
};

// Spring bounce animation
export const springBounce = (animatedValue, toValue = 1, tension = 40, friction = 7) => {
  return Animated.spring(animatedValue, {
    toValue,
    tension,
    friction,
    useNativeDriver: true,
  });
};

// Stagger animation for lists
export const staggerAnimation = (animations, delay = 100) => {
  return Animated.stagger(delay, animations);
};

// Parallel animation
export const parallelAnimation = (animations) => {
  return Animated.parallel(animations);
};

// Sequence animation
export const sequenceAnimation = (animations) => {
  return Animated.sequence(animations);
};

// Pulse animation (loop)
export const pulseAnimation = (animatedValue, fromValue = 1, toValue = 1.1, duration = 1000) => {
  return Animated.loop(
    Animated.sequence([
      Animated.timing(animatedValue, {
        toValue,
        duration,
        useNativeDriver: true,
      }),
      Animated.timing(animatedValue, {
        toValue: fromValue,
        duration,
        useNativeDriver: true,
      }),
    ])
  );
};

// Rotate animation
export const rotateAnimation = (animatedValue, duration = 1000) => {
  return Animated.loop(
    Animated.timing(animatedValue, {
      toValue: 1,
      duration,
      useNativeDriver: true,
    })
  );
};

// Helper to create interpolation for rotation
export const createRotateInterpolation = (animatedValue) => {
  return animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });
};

// Standard animation config presets
export const ANIMATION_PRESETS = {
  quick: { duration: 100, useNativeDriver: true },
  normal: { duration: 200, useNativeDriver: true },
  slow: { duration: 300, useNativeDriver: true },
  slower: { duration: 400, useNativeDriver: true },
  spring: { friction: 7, tension: 40, useNativeDriver: true },
  springBouncy: { friction: 3, tension: 40, useNativeDriver: true },
};

export default {
  fadeIn,
  fadeOut,
  scalePress,
  slideUp,
  slideDown,
  springBounce,
  staggerAnimation,
  parallelAnimation,
  sequenceAnimation,
  pulseAnimation,
  rotateAnimation,
  createRotateInterpolation,
  ANIMATION_PRESETS,
};
