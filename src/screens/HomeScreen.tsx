/**
 * Pantalla principal de la aplicación que muestra el listado de recordatorios 
 * de medicación guardados mediante Zustand, permitiendo agregar nuevos elementos, 
 * eliminar existentes y cerrar la sesión actual del usuario.
 */

import React, { useCallback } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, FlatList } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import MedicationItem from '../components/MedicationItem';
import { useAuthStore } from '../stores/authStore';
import { useMedicationStore } from '../stores/medicationStore';

export default function HomeScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const medications = useMedicationStore((state) => state.medications);
  const loadMedications = useMedicationStore((state) => state.loadMedications);
  const deleteMedication = useMedicationStore((state) => state.deleteMedication);
  const logout = useAuthStore((state) => state.logout);

  useFocusEffect(
    useCallback(() => {
      loadMedications();
    }, [loadMedications])
  );

  const handleDeleteMedication = async (id: string) => {
    await deleteMedication(id);
  };

  const handleLogout = async () => {
    await logout();
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