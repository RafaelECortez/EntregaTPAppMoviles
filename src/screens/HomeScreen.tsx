/**
 * Pantalla principal de la aplicación que muestra el listado de recordatorios 
 * de medicación guardados localmente, permitiendo agregar nuevos elementos, 
 * eliminar existentes y cerrar la sesión actual del usuario.
 */

import React, { useState, useCallback } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, FlatList, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import MedicationItem, { Medication } from '../components/MedicationItem';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

export default function HomeScreen({ navigation }: Props) {
  const [medications, setMedications] = useState<Medication[]>([]);

  // Cargar medicamentos cada vez que la pantalla recibe el foco (ej: al volver de AltaMedication)
  useFocusEffect(
    useCallback(() => {
      loadMedications();
    }, [])
  );

  const loadMedications = async () => {
    try {
      const storedMeds = await AsyncStorage.getItem('medications_list');
      if (storedMeds) {
        setMedications(JSON.parse(storedMeds));
      } else {
        setMedications([]);
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudieron cargar los recordatorios.');
    }
  };

  const handleDeleteMedication = async (id: string) => {
    try {
      const updatedList = medications.filter((item) => item.id !== id);
      setMedications(updatedList);
      await AsyncStorage.setItem('medications_list', JSON.stringify(updatedList));
    } catch (error) {
      Alert.alert('Error', 'No se pudo eliminar el elemento.');
    }
  };

  const handleLogout = async () => {
    await AsyncStorage.setItem('is_logged_in', 'false');
    navigation.replace('Login');
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Recordatorio de Medicación</Text>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Text style={styles.logoutText}>Cerrar Sesión</Text>
        </TouchableOpacity>
      </View>

      {/* Contenido Principal / Listado */}
      <View style={styles.content}>
        {medications.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No tienes recordatorios activos.</Text>
            <Text style={styles.emptySubText}>Toca el botón "+" para agregar uno.</Text>
          </View>
        ) : (
          <FlatList
            data={medications}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <MedicationItem item={item} onDelete={handleDeleteMedication} />
            )}
            contentContainerStyle={styles.listContainer}
          />
        )}
      </View>

      {/* Botón flotante para ir a la pantalla de Alta */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('AltaMedication')}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { 
    height: 90, 
    backgroundColor: '#1976d2', 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'flex-end', 
    paddingBottom: 15, 
    paddingHorizontal: 20 
  },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  logoutButton: { backgroundColor: '#d32f2f', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 5 },
  logoutText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  content: { flex: 1 },
  listContainer: { paddingVertical: 10 },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  emptyText: { fontSize: 16, fontWeight: 'bold', color: '#555', marginBottom: 5 },
  emptySubText: { fontSize: 14, color: '#888' },
  fab: {
    position: 'absolute',
    right: 25,
    bottom: 25,
    backgroundColor: '#2e7d32',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
  },
  fabText: { color: '#fff', fontSize: 32, fontWeight: 'bold', marginTop: -2 },
});
