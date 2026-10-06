/**
 * Pantalla de registro de usuarios que valida las restricciones de formato 
 * (letras y longitud mínima) para el nombre de usuario y contraseña, 
 * guardando los datos de forma local usando AsyncStorage.
 */

import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage'; // o '@react-native-async-storage/async-storage'
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'Register'>;

export default function RegisterScreen({ navigation }: Props) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleRegister = async () => {
    // Validación de usuario: solo letras y mínimo 3 caracteres
    const lettersOnly = /^[A-Za-z]+$/;
    if (!username.trim() || username.length < 3 || !lettersOnly.test(username)) {
      Alert.alert('Error', 'El usuario debe tener al menos 3 caracteres y contener solo letras (sin números ni espacios).');
      return;
    }

    // Validación de contraseña: mínimo 6 caracteres
    if (!password || password.length < 6) {
      Alert.alert('Error', 'La contraseña debe tener un mínimo de 6 caracteres.');
      return;
    }

    try {
      const userData = JSON.stringify({ username, password });
      await AsyncStorage.setItem('registered_user', userData);
      Alert.alert('¡Éxito!', 'Usuario registrado correctamente.', [
        { text: 'OK', onPress: () => navigation.navigate('Login') }
      ]);
    } catch (error) {
      Alert.alert('Error', 'No se pudo guardar el registro.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Registro de Usuario</Text>
      
      <TextInput
        style={styles.input}
        placeholder="Usuario (solo letras, mín. 3 caracteres)"
        placeholderTextColor="#888"
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
      />

      <TextInput
        style={styles.input}
        placeholder="Contraseña (mín. 6 caracteres)"
        placeholderTextColor="#888"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <TouchableOpacity style={styles.button} onPress={handleRegister}>
        <Text style={styles.buttonText}>Registrarse</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.linkButton}>
        <Text style={styles.linkText}>¿Ya tienes cuenta? Inicia sesión</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20, backgroundColor: '#f5f5f5' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center', color: '#333' },
  input: { backgroundColor: '#fff', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#ddd', marginBottom: 15 },
  button: { backgroundColor: '#2e7d32', padding: 15, borderRadius: 8, alignItems: 'center', marginTop: 10 },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  linkButton: { marginTop: 15, alignItems: 'center' },
  linkText: { color: '#1976d2', fontSize: 14 }
});