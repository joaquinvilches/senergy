import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import moment from 'moment';
import { SPACING, TYPOGRAPHY, RADIUS } from '../constants/theme';

/**
 * Selector horizontal de meses
 */
export const MonthSelector = ({ availableMonths, selectedMonth, onSelectMonth, colors }) => {
  if (availableMonths.length === 0) return null;

  return (
    <View style={[styles.container, { backgroundColor: colors.CARD, borderColor: colors.BORDER }]}>
      <Text style={[styles.title, { color: colors.TEXT_DARK }]}>
        Selecciona mes:
      </Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.scroll}
      >
        {availableMonths.map((month) => {
          const isSelected = month === selectedMonth;
          return (
            <TouchableOpacity
              key={month}
              style={[
                styles.monthButton,
                {
                  backgroundColor: isSelected ? colors.PRIMARY : colors.BACKGROUND,
                  borderColor: colors.ACCENT,
                },
              ]}
              onPress={() => onSelectMonth(month)}
            >
              <Text
                style={[
                  styles.monthButtonText,
                  { color: isSelected ? '#FFFFFF' : colors.TEXT_DARK },
                ]}
              >
                {moment(month).format('MMM YYYY')}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: SPACING.md,
    marginVertical: SPACING.sm,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
  },
  title: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.semibold,
    marginBottom: SPACING.sm,
  },
  scroll: {
    flexGrow: 0,
  },
  monthButton: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.xl,
    marginRight: SPACING.sm,
    borderWidth: 1,
  },
  monthButtonText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
});