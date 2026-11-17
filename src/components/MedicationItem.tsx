import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image } from 'react-native';
import { Medication } from '../stores/medicationStore';

interface Props {
  item: Medication;
  onDelete: (id: string) => void;
}

export default function MedicationItem({ item, onDelete }: Props) {
  const unitText = {
    seconds: 'segundo(s)',
    minutes: 'minuto(s)',
    hours: 'hora(s)',
  }[item.timeUnit];

  return (
    <View style={styles.card} testID="medication-card">
      {/* Miniatura de la imagen asociada */}
      {item.imageUri ? (
        <Image source={{ uri: item.imageUri }} style={styles.thumbnail} />
      ) : (
        <View style={[styles.thumbnail, styles.placeholderThumb]}>
          <Text style={styles.placeholderEmoji}>💊</Text>
        </View>
      )}

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
    backgroundColor: '#fcfdff',
    borderRadius: 12,
    padding: 14,
    marginVertical: 8,
    marginHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5eaf1',
    shadowColor: '#1e293b',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  thumbnail: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
    backgroundColor: '#eee',
  },
  placeholderThumb: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#e3f2fd',
  },
  placeholderEmoji: {
    fontSize: 22,
  },
  infoContainer: {
    flex: 1,
    marginRight: 8,
    minWidth: 0,
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    color: '#243247',
    marginBottom: 5,
  },
  time: {
    fontSize: 13,
    color: '#718096',
    lineHeight: 18,
  },
  deleteButton: {
    backgroundColor: '#fff1f2',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    flexShrink: 0,
  },
  deleteText: {
    color: '#c2414b',
    fontWeight: 'bold',
    fontSize: 12,
  },
});
