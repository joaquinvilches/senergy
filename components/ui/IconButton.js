import React, { useRef } from 'react';
import { TouchableOpacity, Animated, StyleSheet } from 'react-native';
import Icon from '../Icon';
import { useDarkMode } from '../../utils/darkModeContext';
import { RADIUS, SPACING, OPACITY } from '../../constants/theme';

/**
 * IconButton - Botón circular solo con icono
 *
 * @param {string} icon - Nombre del icono
 * @param {string} family - Familia del icono
 * @param {function} onPress - Callback al presionar
 * @param {string} variant - 'solid', 'outline', 'ghost' (default: 'solid')
 * @param {string} color - 'primary', 'error', 'warning', 'neutral' (default: 'neutral')
 * @param {string} size - 'sm', 'md', 'lg' (default: 'md')
 * @param {boolean} disabled - Deshabilitar botón
 */
const IconButton = ({
  icon,
  family = 'MaterialCommunityIcons',
  onPress,
  variant = 'solid',
  color = 'neutral',
  size = 'md',
  disabled = false,
  style,
  ...props
}) => {
  const { colors } = useDarkMode();
  const scaleAnim = useRef(new Animated.Value(1)).current;

  // Tamaños
  const sizes = {
    sm: { container: 32, icon: 16 },
    md: { container: 40, icon: 20 },
    lg: { container: 48, icon: 24 },
  };

  const buttonSize = sizes[size];

  // Colores según tipo
  const getColors = () => {
    switch (color) {
      case 'primary':
        return {
          solid: { bg: colors.PRIMARY, icon: '#FFFFFF' },
          outline: { bg: 'transparent', icon: colors.PRIMARY, border: colors.PRIMARY },
          ghost: { bg: 'transparent', icon: colors.PRIMARY },
        };
      case 'error':
        return {
          solid: { bg: colors.ERROR, icon: '#FFFFFF' },
          outline: { bg: 'transparent', icon: colors.ERROR, border: colors.ERROR },
          ghost: { bg: 'transparent', icon: colors.ERROR },
        };
      case 'warning':
        return {
          solid: { bg: colors.WARNING, icon: '#FFFFFF' },
          outline: { bg: 'transparent', icon: colors.WARNING, border: colors.WARNING },
          ghost: { bg: 'transparent', icon: colors.WARNING },
        };
      case 'neutral':
      default:
        return {
          solid: { bg: colors.neutral[200], icon: colors.TEXT_DARK },
          outline: { bg: 'transparent', icon: colors.TEXT, border: colors.BORDER },
          ghost: { bg: 'transparent', icon: colors.TEXT },
        };
    }
  };

  const colorScheme = getColors()[variant];

  // Animación de press
  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.9,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 3,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      activeOpacity={0.8}
      accessibilityRole="button"
      {...props}
    >
      <Animated.View
        style={[
          styles.container,
          {
            width: buttonSize.container,
            height: buttonSize.container,
            borderRadius: buttonSize.container / 2,
            backgroundColor: colorScheme.bg,
            borderWidth: variant === 'outline' ? 1.5 : 0,
            borderColor: colorScheme.border || 'transparent',
            opacity: disabled ? OPACITY.disabled : 1,
            transform: [{ scale: scaleAnim }],
          },
          style
        ]}
      >
        <Icon
          name={icon}
          family={family}
          size={buttonSize.icon}
          color={colorScheme.icon}
        />
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default IconButton;
