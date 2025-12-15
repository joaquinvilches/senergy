import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from './Icon';
import Button from './ui/Button';

/**
 * Error Boundary global para capturar errores no manejados
 *
 * Uso:
 * <ErrorBoundary>
 *   <App />
 * </ErrorBoundary>
 */
export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorCount: 0,
    };
  }

  static getDerivedStateFromError(error) {
    // Actualizar estado para mostrar UI de error
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log del error
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    // Guardar detalles del error
    this.setState({
      error,
      errorInfo,
      errorCount: this.state.errorCount + 1,
    });

    // Aquí podrías enviar el error a un servicio de logging
    // como Firebase Crashlytics, Sentry, etc.
    this.logErrorToService(error, errorInfo);
  }

  logErrorToService = (error, errorInfo) => {
    // TODO: Integrar con Firebase Crashlytics
    // crashlytics().recordError(error);
    // crashlytics().log(`Component Stack: ${errorInfo.componentStack}`);

    // Por ahora, solo log en consola
    console.error('Error logged:', {
      message: error.toString(),
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
    });
  };

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  handleReload = () => {
    // Recargar la app completamente
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorCount: 0,
    });
  };

  render() {
    if (this.state.hasError) {
      return (
        <SafeAreaView style={styles.container}>
          <ScrollView contentContainerStyle={styles.scrollContent}>
            <View style={styles.iconContainer}>
              <Icon name="alert-circle" size={80} color="#EF4444" />
            </View>

            <Text style={styles.title}>¡Ups! Algo salió mal</Text>

            <Text style={styles.message}>
              Lo sentimos, ocurrió un error inesperado. Nuestro equipo ha sido notificado
              y estamos trabajando para solucionarlo.
            </Text>

            {/* Botones de acción */}
            <View style={styles.actions}>
              <Button
                title="Reintentar"
                onPress={this.handleReset}
                icon="refresh-cw"
              />

              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={this.handleReload}
              >
                <Text style={styles.secondaryButtonText}>Recargar App</Text>
              </TouchableOpacity>
            </View>

            {/* Información técnica (solo en desarrollo) */}
            {__DEV__ && this.state.error && (
              <View style={styles.errorDetails}>
                <Text style={styles.errorDetailsTitle}>Detalles del Error (Dev Only):</Text>

                <View style={styles.errorBox}>
                  <Text style={styles.errorText}>
                    {this.state.error.toString()}
                  </Text>
                </View>

                {this.state.errorInfo && (
                  <View style={styles.errorBox}>
                    <Text style={styles.errorLabel}>Component Stack:</Text>
                    <Text style={styles.errorText}>
                      {this.state.errorInfo.componentStack}
                    </Text>
                  </View>
                )}

                <Text style={styles.errorCount}>
                  Error Count: {this.state.errorCount}
                </Text>
              </View>
            )}
          </ScrollView>
        </SafeAreaView>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  iconContainer: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 12,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  actions: {
    width: '100%',
    gap: 12,
  },
  secondaryButton: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4B5563',
  },
  errorDetails: {
    width: '100%',
    marginTop: 32,
    padding: 16,
    backgroundColor: '#FEF2F2',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FEE2E2',
  },
  errorDetailsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#991B1B',
    marginBottom: 12,
  },
  errorBox: {
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  errorLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#DC2626',
    marginBottom: 4,
  },
  errorText: {
    fontSize: 12,
    color: '#7F1D1D',
    fontFamily: 'monospace',
  },
  errorCount: {
    fontSize: 12,
    color: '#991B1B',
    marginTop: 8,
  },
});
