import React from 'react';
import { Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MainTabParamList } from '../types/navigation';
import HomeScreen from '../screens/HomeScreen';
import DoctorsScreen from '../screens/DoctorsScreen';

const Tab = createBottomTabNavigator<MainTabParamList>();

export default function MainTabNavigator() {
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      initialRouteName="MedicamentosTab"
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#1976d2',
        tabBarInactiveTintColor: '#777',
        tabBarStyle: {
          height: 60 + insets.bottom,
          paddingBottom: 8 + insets.bottom,
          paddingTop: 6,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: 'bold',
        },
      }}
    >
      <Tab.Screen
        name="MedicamentosTab"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Medicamentos',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>💊</Text>,
        }}
      />
      <Tab.Screen
        name="MedicosTab"
        component={DoctorsScreen}
        options={{
          tabBarLabel: 'Médicos',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>🩺</Text>,
        }}
      />
    </Tab.Navigator>
  );
}
