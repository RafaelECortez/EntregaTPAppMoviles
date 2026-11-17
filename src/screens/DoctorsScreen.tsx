import React, { useState, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  FlatList,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import DoctorItem from '../components/DoctorItem';
import { useAuthStore } from '../stores/authStore';
import { useDoctorStore } from '../stores/doctorStore';

export default function DoctorsScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const doctors = useDoctorStore((state) => state.doctors);
  const loadDoctors = useDoctorStore((state) => state.loadDoctors);
  const addDoctor = useDoctorStore((state) => state.addDoctor);
  const deleteDoctor = useDoctorStore((state) => state.deleteDoctor);
  const logout = useAuthStore((state) => state.logout);

  const [modalVisible, setModalVisible] = useState(false);
  const [doctorName, setDoctorName] = useState('');

  useFocusEffect(
    useCallback(() => {
      loadDoctors();
    }, [loadDoctors])
  );

  const handleCreateDoctor = async () => {
    if (!doctorName.trim()) {
      Alert.alert('Error', 'Por favor ingresa el nombre del médico.');
      return;
    }

    const success = await addDoctor(doctorName);
    if (success) {
      setDoctorName('');
      setModalVisible(false);
    } else {
      Alert.alert('Error', 'No se pudo guardar el médico.');
    }
  };

  const handleCloseModal = () => {
    setDoctorName('');
    setModalVisible(false);
  };

  const handleLogout = async () => {
    await logout();
    navigation.replace('Login');
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mis Médicos</Text>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Text style={styles.logoutText}>Cerrar Sesión</Text>
        </TouchableOpacity>
      </View>

      {/* Listado */}
      <View style={styles.content}>
        {doctors.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No tienes médicos registrados.</Text>
            <Text style={styles.emptySubText}>Toca el botón "+" para agregar uno.</Text>
          </View>
        ) : (
          <FlatList
            data={doctors}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <DoctorItem item={item} onDelete={deleteDoctor} />
            )}
            contentContainerStyle={styles.listContainer}
          />
        )}
      </View>

      {/* Botón flotante + */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      {/* Modal de Alta */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={handleCloseModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Nuevo Médico</Text>
            <Text style={styles.modalLabel}>Nombre del profesional</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Ej: Dr. Juan Pérez"
              placeholderTextColor="#888"
              value={doctorName}
              onChangeText={setDoctorName}
              autoFocus
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalBtn, styles.cancelBtn]}
                onPress={handleCloseModal}
              >
                <Text style={styles.cancelBtnText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalBtn, styles.acceptBtn]}
                onPress={handleCreateDoctor}
              >
                <Text style={styles.acceptBtnText}>Aceptar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    paddingHorizontal: 20,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    textAlign: 'center',
  },
  modalLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#444',
    marginBottom: 6,
  },
  modalInput: {
    backgroundColor: '#f9f9f9',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
    fontSize: 15,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  modalBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelBtn: {
    backgroundColor: '#ffebee',
  },
  cancelBtnText: {
    color: '#c62828',
    fontWeight: 'bold',
  },
  acceptBtn: {
    backgroundColor: '#2e7d32',
  },
  acceptBtnText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});