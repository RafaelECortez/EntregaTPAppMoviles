/**
 * Test de Componente
 * Verifica renderizado de los elementos visuales de la pantalla de login, 
 * la interacción con los campos de texto, 
 * la simulación de eventos táctiles y 
 * su comportamiento asíncrono con AsyncStorage.
 */

import React from "react";
import { render, fireEvent, screen, waitFor } from "@testing-library/react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import LoginScreen from "../LoginScreen";

// MOCK DE ASYNCSTORAGE: 
jest.mock("@react-native-async-storage/async-storage", () =>
  require("@react-native-async-storage/async-storage/jest/async-storage-mock")
);

// Mock de la navegación de Stack para evitar errores de contexto de React Navigation
const mockNavigate = jest.fn();
const mockProps = {
  navigation: {
    navigate: mockNavigate,
    replace: jest.fn(),
  },
} as any;

describe("LoginScreen Component (Test 3)", () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    await AsyncStorage.clear();
  });

  it("renderiza correctamente los elementos principales del login", () => {
    render(<LoginScreen {...mockProps} />);

    expect(screen.getByText("Iniciar Sesión")).toBeTruthy();
    expect(screen.getByTestId("username-input")).toBeTruthy();
    expect(screen.getByTestId("password-input")).toBeTruthy();
    expect(screen.getByTestId("login-button")).toBeTruthy();
  });

  it("permite escribir en los inputs de usuario y contraseña", () => {
    render(<LoginScreen {...mockProps} />);

    const userinput = screen.getByTestId("username-input");
    const passInput = screen.getByTestId("password-input");

    fireEvent.changeText(userinput, "rafael");
    fireEvent.changeText(passInput, "123456");

    expect(userinput.props.value).toBe("rafael");
    expect(passInput.props.value).toBe("123456");
  });

  it("ejecuta el login con éxito si las credenciales coinciden con AsyncStorage", async () => {
    // Simulamos que ya hay un usuario registrado guardado en el storage
    await AsyncStorage.setItem(
      "registered_user",
      JSON.stringify({ username: "rafael", password: "123456" })
    );

    const onLoginSuccessMock = jest.fn();
    render(<LoginScreen {...mockProps} onLoginSuccess={onLoginSuccessMock} />);

    fireEvent.changeText(screen.getByTestId("username-input"), "rafael");
    fireEvent.changeText(screen.getByTestId("password-input"), "123456");
    fireEvent.press(screen.getByTestId("login-button"));

    // Esperamos a que se resuelva la promesa asíncrona de AsyncStorage y el login
    await waitFor(() => {
      expect(onLoginSuccessMock).toHaveBeenCalledTimes(1);
    });
  });
});