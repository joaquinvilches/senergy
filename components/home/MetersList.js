import React from 'react';
import { FlatList, StyleSheet, RefreshControl } from 'react-native';
import { useDarkMode } from '../../utils/darkModeContext';
import { SPACING } from '../../constants/theme';
import { MeterCard } from '../MeterCard';

/**
 * Lista de medidores con pull-to-refresh
 */
export const MetersList = ({
  meters,
  onMeterPress,
  onMeterDelete,
  refreshing,
  onRefresh,
}) => {
  const { colors } = useDarkMode();

  return (
    <FlatList
      data={meters}
      keyExtractor={(item) => item.id}
      renderItem={({ item, index }) => (
        <MeterCard
          meter={item}
          onPress={() => onMeterPress(item.id)}
          onDelete={() => onMeterDelete(item.id, item.name)}
          index={index}
        />
      )}
      contentContainerStyle={styles.list}
      scrollEnabled={true}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={[colors.PRIMARY]}
          tintColor={colors.PRIMARY}
        />
      }
    />
  );
};

const styles = StyleSheet.create({
  list: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    paddingBottom: SPACING.xl,
  },
});
