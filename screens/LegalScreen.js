import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useDarkMode } from '../utils/darkModeContext';
import { SPACING, TYPOGRAPHY, RADIUS } from '../constants/theme';

export const LegalScreen = ({ navigation }) => {
  const { colors } = useDarkMode();
  const [activeTab, setActiveTab] = useState('terms'); // 'terms' | 'privacy'

  const openExternalLink = (url) => {
    Linking.openURL(url).catch((err) =>
      console.error('Error al abrir enlace:', err)
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.BACKGROUND }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.BORDER }]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color={colors.TEXT} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.TEXT }]}>
          Legal
        </Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Tabs */}
      <View style={[styles.tabContainer, { backgroundColor: colors.SURFACE }]}>
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'terms' && [
              styles.activeTab,
              { backgroundColor: colors.PRIMARY },
            ],
          ]}
          onPress={() => setActiveTab('terms')}
        >
          <Text
            style={[
              styles.tabText,
              { color: activeTab === 'terms' ? '#FFFFFF' : colors.TEXT_LIGHT },
            ]}
          >
            Términos de Servicio
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'privacy' && [
              styles.activeTab,
              { backgroundColor: colors.PRIMARY },
            ],
          ]}
          onPress={() => setActiveTab('privacy')}
        >
          <Text
            style={[
              styles.tabText,
              { color: activeTab === 'privacy' ? '#FFFFFF' : colors.TEXT_LIGHT },
            ]}
          >
            Política de Privacidad
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={[styles.contentCard, { backgroundColor: colors.SURFACE }]}>
          {activeTab === 'terms' ? (
            <TermsContent colors={colors} />
          ) : (
            <PrivacyContent colors={colors} />
          )}
        </View>

        {/* Footer */}
        <View style={styles.footerContainer}>
          <Text style={[styles.footerText, { color: colors.TEXT_LIGHT }]}>
            Si tienes preguntas sobre estos documentos, contáctanos.
          </Text>

          <TouchableOpacity
            style={[styles.contactButton, { backgroundColor: colors.PRIMARY }]}
            onPress={() => openExternalLink('mailto:contacto@senergy.cl')}
          >
            <Ionicons name="mail-outline" size={20} color="#FFFFFF" />
            <Text style={styles.contactButtonText}>Contactar Soporte</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const TermsContent = ({ colors }) => (
  <View>
    <Text style={[styles.title, { color: colors.TEXT }]}>
      Términos y Condiciones de Uso
    </Text>
    <Text style={[styles.date, { color: colors.TEXT_LIGHT }]}>
      Última actualización: 17 de junio de 2026
    </Text>

    <Section
      title="1. Aceptación de los Términos"
      colors={colors}
    >
      Al usar SENERGY, aceptas estar sujeto a estos Términos y Condiciones.
      Si no estás de acuerdo, no utilices la aplicación.
    </Section>

    <Section
      title="2. Descripción del Servicio"
      colors={colors}
    >
      SENERGY es una aplicación móvil para monitorear medidores eléctricos,
      registrar lecturas y analizar consumo energético.{'\n\n'}

      <Text style={{ fontWeight: '600' }}>Plan GRATUITO:{'\n'}</Text>
      • Medidores ilimitados{'\n'}
      • Lecturas ilimitadas{'\n'}
      • Exportación a Excel{'\n'}
      • Estadísticas y gráficos completos{'\n'}
      • Con anuncios discretos{'\n\n'}

      <Text style={{ fontWeight: '600' }}>Plan PREMIUM ($2.200 CLP/mes):{'\n'}</Text>
      • Todo lo del plan Gratuito{'\n'}
      • Captura de fotos del medidor (evidencia de respaldo){'\n'}
      • Sin anuncios{'\n'}
      • Soporte prioritario{'\n'}
      • Acceso anticipado a nuevas funciones
    </Section>

    <Section
      title="3. Uso Aceptable"
      colors={colors}
    >
      Debes utilizar SENERGY únicamente para fines legales y personales.
      NO está permitido el uso comercial sin autorización, intentos de hackeo,
      o cualquier actividad que dañe el servicio.
    </Section>

    <Section
      title="4. Suscripciones y Pagos"
      colors={colors}
    >
      • El Plan Premium se factura mensualmente por adelantado{'\n'}
      • Renovación automática hasta cancelación{'\n'}
      • Sin reembolsos por períodos parciales{'\n'}
      • Puedes cancelar en cualquier momento desde la app
    </Section>

    <Section
      title="5. Limitación de Responsabilidad"
      colors={colors}
    >
      SENERGY proporciona ESTIMACIONES de consumo y costo. NO GARANTIZAMOS
      la exactitud de los cálculos. Verifica siempre con tu factura eléctrica oficial.{'\n\n'}

      La aplicación se proporciona "TAL CUAL", sin garantías de ningún tipo.
    </Section>

    <Section
      title="6. Privacidad"
      colors={colors}
    >
      Tu privacidad es importante. Consulta nuestra Política de Privacidad
      para conocer cómo manejamos tus datos.
    </Section>

    <Section
      title="7. Ley Aplicable"
      colors={colors}
    >
      Estos Términos se rigen por las leyes de la República de Chile.
      Cualquier disputa será resuelta por los tribunales ordinarios de justicia de Chile.
    </Section>

    <InfoBox colors={colors}>
      📄 Para el documento completo con todos los detalles legales,
      consulta el archivo TERMINOS_DE_SERVICIO.md en el repositorio del proyecto.
    </InfoBox>
  </View>
);

