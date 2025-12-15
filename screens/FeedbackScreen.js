import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDarkMode } from '../utils/darkModeContext';
import { showToast } from '../utils/toastUtils';
import { getCurrentUser } from '../services/authService';
import { submitFeedback } from '../services/feedbackService';
import { SPACING, TYPOGRAPHY, RADIUS } from '../constants/theme';
import Icon from '../components/Icon';
import Button from '../components/ui/Button';

export const FeedbackScreen = ({ navigation }) => {
  const { colors } = useDarkMode();
  const [feedbackType, setFeedbackType] = useState('suggestion');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const feedbackTypes = [
    { id: 'suggestion', label: 'Sugerencia', icon: 'lightbulb-outline' },
    { id: 'bug', label: 'Error/Bug', icon: 'bug-outline' },
    { id: 'feature', label: 'Nueva función', icon: 'star-outline' },
    { id: 'other', label: 'Otro', icon: 'pencil-outline' },
  ];

  const handleSubmit = async () => {
    if (!message.trim()) {
      showToast('Por favor escribe tu mensaje', 'error');
      return;
    }

    if (message.trim().length < 10) {
      showToast('El mensaje debe tener al menos 10 caracteres', 'error');
      return;
    }

    try {
      setLoading(true);
      const user = getCurrentUser();

      await submitFeedback(user.uid, user.email, {
        type: feedbackType,
        message: message.trim(),
      });

      showToast('¡Gracias por tu feedback!', 'success');
      setMessage('');
      setFeedbackType('suggestion');
      
      // Volver a la pantalla anterior después de 1 segundo
      setTimeout(() => {
        navigation.goBack();
      }, 1000);
    } catch (error) {
      showToast('Error al enviar el feedback', 'error');
      console.error('Error submitting feedback:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.BACKGROUND }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={[styles.header, { backgroundColor: colors.CARD }]}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
              <View style={styles.backButtonContent}>
                <Icon name="chevron-left" size={24} color={colors.PRIMARY} />
                <Text style={[styles.backButtonText, { color: colors.PRIMARY }]}>Volver</Text>
              </View>
            </TouchableOpacity>
            <Text style={[styles.title, { color: colors.TEXT_DARK }]}>
              Ayúdanos a mejorar
            </Text>
            <Text style={[styles.subtitle, { color: colors.TEXT_LIGHT }]}>
              Tu opinión es muy importante para nosotros
            </Text>
          </View>

          {/* Tipo de feedback */}
          <View style={[styles.section, { backgroundColor: colors.CARD }]}>
            <Text style={[styles.sectionTitle, { color: colors.PRIMARY }]}>
              Tipo de feedback
            </Text>
            <View style={styles.typesContainer}>
              {feedbackTypes.map((type) => (
                <TouchableOpacity
                  key={type.id}
                  style={[
                    styles.typeButton,
                    {
                      backgroundColor: colors.BACKGROUND,
                      borderColor: feedbackType === type.id ? colors.PRIMARY : colors.BORDER,
                      borderWidth: 2,
                    },
                  ]}
                  onPress={() => setFeedbackType(type.id)}
                  activeOpacity={0.7}
                >
                  <Icon
                    name={type.icon}
                    size={18}
                    color={feedbackType === type.id ? colors.PRIMARY : colors.TEXT_LIGHT}
                    style={styles.typeIcon}
                  />
                  <Text
                    style={[
                      styles.typeLabel,
                      {
                        color:
                          feedbackType === type.id ? colors.PRIMARY : colors.TEXT_DARK,
                      },
                    ]}
                  >
                    {type.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Mensaje */}
          <View style={[styles.section, { backgroundColor: colors.CARD }]}>
            <Text style={[styles.sectionTitle, { color: colors.PRIMARY }]}>
              Cuéntanos más
            </Text>
            <TextInput
              style={[
                styles.textArea,
                {
                  backgroundColor: colors.BACKGROUND,
                  color: colors.TEXT_DARK,
                  borderColor: colors.BORDER,
                },
              ]}
              placeholder="Describe tu sugerencia, problema o idea..."
              placeholderTextColor={colors.TEXT_LIGHT}
              value={message}
              onChangeText={setMessage}
              multiline
              numberOfLines={8}
              maxLength={500}
              textAlignVertical="top"
            />
            <Text style={[styles.characterCount, { color: colors.TEXT_LIGHT }]}>
              {message.length}/500 caracteres
            </Text>
          </View>

          {/* Botón de enviar */}
          <View style={styles.submitButtonContainer}>
            <Button
              title="Enviar feedback"
              onPress={handleSubmit}
              variant="primary"
              size="lg"
              iconLeft="send-outline"
              loading={loading}
              disabled={loading}
              fullWidth
            />
          </View>

          {/* Info adicional */}
          <View style={[styles.infoBox, { backgroundColor: colors.CARD }]}>
            <View style={styles.infoContent}>
              <Icon name="information-outline" size={16} color={colors.TEXT_LIGHT} style={styles.infoIcon} />
              <Text style={[styles.infoText, { color: colors.TEXT_LIGHT }]}>
                Revisamos todos los comentarios y los utilizamos para mejorar SENERGY. Si
                necesitas soporte inmediato, por favor usa la opción de Contacto.
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    paddingVertical: SPACING.xl,
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
  },
  backButton: {
    marginBottom: SPACING.md,
  },
  backButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  title: {
    fontSize: TYPOGRAPHY.sizes['2xl'],
    fontWeight: TYPOGRAPHY.weights.bold,
    marginBottom: SPACING.sm,
  },
  subtitle: {
    fontSize: TYPOGRAPHY.sizes.base,
  },
  section: {
    marginHorizontal: SPACING.md,
    marginVertical: SPACING.md,
    borderRadius: RADIUS.lg,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.sizes.base,
    fontWeight: TYPOGRAPHY.weights.bold,
    marginBottom: SPACING.md,
  },
  typesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  typeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm + 2,
    paddingHorizontal: SPACING.md + 2,
    borderRadius: RADIUS.md,
    marginRight: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  typeIcon: {
    marginRight: SPACING.xs + 2,
  },
  typeLabel: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  textArea: {
    borderRadius: RADIUS.md,
    borderWidth: 1,
    padding: SPACING.md,
    fontSize: TYPOGRAPHY.sizes.base,
    minHeight: 140,
  },
  characterCount: {
    fontSize: TYPOGRAPHY.sizes.xs,
    textAlign: 'right',
    marginTop: SPACING.xs + 2,
  },
  submitButtonContainer: {
    marginHorizontal: SPACING.md,
    marginVertical: SPACING.md,
  },
  infoBox: {
    marginHorizontal: SPACING.md,
    marginVertical: SPACING.md,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING['3xl'],
  },
  infoContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  infoIcon: {
    marginRight: SPACING.sm,
    marginTop: 2,
  },
  infoText: {
    flex: 1,
    fontSize: TYPOGRAPHY.sizes.sm,
    lineHeight: TYPOGRAPHY.sizes.sm * TYPOGRAPHY.lineHeights.relaxed,
  },
});