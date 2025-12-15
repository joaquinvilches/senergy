import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { useDarkMode } from '../utils/darkModeContext';
import { SPACING, TYPOGRAPHY, RADIUS, ELEVATION } from '../constants/theme';
import Icon from './Icon';

export const HelpSection = ({ navigation }) => {
  const { colors } = useDarkMode();
  const animValues = useRef([
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
  ]).current;

  useEffect(() => {
    // Animación escalonada
    animValues.forEach((anim, index) => {
      Animated.spring(anim, {
        toValue: 1,
        delay: index * 80,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }).start();
    });
  }, [animValues]);

  const helpItems = [
    {
      icon: 'alert-circle',
      title: 'Reportar Inconvenientes',
      subtitle: 'Informa problemas técnicos',
      color: colors.ERROR,
      onPress: () => navigation.navigate('IncidentsListScreen'),
    },
    {
      icon: 'message-text',
      title: 'Ayúdanos a mejorar',
      subtitle: 'Envía tus sugerencias',
      color: colors.ACCENT,
      onPress: () => navigation.navigate('FeedbackScreen'),
    },
    {
      icon: 'email',
      title: 'Contacto',
      subtitle: 'Ponte en contacto con nosotros',
      color: colors.PRIMARY,
      onPress: null, // Implementar más adelante
    },
    {
      icon: 'information',
      title: 'Acerca de SENERGY',
      subtitle: 'Información de la app',
      color: colors.SUCCESS,
      onPress: null, // Implementar más adelante
    },
  ];

  return (
    <View style={[styles.section, { backgroundColor: colors.CARD, borderColor: colors.BORDER }]}>
      {/* Header mejorado */}
      <View style={styles.headerContainer}>
        <View style={[styles.headerIconBg, { backgroundColor: `${colors.SUCCESS}15` }]}>
          <Icon name="help-circle" size={18} color={colors.SUCCESS} />
        </View>
        <View>
          <Text style={[styles.sectionTitle, { color: colors.TEXT_DARK }]}>
            Ayuda y Soporte
          </Text>
          <Text style={[styles.sectionSubtitle, { color: colors.TEXT_LIGHT }]}>
            ¿Necesitas ayuda?
          </Text>
        </View>
      </View>

      {/* Items con animación */}
      {helpItems.map((item, index) => {
        const translateY = animValues[index].interpolate({
          inputRange: [0, 1],
          outputRange: [20, 0],
        });

        return (
          <Animated.View
            key={index}
            style={[
              {
                opacity: animValues[index],
                transform: [{ translateY }],
              },
            ]}
          >
            <TouchableOpacity
              style={[styles.helpItem, { backgroundColor: colors.BACKGROUND }]}
              onPress={item.onPress}
              activeOpacity={item.onPress ? 0.7 : 1}
              disabled={!item.onPress}
            >
              <View style={[styles.iconContainer, { backgroundColor: `${item.color}15` }]}>
                <Icon name={item.icon} size={20} color={item.color} />
              </View>
              <View style={styles.helpContent}>
                <Text style={[styles.helpTitle, { color: colors.TEXT_DARK }]}>
                  {item.title}
                </Text>
                <Text style={[styles.helpSubtitle, { color: colors.TEXT_LIGHT }]}>
                  {item.subtitle}
                </Text>
              </View>
              <Icon name="chevron-right" size={20} color={colors.TEXT_LIGHT} />
            </TouchableOpacity>
          </Animated.View>
        );
      })}
    </View>
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
  helpItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.sm,
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
  helpContent: {
    flex: 1,
  },
  helpTitle: {
    fontSize: TYPOGRAPHY.sizes.base,
    fontWeight: TYPOGRAPHY.weights.semibold,
    letterSpacing: 0.2,
  },
  helpSubtitle: {
    fontSize: TYPOGRAPHY.sizes.xs,
    marginTop: SPACING.xs / 2,
    fontWeight: TYPOGRAPHY.weights.medium,
  },
});