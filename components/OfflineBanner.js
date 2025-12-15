import React from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { useNetworkStatus } from '../hooks/useNetworkStatus';
import { useDarkMode } from '../utils/darkModeContext';

const OfflineBanner = () => {
  const { isOnline } = useNetworkStatus();
  const { colors } = useDarkMode();
  const [fadeAnim] = React.useState(new Animated.Value(0));

  React.useEffect(() => {
    if (!isOnline) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [isOnline]);

  if (isOnline) {
    return null;
  }

  return (
    <Animated.View
      style={[
        styles.banner,
        {
          backgroundColor: '#F59E0B',
          opacity: fadeAnim,
        },
      ]}
    >
      <Text style={styles.bannerText}>
        📡 Sin conexión - Trabajando en modo offline
      </Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  banner: {
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default OfflineBanner;
