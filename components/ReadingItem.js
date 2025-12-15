import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Modal, Animated, Image } from 'react-native';
import { formatKWh, formatCLP, parseChileanNumber, getNumberPlaceholder } from '../utils/formatHelpers';
import { ChileanNumberInput } from './ChileanNumberInput';
import { HelpIcon } from './HelpIcon';
import { safeToDate } from '../utils/dateHelpers';
import moment from 'moment';
import { SPACING, TYPOGRAPHY, RADIUS, ELEVATION } from '../constants/theme';
import { fadeIn, springBounce } from '../utils/animations';
import Icon from './Icon';

/**
 * Componente para mostrar una lectura individual con opciones de editar y eliminar
 */
export const ReadingItem = ({ item, isInitial, colors, onDelete, onEdit, index = 0 }) => {
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editedValue, setEditedValue] = useState(item.value.toString());
  const [isPhotoModalVisible, setIsPhotoModalVisible] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const cost = item.consumption * item.costPerKwh;

  // Usar helper seguro para fechas de Firestore
  const dateObj = safeToDate(item.date);
  const readingDate = dateObj ? moment(dateObj) : moment();
  const dayName = readingDate.format('dddd');
  const formattedDate = readingDate.format('DD/MM/YYYY');
  const formattedTime = readingDate.format('HH:mm');

  const handleDelete = () => {
    Alert.alert(
      'Eliminar lectura',
      `¿Estás seguro de que deseas eliminar esta lectura?\n\n${formattedDate} - ${item.value} kWh`,
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => onDelete(item.id),
        },
      ]
    );
  };

  const handleEdit = () => {
    setEditedValue(item.value.toString());
    setIsEditModalVisible(true);
  };

  const handleSaveEdit = () => {
    const newValue = parseChileanNumber(editedValue);

    if (newValue === null || newValue < 0) {
      Alert.alert('Error', 'Ingresa un valor válido. Ejemplo: 38.245 o 38.245,5');
      return;
    }

    if (newValue === item.value) {
      setIsEditModalVisible(false);
      return;
    }

    Alert.alert(
      'Confirmar edición',
      `¿Deseas actualizar la lectura de ${formatKWh(item.value, 0)} a ${formatKWh(newValue, 0)}?`,
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Guardar',
          onPress: () => {
            onEdit(item.id, newValue);
            setIsEditModalVisible(false);
          },
        },
      ]
    );
  };

  // Animación de entrada con delay basado en índice
  useEffect(() => {
    const delay = index * 80; // 80ms de delay por cada item
    setTimeout(() => {
      Animated.parallel([
        fadeIn(fadeAnim, 350),
        springBounce(scaleAnim, 1),
      ]).start();
    }, delay);
  }, []);

  return (
    <>
      {/* Modal de edición */}
      <Modal
        visible={isEditModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsEditModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.CARD }]}>
            <Text style={[styles.modalTitle, { color: colors.TEXT_DARK }]}>
              Editar Lectura
            </Text>
            <Text style={[styles.modalDate, { color: colors.TEXT_LIGHT }]}>
              {formattedDate}
            </Text>

            <View style={styles.inputContainer}>
              <ChileanNumberInput
                style={[styles.input, {
                  color: colors.TEXT_DARK,
                  borderColor: colors.BORDER,
                  backgroundColor: colors.BACKGROUND
                }]}
                value={editedValue}
                onChangeValue={setEditedValue}
                decimals={1}
                placeholder={getNumberPlaceholder('kwh')}
                placeholderTextColor={colors.TEXT_LIGHT}
                autoFocus
              />
              <Text style={[styles.inputUnit, { color: colors.TEXT_LIGHT }]}>kWh</Text>
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton, { borderColor: colors.BORDER }]}
                onPress={() => setIsEditModalVisible(false)}
                activeOpacity={0.7}
              >
                <Text style={[styles.cancelButtonText, { color: colors.TEXT_DARK }]}>
                  Cancelar
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton, { backgroundColor: colors.PRIMARY }]}
                onPress={handleSaveEdit}
                activeOpacity={0.7}
              >
                <Text style={styles.saveButtonText}>Guardar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal de foto full-screen */}
      <Modal
        visible={isPhotoModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsPhotoModalVisible(false)}
      >
        <View style={styles.photoModalOverlay}>
          <TouchableOpacity
            style={styles.photoModalClose}
            onPress={() => setIsPhotoModalVisible(false)}
            activeOpacity={0.9}
          >
            <Icon name="close" size={28} color="#FFFFFF" />
          </TouchableOpacity>

          <View style={styles.photoModalContent}>
            {item.photoURL ? (
              <>
                <Image
                  source={{ uri: item.photoURL }}
                  style={styles.photoModalImage}
                  resizeMode="contain"
                />
                <View style={styles.photoModalInfo}>
                  <Icon name="calendar" size={14} color="#FFFFFF" style={{ marginRight: SPACING.xs }} />
                  <Text style={styles.photoModalDate}>
                    {formattedDate} • {formattedTime}
                  </Text>
                </View>
              </>
            ) : (
              <View style={styles.photoModalEmpty}>
                <Icon name="image-off" size={64} color="#FFFFFF" />
                <Text style={styles.photoModalEmptyText}>
                  No hay foto disponible
                </Text>
              </View>
            )}
          </View>
        </View>
      </Modal>

      {/* Componente de lectura */}
      <Animated.View style={{ opacity: fadeAnim, transform: [{ scale: scaleAnim }] }}>
    <View style={[styles.readingItem, { backgroundColor: colors.CARD, borderColor: colors.BORDER }]}>
      {/* Header con fecha y botón eliminar */}
      <View style={[styles.dateSection, { backgroundColor: colors.BACKGROUND }]}>
        <View style={styles.dateContent}>
          <Text style={[styles.dayName, { color: colors.PRIMARY }]}>
            {dayName.charAt(0).toUpperCase() + dayName.slice(1)}
          </Text>
          <Text style={[styles.date, { color: colors.TEXT_LIGHT }]}>
            {formattedDate} • {formattedTime}
          </Text>
        </View>
        
        <View style={styles.headerRight}>
          {/* Indicador de foto */}
          {item.photoURL && (
            <TouchableOpacity
              style={[styles.photoIndicator, { backgroundColor: `${colors.PRIMARY}20`, borderColor: colors.PRIMARY }]}
              onPress={() => setIsPhotoModalVisible(true)}
              activeOpacity={0.7}
            >
              <Icon name="image" size={16} color={colors.PRIMARY} />
            </TouchableOpacity>
          )}

          {isInitial && (
            <>
              <View style={[styles.badge, { backgroundColor: colors.ACCENT }]}>
                <Text style={styles.badgeText}>Inicial</Text>
              </View>
              <HelpIcon
                title="Lectura Inicial"
                message="Esta es tu lectura inicial, el punto de partida que registraste al crear el medidor. No tiene consumo asociado porque no hay lectura anterior con la cual compararla."
                icon="help-circle-outline"
              />
            </>
          )}

          {/* Botones de editar y eliminar (solo si NO es la lectura inicial) */}
          {!isInitial && (
            <>
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: `${colors.PRIMARY}20` }]}
                onPress={handleEdit}
                activeOpacity={0.7}
              >
                <Icon name="pencil-outline" size={16} color={colors.PRIMARY} />
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: `${colors.ERROR}20` }]}
                onPress={handleDelete}
                activeOpacity={0.7}
              >
                <Icon name="delete-outline" size={16} color={colors.ERROR} />
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>

      <View style={[styles.readingSection, { borderTopColor: colors.BORDER }]}>
        <View style={styles.readingBox}>
          <Text style={[styles.readingLabel, { color: colors.TEXT_LIGHT }]}>
            Lectura del medidor
          </Text>
          <Text style={[styles.readingValue, { color: colors.PRIMARY }]}>
            {formatKWh(item.value, 0)}
          </Text>
        </View>

        {!isInitial && (
          <>
            <View style={[styles.divider, { backgroundColor: colors.BORDER }]} />

            <View style={styles.readingBox}>
              <Text style={[styles.readingLabel, { color: colors.TEXT_LIGHT }]}>
                Consumo desde última lectura
              </Text>
              <Text style={[styles.readingValue, { color: colors.ACCENT }]}>
                {formatKWh(item.consumption, 1)}
              </Text>
            </View>

            <View style={[styles.divider, { backgroundColor: colors.BORDER }]} />

            <View style={styles.readingBox}>
              <Text style={[styles.readingLabel, { color: colors.TEXT_LIGHT }]}>
                Costo por consumo
              </Text>
              <Text style={[styles.costValue, { color: colors.PRIMARY }]}>
                {formatCLP(cost)}
              </Text>
              <Text style={[styles.costDetail, { color: colors.TEXT_LIGHT }]}>
                {formatCLP(item.costPerKwh)}/kWh × {formatKWh(item.consumption, 1)}
              </Text>
            </View>
          </>
        )}

        {/* Miniatura de foto si existe */}
        {item.photoURL && (
          <>
            <View style={[styles.divider, { backgroundColor: colors.BORDER }]} />
            <View style={styles.photoThumbnailContainer}>
              <Text style={[styles.readingLabel, { color: colors.TEXT_LIGHT, marginBottom: SPACING.md }]}>
                Foto del medidor
              </Text>
              <TouchableOpacity
                onPress={() => setIsPhotoModalVisible(true)}
                activeOpacity={0.8}
                style={styles.thumbnailTouchable}
              >
                <Image
                  source={{ uri: item.photoURL }}
                  style={[styles.photoThumbnail, { borderColor: colors.BORDER }]}
                  resizeMode="cover"
                />
                <View style={[styles.viewPhotoButton, { backgroundColor: colors.PRIMARY }]}>
                  <Icon name="eye" size={14} color="#FFFFFF" style={{ marginRight: SPACING.xs - 2 }} />
                  <Text style={styles.viewPhotoText}>Ver foto completa</Text>
                </View>
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>
    </View>
    </Animated.View>
    </>
  );
};

