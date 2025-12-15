import React from 'react';
import { View } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDarkMode } from '../utils/darkModeContext';
import Icon from '../components/Icon';

import { HomeScreen } from '../screens/HomeScreen';
import { RegisterMeterScreen } from '../screens/RegisterMeterScreen';
import { MeterDetailScreen } from '../screens/MeterDetailScreen';
import { NewReadingScreen } from '../screens/NewReadingScreen';
import { StatsScreen } from '../screens/StatsScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { FeedbackScreen } from '../screens/FeedbackScreen';
import { ReportIncidentScreen } from '../screens/ReportIncidentScreen';
import { IncidentsListScreen } from '../screens/IncidentsListScreen';
import { PricingScreen } from '../screens/PricingScreen';
import { LegalScreen } from '../screens/LegalScreen';
import OfflineBanner from '../components/OfflineBanner';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Navegación de medidores
const HomeNavigator = () => {
  const { colors } = useDarkMode();

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.PRIMARY,
        },
        headerTintColor: colors.WHITE,
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
      <Stack.Screen
        name="Pricing"
        component={PricingScreen}
        options={{
          title: 'Planes',
          headerBackTitle: 'Atrás',
        }}
      />
    </Stack.Navigator>
  );
};

// Navegación de estadísticas
const StatsNavigator = () => {
  const { colors } = useDarkMode();

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.PRIMARY,
        },
        headerTintColor: colors.WHITE,
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
      <Stack.Screen
        name="Pricing"
        component={PricingScreen}
        options={{
          title: 'Planes',
          headerBackTitle: 'Atrás',
        }}
      />
    </Stack.Navigator>
  );
};

// Navegación de perfil
const ProfileNavigator = () => {
  const { colors } = useDarkMode();

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.PRIMARY,
        },
        headerTintColor: colors.WHITE,
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
      <Stack.Screen
        name="FeedbackScreen"
        component={FeedbackScreen}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="IncidentsListScreen"
        component={IncidentsListScreen}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="ReportIncidentScreen"
        component={ReportIncidentScreen}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="Pricing"
        component={PricingScreen}
        options={{
          title: 'Planes',
          headerBackTitle: 'Atrás',
        }}
      />
      <Stack.Screen
        name="LegalScreen"
        component={LegalScreen}
        options={{
          headerShown: false,
        }}
      />
    </Stack.Navigator>
  );
};

// Navegación de Tabs principal
export const AppNavigator = () => {
  const { colors } = useDarkMode();
  const insets = useSafeAreaInsets();

  // Calcular el padding y altura del TabBar según el dispositivo
  const tabBarHeight = 60; // Altura base del contenido
  const tabBarPaddingBottom = Math.max(insets.bottom, 8); // Usar el inset del dispositivo o mínimo 8px
  const totalTabBarHeight = tabBarHeight + tabBarPaddingBottom;

  return (
    <View style={{ flex: 1 }}>
      <OfflineBanner />
      <Tab.Navigator
        screenOptions={{
          tabBarStyle: {
            backgroundColor: colors.CARD,
            borderTopColor: colors.BORDER,
            borderTopWidth: 1,
            paddingBottom: tabBarPaddingBottom,
            paddingTop: 8,
            height: totalTabBarHeight,
          },
          tabBarActiveTintColor: colors.PRIMARY,
          tabBarInactiveTintColor: colors.TEXT_LIGHT,
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
            tabBarIcon: ({ focused, color }) => (
              <Icon
                name={focused ? 'lightning-bolt' : 'lightning-bolt-outline'}
                size={24}
                color={color}
              />
            ),
          }}
        />
        <Tab.Screen
          name="Stats"
          component={StatsNavigator}
          options={{
            tabBarLabel: 'Estadísticas',
            tabBarIcon: ({ focused, color }) => (
              <Icon
                name={focused ? 'chart-box' : 'chart-line'}
                size={24}
                color={color}
              />
            ),
          }}
        />
        <Tab.Screen
          name="Profile"
          component={ProfileNavigator}
          options={{
            tabBarLabel: 'Perfil',
            tabBarIcon: ({ focused, color }) => (
              <Icon
                name={focused ? 'account-circle' : 'account-circle-outline'}
                size={24}
                color={color}
              />
            ),
          }}
        />
      </Tab.Navigator>
    </View>
  );
};