const PrivacyContent = ({ colors }) => (
  <View>
    <Text style={[styles.title, { color: colors.TEXT }]}>
      Política de Privacidad
    </Text>
    <Text style={[styles.date, { color: colors.TEXT_LIGHT }]}>
      Última actualización: 17 de junio de 2026
    </Text>

    <Section
      title="1. Datos que Recopilamos"
      colors={colors}
    >
      <Text style={{ fontWeight: '600' }}>Datos proporcionados por ti:{'\n'}</Text>
      • Nombre y correo electrónico{'\n'}
      • Información de medidores eléctricos{'\n'}
      • Lecturas de consumo{'\n'}
      • Fotografías de medidores (solo Premium){'\n\n'}

      <Text style={{ fontWeight: '600' }}>Datos recopilados automáticamente:{'\n'}</Text>
      • Tipo de dispositivo y sistema operativo{'\n'}
      • Datos de uso de la aplicación{'\n'}
      • Errores y métricas de rendimiento
    </Section>

    <Section
      title="2. Cómo Usamos tus Datos"
      colors={colors}
    >
      Utilizamos tus datos para:{'\n\n'}
      ✅ Proporcionar el servicio (guardar lecturas, calcular consumos){'\n'}
      ✅ Procesar suscripciones Premium{'\n'}
      ✅ Mejorar la aplicación y corregir errores{'\n'}
      ✅ Enviarte notificaciones importantes{'\n'}
      ✅ Proteger contra fraude y abusos
    </Section>

    <Section
      title="3. Con Quién Compartimos tus Datos"
      colors={colors}
    >
      <Text style={{ fontWeight: '600' }}>NO vendemos tus datos.{'\n\n'}</Text>

      Compartimos solo con proveedores técnicos necesarios:{'\n\n'}

      <Text style={{ fontWeight: '600' }}>• Google Firebase{'\n'}</Text>
      Almacenamiento y procesamiento de datos{'\n\n'}

      <Text style={{ fontWeight: '600' }}>• Cloudinary{'\n'}</Text>
      Almacenamiento de fotografías (Premium){'\n\n'}

      <Text style={{ fontWeight: '600' }}>• Pasarela de Pagos{'\n'}</Text>
      Procesamiento de suscripciones Premium
    </Section>

    <Section
      title="4. Dónde Almacenamos tus Datos"
      colors={colors}
    >
      Tus datos se almacenan en servidores de Google Cloud (Firebase)
      ubicados en múltiples regiones, incluyendo Estados Unidos y Europa.{'\n\n'}

      Utilizamos Cláusulas Contractuales Estándar para garantizar
      protección equivalente según GDPR.
    </Section>

    <Section
      title="5. Seguridad"
      colors={colors}
    >
      Protegemos tus datos con:{'\n\n'}
      🔒 Encriptación de datos en tránsito (HTTPS){'\n'}
      🔐 Encriptación de contraseñas{'\n'}
      🛡️ Reglas de seguridad de Firebase{'\n'}
      💾 Backups automáticos encriptados{'\n'}
      👁️ Monitoreo de seguridad 24/7
    </Section>

    <Section
      title="6. Tus Derechos"
      colors={colors}
    >
      Según la Ley 19.628 de Chile y GDPR, tienes derecho a:{'\n\n'}
      ✅ Acceder a tus datos personales{'\n'}
      ✅ Corregir datos inexactos{'\n'}
      ✅ Eliminar tu cuenta y datos{'\n'}
      ✅ Exportar tus datos{'\n'}
      ✅ Oponerte al procesamiento{'\n'}
      ✅ Presentar reclamo ante autoridades
    </Section>

    <Section
      title="7. Retención de Datos"
      colors={colors}
    >
      Conservamos tus datos mientras tu cuenta esté activa.{'\n\n'}

      Al eliminar tu cuenta:{'\n'}
      • Eliminamos tus datos en 30 días{'\n'}
      • Datos fiscales se conservan 7 años (requisito legal){'\n'}
      • Backups se eliminan en 90 días
    </Section>

    <Section
      title="8. Menores de Edad"
      colors={colors}
    >
      SENERGY está destinada a mayores de 18 años.
      NO recopilamos intencionalmente datos de menores.
    </Section>

    <InfoBox colors={colors}>
      📄 Para el documento completo con detalles técnicos y legales,
      consulta el archivo POLITICA_DE_PRIVACIDAD.md en el repositorio del proyecto.
    </InfoBox>

    <HighlightBox colors={colors}>
      💡 Cumplimos con la Ley N° 19.628 de Chile y GDPR de la Unión Europea
    </HighlightBox>
  </View>
);

