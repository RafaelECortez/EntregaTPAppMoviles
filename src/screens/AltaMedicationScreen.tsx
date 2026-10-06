/**
 * Pantalla de alta de nuevos recordatorios que valida los datos ingresados, 
 * programa notificaciones locales en el dispositivo y almacena la información 
 * de la medicación de manera local utilizando AsyncStorage.
 */

import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { Medication } from '../components/MedicationItem';

type Props = NativeStackScreenProps<RootStackParamList, 'AltaMedication'>;

// CONFIGURACIÓN DE NOTIFICACIONES

// Cuando la notificación llega mientras la aplicación está abierta, queremos mostrarla igualmente.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,

    // Para versiones nuevas de Expo
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export default function AltaMedicationScreen({ navigation }: Props) {
  const [name, setName] = useState('');
  const [timeValue, setTimeValue] = useState('');
  const [timeUnit, setTimeUnit] = useState<'seconds' | 'minutes' | 'hours'>('seconds');

  // PERMISOS Y CANAL DE ANDROID
  useEffect(() => {
    const setupNotifications = async () => {
      try {
        // Android 8+ - Crear canal de notificaciones
        if (Platform.OS === 'android') {
          await Notifications.setNotificationChannelAsync('recordatorios',
            {
              name: 'Recordatorios',
              importance: Notifications.AndroidImportance.HIGH,
              vibrationPattern: [0, 250, 250, 250],
              sound: 'default',
            }
          );
        }

        // Permisos
        const { status } = await Notifications.getPermissionsAsync();

        if (status !== 'granted') {
          const permission = await Notifications.requestPermissionsAsync();
          console.log( 'Permiso de notificaciones:', permission.status);
        }

        // Aviso si estamos en un emulador
        if (!Device.isDevice) {
          console.log('Se está ejecutando en un emulador. Las notificaciones pueden tener limitaciones.');
        }
      } catch (error) {
        console.error( 'Error configurando notificaciones:', error);
      }
    };

    setupNotifications();

  }, []);

  // GUARDAR MEDICAMENTO
  const handleSaveMedication = async () => {
    // Validar nombre
    if (!name.trim()) {
      Alert.alert('Error','Por favor ingresa el nombre del medicamento.');
      return;
    }

    // Validar tiempo
    const numericValue = parseInt(timeValue, 10);

    if (isNaN(numericValue) ||numericValue <= 0) {
      Alert.alert('Error','Por favor ingresa un valor de tiempo válido mayor a 0.');
      return;
    }

    try {
      // CALCULAR SEGUNDOS
      let triggerSeconds = numericValue;

      if (timeUnit === 'minutes') {triggerSeconds = numericValue * 60;}
      if (timeUnit === 'hours') {triggerSeconds = numericValue * 3600;}

      console.log('Programando notificación en:', triggerSeconds, 'segundos');

      // PROGRAMAR NOTIFICACIÓN LOCAL
      const notificationId = await Notifications.scheduleNotificationAsync({
          content: {
            title: '⏰ ¡Hora de tu medicación!',
            body: `Es momento de tomar: ${name.trim()}`,
            sound: 'default',
          },
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
            seconds: triggerSeconds,
            repeats: false,
          },
      });

      console.log('Notificación programada:',notificationId);

      // CREAR MEDICAMENTO
      const newMedication: Medication = {
        id: Date.now().toString(),
        name: name.trim(),
        timeValue: numericValue,
        timeUnit,
      };

      // GUARDAR EN ASYNC STORAGE
      const storedMeds = await AsyncStorage.getItem('medications_list');
      const medsList: Medication[] = storedMeds ? JSON.parse(storedMeds) : [];
      
      medsList.push(newMedication);
      await AsyncStorage.setItem('medications_list', JSON.stringify(medsList));

      // ÉXITO
      Alert.alert('Éxito', 'Recordatorio creado y notificación programada correctamente.', [{text: 'OK', onPress: () => navigation.goBack(),},]);

    } catch (error) {
      console.error('Error programando notificación:',error);
      Alert.alert('Error', 'No se pudo guardar el recordatorio.');
    }
  };

  // INTERFAZ
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Nuevo Recordatorio</Text>
      <Text style={styles.label}>Nombre del Medicamento</Text>
      <TextInput style={styles.input} placeholder="Ej: Qura Plus" placeholderTextColor="#888" value={name} onChangeText={setName}/>
      
      <Text style={styles.label}>Tiempo para el recordatorio (valor numérico)</Text>
      <TextInput style={styles.input} placeholder="Ej: 10" placeholderTextColor="#888" keyboardType="numeric" value={timeValue} onChangeText={setTimeValue}/>
      <Text style={styles.label}>Unidad de Tiempo</Text>

      <View style={styles.unitContainer}>
        {(['seconds', 'minutes', 'hours'] as const).map(
          (unit) => (
            <TouchableOpacity key={unit} style={[styles.unitButton, timeUnit === unit && styles.selectedUnit,]} onPress={() => setTimeUnit(unit)}>
              <Text style={[styles.unitText, timeUnit === unit && styles.selectedUnitText,]}>
                {unit === 'seconds' ? 'Segundos' : unit === 'minutes' ? 'Minutos' : 'Horas'}
              </Text>
            </TouchableOpacity>
          )
        )}
      </View>

      <TouchableOpacity style={styles.saveButton} onPress={handleSaveMedication}>
        <Text style={styles.saveButtonText}>Guardar y Programar</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.cancelButton} onPress={() => navigation.goBack()}>
        <Text style={styles.cancelButtonText}>Cancelar</Text>
      </TouchableOpacity>
    </View>
  );
}

// ESTILOS
const styles = StyleSheet.create({
  container: {flex: 1, padding: 20, backgroundColor: '#f5f5f5', justifyContent: 'center'},
  title: {fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center', color: '#333'},
  label: {fontSize: 14, fontWeight: '600', color: '#444', marginBottom: 6},
  input: {backgroundColor: '#fff', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#ddd', marginBottom: 15},
  unitContainer: {flexDirection: 'row', justifyContent: 'space-between', marginBottom: 25},
  unitButton: {flex: 1, padding: 10, borderWidth: 1, borderColor: '#1976d2', borderRadius: 8, alignItems: 'center', marginHorizontal: 4},
  selectedUnit: {backgroundColor: '#1976d2'},
  unitText: {color: '#1976d2', fontWeight: '600', fontSize: 12},
  selectedUnitText: {color: '#fff'},
  saveButton: {backgroundColor: '#2e7d32', padding: 15, borderRadius: 8, alignItems: 'center', marginBottom: 10},
  saveButtonText: {color: '#fff', fontWeight: 'bold', fontSize: 16},
  cancelButton: {alignItems: 'center', padding: 10},
  cancelButtonText: {color: '#d32f2f', fontWeight: '600'},
});
