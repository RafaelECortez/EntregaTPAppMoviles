import React, { useEffect, useRef } from 'react';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { NavigationContainer, NavigationContainerRef } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import type { EventSubscription } from 'expo-modules-core';

// ─── IMPORTACIÓN GRANULAR PARA ESCUCHAR CLICS EN NOTIFICACIONES ───────────────
import { addNotificationResponseReceivedListener } from 'expo-notifications/build/NotificationsEmitter';

import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import MainTabNavigator from './src/navigation/MainTabNavigator';
import AltaMedicationScreen from './src/screens/AltaMedicationScreen';
import { RootStackParamList } from './src/types/navigation';
import { useAuthStore } from './src/stores/authStore';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  const { isLoggedIn, isLoadingSession, checkSession } = useAuthStore();

  const navigationRef = useRef<NavigationContainerRef<RootStackParamList>>(null);
  const responseListener = useRef<EventSubscription | null>(null);

  useEffect(() => {
    checkSession();

    responseListener.current = addNotificationResponseReceivedListener(response => {
      const data = response.notification.request.content.data;
      console.log('[App] Notificación presionada con datos:', data);

      if (navigationRef.current?.isReady()) {
        navigationRef.current.navigate('MainTabs');
      }
    });

    return () => {
      if (responseListener.current) {
        responseListener.current.remove();
      }
    };
  }, []);

  if (isLoadingSession) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#1976d2" />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <NavigationContainer ref={navigationRef}>
        <Stack.Navigator 
          initialRouteName={isLoggedIn ? 'MainTabs' : 'Login'} 
          screenOptions={{ headerShown: false }}
        >
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
          <Stack.Screen name="MainTabs" component={MainTabNavigator} />
          <Stack.Screen name="AltaMedication" component={AltaMedicationScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }
});