const Section = ({ title, children, colors }) => (
  <View style={styles.section}>
    <Text style={[styles.sectionTitle, { color: colors.PRIMARY }]}>
      {title}
    </Text>
    <Text style={[styles.sectionContent, { color: colors.TEXT }]}>
      {children}
    </Text>
  </View>
);

const InfoBox = ({ children, colors }) => (
  <View style={[styles.infoBox, { backgroundColor: colors.INFO_LIGHT, borderColor: colors.INFO }]}>
    <Text style={[styles.infoText, { color: colors.INFO_DARK }]}>
      {children}
    </Text>
  </View>
);

const HighlightBox = ({ children, colors }) => (
  <View style={[styles.highlightBox, { backgroundColor: colors.SUCCESS_LIGHT, borderColor: colors.SUCCESS }]}>
    <Text style={[styles.highlightText, { color: colors.SUCCESS_DARK }]}>
      {children}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: '700',
  },
  tabContainer: {
    flexDirection: 'row',
    padding: SPACING.sm,
    gap: SPACING.sm,
  },
  tab: {
    flex: 1,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.md,
    alignItems: 'center',
  },
  activeTab: {
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  tabText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.md,
    paddingBottom: SPACING.xl * 2,
  },
  contentCard: {
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  title: {
    fontSize: TYPOGRAPHY.sizes['2xl'],
    fontWeight: '700',
    marginBottom: SPACING.xs,
  },
  date: {
    fontSize: TYPOGRAPHY.sizes.sm,
    marginBottom: SPACING.lg,
  },
  section: {
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: '600',
    marginBottom: SPACING.sm,
  },
  sectionContent: {
    fontSize: TYPOGRAPHY.sizes.base,
    lineHeight: TYPOGRAPHY.sizes.base * 1.5,
  },
  infoBox: {
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    borderLeftWidth: 4,
    marginTop: SPACING.md,
    marginBottom: SPACING.md,
  },
  infoText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    lineHeight: TYPOGRAPHY.sizes.sm * 1.5,
  },
  highlightBox: {
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    borderLeftWidth: 4,
    marginTop: SPACING.md,
  },
  highlightText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: '600',
  },
  footerContainer: {
    marginTop: SPACING.xl,
    alignItems: 'center',
  },
  footerText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: RADIUS.full,
    gap: SPACING.sm,
  },
  contactButtonText: {
    color: '#FFFFFF',
    fontSize: TYPOGRAPHY.sizes.base,
    fontWeight: '600',
  },
});
