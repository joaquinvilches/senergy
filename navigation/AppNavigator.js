import React from 'react';
import { Text } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { COLORS } from '../utils/constants';

import { HomeScreen } from '../screens/HomeScreen';
import { RegisterMeterScreen } from '../screens/RegisterMeterScreen';
import { MeterDetailScreen } from '../screens/MeterDetailScreen';
import { NewReadingScreen } from '../screens/NewReadingScreen';
import { StatsScreen } from '../screens/StatsScreen';
import { ProfileScreen } from '../screens/ProfileScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Navegación de medidores
const HomeNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: COLORS.PRIMARY,
        },
        headerTintColor: COLORS.WHITE,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen
        name="HomeMain"
        component={HomeScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="RegisterMeter"
        component={RegisterMeterScreen}
        options={{
          title: 'Nuevo Medidor',
          headerBackTitle: 'Atrás',
        }}
      />
      <Stack.Screen
        name="MeterDetail"
        component={MeterDetailScreen}
        options={{
          title: 'Detalle del Medidor',
          headerBackTitle: 'Atrás',
        }}
      />
      <Stack.Screen
        name="NewReading"
        component={NewReadingScreen}
        options={{
          title: 'Nueva Lectura',
          headerBackTitle: 'Atrás',
        }}
      />
    </Stack.Navigator>
  );
};

// Navegación de estadísticas
const StatsNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: COLORS.PRIMARY,
        },
        headerTintColor: COLORS.WHITE,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen
        name="StatsMain"
        component={StatsScreen}
        options={{
          title: 'Estadísticas',
        }}
      />
    </Stack.Navigator>
  );
};

// Navegación de perfil
const ProfileNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: COLORS.PRIMARY,
        },
        headerTintColor: COLORS.WHITE,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen
        name="ProfileMain"
        component={ProfileScreen}
        options={{
          headerShown: false,
        }}
      />
    </Stack.Navigator>
  );
};

// Navegación de Tabs principal
export const AppNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarStyle: {
          backgroundColor: COLORS.WHITE,
          borderTopColor: COLORS.BACKGROUND,
          borderTopWidth: 1,
          paddingBottom: 8,
          paddingTop: 8,
          height: 100,
        },
        tabBarActiveTintColor: COLORS.PRIMARY,
        tabBarInactiveTintColor: COLORS.TEXT_LIGHT,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: 4,
        },
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeNavigator}
        options={{
          tabBarLabel: 'Medidores',
          tabBarIcon: () => <Text style={{ fontSize: 24 }}>⚡</Text>,
        }}
      />
      <Tab.Screen
        name="Stats"
        component={StatsNavigator}
        options={{
          tabBarLabel: 'Estadísticas',
          tabBarIcon: () => <Text style={{ fontSize: 24 }}>📊</Text>,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileNavigator}
        options={{
          tabBarLabel: 'Perfil',
          tabBarIcon: () => <Text style={{ fontSize: 24 }}>👤</Text>,
        }}
      />
    </Tab.Navigator>
  );
};