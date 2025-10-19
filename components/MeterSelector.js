import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useDarkMode } from '../utils/darkModeContext';

export const MeterSelector = ({ meters, selectedMeterId, onSelectMeter }) => {
  const { colors } = useDarkMode();

  if (!meters || meters.length === 0) {
    return null;
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.WHITE }]}>
      <Text style={[styles.label, { color: colors.TEXT_LIGHT }]}>Selecciona medidor:</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.scrollView}
      >
        {meters.map((meter) => {
          const isSelected = meter.id === selectedMeterId;
          return (
            <TouchableOpacity
              key={meter.id}
              style={[
                styles.meterButton,
                {
                  backgroundColor: isSelected ? colors.PRIMARY : colors.BACKGROUND,
                  borderColor: isSelected ? colors.PRIMARY : colors.BACKGROUND,
                },
              ]}
              onPress={() => onSelectMeter(meter.id)}
            >
              <Text
                style={[
                  styles.meterButtonText,
                  {
                    color: isSelected ? colors.WHITE : colors.TEXT_DARK,
                    fontWeight: isSelected ? 'bold' : '600',
                  },
                ]}
              >
                {meter.name}
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
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
  },
  scrollView: {
    flexGrow: 0,
  },
  meterButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
  },
  meterButtonText: {
    fontSize: 13,
  },
});