import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { useDarkMode } from '../utils/darkModeContext';
import { registerUser, loginUser } from '../services/authService';
import { createUserProfile } from '../services/meterService';
import { SPACING, TYPOGRAPHY, RADIUS, ELEVATION } from '../constants/theme';
import Icon from '../components/Icon';
import Button from '../components/ui/Button';

export const AuthScreen = () => {
  const { colors } = useDarkMode();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [loading, setLoading] = useState(false);

  const styles = getStyles(colors);

  const handleAuth = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Por favor completa todos los campos');
      return;
    }

    if (!isLogin && password !== passwordConfirm) {
      Alert.alert('Error', 'Las contraseñas no coinciden');
      return;
    }

    setLoading(true);

    try {
      if (isLogin) {
        await loginUser(email, password);
      } else {
        const user = await registerUser(email, password);
        await createUserProfile(user.uid, email);
        Alert.alert('Éxito', 'Cuenta creada correctamente');
      }
    } catch (error) {
      let message = 'Error en la autenticación';
      if (error.code === 'auth/user-not-found') {
        message = 'Usuario no encontrado';
      } else if (error.code === 'auth/wrong-password') {
        message = 'Contraseña incorrecta';
      } else if (error.code === 'auth/email-already-in-use') {
        message = 'El email ya está registrado';
      } else if (error.code === 'auth/weak-password') {
        message = 'La contraseña debe tener al menos 6 caracteres';
      }
      Alert.alert('Error', message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Encabezado */}
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Icon name="lightning-bolt" size={64} color={colors.PRIMARY} />
          </View>
          <Text style={styles.title}>SENERGY</Text>
          <Text style={styles.subtitle}>
            {isLogin ? 'Inicia sesión' : 'Crea tu cuenta'}
          </Text>
        </View>

        {/* Formulario */}
        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="Correo electrónico"
            placeholderTextColor={colors.TEXT_LIGHT}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            editable={!loading}
          />

          <TextInput
            style={styles.input}
            placeholder="Contraseña"
            placeholderTextColor={colors.TEXT_LIGHT}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            editable={!loading}
          />

          {!isLogin && (
            <TextInput
              style={styles.input}
              placeholder="Confirmar contraseña"
              placeholderTextColor={colors.TEXT_LIGHT}
              value={passwordConfirm}
              onChangeText={setPasswordConfirm}
              secureTextEntry
              editable={!loading}
            />
          )}
        </View>

        {/* Botón principal */}
        <Button
          title={isLogin ? 'Inicia sesión' : 'Crear cuenta'}
          onPress={handleAuth}
          variant="primary"
          size="lg"
          loading={loading}
          disabled={loading}
          fullWidth
        />

        {/* Cambiar modo */}
        <TouchableOpacity
          onPress={() => setIsLogin(!isLogin)}
          disabled={loading}
        >
          <Text style={styles.toggleText}>
            {isLogin ? '¿No tienes cuenta? ' : '¿Ya tienes cuenta? '}
            <Text style={styles.toggleLink}>
              {isLogin ? 'Regístrate' : 'Inicia sesión'}
            </Text>
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const getStyles = (colors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.BACKGROUND,
  },
  content: {
    padding: SPACING.xl,
    justifyContent: 'center',
    minHeight: '100%',
  },
  header: {
    alignItems: 'center',
    marginBottom: SPACING['4xl'],
  },
  iconContainer: {
    marginBottom: SPACING.lg,
  },
  title: {
    fontSize: TYPOGRAPHY.sizes['4xl'],
    fontWeight: TYPOGRAPHY.weights.bold,
    color: colors.PRIMARY,
    letterSpacing: 2,
  },
  subtitle: {
    fontSize: TYPOGRAPHY.sizes.base,
    color: colors.TEXT_LIGHT,
    marginTop: SPACING.sm,
  },
  form: {
    marginBottom: SPACING.xl,
  },
  input: {
    backgroundColor: colors.CARD,
    borderRadius: RADIUS.lg,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md + 2,
    marginBottom: SPACING.md,
    fontSize: TYPOGRAPHY.sizes.lg,
    color: colors.TEXT_DARK,
    borderWidth: 1,
    borderColor: colors.BORDER,
  },
  toggleText: {
    textAlign: 'center',
    color: colors.TEXT_LIGHT,
    fontSize: TYPOGRAPHY.sizes.base,
    marginTop: SPACING.lg,
  },
  toggleLink: {
    color: colors.PRIMARY,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
});