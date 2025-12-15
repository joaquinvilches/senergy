import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Icon from '../Icon';
import { useDarkMode } from '../../utils/darkModeContext';
import { TYPOGRAPHY, SPACING, RADIUS } from '../../constants/theme';

/**
 * Badge Component - Badge/Pill component con variantes
 *
 * @param {string} text - Texto del badge
 * @param {string} variant - 'default', 'success', 'warning', 'error', 'info' (default: 'default')
 * @param {string} size - 'sm', 'md', 'lg' (default: 'md')
 * @param {string} icon - Nombre del icono opcional
 * @param {boolean} pill - Estilo pill (más redondeado)
 */
const Badge = ({
  text,
  variant = 'default',
  size = 'md',
  icon,
  pill = false,
  style,
  textStyle
}) => {
  const { colors } = useDarkMode();

  // Configuración de tamaños
  const sizeConfig = {
    sm: {
      paddingVertical: SPACING.xs,
      paddingHorizontal: SPACING.sm,
      fontSize: TYPOGRAPHY.sizes.xs,
      iconSize: 12,
    },
    md: {
      paddingVertical: SPACING.sm,
      paddingHorizontal: SPACING.md,
      fontSize: TYPOGRAPHY.sizes.sm,
      iconSize: 14,
    },
    lg: {
      paddingVertical: SPACING.md,
      paddingHorizontal: SPACING.lg,
      fontSize: TYPOGRAPHY.sizes.base,
      iconSize: 16,
    },
  };

  const config = sizeConfig[size];

  // Configuración de variantes
  const getVariantStyle = () => {
    switch (variant) {
      case 'success':
        return {
          backgroundColor: `${colors.SUCCESS}15`,
          textColor: colors.SUCCESS,
          borderColor: `${colors.SUCCESS}30`,
        };
      case 'warning':
        return {
          backgroundColor: `${colors.WARNING}15`,
          textColor: colors.WARNING,
          borderColor: `${colors.WARNING}30`,
        };
      case 'error':
        return {
          backgroundColor: `${colors.ERROR}15`,
          textColor: colors.ERROR,
          borderColor: `${colors.ERROR}30`,
        };
      case 'info':
        return {
          backgroundColor: `${colors.INFO}15`,
          textColor: colors.INFO,
          borderColor: `${colors.INFO}30`,
        };
      case 'default':
      default:
        return {
          backgroundColor: colors.neutral[200],
          textColor: colors.TEXT_DARK,
          borderColor: colors.neutral[300],
        };
    }
  };

  const variantStyle = getVariantStyle();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: variantStyle.backgroundColor,
          borderColor: variantStyle.borderColor,
          paddingVertical: config.paddingVertical,
          paddingHorizontal: config.paddingHorizontal,
          borderRadius: pill ? RADIUS.full : RADIUS.md,
        },
        style
      ]}
    >
      {icon && (
        <Icon
          name={icon}
          size={config.iconSize}
          color={variantStyle.textColor}
          style={styles.icon}
        />
      )}
      <Text
        style={[
          styles.text,
          {
            color: variantStyle.textColor,
            fontSize: config.fontSize,
            fontWeight: TYPOGRAPHY.weights.medium,
          },
          textStyle
        ]}
      >
        {text}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  text: {
    textAlign: 'center',
  },
  icon: {
    marginRight: SPACING.xs,
  },
});

export default Badge;
