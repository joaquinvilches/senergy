import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useDarkMode } from '../../utils/darkModeContext';
import { SPACING, TYPOGRAPHY, RADIUS } from '../../constants/theme';
import Icon from '../Icon';

export const MeterFilterChips = ({ meters, selectedMeter, onMeterChange, readingsCounts }) => {
  const { colors } = useDarkMode();

  // Calcular total de lecturas para "Todos"
  const totalReadings = readingsCounts ? Object.values(readingsCounts).reduce((sum, count) => sum + count, 0) : 0;

  return (
    <View style={[styles.container, { backgroundColor: colors.CARD, borderColor: colors.BORDER }]}>
      <View style={styles.header}>
        <Icon name="filter-outline" size={16} color={colors.PRIMARY} style={styles.headerIcon} />
        <Text style={[styles.headerText, { color: colors.TEXT_DARK }]}>Filtrar por medidor</Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Opción "Todos" */}
        <TouchableOpacity
          style={[
            styles.meterChip,
            {
              backgroundColor: selectedMeter === 'all' ? colors.ACCENT : colors.BACKGROUND,
              borderColor: selectedMeter === 'all' ? colors.ACCENT : colors.BORDER,
            },
          ]}
          onPress={() => onMeterChange('all')}
          activeOpacity={0.7}
        >
          <Icon
            name="view-dashboard"
            size={16}
            color={selectedMeter === 'all' ? '#FFFFFF' : colors.TEXT_LIGHT}
            style={styles.chipIcon}
          />
          <Text
            style={[
              styles.chipText,
              { color: selectedMeter === 'all' ? '#FFFFFF' : colors.TEXT_DARK },
            ]}
          >
            Todos
          </Text>
          {totalReadings > 0 && (
            <View
              style={[
                styles.badge,
                { backgroundColor: selectedMeter === 'all' ? 'rgba(255,255,255,0.3)' : colors.PRIMARY },
              ]}
            >
              <Text
                style={[
                  styles.badgeText,
                  { color: selectedMeter === 'all' ? '#FFFFFF' : '#FFFFFF' },
                ]}
              >
                {totalReadings}
              </Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Chips de medidores */}
        {meters.map((meter) => {
          const count = readingsCounts?.[meter.id] || 0;
          return (
            <TouchableOpacity
              key={meter.id}
              style={[
                styles.meterChip,
                {
                  backgroundColor: selectedMeter === meter.id ? colors.PRIMARY : colors.BACKGROUND,
                  borderColor: selectedMeter === meter.id ? colors.PRIMARY : colors.BORDER,
                },
              ]}
              onPress={() => onMeterChange(meter.id)}
              activeOpacity={0.7}
            >
              <Icon
                name="lightning-bolt"
                size={16}
                color={selectedMeter === meter.id ? '#FFFFFF' : colors.PRIMARY}
                style={styles.chipIcon}
              />
              <Text
                style={[
                  styles.chipText,
                  { color: selectedMeter === meter.id ? '#FFFFFF' : colors.TEXT_DARK },
                ]}
                numberOfLines={1}
              >
                {meter.name}
              </Text>
              {count > 0 && (
                <View
                  style={[
                    styles.badge,
                    { backgroundColor: selectedMeter === meter.id ? 'rgba(255,255,255,0.3)' : colors.ACCENT },
                  ]}
                >
                  <Text
                    style={[
                      styles.badgeText,
                      { color: '#FFFFFF' },
                    ]}
                  >
                    {count}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.sm,
  },
  headerIcon: {
    marginRight: SPACING.xs,
  },
  headerText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  scrollContent: {
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.md,
    gap: SPACING.sm,
  },
  meterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm + 2,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.md,
    borderWidth: 2,
    marginRight: SPACING.xs,
    maxWidth: 180,
  },
  chipIcon: {
    marginRight: SPACING.xs,
  },
  chipText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.semibold,
    marginRight: SPACING.xs,
  },
  badge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.xs,
  },
  badgeText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
});
