import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';

export interface Medication {
  id: string;
  name: string;
  timeValue: number;
  timeUnit: 'seconds' | 'minutes' | 'hours';
}

interface Props {
  item: Medication;
  onDelete: (id: string) => void;
}

export default function MedicationItem({ item, onDelete }: Props) {
  // Traducir la unidad para mostrarla de forma amigable
  const unitText = {
    seconds: 'segundo(s)',
    minutes: 'minuto(s)',
    hours: 'hora(s)',
  }[item.timeUnit];

  return (
    <View style={styles.card} testID="medication-card">
      <View style={styles.infoContainer}>
        <Text style={styles.name} testID="medication-name">{item.name}</Text>
        <Text style={styles.time} testID="medication-time">
          Recordatorio en: {item.timeValue} {unitText}
        </Text>
      </View>

      <TouchableOpacity 
        style={styles.deleteButton} 
        onPress={() => onDelete(item.id)}
        testID="delete-button"
      >
        <Text style={styles.deleteText}>Eliminar</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    marginVertical: 8,
    marginHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    elevation: 2, // Sombra para Android
  },
  infoContainer: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  time: {
    fontSize: 14,
    color: '#666',
  },
  deleteButton: {
    backgroundColor: '#ffebee',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  deleteText: {
    color: '#c62828',
    fontWeight: 'bold',
    fontSize: 12,
  },
});
