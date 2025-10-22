import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  SafeAreaView,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { MeterCard } from '../components/MeterCard';
import { getUserMeters, deleteMeter } from '../services/meterService';
import { getCurrentUser } from '../services/authService';
import { useDarkMode } from '../utils/darkModeContext';

export const HomeScreen = ({ navigation }) => {
  const { colors } = useDarkMode(); // <<--- usar paleta dinámica del contexto
  const styles = createStyles(colors);

  const [meters, setMeters] = useState([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    React.useCallback(() => {
      loadMeters();
    }, [])
  );

  const loadMeters = async () => {
    try {
      setLoading(true);
      const user = getCurrentUser();
      if (user) {
        const userMeters = await getUserMeters(user.uid);
        console.log('Medidores cargados:', userMeters);
        setMeters(userMeters);
      }
    } catch (error) {
      console.log('Error loading meters:', error);
      Alert.alert('Error', 'No se pudieron cargar los medidores');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMeter = (meterId, meterName) => {
    Alert.alert(
      'Eliminar medidor',
      `¿Estás seguro de que deseas eliminar "${meterName}"?`,
      [
        { text: 'Cancelar', onPress: () => {}, style: 'cancel' },
        {
          text: 'Eliminar',
          onPress: async () => {
            try {
              const user = getCurrentUser();
              await deleteMeter(user.uid, meterId);
              setMeters(meters.filter(m => m.id !== meterId));
              Alert.alert('Éxito', 'Medidor eliminado correctamente');
            } catch (error) {
              Alert.alert('Error', 'No se pudo eliminar el medidor');
            }
          },
          style: 'destructive',
        },
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={colors.PRIMARY} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Encabezado */}
      <View style={styles.header}>
        <Text style={styles.title}>Mis Medidores</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('RegisterMeter')}
        >
          <Text style={styles.addButtonText}>+ Agregar</Text>
        </TouchableOpacity>
      </View>

      {/* Lista de medidores */}
      {meters.length > 0 ? (
        <FlatList
          data={meters}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <MeterCard
              meter={item}
              onPress={() => navigation.navigate('MeterDetail', { meterId: item.id })}
              onDelete={() => handleDeleteMeter(item.id, item.name)}
            />
          )}
          contentContainerStyle={styles.list}
          scrollEnabled={true}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyEmoji}>📊</Text>
          <Text style={styles.emptyTitle}>No hay medidores</Text>
          <Text style={styles.emptySubtitle}>
            Agrega tu primer medidor para comenzar a monitorear tu consumo
          </Text>
          <TouchableOpacity
            style={styles.emptyButton}
            onPress={() => navigation.navigate('RegisterMeter')}
          >
            <Text style={styles.emptyButtonText}>Crear medidor</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
};

// ---- estilos dependientes del tema (contexto) ----
const createStyles = (colors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.BACKGROUND,
    },
    centerContent: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 40,
      backgroundColor: colors.CARD,     // antes: COLORS.WHITE
      borderBottomWidth: 1,
      borderBottomColor: colors.BORDER, // antes: COLORS.BACKGROUND
    },
    title: {
      fontSize: 28,
      fontWeight: 'bold',
      color: colors.PRIMARY, // mantiene tu acento
    },
    addButton: {
      backgroundColor: colors.PRIMARY,
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: 20,
    },
    addButtonText: {
      color: colors.WHITE,   // ya definido en el contexto
      fontWeight: 'bold',
      fontSize: 14,
    },
    list: {
      paddingHorizontal: 16,
      paddingVertical: 12,
      paddingBottom: 20,
    },
    emptyState: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 32,
    },
    emptyEmoji: {
      fontSize: 60,
      marginBottom: 16,
    },
    emptyTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: colors.TEXT_DARK, // dependiente del tema
      marginBottom: 8,
      textAlign: 'center',
    },
    emptySubtitle: {
      fontSize: 14,
      color: colors.TEXT_LIGHT, // dependiente del tema
      textAlign: 'center',
      marginBottom: 24,
      lineHeight: 20,
    },
    emptyButton: {
      backgroundColor: colors.PRIMARY,
      paddingHorizontal: 32,
      paddingVertical: 12,
      borderRadius: 20,
    },
    emptyButtonText: {
      color: colors.WHITE,
      fontWeight: 'bold',
      fontSize: 14,
    },
  });
