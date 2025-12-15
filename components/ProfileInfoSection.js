import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { useDarkMode } from '../utils/darkModeContext';
import { showToast } from '../utils/toastUtils';
import { SPACING, TYPOGRAPHY, RADIUS, ELEVATION } from '../constants/theme';
import Icon from './Icon';

export const ProfileInfoSection = ({ user, totalReadings = 0 }) => {
  const { colors } = useDarkMode();
  const [copiedUID, setCopiedUID] = useState(false);
  const animValues = useRef([
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
  ]).current;

  useEffect(() => {
    // Animación escalonada de entrada
    animValues.forEach((anim, index) => {
      Animated.spring(anim, {
        toValue: 1,
        delay: index * 100,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }).start();
    });
  }, [animValues]);

  const handleCopyUID = async () => {
    await Clipboard.setStringAsync(user.uid);
    setCopiedUID(true);
    showToast('UID copiado al portapapeles', 'success');
    setTimeout(() => setCopiedUID(false), 2000);
  };

  const infoItems = [
    {
      icon: 'email-outline',
      label: 'Correo electrónico',
      value: user.email,
      color: colors.PRIMARY,
    },
    {
      icon: 'identifier',
      label: 'ID de Usuario',
      value: user.uid.substring(0, 16) + '...',
      color: colors.ACCENT,
      actionIcon: copiedUID ? 'check' : 'content-copy',
      onAction: handleCopyUID,
    },
    {
      icon: 'calendar-account',
      label: 'Cuenta creada',
      value: user.metadata?.creationTime
        ? new Date(user.metadata.creationTime).toLocaleDateString('es-CL', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })
        : 'No disponible',
      color: colors.SUCCESS,
    },
  ];

  return (
    <View style={[styles.section, { backgroundColor: colors.CARD, borderColor: colors.BORDER }]}>
      {/* Header mejorado */}
      <View style={styles.headerContainer}>
        <View style={[styles.headerIconBg, { backgroundColor: `${colors.PRIMARY}15` }]}>
          <Icon name="account-details" size={18} color={colors.PRIMARY} />
        </View>
        <View>
          <Text style={[styles.sectionTitle, { color: colors.TEXT_DARK }]}>
            Información Personal
          </Text>
          <Text style={[styles.sectionSubtitle, { color: colors.TEXT_LIGHT }]}>
            Datos de tu cuenta
          </Text>
        </View>
      </View>

      {/* Items con animación escalonada */}
      {infoItems.map((item, index) => {
        const translateY = animValues[index].interpolate({
          inputRange: [0, 1],
          outputRange: [20, 0],
        });

        return (
          <Animated.View
            key={index}
            style={[
              styles.infoItem,
              {
                backgroundColor: colors.BACKGROUND,
                opacity: animValues[index],
                transform: [{ translateY }],
              },
            ]}
          >
            <View style={[styles.iconContainer, { backgroundColor: `${item.color}15` }]}>
              <Icon name={item.icon} size={20} color={item.color} />
            </View>
            <View style={styles.infoContent}>
              <Text style={[styles.infoLabel, { color: colors.TEXT_LIGHT }]}>
                {item.label}
              </Text>
              <Text
                style={[styles.infoValue, { color: colors.TEXT_DARK }]}
                numberOfLines={1}
                ellipsizeMode="middle"
              >
                {item.value}
              </Text>
            </View>
            {item.onAction && (
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: `${item.color}15` }]}
                onPress={item.onAction}
                activeOpacity={0.7}
              >
                <Icon
                  name={item.actionIcon}
                  size={18}
                  color={copiedUID ? colors.SUCCESS : item.color}
                />
              </TouchableOpacity>
            )}
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
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: TYPOGRAPHY.sizes.xs,
    marginBottom: SPACING.xs / 2,
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  infoValue: {
    fontSize: TYPOGRAPHY.sizes.base,
    fontWeight: TYPOGRAPHY.weights.semibold,
    letterSpacing: 0.2,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: SPACING.sm,
  },
});