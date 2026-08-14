import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDarkMode } from '../utils/darkModeContext';
import { showToast } from '../utils/toastUtils';
import { logoutUser } from '../services/authService';
import { useProfileData } from '../hooks/useProfileData';
import { ProfileHeader } from '../components/ProfileHeader';
import { SavingsCard } from '../components/SavingsCard';
import { ProfileInfoSection } from '../components/ProfileInfoSection';
import { SettingsSection } from '../components/SettingsSection';
import { HelpSection } from '../components/HelpSection';
import { SPACING, TYPOGRAPHY, RADIUS } from '../constants/theme';
import Button from '../components/ui/Button';
import { AdBanner } from '../components/AdBanner';
import { AD_UNIT_IDS } from '../services/adsService';

export const ProfileScreen = ({ navigation }) => {
  const { colors } = useDarkMode();
  const { user, savingsData, loadingMetrics, totalMeters, totalReadings } = useProfileData();
  const [loading, setLoading] = useState(false);

  const handleLogout = () => {
    Alert.alert(
      'Cerrar sesión',
      '¿Estás seguro de que deseas cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Cerrar sesión',
          onPress: async () => {
            try {
              setLoading(true);
              await logoutUser();
              showToast('Sesión cerrada correctamente', 'success');
            } catch (error) {
              showToast('Error al cerrar sesión', 'error');
            } finally {
              setLoading(false);
            }
          },
          style: 'destructive',
        },
      ]
    );
  };

  if (!user) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.BACKGROUND }]}>
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={colors.PRIMARY} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.BACKGROUND }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <ProfileHeader user={user} totalMeters={totalMeters} totalReadings={totalReadings} />

        <SavingsCard savingsData={savingsData} loadingMetrics={loadingMetrics} />

        <ProfileInfoSection user={user} totalReadings={totalReadings} />

        <SettingsSection />

        <HelpSection navigation={navigation} />

        <View style={styles.logoutButtonContainer}>
          <Button
            title="Cerrar sesión"
            onPress={handleLogout}
            variant="danger"
            size="lg"
            iconLeft="logout"
            loading={loading}
            disabled={loading}
            fullWidth
          />
        </View>

        <View style={[styles.footer, { borderTopColor: colors.BORDER }]}>
          <TouchableOpacity
            style={styles.legalButton}
            onPress={() => navigation.navigate('LegalScreen')}
          >
            <Text style={[styles.legalButtonText, { color: colors.TEXT_LIGHT }]}>
              Términos y Privacidad
            </Text>
          </TouchableOpacity>

          <Text style={[styles.footerText, { color: colors.PRIMARY }]}>SENERGY v1.0.0</Text>
          <Text style={[styles.footerSubtext, { color: colors.TEXT_LIGHT }]}>
            Controla tu consumo energético
          </Text>
        </View>
      </ScrollView>

      {/* Banner publicitario (solo usuarios FREE) */}
      <AdBanner adUnitId={AD_UNIT_IDS.BANNER_PROFILE} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoutButtonContainer: {
    marginHorizontal: SPACING.md,
    marginVertical: SPACING.xl,
  },
  footer: {
    paddingVertical: SPACING.xl,
    paddingHorizontal: SPACING.lg,
    alignItems: 'center',
    borderTopWidth: 1,
    marginTop: SPACING.xl,
    marginBottom: SPACING.xl,
  },
  legalButton: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.md,
  },
  legalButtonText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    textDecorationLine: 'underline',
  },
  footerText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  footerSubtext: {
    fontSize: TYPOGRAPHY.sizes.xs,
    marginTop: SPACING.xs,
  },
});