const styles = StyleSheet.create({
  readingItem: {
    borderRadius: RADIUS.lg,
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.md,
    overflow: 'hidden',
    borderWidth: 1,
    ...ELEVATION.sm,
  },
  dateSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  dateContent: {
    flex: 1,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  dayName: {
    fontSize: TYPOGRAPHY.sizes.base,
    fontWeight: TYPOGRAPHY.weights.bold,
    marginBottom: SPACING.xs,
  },
  date: {
    fontSize: TYPOGRAPHY.sizes.sm,
  },
  badge: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.md,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  readingSection: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderTopWidth: 1,
  },
  readingBox: {
    alignItems: 'center',
    paddingVertical: SPACING.sm,
  },
  readingLabel: {
    fontSize: TYPOGRAPHY.sizes.sm,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  readingValue: {
    fontSize: TYPOGRAPHY.sizes['4xl'],
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  readingUnit: {
    fontSize: TYPOGRAPHY.sizes.sm,
    marginTop: SPACING.xs,
  },
  costValue: {
    fontSize: TYPOGRAPHY.sizes['2xl'],
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  costDetail: {
    fontSize: TYPOGRAPHY.sizes.xs,
    marginTop: SPACING.xs,
    textAlign: 'center',
  },
  divider: {
    height: 1,
    marginVertical: SPACING.sm,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '85%',
    borderRadius: RADIUS.xl,
    padding: SPACING['2xl'],
    ...ELEVATION.lg,
  },
  modalTitle: {
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: TYPOGRAPHY.weights.bold,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  modalDate: {
    fontSize: TYPOGRAPHY.sizes.base,
    marginBottom: SPACING['2xl'],
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: SPACING['2xl'],
  },
  input: {
    borderWidth: 2,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md + 2,
    fontSize: TYPOGRAPHY.sizes['2xl'],
    fontWeight: TYPOGRAPHY.weights.bold,
    textAlign: 'center',
  },
  inputUnit: {
    fontSize: TYPOGRAPHY.sizes.base,
    textAlign: 'center',
    marginTop: SPACING.sm,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  modalButton: {
    flex: 1,
    paddingVertical: SPACING.md + 2,
    borderRadius: RADIUS.md,
    alignItems: 'center',
  },
  cancelButton: {
    borderWidth: 2,
  },
  cancelButtonText: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  saveButton: {},
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.bold,
  },

  // Estilos de foto
  photoIndicator: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.full,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoThumbnailContainer: {
    alignItems: 'center',
    paddingVertical: SPACING.md,
  },
  thumbnailTouchable: {
    alignItems: 'center',
  },
  photoThumbnail: {
    width: 200,
    height: 150,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    marginBottom: SPACING.sm,
  },
  viewPhotoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    borderRadius: RADIUS.md,
  },
  viewPhotoText: {
    color: '#FFFFFF',
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  photoModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoModalClose: {
    position: 'absolute',
    top: 60,
    right: SPACING.lg,
    zIndex: 10,
    width: 44,
    height: 44,
    borderRadius: RADIUS.full,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoModalContent: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  photoModalImage: {
    width: '100%',
    height: '80%',
  },
  photoModalInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.xl,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: RADIUS.lg,
  },
  photoModalDate: {
    color: '#FFFFFF',
    fontSize: TYPOGRAPHY.sizes.base,
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  photoModalEmpty: {
    alignItems: 'center',
    gap: SPACING.lg,
  },
  photoModalEmptyText: {
    color: '#FFFFFF',
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.medium,
  },
});