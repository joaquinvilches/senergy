import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  Switch,
} from 'react-native';
import { useDarkMode } from '../utils/darkModeContext';
import { showToast } from '../utils/toastUtils';
import { getCurrentUser, logoutUser } from '../services/authService';
import { getUserMeters, getMeterReadings } from '../services/meterService';
import { formatCurrency } from '../utils/calculations';
import moment from 'moment';

export const ProfileScreen = ({ navigation }) => {
  const { colors, isDarkMode, toggleDarkMode } = useDarkMode();
  
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [savingsData, setSavingsData] = useState(null);
  const [loadingMetrics, setLoadingMetrics] = useState(true);

  useEffect(() => {
    loadUser();
    loadSavingsMetrics();
  }, []);

  const loadUser = () => {
    const currentUser = getCurrentUser();
    setUser(currentUser);
  };

  const loadSavingsMetrics = async () => {
    try {
      setLoadingMetrics(true);
      const user = getCurrentUser();
      if (!user) return;

      const meters = await getUserMeters(user.uid);
      let currentMonthTotal = 0;
      let previousMonthTotal = 0;
      let currentMonthCost = 0;
      let previousMonthCost = 0;

      const currentMonth = moment().format('YYYY-MM');
      const previousMonth = moment().subtract(1, 'month').format('YYYY-MM');

      for (const meter of meters) {
        const readings = await getMeterReadings(user.uid, meter.id);

        readings.forEach((reading) => {
          if (reading.consumption && reading.consumption > 0) {
            const readingMonth = moment(reading.date.toDate()).format('YYYY-MM');

            if (readingMonth === currentMonth) {
              currentMonthTotal += reading.consumption;
              currentMonthCost += reading.cost || 0;
            } else if (readingMonth === previousMonth) {
              previousMonthTotal += reading.consumption;
              previousMonthCost += reading.cost || 0;
            }
          }
        });
      }

      const consumptionDiff = previousMonthTotal - currentMonthTotal;
      const costDiff = previousMonthCost - currentMonthCost;
      const savingsPercentage = previousMonthTotal
        ? ((consumptionDiff / previousMonthTotal) * 100).toFixed(1)
        : 0;

      setSavingsData({
        currentMonthConsumption: currentMonthTotal,
        previousMonthConsumption: previousMonthTotal,
        currentMonthCost: currentMonthCost,
        previousMonthCost: previousMonthCost,
        consumptionDiff,
        costDiff,
        savingsPercentage,
        isSavings: consumptionDiff > 0,
      });
    } catch (error) {
      console.log('Error loading savings metrics:', error);
    } finally {
      setLoadingMetrics(false);
    }
  };

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
        {/* Encabezado */}
        <View style={[styles.header, { backgroundColor: colors.PRIMARY }]}>
          <View style={[styles.avatar, { backgroundColor: colors.ACCENT }]}>
            <Text style={styles.avatarText}>👤</Text>
          </View>
          <View style={styles.userInfo}>
            <Text style={[styles.userName, { color: colors.WHITE }]}>Mi Cuenta</Text>
            <Text style={[styles.userEmail, { color: 'rgba(255,255,255,0.8)' }]}>
              {user.email}
            </Text>
          </View>
        </View>

        {/* Indicador de Ahorro */}
        {!loadingMetrics && savingsData && (
          <View style={[styles.savingsContainer, { backgroundColor: colors.WHITE }]}>
            <View style={styles.savingsHeader}>
              <Text style={[styles.savingsTitle, { color: colors.PRIMARY }]}>
                💰 Indicador de Ahorro
              </Text>
              {savingsData.isSavings && <Text style={styles.celebrationEmoji}>🎉</Text>}
            </View>

            {savingsData.isSavings ? (
              <>
                <View
                  style={[styles.savingsBanner, { backgroundColor: '#D1FAE515' }]}
                >
                  <Text style={[styles.savingsBannerText, { color: '#10B981' }]}>
                    ¡Excelente! Estás ahorrando este mes
                  </Text>
                </View>

                <View style={styles.savingsMetric}>
                  <Text style={[styles.savingsLabel, { color: colors.TEXT_LIGHT }]}>
                    Ahorro de consumo:
                  </Text>
                  <Text style={[styles.savingsValue, { color: '#10B981' }]}>
                    {savingsData.consumptionDiff} kWh (-{savingsData.savingsPercentage}%)
                  </Text>
                </View>

                <View style={styles.savingsMetric}>
                  <Text style={[styles.savingsLabel, { color: colors.TEXT_LIGHT }]}>
                    Ahorro de dinero:
                  </Text>
                  <Text style={[styles.savingsValue, { color: '#10B981' }]}>
                    {formatCurrency(savingsData.costDiff)}
                  </Text>
                </View>
              </>
            ) : (
              <>
                <View
                  style={[styles.savingsBanner, { backgroundColor: '#FEE2E215' }]}
                >
                  <Text style={[styles.savingsBannerText, { color: '#EF4444' }]}>
                    Tu consumo aumentó este mes
                  </Text>
                </View>

                <View style={styles.savingsMetric}>
                  <Text style={[styles.savingsLabel, { color: colors.TEXT_LIGHT }]}>
                    Aumento de consumo:
                  </Text>
                  <Text style={[styles.savingsValue, { color: '#EF4444' }]}>
                    +{Math.abs(savingsData.consumptionDiff)} kWh (+{Math.abs(savingsData.savingsPercentage)}%)
                  </Text>
                </View>

                <View style={styles.savingsMetric}>
                  <Text style={[styles.savingsLabel, { color: colors.TEXT_LIGHT }]}>
                    Gasto adicional:
                  </Text>
                  <Text style={[styles.savingsValue, { color: '#EF4444' }]}>
                    +{formatCurrency(Math.abs(savingsData.costDiff))}
                  </Text>
                </View>

                <View
                  style={[styles.tipsBox, { backgroundColor: '#FEF3C715' }]}
                >
                  <Text style={[styles.tipsText, { color: '#92400E' }]}>
                    💡 Intenta reducir el uso de equipos de climatización y revisa que no haya
                    electrodomésticos defectuosos.
                  </Text>
                </View>
              </>
            )}
          </View>
        )}

        {/* Sección de Información */}
        <View style={[styles.section, { backgroundColor: colors.WHITE }]}>
          <Text style={[styles.sectionTitle, { color: colors.PRIMARY }]}>Información</Text>

          <View style={[styles.infoItem, { backgroundColor: colors.BACKGROUND }]}>
            <Text style={[styles.infoLabel, { color: colors.TEXT_LIGHT }]}>Email</Text>
            <Text style={[styles.infoValue, { color: colors.TEXT_DARK }]}>
              {user.email}
            </Text>
          </View>

          <View style={[styles.infoItem, { backgroundColor: colors.BACKGROUND }]}>
            <Text style={[styles.infoLabel, { color: colors.TEXT_LIGHT }]}>Usuario ID</Text>
            <Text style={[styles.infoValue, { color: colors.TEXT_DARK }]}>
              {user.uid.substring(0, 16)}...
            </Text>
          </View>

          <View style={[styles.infoItem, { backgroundColor: colors.BACKGROUND }]}>
            <Text style={[styles.infoLabel, { color: colors.TEXT_LIGHT }]}>
              Cuenta creada
            </Text>
            <Text style={[styles.infoValue, { color: colors.TEXT_DARK }]}>
              {user.metadata?.creationTime
                ? new Date(user.metadata.creationTime).toLocaleDateString('es-CL')
                : 'Información no disponible'}
            </Text>
          </View>
        </View>

        {/* Sección de Configuración */}
        <View style={[styles.section, { backgroundColor: colors.WHITE }]}>
          <Text style={[styles.sectionTitle, { color: colors.PRIMARY }]}>
            Configuración
          </Text>

          <View
            style={[
              styles.settingItem,
              { backgroundColor: colors.BACKGROUND, borderBottomColor: colors.BACKGROUND },
            ]}
          >
            <View style={styles.settingLeft}>
              <Text style={[styles.settingText, { color: colors.TEXT_DARK }]}>
                🌙 Modo Oscuro
              </Text>
              <Text style={[styles.settingDescription, { color: colors.TEXT_LIGHT }]}>
                {isDarkMode ? 'Activado' : 'Desactivado'}
              </Text>
            </View>
            <Switch
              value={isDarkMode}
              onValueChange={toggleDarkMode}
              trackColor={{ false: '#D1D5DB', true: colors.ACCENT }}
              thumbColor={isDarkMode ? colors.PRIMARY : '#F3F4F6'}
            />
          </View>

          <TouchableOpacity
            style={[styles.settingItem, { backgroundColor: colors.BACKGROUND }]}
          >
            <Text style={[styles.settingText, { color: colors.TEXT_DARK }]}>
              ⚙️ Preferencias
            </Text>
            <Text style={styles.arrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.settingItem, { backgroundColor: colors.BACKGROUND }]}
          >
            <Text style={[styles.settingText, { color: colors.TEXT_DARK }]}>
              🔔 Notificaciones
            </Text>
            <Text style={styles.arrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.settingItem, { backgroundColor: colors.BACKGROUND }]}
          >
            <Text style={[styles.settingText, { color: colors.TEXT_DARK }]}>
              📋 Términos y Condiciones
            </Text>
            <Text style={styles.arrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.settingItem, { backgroundColor: colors.BACKGROUND }]}
          >
            <Text style={[styles.settingText, { color: colors.TEXT_DARK }]}>
              🔒 Política de Privacidad
            </Text>
            <Text style={styles.arrow}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Sección de Ayuda */}
        <View style={[styles.section, { backgroundColor: colors.WHITE }]}>
          <Text style={[styles.sectionTitle, { color: colors.PRIMARY }]}>Ayuda</Text>

          <TouchableOpacity
            style={[styles.settingItem, { backgroundColor: colors.BACKGROUND }]}
          >
            <Text style={[styles.settingText, { color: colors.TEXT_DARK }]}>
              ❓ Preguntas frecuentes
            </Text>
            <Text style={styles.arrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.settingItem, { backgroundColor: colors.BACKGROUND }]}
          >
            <Text style={[styles.settingText, { color: colors.TEXT_DARK }]}>
              📧 Contacto
            </Text>
            <Text style={styles.arrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.settingItem, { backgroundColor: colors.BACKGROUND }]}
          >
            <Text style={[styles.settingText, { color: colors.TEXT_DARK }]}>
              ℹ️ Acerca de SENERGY
            </Text>
            <Text style={styles.arrow}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Botón de logout */}
        <TouchableOpacity
          style={[styles.logoutButton, { backgroundColor: '#EF4444' }, loading && styles.buttonDisabled]}
          onPress={handleLogout}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={colors.WHITE} />
          ) : (
            <Text style={styles.logoutButtonText}>🚪 Cerrar sesión</Text>
          )}
        </TouchableOpacity>

        {/* Pie de página */}
        <View style={[styles.footer, { borderTopColor: colors.BACKGROUND }]}>
          <Text style={[styles.footerText, { color: colors.PRIMARY }]}>SENERGY v1.0.0</Text>
          <Text style={[styles.footerSubtext, { color: colors.TEXT_LIGHT }]}>
            Controla tu consumo energético
          </Text>
        </View>
      </ScrollView>
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
  header: {
    paddingVertical: 24,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarText: {
    fontSize: 32,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  userEmail: {
    fontSize: 12,
    marginTop: 4,
  },
  savingsContainer: {
    marginHorizontal: 12,
    marginVertical: 16,
    borderRadius: 12,
    padding: 16,
  },
  savingsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  savingsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  celebrationEmoji: {
    fontSize: 24,
  },
  savingsBanner: {
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 12,
  },
  savingsBannerText: {
    fontSize: 13,
    fontWeight: '600',
  },
  savingsMetric: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  savingsLabel: {
    fontSize: 13,
  },
  savingsValue: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  tipsBox: {
    borderRadius: 8,
    padding: 12,
    marginTop: 12,
  },
  tipsText: {
    fontSize: 12,
    lineHeight: 18,
  },
  section: {
    marginHorizontal: 12,
    marginVertical: 12,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  infoItem: {
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 11,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 12,
    marginBottom: 8,
    borderRadius: 8,
  },
  settingLeft: {
    flex: 1,
  },
  settingText: {
    fontSize: 14,
  },
  settingDescription: {
    fontSize: 11,
    marginTop: 4,
  },
  arrow: {
    fontSize: 16,
  },
  logoutButton: {
    marginHorizontal: 12,
    marginVertical: 20,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  logoutButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  footer: {
    paddingVertical: 20,
    paddingHorizontal: 16,
    alignItems: 'center',
    borderTopWidth: 1,
    marginTop: 20,
    marginBottom: 20,
  },
  footerText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  footerSubtext: {
    fontSize: 11,
    marginTop: 4,
  },
});