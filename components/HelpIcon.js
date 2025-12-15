import React from 'react';
import { TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { useDarkMode } from '../utils/darkModeContext';
import { SPACING, RADIUS } from '../constants/theme';
import Icon from './Icon';

/**
 * Ícono de ayuda que muestra un tooltip con explicación al presionarlo
 *
 * @param {string} title - Título del tooltip
 * @param {string} message - Mensaje explicativo
 * @param {string} icon - Nombre del ícono a mostrar (default: 'help-circle-outline')
 * @param {object} style - Estilos adicionales
 */
export const HelpIcon = ({ title, message, icon = 'help-circle-outline', style }) => {
  const { colors } = useDarkMode();

  const handlePress = () => {
    Alert.alert(title, message, [{ text: 'Entendido' }]);
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      style={[styles.container, style]}
      activeOpacity={0.7}
    >
      <Icon name={icon} size={16} color={colors.PRIMARY} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 24,
    height: 24,
    borderRadius: RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: SPACING.xs + 2,
  },
});
