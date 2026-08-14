import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Alert,
  Keyboard,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDarkMode } from '../utils/darkModeContext';
import { showToast } from '../utils/toastUtils';
import { addReading, updateMeter, getUserMeters, updateReading } from '../services/meterService';
import { getCurrentUser } from '../services/authService';
import { calculateConsumption, calculateCost } from '../utils/calculations';
import { parseChileanNumber, formatKWh, formatCLP, getNumberPlaceholder } from '../utils/formatHelpers';
import { ChileanNumberInput } from '../components/ChileanNumberInput';
import { HelpIcon } from '../components/HelpIcon';
import { useNetworkStatus } from '../hooks/useNetworkStatus';
import { capturePhoto, compressImage, uploadMeterPhoto } from '../services/imageService';
import moment from 'moment';
import { SPACING, TYPOGRAPHY, RADIUS, ELEVATION } from '../constants/theme';
import Icon from '../components/Icon';
import Button from '../components/ui/Button';
import { useSubscription } from '../hooks/useSubscription';
import { Paywall } from '../components/Paywall';

export const NewReadingScreen = ({ route, navigation }) => {
  const { meterId } = route.params;
  const { colors } = useDarkMode();
  const { isConnected } = useNetworkStatus();
  const { checkCanCreateReading, checkCanTakePhoto, isPremium } = useSubscription();

  const [readingValue, setReadingValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(null);
  const [meterData, setMeterData] = useState(null);
  const [photoUri, setPhotoUri] = useState(null);
  const [photoURL, setPhotoURL] = useState(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const [paywallFeature, setPaywallFeature] = useState('');
  const [paywallReason, setPaywallReason] = useState('');

  // --- Util: toast seguro (si no hay Toast montado, usa Alert) ---
  const safeToast = useCallback((message, type = 'info') => {
    try {
      showToast(message, type);
    } catch {
      const title =
        type === 'error' ? 'Error' : type === 'warning' ? 'Atención' : 'Información';
      Alert.alert(title, message);
    }
  }, []);

  useEffect(() => {
    loadMeterData();
  }, []);

  const loadMeterData = useCallback(async () => {
    try {
      const user = getCurrentUser();
      if (!user?.uid) return;
      const userMeters = await getUserMeters(user.uid);
      const meter = userMeters.find((m) => m.id === meterId);
      setMeterData(meter || null);
    } catch (error) {
      console.error('Error loading meter data:', error);
      safeToast('No se pudo cargar el medidor', 'error');
    }
  }, [meterId, safeToast]);

  const validateReading = useCallback(
    (value) => {
      const raw = (value || '').toString().trim();
      if (!raw) {
        safeToast('Por favor ingresa el valor del medidor', 'error');
        return false;
      }

      // Usar parser chileno que acepta puntos (miles) y comas (decimales)
      const parsed = parseChileanNumber(raw);
      if (parsed === null || !Number.isFinite(parsed)) {
        safeToast(
          'Ingresa un número entero válido. Ejemplo: 38245 o 38.245',
          'error'
        );
        return false;
      }

      if (parsed <= 0) {
        safeToast('El valor del medidor debe ser mayor a cero', 'error');
        return false;
      }

      // Validar rango máximo razonable
      if (parsed > 999999) {
        safeToast('El valor ingresado es demasiado alto. Revisa que sea correcto.', 'error');
        return false;
      }

      if (!meterData) {
        safeToast('Cargando información del medidor...', 'warning');
        return false;
      }

      if (parsed <= meterData.lastReading) {
        safeToast(
          `El medidor debe haber avanzado. El valor anterior fue ${formatKWh(meterData.lastReading, 0)}. Ingresa un número mayor.`,
          'error'
        );
        return false;
      }

      const increment = parsed - meterData.lastReading;

      // Validar incremento mínimo (evitar errores de lectura)
      if (increment < 0.01) {
        safeToast(
          'El consumo es muy pequeño (menor a 0,01 kWh). Revisa el valor ingresado.',
          'error'
        );
        return false;
      }

      // Validar incremento máximo
      if (increment > 5000) {
        Alert.alert(
          '¿Estás seguro?',
          `El consumo sería de ${formatKWh(increment, 0)}, que es muy alto. ¿El valor ${formatKWh(parsed, 0)} es correcto?`,
          [
            { text: 'No, revisar', style: 'cancel' },
            { text: 'Sí, continuar', onPress: () => handlePreview() }
          ]
        );
        return false;
      }

      return true;
    },
    [meterData, safeToast]
  );

  const handleAddReading = useCallback(async () => {
    if (!validateReading(readingValue) || !meterData) return;

    // VERIFICAR LÍMITE DE LECTURAS MENSUALES
    const canCreate = await checkCanCreateReading(meterId);
    if (!canCreate.canCreate) {
      setPaywallFeature('lecturas ilimitadas');
      setPaywallReason(canCreate.reason);
      setShowPaywall(true);
      return;
    }

    // cierra teclado para mejor UX
    Keyboard.dismiss();
    setLoading(true);

    try {
      const user = getCurrentUser();
      if (!user?.uid) throw new Error('Usuario no autenticado');

      const currentReading = parseChileanNumber(readingValue);
      if (currentReading === null) {
        throw new Error('Valor ingresado no válido');
      }

      const consumption = calculateConsumption(meterData.lastReading, currentReading);
      const costPerKwh = Number(meterData.costPerKwh || 0);
      const cost = calculateCost(consumption, costPerKwh);

      const readingData = {
        value: currentReading,
        consumption,
        cost,
        costPerKwh,
      };

      // 1. Guardar lectura primero (para obtener ID)
      const readingId = await addReading(user.uid, meterId, readingData);

      // 2. Si hay foto, comprimir y subir
      let uploadedPhotoURL = null;
      if (photoUri) {
        try {
          setUploadingPhoto(true);

          // Comprimir imagen
          const compressed = await compressImage(photoUri, 1024, 0.7);

          // Subir a Firebase Storage
          uploadedPhotoURL = await uploadMeterPhoto(
            compressed.uri,
            user.uid,
            meterId,
            readingId
          );

          // 3. Actualizar lectura con URL de foto
          await updateReading(user.uid, meterId, readingId, {
            photoURL: uploadedPhotoURL,
          });

          setPhotoURL(uploadedPhotoURL);
        } catch (photoError) {
          console.error('Error uploading photo:', photoError);
          // No fallar toda la lectura por error de foto
          safeToast('Lectura guardada, pero la foto no se pudo subir', 'warning');
        } finally {
          setUploadingPhoto(false);
        }
      }

      // 4. Actualizar última lectura del medidor
      await updateMeter(user.uid, meterId, {
        lastReading: currentReading,
        lastCost: cost,
      });

      // Feedback + volver
      const photoMsg = uploadedPhotoURL ? ' con foto' : '';
      safeToast(`¡Lectura guardada${photoMsg}! Consumo: ${formatKWh(consumption, 1)}`, 'success');
      setTimeout(() => {
        try {
          navigation.goBack();
        } catch (navError) {
          console.error('Error navigating back after saving reading:', navError);
        }
      }, 300);
    } catch (error) {
      console.error('Error adding reading:', error);
      safeToast(`No se pudo guardar la lectura: ${error?.message}`, 'error');
    } finally {
      setLoading(false);
    }
  }, [
    validateReading,
    readingValue,
    meterData,
    meterId,
    navigation,
    safeToast,
    photoUri
  ]);

  const handlePreview = useCallback(() => {
    if (!validateReading(readingValue) || !meterData) return;

    const currentReading = parseChileanNumber(readingValue);
    if (currentReading === null) return;

    const consumption = calculateConsumption(meterData.lastReading, currentReading);
    const costPerKwh = Number(meterData.costPerKwh || 0);
    const cost = calculateCost(consumption, costPerKwh);

    setPreview({
      lastReading: meterData.lastReading,
      currentReading,
      consumption,
      cost,
      costPerKwh,
    });
  }, [validateReading, readingValue, meterData]);

  const handleTakePhoto = useCallback(async () => {
    // VERIFICAR SI PUEDE TOMAR FOTOS (solo Premium)
    const canTakePhoto = await checkCanTakePhoto();
    if (!canTakePhoto) {
      setPaywallFeature('captura de fotos');
      setPaywallReason('La captura de fotos está disponible solo en el plan Premium');
      setShowPaywall(true);
      return;
    }

    // Validar conexión antes de permitir captura
    if (!isConnected) {
      safeToast('Necesitas conexión a internet para agregar fotos', 'warning');
      return;
    }

    setUploadingPhoto(true);
    try {
      const photo = await capturePhoto();

      if (photo) {
        // Guardar URI local para preview inmediato
        setPhotoUri(photo.uri);
        safeToast('Foto capturada. Se subirá al guardar la lectura', 'success');
      }
    } catch (error) {
      console.error('Error capturing photo:', error);

      if (error.message.includes('permiso')) {
        Alert.alert(
          'Permiso de cámara requerido',
          'SENERGY necesita acceso a tu cámara para tomar fotos del medidor. Ve a Configuración > SENERGY > Cámara y activa el permiso.',
          [{ text: 'Entendido' }]
        );
      } else {
        safeToast('No se pudo capturar la foto. Intenta nuevamente.', 'error');
      }
    } finally {
      setUploadingPhoto(false);
    }
  }, [isConnected, safeToast]);

  const handleRemovePhoto = useCallback(() => {
    Alert.alert(
      'Eliminar foto',
      '¿Deseas eliminar la foto capturada?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => {
            setPhotoUri(null);
            setPhotoURL(null);
            safeToast('Foto eliminada', 'info');
          }
        }
      ]
    );
  }, [safeToast]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.BACKGROUND }]}>
      <ScrollView style={styles.scrollView} keyboardShouldPersistTaps="handled">
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.PRIMARY }]}>Registrar Lectura</Text>
            <Text style={[styles.subtitle, { color: colors.TEXT_LIGHT }]}>
              ¿Cuánto marca tu medidor hoy?
            </Text>
          </View>

          {meterData && (
            <View
              style={[
                styles.infoBox,
                {
                  backgroundColor: colors.CARD,
                  borderColor: colors.BORDER,
                },
              ]}
            >
              <View style={styles.infoLabelRow}>
                <Icon name="information-outline" size={14} color={colors.TEXT_LIGHT} style={styles.infoIcon} />
                <Text style={[styles.infoLabel, { color: colors.TEXT_LIGHT }]}>
                  Lectura anterior registrada:
                </Text>
              </View>
              <Text style={[styles.infoValue, { color: colors.PRIMARY }]}>
                {formatKWh(meterData.lastReading, 0)}
              </Text>
              <Text style={[styles.infoHint, { color: colors.TEXT_LIGHT }]}>
                El nuevo valor debe ser mayor que este
              </Text>
            </View>
          )}

          <View style={styles.section}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Icon name="lightning-bolt" size={16} color={colors.PRIMARY} style={styles.labelIcon} />
              <Text style={[styles.label, { color: colors.TEXT_DARK }]}>
                Valor actual del medidor
              </Text>
              <HelpIcon
                title="¿Qué es el kWh?"
                message="kWh significa kilowatt-hora y es la unidad que mide cuánta electricidad consumes. Es como el 'kilometraje' de tu auto, pero para la energía.\n\nTu medidor de luz acumula este número continuamente. La diferencia entre tu lectura anterior y la actual es lo que has consumido en ese período."
              />
            </View>
            <ChileanNumberInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.WHITE,
                  color: colors.TEXT_DARK,
                  borderColor: colors.ACCENT,
                },
              ]}
              placeholder={getNumberPlaceholder('kwh')}
              placeholderTextColor={colors.TEXT_LIGHT}
              value={readingValue}
              onChangeValue={setReadingValue}
              decimals={1}
              editable={!loading}
              returnKeyType="done"
              onSubmitEditing={handlePreview}
            />
            <Text style={[styles.hint, { color: colors.TEXT_LIGHT }]}>
              Lee el número en la pantalla de tu medidor de luz.{'\n'}
              Las lecturas son números enteros. Puedes usar punto para miles (Ej: 38.245)
            </Text>
            <View style={styles.dateRow}>
              <Icon name="calendar-outline" size={14} color={colors.ACCENT} style={styles.dateIcon} />
              <Text style={[styles.hintDate, { color: colors.ACCENT }]}>
                {moment().format('dddd, DD [de] MMMM [de] YYYY • HH:mm')}
              </Text>
            </View>
          </View>

          {/* Sección de foto del medidor */}
          <View style={styles.photoSection}>
            <View style={styles.photoHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Icon name="camera-outline" size={16} color={colors.PRIMARY} style={styles.labelIcon} />
                <Text style={[styles.label, { color: colors.TEXT_DARK, marginBottom: 0 }]}>
                  Foto del medidor
                </Text>
                <View style={[styles.recommendedBadge, { backgroundColor: `${colors.ACCENT}20` }]}>
                  <Text style={[styles.recommendedText, { color: colors.ACCENT }]}>
                    Recomendado
                  </Text>
                </View>
              </View>
              <HelpIcon
                title="¿Por qué tomar foto?"
                message="Tomar una foto de tu medidor te ayuda a:\n\n• Verificar que ingresaste el número correcto\n• Tener evidencia visual de tu lectura\n• Resolver dudas futuras sobre consumos\n• Llevar un registro completo y confiable\n\nLa foto es opcional pero muy recomendada para mayor precisión."
              />
            </View>

            {!photoUri ? (
              <>
                <Button
                  title="Tomar foto del medidor"
                  onPress={handleTakePhoto}
                  variant="outline"
                  size="md"
                  iconLeft="camera"
                  disabled={loading || uploadingPhoto || !isConnected}
                  fullWidth
                />
                {!isConnected && (
                  <View style={[styles.offlineWarning, { backgroundColor: `${colors.WARNING}15`, borderColor: colors.WARNING }]}>
                    <Icon name="wifi-off" size={16} color={colors.WARNING} style={{ marginRight: SPACING.xs }} />
                    <Text style={[styles.offlineText, { color: colors.WARNING }]}>
                      Necesitas conexión para agregar fotos
                    </Text>
                  </View>
                )}
              </>
            ) : (
              <View style={styles.photoPreviewContainer}>
                <View style={[styles.photoPreview, { borderColor: colors.BORDER }]}>
                  <Image
                    source={{ uri: photoUri }}
                    style={styles.photoImage}
                    resizeMode="cover"
                  />
                  <TouchableOpacity
                    style={[styles.removePhotoButton, { backgroundColor: colors.ERROR }]}
                    onPress={handleRemovePhoto}
                    activeOpacity={0.8}
                  >
                    <Icon name="close" size={18} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>
                <View style={[styles.photoSuccessBox, { backgroundColor: `${colors.SUCCESS}15` }]}>
                  <Icon name="check-circle" size={16} color={colors.SUCCESS} style={{ marginRight: SPACING.xs }} />
                  <Text style={[styles.photoSuccessText, { color: colors.SUCCESS }]}>
                    Foto capturada. Se guardará con la lectura.
                  </Text>
                </View>
              </View>
            )}
          </View>

          {preview && (
            <View
              style={[
                styles.previewContainer,
                {
                  backgroundColor: colors.CARD,
                  borderColor: colors.PRIMARY,
                },
              ]}
            >
              <View style={styles.previewTitleRow}>
                <Icon name="information-outline" size={16} color={colors.PRIMARY} style={styles.previewIcon} />
                <Text style={[styles.previewTitle, { color: colors.PRIMARY }]}>
                  Resumen de tu consumo y costo
                </Text>
              </View>

              <View style={styles.previewRow}>
                <Text style={[styles.previewLabel, { color: colors.TEXT_LIGHT }]}>
                  Lectura anterior:
                </Text>
                <Text style={[styles.previewValue, { color: colors.TEXT_DARK }]}>
                  {formatKWh(preview.lastReading, 0)}
                </Text>
              </View>

              <View style={styles.previewRow}>
                <Text style={[styles.previewLabel, { color: colors.TEXT_LIGHT }]}>
                  Lectura nueva:
                </Text>
                <Text style={[styles.previewValue, { color: colors.TEXT_DARK }]}>
                  {formatKWh(preview.currentReading, 0)}
                </Text>
              </View>

              <View style={[styles.divider, { borderColor: colors.BORDER }]} />

              <View style={styles.previewRow}>
                <View style={styles.previewLabelRow}>
                  <Icon name="lightning-bolt" size={14} color={colors.ACCENT} style={styles.previewLabelIcon} />
                  <Text style={[styles.previewLabel, { color: colors.TEXT_LIGHT }]}>
                    Energía consumida:
                  </Text>
                </View>
                <Text style={[styles.previewValue, { color: colors.ACCENT, fontWeight: 'bold' }]}>
                  {formatKWh(preview.consumption, 1)}
                </Text>
              </View>

              <View style={styles.previewRow}>
                <Text style={[styles.previewLabel, { color: colors.TEXT_LIGHT }]}>
                  Tarifa por kWh:
                </Text>
                <Text style={[styles.previewValue, { color: colors.TEXT_DARK }]}>
                  {formatCLP(preview.costPerKwh)}/kWh
                </Text>
              </View>

              <View style={styles.previewRow}>
                <View style={styles.previewLabelRow}>
                  <Icon name="cash" size={14} color={colors.PRIMARY} style={styles.previewLabelIcon} />
                  <Text style={[styles.previewLabel, { color: colors.TEXT_LIGHT }]}>
                    Costo total:
                  </Text>
                </View>
                <Text
                  style={[
                    styles.previewValue,
                    { color: colors.PRIMARY, fontSize: 18, fontWeight: 'bold' },
                  ]}
                >
                  {formatCLP(preview.cost)}
                </Text>
              </View>

              <Text style={[styles.previewExplain, { color: colors.TEXT_LIGHT }]}>
                Este monto se sumará a tu cuenta de luz este mes
              </Text>
            </View>
          )}

          <View style={styles.buttons}>
            <View style={styles.buttonWrapper}>
              <Button
                title="Ver cálculo"
                onPress={handlePreview}
                variant="secondary"
                size="md"
                iconLeft="eye-outline"
                disabled={loading || !meterData}
                fullWidth
              />
            </View>

            <View style={styles.buttonWrapper}>
              <Button
                title="Guardar lectura"
                onPress={handleAddReading}
                variant="primary"
                size="md"
                iconLeft="check"
                loading={loading}
                disabled={loading || !meterData}
                fullWidth
              />
            </View>
          </View>

          <Button
            title="Cancelar"
            onPress={() => navigation.goBack()}
            variant="outline"
            size="md"
            disabled={loading}
            fullWidth
          />
        </View>
      </ScrollView>

      {/* Paywall para upgrade a Premium */}
      <Paywall
        visible={showPaywall}
        onClose={() => setShowPaywall(false)}
        onUpgrade={() => {
          setShowPaywall(false);
          navigation.navigate('Pricing', {
            feature: paywallFeature,
            onUpgrade: () => {
              // Después de activar premium, cerrar Pricing
              navigation.goBack();
            },
          });
        }}
        feature={paywallFeature}
        reason={paywallReason}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollView: { flex: 1 },
  content: { padding: SPACING.lg },

  header: { marginBottom: SPACING['2xl'] },
  title: { fontSize: TYPOGRAPHY.sizes['3xl'], fontWeight: TYPOGRAPHY.weights.bold, marginBottom: SPACING.sm },
  subtitle: { fontSize: TYPOGRAPHY.sizes.base },

  infoBox: {
    borderRadius: RADIUS.lg,
    padding: SPACING.md + 2,
    marginBottom: SPACING.xl,
    borderLeftWidth: 4,
  },
  infoLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs + 2,
  },
  infoIcon: {
    marginRight: SPACING.xs,
  },
  infoLabel: { fontSize: TYPOGRAPHY.sizes.sm, fontWeight: TYPOGRAPHY.weights.semibold },
  infoValue: { fontSize: TYPOGRAPHY.sizes.xl, fontWeight: TYPOGRAPHY.weights.bold, marginBottom: SPACING.xs },
  infoHint: { fontSize: TYPOGRAPHY.sizes.xs, fontStyle: 'italic', marginTop: SPACING.xs - 2 },

  section: { marginBottom: SPACING.xl },
  labelIcon: {
    marginRight: SPACING.xs,
  },
  label: { fontSize: TYPOGRAPHY.sizes.base, fontWeight: TYPOGRAPHY.weights.semibold, marginBottom: SPACING.sm },
  input: {
    borderRadius: RADIUS.lg,
    paddingHorizontal: SPACING.md + 2,
    paddingVertical: SPACING.md,
    fontSize: TYPOGRAPHY.sizes.lg,
    borderWidth: 2,
    marginBottom: SPACING.xs + 2,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  hint: { fontSize: TYPOGRAPHY.sizes.sm, fontStyle: 'italic', lineHeight: TYPOGRAPHY.sizes.sm * TYPOGRAPHY.lineHeights.relaxed, marginBottom: SPACING.xs + 2 },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.xs,
  },
  dateIcon: {
    marginRight: SPACING.xs - 2,
  },
  hintDate: { fontSize: TYPOGRAPHY.sizes.xs, fontWeight: TYPOGRAPHY.weights.semibold },

  previewContainer: {
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.xl,
    borderLeftWidth: 4,
  },
  previewTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md + 2,
  },
  previewIcon: {
    marginRight: SPACING.xs,
  },
  previewTitle: { fontSize: TYPOGRAPHY.sizes.base, fontWeight: TYPOGRAPHY.weights.bold },
  previewRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: SPACING.sm },
  previewLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  previewLabelIcon: {
    marginRight: SPACING.xs - 2,
  },
  divider: { borderBottomWidth: 1, marginVertical: SPACING.sm },
  previewLabel: { fontSize: TYPOGRAPHY.sizes.sm },
  previewValue: { fontSize: TYPOGRAPHY.sizes.base, fontWeight: TYPOGRAPHY.weights.semibold, textAlign: 'right' },
  previewExplain: { fontSize: TYPOGRAPHY.sizes.xs, fontStyle: 'italic', marginTop: SPACING.md, textAlign: 'center' },

  buttons: { flexDirection: 'row', gap: SPACING.md, marginBottom: SPACING.md },
  buttonWrapper: { flex: 1 },

  // Estilos de foto
  photoSection: {
    marginBottom: SPACING.xl,
  },
  photoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  recommendedBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs - 2,
    borderRadius: RADIUS.md,
    marginLeft: SPACING.sm,
  },
  recommendedText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  offlineWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    marginTop: SPACING.sm,
    borderWidth: 1,
  },
  offlineText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    flex: 1,
  },
  photoPreviewContainer: {
    gap: SPACING.md,
  },
  photoPreview: {
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    borderWidth: 2,
    position: 'relative',
    aspectRatio: 4/3,
  },
  photoImage: {
    width: '100%',
    height: '100%',
  },
  removePhotoButton: {
    position: 'absolute',
    top: SPACING.sm,
    right: SPACING.sm,
    width: 32,
    height: 32,
    borderRadius: RADIUS.full,
    justifyContent: 'center',
    alignItems: 'center',
    ...ELEVATION.md,
  },
  photoSuccessBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: RADIUS.md,
  },
  photoSuccessText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    flex: 1,
    fontWeight: TYPOGRAPHY.weights.medium,
  },
});
