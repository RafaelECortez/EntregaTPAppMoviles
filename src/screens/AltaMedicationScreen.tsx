/**
 * Pantalla de alta de nuevos recordatorios que valida los datos, 
 * permite adjuntar imagen (cámara o galería con manejo de permisos),
 * programa notificaciones locales y almacena mediante Zustand.
 */

import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert, Image, ScrollView } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { useMedicationStore } from '../stores/medicationStore';

// IMPORTACIONES GRANULARES DE EXPO-NOTIFICATIONS 
import { setNotificationHandler } from 'expo-notifications/build/NotificationsHandler';
import { getPermissionsAsync, requestPermissionsAsync } from 'expo-notifications/build/NotificationPermissions';

type Props = NativeStackScreenProps<RootStackParamList, 'AltaMedication'>;

setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function AltaMedicationScreen({ navigation }: Props) {
  const [name, setName] = useState('');
  const [timeValue, setTimeValue] = useState('');
  const [timeUnit, setTimeUnit] = useState<'seconds' | 'minutes' | 'hours'>('seconds');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const addMedication = useMedicationStore((state) => state.addMedication);

  useEffect(() => {
    const setupNotifications = async () => {
      try {
        const existingPermission = await getPermissionsAsync();
        if (existingPermission.status !== 'granted') {
          await requestPermissionsAsync();
        }
      } catch (error) {
        console.error('Error configurando notificaciones:', error);
      }
    };
    setupNotifications();
  }, []);

  // FUNCIÓN PARA TOMAR FOTO CON LA CÁMARA 
  const handleTakePhoto = async () => {
    try {
      const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
      
      if (!permissionResult.granted) {
        Alert.alert(
          'Permiso denegado',
          'Necesitamos acceso a la cámara para tomar la foto del medicamento. Podés intentar seleccionarla desde la galería.'
        );
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setSelectedImage(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo abrir la cámara.');
    }
  };

  // FUNCIÓN PARA SELECCIONAR DESDE LA GALERÍA 
  const handlePickFromGallery = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permissionResult.granted) {
        Alert.alert(
          'Permiso denegado',
          'Necesitamos acceso a tu galería para elegir una foto del medicamento.'
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setSelectedImage(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo abrir la galería.');
    }
  };

  // GUARDAR MEDICAMENTO
  const handleSaveMedication = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Por favor ingresa el nombre del medicamento.');
      return;
    }

    const numericValue = parseInt(timeValue, 10);
    if (isNaN(numericValue) || numericValue <= 0) {
      Alert.alert('Error', 'Por favor ingresa un valor de tiempo válido mayor a 0.');
      return;
    }

    const success = await addMedication(name, numericValue, timeUnit, selectedImage);

    if (success) {
      Alert.alert(
        'Éxito', 
        'Recordatorio creado y notificación programada correctamente.', 
        [{ 
          text: 'OK', 
          onPress: () => {
            if (navigation.canGoBack()) {
              navigation.goBack();
            } else {
              navigation.navigate('MainTabs');
            }
          } 
        }]
      );
    } else {
      Alert.alert('Error', 'No se pudo guardar el recordatorio.');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Nuevo Recordatorio</Text>
      
      <Text style={styles.label}>Nombre del Medicamento</Text>
      <TextInput 
        style={styles.input} 
        placeholder="Ej: Qura Plus" 
        placeholderTextColor="#888" 
        value={name} 
        onChangeText={setName} 
      />
      
      <Text style={styles.label}>Tiempo para el recordatorio (valor numérico)</Text>
      <TextInput 
        style={styles.input} 
        placeholder="Ej: 10" 
        placeholderTextColor="#888" 
        keyboardType="numeric" 
        value={timeValue} 
        onChangeText={setTimeValue} 
      />

      <Text style={styles.label}>Unidad de Tiempo</Text>
      <View style={styles.unitContainer}>
        {(['seconds', 'minutes', 'hours'] as const).map((unit) => (
          <TouchableOpacity 
            key={unit} 
            style={[styles.unitButton, timeUnit === unit && styles.selectedUnit]} 
            onPress={() => setTimeUnit(unit)}
          >
            <Text style={[styles.unitText, timeUnit === unit && styles.selectedUnitText]}>
              {unit === 'seconds' ? 'Segundos' : unit === 'minutes' ? 'Minutos' : 'Horas'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Sección de Imagen del Medicamento */}
      <Text style={styles.label}>Foto del Medicamento (Opcional)</Text>
      {selectedImage ? (
        <View style={styles.imagePreviewContainer}>
          <Image source={{ uri: selectedImage }} style={styles.imagePreview} />
          <TouchableOpacity style={styles.removeImageBtn} onPress={() => setSelectedImage(null)}>
            <Text style={styles.removeImageText}>Quitar foto</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.imageButtonsRow}>
          <TouchableOpacity style={styles.mediaButton} onPress={handleTakePhoto}>
            <Text style={styles.mediaButtonText}>📷 Tomar Foto</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.mediaButton} onPress={handlePickFromGallery}>
            <Text style={styles.mediaButtonText}>🖼️ Galería</Text>
          </TouchableOpacity>
        </View>
      )}

      <TouchableOpacity style={styles.saveButton} onPress={handleSaveMedication}>
        <Text style={styles.saveButtonText}>Guardar y Programar</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.cancelButton} 
        onPress={() => { if (navigation.canGoBack()) navigation.goBack(); else navigation.navigate('MainTabs'); }}
      >
        <Text style={styles.cancelButtonText}>Cancelar</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 20, backgroundColor: '#f5f5f5', justifyContent: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center', color: '#333' },
  label: { fontSize: 14, fontWeight: '600', color: '#444', marginBottom: 6, marginTop: 5 },
  input: { backgroundColor: '#fff', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#ddd', marginBottom: 10 },
  unitContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
  unitButton: { flex: 1, padding: 10, borderWidth: 1, borderColor: '#1976d2', borderRadius: 8, alignItems: 'center', marginHorizontal: 4 },
  selectedUnit: { backgroundColor: '#1976d2' },
  unitText: { color: '#1976d2', fontWeight: '600', fontSize: 12 },
  selectedUnitText: { color: '#fff' },
  imageButtonsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  mediaButton: { flex: 1, backgroundColor: '#e0e0e0', padding: 12, borderRadius: 8, alignItems: 'center', marginHorizontal: 4 },
  mediaButtonText: { color: '#333', fontWeight: '600', fontSize: 13 },
  imagePreviewContainer: { alignItems: 'center', marginBottom: 20 },
  imagePreview: { width: 100, height: 100, borderRadius: 50, marginBottom: 8, borderWidth: 1, borderColor: '#ccc' },
  removeImageText: { color: '#d32f2f', fontSize: 12, fontWeight: '600' },
  removeImageBtn: { padding: 4 },
  saveButton: { backgroundColor: '#2e7d32', padding: 15, borderRadius: 8, alignItems: 'center', marginBottom: 10, marginTop: 10 },
  saveButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  cancelButton: { alignItems: 'center', padding: 10 },
  cancelButtonText: { color: '#d32f2f', fontWeight: '600' },
});