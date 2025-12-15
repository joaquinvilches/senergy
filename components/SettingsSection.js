import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Switch, Animated } from 'react-native';
import { useDarkMode } from '../utils/darkModeContext';
import { SPACING, TYPOGRAPHY, RADIUS, ELEVATION } from '../constants/theme';
import Icon from './Icon';

export const SettingsSection = () => {
  const { colors, isDarkMode, toggleDarkMode } = useDarkMode();
  const scaleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      tension: 50,
      friction: 8,
      useNativeDriver: true,
    }).start();
  }, [scaleAnim]);

  return (
    <Animated.View
      style={[
        styles.section,
        {
          backgroundColor: colors.CARD,
          borderColor: colors.BORDER,
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      {/* Header mejorado */}
      <View style={styles.headerContainer}>
        <View style={[styles.headerIconBg, { backgroundColor: `${colors.ACCENT}15` }]}>
          <Icon name="cog" size={18} color={colors.ACCENT} />
        </View>
        <View>
          <Text style={[styles.sectionTitle, { color: colors.TEXT_DARK }]}>
            Configuración
          </Text>
          <Text style={[styles.sectionSubtitle, { color: colors.TEXT_LIGHT }]}>
            Preferencias de la app
          </Text>
        </View>
      </View>

      {/* Dark Mode Setting */}
      <View style={[styles.settingItem, { backgroundColor: colors.BACKGROUND }]}>
        <View style={[styles.iconContainer, { backgroundColor: `${isDarkMode ? '#6366F1' : '#FBBF24'}15` }]}>
          <Icon
            name={isDarkMode ? 'weather-night' : 'weather-sunny'}
            size={20}
            color={isDarkMode ? '#6366F1' : '#FBBF24'}
          />
        </View>
        <View style={styles.settingContent}>
          <Text style={[styles.settingText, { color: colors.TEXT_DARK }]}>
            Modo Oscuro
          </Text>
          <Text style={[styles.settingDescription, { color: colors.TEXT_LIGHT }]}>
            {isDarkMode ? 'Tema oscuro activado' : 'Tema claro activado'}
          </Text>
        </View>
        <Switch
          value={isDarkMode}
          onValueChange={toggleDarkMode}
          trackColor={{ false: '#D1D5DB', true: colors.ACCENT }}
          thumbColor={isDarkMode ? '#FFFFFF' : '#F3F4F6'}
          ios_backgroundColor="#D1D5DB"
        />
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  section: {
    marginHorizontal: SPACING.md,
    marginVertical: SPACING.md,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    borderWidth: 1,
    ...ELEVATION.sm,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  headerIconBg: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.bold,
    letterSpacing: 0.3,
  },
  sectionSubtitle: {
    fontSize: TYPOGRAPHY.sizes.xs,
    marginTop: 2,
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.lg,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  settingContent: {
    flex: 1,
  },
  settingText: {
    fontSize: TYPOGRAPHY.sizes.base,
    fontWeight: TYPOGRAPHY.weights.semibold,
    letterSpacing: 0.2,
  },
  settingDescription: {
    fontSize: TYPOGRAPHY.sizes.xs,
    marginTop: SPACING.xs / 2,
    fontWeight: TYPOGRAPHY.weights.medium,
  },
});