import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

// Configurar comportamiento de notificaciones cuando la app está en primer plano
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

/**
 * Solicitar permisos de notificaciones
 */
export const registerForPushNotificationsAsync = async () => {
  try {
    if (!Device.isDevice) {
      console.warn('Las notificaciones push solo funcionan en dispositivos físicos');
      return null;
    }

    // Configurar canales de Android PRIMERO (antes de pedir permisos)
    // Esto evita el error de cast en Expo Go
    if (Platform.OS === 'android') {
      try {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#10B981',
          enableVibrate: true,
          enableLights: true,
        });

        // Canal para alertas de consumo alto
        await Notifications.setNotificationChannelAsync('high-consumption', {
          name: 'Alertas de Consumo Alto',
          importance: Notifications.AndroidImportance.HIGH,
          vibrationPattern: [0, 500, 250, 500],
          lightColor: '#EF4444',
          enableVibrate: true,
          enableLights: true,
        });
      } catch (channelError) {
        // Si falla la creación de canales en Expo Go, continuar
        console.warn('No se pudieron crear canales de notificación (normal en Expo Go):', channelError.message);
      }
    }

    // Verificar permisos actuales
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    // Si no hay permisos, solicitarlos
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.warn('Permisos de notificaciones denegados por el usuario');
      return null;
    }

    // Obtener token de notificaciones push
    // Nota: En Expo Go (SDK 53+), las notificaciones remotas no funcionan
    // Esto solo funcionará en development builds o producción
    const projectId = Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;

    if (!projectId) {
      console.warn('Push notifications requieren un development build (no disponible en Expo Go)');
      return null;
    }

    try {
      const token = await Notifications.getExpoPushTokenAsync({
        projectId,
      });

      // Token registrado exitosamente (comentado en producción por seguridad)
      // console.log('Push token:', token.data);
      return token.data;
    } catch (tokenError) {
      // En Expo Go esto fallará, pero las notificaciones locales seguirán funcionando
      console.warn('No se pudo obtener token push (normal en Expo Go):', tokenError.message);
      return null;
    }
  } catch (error) {
    console.error('Error al registrar notificaciones:', error);
    return null;
  }
};

/**
 * Programar una notificación local
 */
export const scheduleLocalNotification = async ({
  title,
  body,
  data = {},
  trigger = null,
  channelId = 'default',
}) => {
  try {
    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data,
        sound: true,
        priority: Notifications.AndroidNotificationPriority.HIGH,
      },
      trigger: trigger || null, // null = inmediato
    });

    return notificationId;
  } catch (error) {
    console.error('Error al programar notificación:', error);
    return null;
  }
};

/**
 * Enviar notificación inmediata
 */
export const sendImmediateNotification = async (title, body, data = {}) => {
  return await scheduleLocalNotification({
    title,
    body,
    data,
    trigger: null,
  });
};

/**
 * Enviar notificación de consumo alto
 */
export const sendHighConsumptionAlert = async (meterName, consumption, averageConsumption) => {
  const percentageIncrease = averageConsumption > 0
    ? (((consumption - averageConsumption) / averageConsumption) * 100).toFixed(0)
    : '0';

  return await scheduleLocalNotification({
    title: '⚠️ Consumo Alto Detectado',
    body: `${meterName}: ${consumption} kWh (${percentageIncrease}% más que el promedio)`,
    data: {
      type: 'high_consumption',
      meterName,
      consumption,
      averageConsumption,
    },
    channelId: 'high-consumption',
  });
};

/**
 * Enviar notificación de recordatorio de lectura
 */
export const sendReadingReminder = async (meterName, daysSinceLastReading) => {
  return await scheduleLocalNotification({
    title: '📊 Recordatorio de Lectura',
    body: `Hace ${daysSinceLastReading} días que no registras lectura en ${meterName}`,
    data: {
      type: 'reading_reminder',
      meterName,
      daysSinceLastReading,
    },
  });
};

/**
 * Programar notificación recurrente (ej: recordatorio semanal)
 */
export const scheduleRecurringNotification = async ({
  title,
  body,
  weekday = 1, // 1 = Lunes, 7 = Domingo
  hour = 9,
  minute = 0,
}) => {
  try {
    // Programar notificación semanal
    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        sound: true,
      },
      trigger: {
        weekday, // Día de la semana
        hour,
        minute,
        repeats: true,
      },
    });

    return notificationId;
  } catch (error) {
    console.error('Error al programar notificación recurrente:', error);
    return null;
  }
};

/**
 * Cancelar una notificación programada
 */
export const cancelScheduledNotification = async (notificationId) => {
  try {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
    return true;
  } catch (error) {
    console.error('Error al cancelar notificación:', error);
    return false;
  }
};

/**
 * Cancelar todas las notificaciones programadas
 */
export const cancelAllScheduledNotifications = async () => {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
    return true;
  } catch (error) {
    console.error('Error al cancelar todas las notificaciones:', error);
    return false;
  }
};

/**
 * Obtener todas las notificaciones programadas
 */
export const getAllScheduledNotifications = async () => {
  try {
    const notifications = await Notifications.getAllScheduledNotificationsAsync();
    return notifications;
  } catch (error) {
    console.error('Error al obtener notificaciones programadas:', error);
    return [];
  }
};

/**
 * Listener para notificaciones recibidas mientras la app está abierta
 */
export const addNotificationReceivedListener = (callback) => {
  return Notifications.addNotificationReceivedListener(callback);
};

/**
 * Listener para cuando el usuario toca una notificación
 */
export const addNotificationResponseReceivedListener = (callback) => {
  return Notifications.addNotificationResponseReceivedListener(callback);
};

/**
 * Limpiar todas las notificaciones de la bandeja
 */
export const dismissAllNotifications = async () => {
  try {
    await Notifications.dismissAllNotificationsAsync();
    return true;
  } catch (error) {
    console.error('Error al limpiar notificaciones:', error);
    return false;
  }
};
