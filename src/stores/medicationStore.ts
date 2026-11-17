import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { scheduleNotificationAsync } from 'expo-notifications/build/scheduleNotificationAsync';
import { SchedulableTriggerInputTypes } from 'expo-notifications/build/Notifications.types';

export interface Medication {
  id: string;
  name: string;
  timeValue: number;
  timeUnit: 'seconds' | 'minutes' | 'hours';
  imageUri?: string | null;
}

interface MedicationState {
  medications: Medication[];
  loadMedications: () => Promise<void>;
  addMedication: (
    name: string, 
    timeValue: number, 
    timeUnit: 'seconds' | 'minutes' | 'hours',
    imageUri?: string | null
  ) => Promise<boolean>;
  deleteMedication: (id: string) => Promise<void>;
}

export const useMedicationStore = create<MedicationState>((set, get) => ({
  medications: [],

  loadMedications: async () => {
    try {
      const storedMeds = await AsyncStorage.getItem('medications_list');
      if (storedMeds) {
        set({ medications: JSON.parse(storedMeds) });
      } else {
        set({ medications: [] });
      }
    } catch (error) {
      console.error('Error al cargar medicamentos:', error);
    }
  },

  addMedication: async (name, timeValue, timeUnit, imageUri) => {
    try {
      let triggerSeconds = timeValue;
      if (timeUnit === 'minutes') { triggerSeconds = timeValue * 60; }
      if (timeUnit === 'hours') { triggerSeconds = timeValue * 3600; }

      // Programar la notificación local
      await scheduleNotificationAsync({
        content: {
          title: '⏰ ¡Hora de tu medicación!',
          body: `Es momento de tomar: ${name.trim()}`,
          sound: 'default',
        },
        trigger: {
          type: SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds: triggerSeconds,
          repeats: false,
        },
      });

      const newMedication: Medication = {
        id: Date.now().toString(),
        name: name.trim(),
        timeValue,
        timeUnit,
        imageUri: imageUri || null,
      };

      const updatedList = [...get().medications, newMedication];
      set({ medications: updatedList });
      await AsyncStorage.setItem('medications_list', JSON.stringify(updatedList));
      return true;
    } catch (error) {
      console.error('Error al guardar y programar medicamento:', error);
      return false;
    }
  },

  deleteMedication: async (id) => {
    try {
      const updatedList = get().medications.filter((item) => item.id !== id);
      set({ medications: updatedList });
      await AsyncStorage.setItem('medications_list', JSON.stringify(updatedList));
    } catch (error) {
      console.error('Error al eliminar medicamento:', error);
    }
  },
}));
