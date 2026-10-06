/**
 * Pantalla de inicio de sesión que valida las credenciales ingresadas 
 * contra los datos almacenados localmente mediante AsyncStorage y gestiona 
 * la navegación hacia la pantalla principal o el registro.
 */

import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'> & {
  onLoginSuccess?: () => void; // Prop para facilitar testing sin romper el flujo real
};

export default function LoginScreen({ navigation, onLoginSuccess }: Props) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    try {
      const storedUser = await AsyncStorage.getItem('registered_user');
      if (!storedUser) {
        Alert.alert('Error', 'No hay ningún usuario registrado. Por favor, regístrate primero.');
        return;
      }

      const { username: savedUser, password: savedPassword } = JSON.parse(storedUser);

      if (username === savedUser && password === savedPassword) {
        await AsyncStorage.setItem('is_logged_in', 'true');
        if (onLoginSuccess) {
          onLoginSuccess();
        } else {
          navigation.replace('Home'); // Navegar hacia Home
        }
      } else {
        Alert.alert('Error', 'Usuario o contraseña incorrectos.');
      }
    } catch (error) {
      Alert.alert('Error', 'Ocurrió un error al iniciar sesión.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Iniciar Sesión</Text>

      <TextInput
        testID="username-input"
        style={styles.input}
        placeholder="Usuario"
        placeholderTextColor="#888"
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
      />

      <TextInput
        testID="password-input"
        style={styles.input}
        placeholder="Contraseña"
        placeholderTextColor="#888"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <TouchableOpacity testID="login-button" style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Entrar</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        testID="register-link"
        onPress={() => navigation.navigate('Register')} //Nagevar a la pantalla de Registro
        style={styles.linkButton}
      >
        <Text style={styles.linkText}>¿No tienes cuenta? Regístrate aquí</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20, backgroundColor: '#f5f5f5' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center', color: '#333' },
  input: { backgroundColor: '#fff', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#ddd', marginBottom: 15 },
  button: { backgroundColor: '#1976d2', padding: 15, borderRadius: 8, alignItems: 'center', marginTop: 10 },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  linkButton: { marginTop: 15, alignItems: 'center' },
  linkText: { color: '#2e7d32', fontSize: 14 }
});
