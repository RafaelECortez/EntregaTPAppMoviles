import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface DoctorLocation {
  source: 'gps' | 'manual';
  latitude?: number;
  longitude?: number;
  altitude?: number | null;
  accuracy?: number | null;
  address?: string;
}

export interface DoctorContact {
  name: string;
  phone: string;
}

export interface DoctorAppointment {
  source: 'calendar' | 'manual';
  description: string;
  eventId?: string;
}

export interface Doctor {
  id: string;
  name: string;
  location?: DoctorLocation | null;
  contact?: DoctorContact | null;
  appointment?: DoctorAppointment | null;
}

interface DoctorState {
  doctors: Doctor[];
  loadDoctors: () => Promise<void>;
  addDoctor: (name: string) => Promise<boolean>;
  deleteDoctor: (id: string) => Promise<void>;
  updateDoctorLocation: (id: string, location: DoctorLocation) => Promise<void>;
  updateDoctorContact: (id: string, contact: DoctorContact) => Promise<void>;
  updateDoctorAppointment: (id: string, appointment: DoctorAppointment) => Promise<void>;
}

export const useDoctorStore = create<DoctorState>((set, get) => ({
  doctors: [],

  loadDoctors: async () => {
    try {
      const storedDoctors = await AsyncStorage.getItem('doctors_list');
      if (storedDoctors) {
        set({ doctors: JSON.parse(storedDoctors) });
      } else {
        set({ doctors: [] });
      }
    } catch (error) {
      console.error('Error al cargar médicos:', error);
    }
  },

  addDoctor: async (name) => {
    try {
      const newDoctor: Doctor = {
        id: Date.now().toString(),
        name: name.trim(),
        location: null,
        contact: null,
        appointment: null,
      };

      const updatedList = [...get().doctors, newDoctor];
      set({ doctors: updatedList });
      await AsyncStorage.setItem('doctors_list', JSON.stringify(updatedList));
      return true;
    } catch (error) {
      console.error('Error al agregar médico:', error);
      return false;
    }
  },

  deleteDoctor: async (id) => {
    try {
      const updatedList = get().doctors.filter((doc) => doc.id !== id);
      set({ doctors: updatedList });
      await AsyncStorage.setItem('doctors_list', JSON.stringify(updatedList));
    } catch (error) {
      console.error('Error al eliminar médico:', error);
    }
  },

  updateDoctorLocation: async (id, location) => {
    try {
      const updatedList = get().doctors.map((doc) =>
        doc.id === id ? { ...doc, location } : doc
      );
      set({ doctors: updatedList });
      await AsyncStorage.setItem('doctors_list', JSON.stringify(updatedList));
    } catch (error) {
      console.error('Error al actualizar ubicación del médico:', error);
    }
  },

  updateDoctorContact: async (id, contact) => {
    try {
      const updatedList = get().doctors.map((doc) =>
        doc.id === id ? { ...doc, contact } : doc
      );
      set({ doctors: updatedList });
      await AsyncStorage.setItem('doctors_list', JSON.stringify(updatedList));
    } catch (error) {
      console.error('Error al actualizar contacto del médico:', error);
    }
  },

  updateDoctorAppointment: async (id, appointment) => {
    try {
      const updatedList = get().doctors.map((doc) =>
        doc.id === id ? { ...doc, appointment } : doc
      );
      set({ doctors: updatedList });
      await AsyncStorage.setItem('doctors_list', JSON.stringify(updatedList));
    } catch (error) {
      console.error('Error al actualizar turno del médico:', error);
    }
  },
}));
