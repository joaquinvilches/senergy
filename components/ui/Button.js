import React, { useRef } from 'react';
import { TouchableOpacity, Text, View, Animated, ActivityIndicator, StyleSheet } from 'react-native';
import Icon from '../Icon';
import { useDarkMode } from '../../utils/darkModeContext';
import { TYPOGRAPHY, SPACING, RADIUS, OPACITY } from '../../constants/theme';

/**
 * Button Component - Botón profesional con variantes
 *
 * @param {string} title - Texto del botón
 * @param {function} onPress - Callback al presionar
 * @param {string} variant - 'primary', 'secondary', 'outline', 'ghost', 'danger' (default: 'primary')
 * @param {string} size - 'sm', 'md', 'lg' (default: 'md')
 * @param {boolean} loading - Mostrar indicador de carga
 * @param {boolean} disabled - Deshabilitar botón
 * @param {string} iconLeft - Nombre del icono izquierdo
 * @param {string} iconRight - Nombre del icono derecho
 * @param {boolean} fullWidth - Ocupar todo el ancho disponible
 */
const Button = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  iconLeft,
  iconRight,
  fullWidth = false,
  style,
  textStyle,
  ...props
}) => {
  const { colors } = useDarkMode();
  const scaleAnim = useRef(new Animated.Value(1)).current;

  // Configuración de tamaños
  const sizeConfig = {
    sm: {
      paddingVertical: SPACING.sm,
      paddingHorizontal: SPACING.lg,
      fontSize: TYPOGRAPHY.sizes.sm,
      iconSize: 16,
      height: 36,
    },
    md: {
      paddingVertical: SPACING.md,
      paddingHorizontal: SPACING.xl,
      fontSize: TYPOGRAPHY.sizes.base,
      iconSize: 18,
      height: 44,
    },
    lg: {
      paddingVertical: SPACING.lg,
      paddingHorizontal: SPACING['2xl'],
      fontSize: TYPOGRAPHY.sizes.lg,
      iconSize: 20,
      height: 52,
    },
  };

  const config = sizeConfig[size];

  // Configuración de variantes
  const getVariantStyle = () => {
    switch (variant) {
      case 'primary':
        return {
          backgroundColor: colors.PRIMARY,
          borderColor: colors.PRIMARY,
          textColor: '#FFFFFF',
        };
      case 'secondary':
        return {
          backgroundColor: colors.ACCENT,
          borderColor: colors.ACCENT,
          textColor: '#FFFFFF',
        };
      case 'outline':
        return {
          backgroundColor: 'transparent',
          borderColor: colors.PRIMARY,
          textColor: colors.PRIMARY,
        };
      case 'ghost':
        return {
          backgroundColor: 'transparent',
          borderColor: 'transparent',
          textColor: colors.PRIMARY,
        };
      case 'danger':
        return {
          backgroundColor: colors.ERROR,
          borderColor: colors.ERROR,
          textColor: '#FFFFFF',
        };
      default:
        return {
          backgroundColor: colors.PRIMARY,
          borderColor: colors.PRIMARY,
          textColor: '#FFFFFF',
        };
    }
  };

  const variantStyle = getVariantStyle();

  // Animación de press
  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
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

  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={isDisabled}
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled }}
      {...props}
    >
      <Animated.View
        style={[
          styles.container,
          {
            backgroundColor: variantStyle.backgroundColor,
            borderColor: variantStyle.borderColor,
            borderWidth: variant === 'outline' ? 1.5 : 0,
            paddingVertical: config.paddingVertical,
            paddingHorizontal: config.paddingHorizontal,
            minHeight: config.height,
            borderRadius: RADIUS.lg,
            opacity: isDisabled ? OPACITY.disabled : 1,
            transform: [{ scale: scaleAnim }],
            width: fullWidth ? '100%' : 'auto',
          },
          style
        ]}
      >
        {loading ? (
          <ActivityIndicator color={variantStyle.textColor} size="small" />
        ) : (
          <View style={styles.content}>
            {iconLeft && (
              <Icon
                name={iconLeft}
                size={config.iconSize}
                color={variantStyle.textColor}
                style={styles.iconLeft}
              />
            )}
            <Text
              style={[
                styles.text,
                {
                  color: variantStyle.textColor,
                  fontSize: config.fontSize,
                  fontWeight: TYPOGRAPHY.weights.semibold,
                },
                textStyle
              ]}
            >
              {title}
            </Text>
            {iconRight && (
              <Icon
                name={iconRight}
                size={config.iconSize}
                color={variantStyle.textColor}
                style={styles.iconRight}
              />
            )}
          </View>
        )}
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    textAlign: 'center',
  },
  iconLeft: {
    marginRight: SPACING.sm,
  },
  iconRight: {
    marginLeft: SPACING.sm,
  },
});

export default Button;
