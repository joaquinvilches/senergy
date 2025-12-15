# Notificaciones Push en SENERGY

## Limitación de Expo Go

**IMPORTANTE:** Las notificaciones push remotas NO funcionan en Expo Go a partir de SDK 53+.

### Error esperado en Expo Go:
```
expo-notifications: Android Push notifications (remote notifications) functionality
provided by expo-notifications was removed from Expo Go with the release of SDK 53
```

Este es un comportamiento esperado y NO es un error de la aplicación.

## Funcionalidad de Notificaciones

La app SENERGY implementa las siguientes notificaciones:

1. **Alertas de Consumo Alto**: Cuando se detecta un consumo anormalmente alto
2. **Recordatorios Semanales**: Recordatorio para registrar lecturas cada 7 días
3. **Alertas de Presupuesto**: Cuando se excede el presupuesto mensual configurado

## Cómo Probar las Notificaciones

### Opción 1: Development Build (Recomendado)

Crear un build de desarrollo con EAS:

```bash
# Instalar EAS CLI
npm install -g eas-cli

# Login a tu cuenta Expo
eas login

# Configurar el proyecto
eas build:configure

# Crear build de desarrollo para Android
eas build --profile development --platform android

# Crear build de desarrollo para iOS
eas build --profile development --platform ios
```

### Opción 2: Build de Producción

Crear un APK/IPA de producción:

```bash
# Android APK
eas build --profile production --platform android

# iOS IPA
eas build --profile production --platform ios
```

### Opción 3: Compilación Local

Usar expo-dev-client localmente:

```bash
# Instalar expo-dev-client
npx expo install expo-dev-client

# Android
npx expo run:android

# iOS
npx expo run:ios
```

## Verificar Configuración

La configuración de notificaciones ya está completa en:

- ✅ `app.json`: Plugin expo-notifications configurado
- ✅ `services/notificationService.js`: Servicio completo implementado
- ✅ `App.js`: Registro de notificaciones en login
- ✅ `hooks/useAlerts.js`: Integración con alertas de consumo

## Testing en Producción

Una vez instalado el build en un dispositivo real:

1. **Permisos**: La app solicitará permisos de notificación al iniciar sesión
2. **Token**: Se generará un token push (visible en logs)
3. **Alertas Automáticas**: Se enviarán cuando se detecte consumo alto
4. **Recordatorios**: Se programarán notificaciones semanales

## Recursos

- [Expo Notifications Docs](https://docs.expo.dev/versions/latest/sdk/notifications/)
- [EAS Build Guide](https://docs.expo.dev/build/introduction/)
- [Development Builds](https://docs.expo.dev/develop/development-builds/introduction/)
