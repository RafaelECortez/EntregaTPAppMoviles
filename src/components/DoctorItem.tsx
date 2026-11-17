import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  Modal,
  FlatList,
  Platform,
} from 'react-native';
import * as Location from 'expo-location';
import * as Calendar from 'expo-calendar/legacy';
import {
  Contact,
  ContactField,
  requestPermissionsAsync as requestContactsPermissionsAsync,
} from 'expo-contacts';
import { Doctor, useDoctorStore } from '../stores/doctorStore';

interface Props {
  item: Doctor;
  onDelete: (id: string) => void;
}

interface DeviceContactOption {
  id: string;
  name: string;
  phone: string;
}

export default function DoctorItem({ item, onDelete }: Props) {
  const updateDoctorLocation = useDoctorStore((state) => state.updateDoctorLocation);
  const updateDoctorContact = useDoctorStore((state) => state.updateDoctorContact);
  const updateDoctorAppointment = useDoctorStore((state) => state.updateDoctorAppointment);

  // Estados de Ubicación
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [showManualLocation, setShowManualLocation] = useState(false);
  const [manualAddress, setManualAddress] = useState('');

  // Estados de Contactos
  const [loadingContacts, setLoadingContacts] = useState(false);
  const [showManualContact, setShowManualContact] = useState(false);
  const [manualContactName, setManualContactName] = useState('');
  const [manualContactPhone, setManualContactPhone] = useState('');

  // Modal selector de contactos
  const [contactsModalVisible, setContactsModalVisible] = useState(false);
  const [deviceContacts, setDeviceContacts] = useState<DeviceContactOption[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<DeviceContactOption[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  // Estados de Calendario / Turno
  const [loadingCalendar, setLoadingCalendar] = useState(false);
  const [showCalendarForm, setShowCalendarForm] = useState(false);
  const [calendarDateText, setCalendarDateText] = useState(''); // Ej: 25/11/2026
  const [showManualAppointment, setShowManualAppointment] = useState(false);
  const [manualAppointmentText, setManualAppointmentText] = useState('');

  // OBTENER UBICACIÓN POR GPS
  const handleGetGpsLocation = async () => {
    setLoadingLocation(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== 'granted') {
        Alert.alert(
          'Permiso de ubicación denegado',
          'No se otorgó acceso al GPS. Podés ingresar la dirección del consultorio manualmente a continuación.'
        );
        setShowManualLocation(true);
        setLoadingLocation(false);
        return;
      }

      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      let resolvedAddress: string | undefined = undefined;
      try {
        const [geo] = await Location.reverseGeocodeAsync({
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
        });
        if (geo) {
          const parts = [geo.street, geo.streetNumber, geo.city, geo.region].filter(Boolean);
          if (parts.length > 0) {
            resolvedAddress = parts.join(', ');
          }
        }
      } catch {
        
      }

      await updateDoctorLocation(item.id, {
        source: 'gps',
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
        altitude: loc.coords.altitude,
        accuracy: loc.coords.accuracy,
        address: resolvedAddress,
      });

      setShowManualLocation(false);
    } catch (error) {
      Alert.alert(
        'Error GPS',
        'No se pudo obtener la ubicación actual. Intentá nuevamente o ingresala manualmente.'
      );
      setShowManualLocation(true);
    } finally {
      setLoadingLocation(false);
    }
  };

  const handleSaveManualLocation = async () => {
    if (!manualAddress.trim()) {
      Alert.alert('Campo vacío', 'Por favor ingresa una dirección.');
      return;
    }

    await updateDoctorLocation(item.id, {
      source: 'manual',
      address: manualAddress.trim(),
    });

    setManualAddress('');
    setShowManualLocation(false);
  };

  // LEER CONTACTOS DEL DISPOSITIVO
  const handleOpenDeviceContacts = async () => {
    setLoadingContacts(true);
    try {
      const { status } = await requestContactsPermissionsAsync();

      if (status !== 'granted') {
        Alert.alert(
          'Permiso de contactos denegado',
          'No se otorgó acceso a tu agenda. Podés ingresar el nombre y teléfono manualmente a continuación.'
        );
        setShowManualContact(true);
        setLoadingContacts(false);
        return;
      }

      const data = await Contact.getAllDetails(
        [ContactField.FULL_NAME, ContactField.PHONES],
        { limit: 200, offset: 0 }
      );

      const mapped: DeviceContactOption[] = data
        .filter((c) => c.fullName)
        .map((c) => ({
          id: c.id,
          name: c.fullName ?? 'Sin nombre',
          phone: c.phones?.[0]?.number ?? 'Sin teléfono',
        }));

      setDeviceContacts(mapped);
      setSearchQuery('');
      setSearchResults([]);
      setHasSearched(false);
      setContactsModalVisible(true);
    } catch (error) {
      console.error('Error leyendo contactos:', error);
      Alert.alert(
        'Error',
        'No se pudieron leer los contactos del dispositivo. Podés ingresarlo manualmente.'
      );
      setShowManualContact(true);
    } finally {
      setLoadingContacts(false);
    }
  };

  const handleExecuteContactSearch = () => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) {
      Alert.alert('Búsqueda vacía', 'Ingresá un nombre o número para buscar.');
      return;
    }

    const matches = deviceContacts.filter(
      (c) =>
        c.name.toLowerCase().includes(query) ||
        c.phone.toLowerCase().includes(query)
    );

    setSearchResults(matches);
    setHasSearched(true);
  };

  const handleSelectDeviceContact = async (contact: DeviceContactOption) => {
    await updateDoctorContact(item.id, {
      name: contact.name,
      phone: contact.phone,
    });
    setContactsModalVisible(false);
    setShowManualContact(false);
  };

  const handleSaveManualContact = async () => {
    if (!manualContactName.trim() || !manualContactPhone.trim()) {
      Alert.alert('Campos requeridos', 'Por favor ingresa el nombre y el teléfono del contacto.');
      return;
    }

    await updateDoctorContact(item.id, {
      name: manualContactName.trim(),
      phone: manualContactPhone.trim(),
    });

    setManualContactName('');
    setManualContactPhone('');
    setShowManualContact(false);
  };

  // CALENDARIO DEL DISPOSITIVO
  const handlePrepareCalendar = async () => {
    try {
      const { status } = await Calendar.requestCalendarPermissionsAsync();

      if (status !== 'granted') {
        Alert.alert(
          'Permiso de calendario denegado',
          'No se otorgó acceso al calendario. Podés anotar la fecha del turno manualmente (ej: "10 de diciembre").'
        );
        setShowManualAppointment(true);
        return;
      }

      // Si el permiso fue concedido, mostramos el input para elegir fecha y crear el evento
      setShowManualAppointment(false);
      setShowCalendarForm(!showCalendarForm);
    } catch (error) {
      Alert.alert('Error', 'No se pudo verificar el permiso de calendario.');
      setShowManualAppointment(true);
    }
  };

  const getWritableCalendarId = async (): Promise<string | null> => {
    if (Platform.OS === 'ios') {
      const defaultCalendar = await Calendar.getDefaultCalendarAsync();
      return defaultCalendar?.id ?? null;
    }

    // En Android buscamos el calendario principal modificable
    const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
    const primaryCal =
      calendars.find((cal) => cal.isPrimary && cal.allowsModifications) ||
      calendars.find((cal) => cal.allowsModifications);

    return primaryCal?.id ?? null;
  };

  const handleCreateCalendarEvent = async () => {
    if (!calendarDateText.trim()) {
      Alert.alert('Fecha requerida', 'Ingresá la fecha del turno (Ej: 25/11/2026).');
      return;
    }

    setLoadingCalendar(true);
    try {
      // Intentar parsear DD/MM/AAAA o usar mañana por defecto
      let startDate = new Date();
      startDate.setDate(startDate.getDate() + 1);
      startDate.setHours(10, 0, 0, 0);

      const dateParts = calendarDateText.trim().split('/');
      if (dateParts.length === 3) {
        const day = parseInt(dateParts[0], 10);
        const month = parseInt(dateParts[1], 10) - 1;
        const year = parseInt(dateParts[2], 10);
        const parsed = new Date(year, month, day, 10, 0, 0);
        if (!isNaN(parsed.getTime())) {
          startDate = parsed;
        }
      }

      const endDate = new Date(startDate.getTime() + 60 * 60 * 1000); // 1 hora de duración

      const calendarId = await getWritableCalendarId();
      if (!calendarId) {
        Alert.alert(
          'Sin calendario disponible',
          'No se encontró un calendario editable en el dispositivo. Se guardará como nota manual.'
        );
        await updateDoctorAppointment(item.id, {
          source: 'manual',
          description: calendarDateText.trim(),
        });
        setShowCalendarForm(false);
        setLoadingCalendar(false);
        return;
      }

      const eventId = await Calendar.createEventAsync(calendarId, {
        title: `Turno Médico: ${item.name}`,
        startDate,
        endDate,
        notes: `Consulta médica agendada desde RecordMedicApp (${calendarDateText.trim()})`,
        location: item.location?.address || undefined,
      });

      await updateDoctorAppointment(item.id, {
        source: 'calendar',
        description: `${calendarDateText.trim()} (Agendado en Calendario)`,
        eventId,
      });

      setCalendarDateText('');
      setShowCalendarForm(false);
      Alert.alert('¡Turno Agendado!', 'El evento fue creado en el calendario de tu dispositivo.');
    } catch (error) {
      console.error('Error creando evento en calendario:', error);
      Alert.alert(
        'Error',
        'No se pudo crear el evento en el calendario. Podés guardarlo usando la opción Manual.'
      );
      setShowManualAppointment(true);
    } finally {
      setLoadingCalendar(false);
    }
  };

  const handleSaveManualAppointment = async () => {
    if (!manualAppointmentText.trim()) {
      Alert.alert('Campo vacío', 'Por favor ingresa la fecha del próximo turno (Ej: 10 de diciembre).');
      return;
    }

    await updateDoctorAppointment(item.id, {
      source: 'manual',
      description: manualAppointmentText.trim(),
    });

    setManualAppointmentText('');
    setShowManualAppointment(false);
  };

  return (
    <View style={styles.card}>
      {/* Cabecera de la Card */}
      <View style={styles.headerRow}>
        <View style={styles.titleContainer}>
          <Text style={styles.emoji}>🩺</Text>
          <Text style={styles.name}>{item.name}</Text>
        </View>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => onDelete(item.id)}
        >
          <Text style={styles.deleteText}>Eliminar</Text>
        </TouchableOpacity>
      </View>

      {/* UBICACIÓN */}
      <View style={styles.sectionBox}>
        <Text style={styles.sectionTitle}>📍 Ubicación del Consultorio</Text>

        {item.location ? (
          <View style={styles.dataBox}>
            {item.location.source === 'gps' ? (
              <>
                <Text style={styles.dataText}>
                  <Text style={styles.bold}>Lat:</Text> {item.location.latitude?.toFixed(6)}° |{' '}
                  <Text style={styles.bold}>Lon:</Text> {item.location.longitude?.toFixed(6)}°
                </Text>
                <Text style={styles.dataText}>
                  <Text style={styles.bold}>Altitud:</Text>{' '}
                  {item.location.altitude !== null && item.location.altitude !== undefined
                    ? `${Math.round(item.location.altitude)} m`
                    : 'N/D'}{' '}
                  | <Text style={styles.bold}>Precisión:</Text>{' '}
                  {item.location.accuracy !== null && item.location.accuracy !== undefined
                    ? `±${Math.round(item.location.accuracy)} m`
                    : 'N/D'}
                </Text>
                {item.location.address && (
                  <Text style={styles.highlightText}>🏠 {item.location.address}</Text>
                )}
              </>
            ) : (
              <Text style={styles.highlightText}>🏠 {item.location.address}</Text>
            )}
          </View>
        ) : (
          <Text style={styles.emptyText}>Sin ubicación asignada</Text>
        )}

        <View style={styles.actionRow}>
          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={handleGetGpsLocation}
            disabled={loadingLocation}
          >
            {loadingLocation ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.primaryBtnText}>Obtener mi ubicación</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryBtn}
            onPress={() => setShowManualLocation(!showManualLocation)}
          >
            <Text style={styles.secondaryBtnText}>
              {showManualLocation ? 'Cancelar' : 'Manual'}
            </Text>
          </TouchableOpacity>
        </View>

        {showManualLocation && (
          <View style={styles.manualRow}>
            <TextInput
              style={styles.manualInput}
              placeholder="Ej: Av. Belgrano 123"
              placeholderTextColor="#888"
              value={manualAddress}
              onChangeText={setManualAddress}
            />
            <TouchableOpacity
              style={styles.saveManualBtn}
              onPress={handleSaveManualLocation}
            >
              <Text style={styles.saveManualText}>Guardar</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* CONTACTO */}
      <View style={[styles.sectionBox, { marginTop: 8 }]}>
        <Text style={styles.sectionTitle}>📞 Contacto Relacionado</Text>

        {item.contact ? (
          <View style={styles.dataBox}>
            <Text style={styles.highlightText}>👤 {item.contact.name}</Text>
            <Text style={styles.dataText}>📱 {item.contact.phone}</Text>
          </View>
        ) : (
          <Text style={styles.emptyText}>Sin contacto asignado</Text>
        )}

        <View style={styles.actionRow}>
          <TouchableOpacity
            style={[styles.primaryBtn, { backgroundColor: '#6a1b9a' }]}
            onPress={handleOpenDeviceContacts}
            disabled={loadingContacts}
          >
            {loadingContacts ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.primaryBtnText}>Buscar en Agenda</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryBtn}
            onPress={() => setShowManualContact(!showManualContact)}
          >
            <Text style={styles.secondaryBtnText}>
              {showManualContact ? 'Cancelar' : 'Manual'}
            </Text>
          </TouchableOpacity>
        </View>

        {showManualContact && (
          <View style={styles.manualColumn}>
            <TextInput
              style={styles.manualInputFull}
              placeholder="Nombre (Ej: Secretaría Dr. Pérez)"
              placeholderTextColor="#888"
              value={manualContactName}
              onChangeText={setManualContactName}
            />
            <View style={styles.manualRow}>
              <TextInput
                style={styles.manualInput}
                placeholder="Teléfono (Ej: 264 123 4567)"
                placeholderTextColor="#888"
                keyboardType="phone-pad"
                value={manualContactPhone}
                onChangeText={setManualContactPhone}
              />
              <TouchableOpacity
                style={styles.saveManualBtn}
                onPress={handleSaveManualContact}
              >
                <Text style={styles.saveManualText}>Guardar</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>

      {/* PRÓXIMO TURNO (CALENDARIO) */}
      <View style={[styles.sectionBox, { marginTop: 8 }]}>
        <Text style={styles.sectionTitle}>📅 Próximo Turno</Text>

        {item.appointment ? (
          <View style={styles.dataBox}>
            <Text style={styles.highlightText}>🗓️ {item.appointment.description}</Text>
          </View>
        ) : (
          <Text style={styles.emptyText}>Sin turno agendado</Text>
        )}

        <View style={styles.actionRow}>
          <TouchableOpacity
            style={[styles.primaryBtn, { backgroundColor: '#00796b' }]}
            onPress={handlePrepareCalendar}
            disabled={loadingCalendar}
          >
            <Text style={styles.primaryBtnText}>Agendar en Calendario</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryBtn}
            onPress={() => setShowManualAppointment(!showManualAppointment)}
          >
            <Text style={styles.secondaryBtnText}>
              {showManualAppointment ? 'Cancelar' : 'Manual'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Formulario para agendar en el Calendario nativo */}
        {showCalendarForm && (
          <View style={styles.manualRow}>
            <TextInput
              style={styles.manualInput}
              placeholder="Fecha (Ej: 25/11/2026)"
              placeholderTextColor="#888"
              value={calendarDateText}
              onChangeText={setCalendarDateText}
            />
            <TouchableOpacity
              style={[styles.saveManualBtn, { backgroundColor: '#00796b' }]}
              onPress={handleCreateCalendarEvent}
              disabled={loadingCalendar}
            >
              {loadingCalendar ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.saveManualText}>Crear Evento</Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* Input Manual (Fallback si se deniega permiso o se prefiere texto libre) */}
        {showManualAppointment && (
          <View style={styles.manualRow}>
            <TextInput
              style={styles.manualInput}
              placeholder="Ej: 10 de diciembre"
              placeholderTextColor="#888"
              value={manualAppointmentText}
              onChangeText={setManualAppointmentText}
            />
            <TouchableOpacity
              style={styles.saveManualBtn}
              onPress={handleSaveManualAppointment}
            >
              <Text style={styles.saveManualText}>Guardar</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* MODAL SELECTOR DE CONTACTOS */}
      <Modal
        visible={contactsModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setContactsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Seleccionar Contacto</Text>

            <View style={styles.searchBarRow}>
              <TextInput
                style={styles.searchInputFlex}
                placeholder="Escribí un nombre..."
                placeholderTextColor="#888"
                value={searchQuery}
                onChangeText={setSearchQuery}
                onSubmitEditing={handleExecuteContactSearch}
                returnKeyType="search"
              />
              <TouchableOpacity
                style={styles.searchActionBtn}
                onPress={handleExecuteContactSearch}
              >
                <Text style={styles.searchActionText}>Buscar</Text>
              </TouchableOpacity>
            </View>

            {/* Solo muestra resultados después de presionar Buscar */}
            {hasSearched && (
              <FlatList
                data={searchResults}
                keyExtractor={(c) => c.id}
                style={styles.contactsList}
                renderItem={({ item: c }) => (
                  <TouchableOpacity
                    style={styles.contactOption}
                    onPress={() => handleSelectDeviceContact(c)}
                  >
                    <Text style={styles.contactOptionName}>{c.name}</Text>
                    <Text style={styles.contactOptionPhone}>{c.phone}</Text>
                  </TouchableOpacity>
                )}
                ListEmptyComponent={
                  <Text style={styles.emptySearchText}>
                    No se encontraron coincidencias.
                  </Text>
                }
              />
            )}

            <TouchableOpacity
              style={styles.closeModalBtn}
              onPress={() => setContactsModalVisible(false)}
            >
              <Text style={styles.closeModalText}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
    borderWidth: 1,
    borderColor: '#e0e0e0',
    elevation: 2,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    paddingBottom: 8,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  emoji: {
    fontSize: 20,
    marginRight: 8,
  },
  name: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#333',
  },
  deleteButton: {
    backgroundColor: '#ffebee',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
  },
  deleteText: {
    color: '#c62828',
    fontWeight: 'bold',
    fontSize: 12,
  },
  sectionBox: {
    backgroundColor: '#f9fafb',
    padding: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#eee',
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#444',
    marginBottom: 6,
  },
  emptyText: {
    fontSize: 12,
    color: '#888',
    fontStyle: 'italic',
    marginBottom: 8,
  },
  dataBox: {
    marginBottom: 8,
    gap: 2,
  },
  dataText: {
    fontSize: 12,
    color: '#333',
  },
  bold: {
    fontWeight: 'bold',
  },
  highlightText: {
    fontSize: 12,
    color: '#1976d2',
    fontWeight: '600',
    marginTop: 2,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 8,
  },
  primaryBtn: {
    flex: 2,
    backgroundColor: '#1976d2',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBtnText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  secondaryBtn: {
    flex: 1,
    backgroundColor: '#e0e0e0',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryBtnText: {
    color: '#333',
    fontSize: 12,
    fontWeight: '600',
  },
  manualRow: {
    flexDirection: 'row',
    marginTop: 8,
    gap: 6,
  },
  manualColumn: {
    marginTop: 8,
  },
  manualInput: {
    flex: 1,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    fontSize: 12,
  },
  manualInputFull: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    fontSize: 12,
  },
  saveManualBtn: {
    backgroundColor: '#2e7d32',
    paddingHorizontal: 12,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveManualText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    maxHeight: '75%',
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
    textAlign: 'center',
  },
  searchBarRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  searchInputFlex: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
  },
  searchActionBtn: {
    backgroundColor: '#6a1b9a',
    paddingHorizontal: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchActionText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  contactsList: {
    maxHeight: 220,
    marginBottom: 12,
  },
  contactOption: {
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  contactOptionName: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#333',
  },
  contactOptionPhone: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
  emptySearchText: {
    textAlign: 'center',
    color: '#888',
    paddingVertical: 20,
  },
  closeModalBtn: {
    backgroundColor: '#d32f2f',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  closeModalText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
});

