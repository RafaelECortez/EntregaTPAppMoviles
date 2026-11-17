/**
 * Test de Componente
 * Verifica renderizado de los elementos visuales de la pantalla de login, 
 * la interacción con los campos de texto, 
 * la simulación de eventos táctiles y 
 * su integración con el store de autenticación (useAuthStore).
 */

import React from "react";
import { render, fireEvent, screen, waitFor } from "@testing-library/react-native";
import LoginScreen from "../LoginScreen";
import { useAuthStore } from "../../stores/authStore";

// Mock del store de Zustand
jest.mock("../../stores/authStore", () => ({
  useAuthStore: jest.fn(),
}));

// Mock de la navegación de Stack
const mockNavigate = jest.fn();
const mockReplace = jest.fn();
const mockProps = {
  navigation: {
    navigate: mockNavigate,
    replace: mockReplace,
  },
} as any;

describe("LoginScreen Component (Test 3)", () => {
  const mockLogin = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    // Configuramos el mock para que cuando LoginScreen llame a useAuthStore(selector),
    // reciba nuestra función mockLogin
    (useAuthStore as unknown as jest.Mock).mockImplementation((selector) =>
      selector({ login: mockLogin })
    );
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

  it("ejecuta el login con éxito si el store valida las credenciales", async () => {
    // Simulamos que el store responde true al iniciar sesión
    mockLogin.mockResolvedValueOnce(true);

    const onLoginSuccessMock = jest.fn();
    render(<LoginScreen {...mockProps} onLoginSuccess={onLoginSuccessMock} />);

    fireEvent.changeText(screen.getByTestId("username-input"), "rafael");
    fireEvent.changeText(screen.getByTestId("password-input"), "123456");
    fireEvent.press(screen.getByTestId("login-button"));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({
        username: "rafael",
        password: "123456",
      });
      expect(onLoginSuccessMock).toHaveBeenCalledTimes(1);
    });
  });

  it("navega a MainTabs si el login tiene éxito y no se pasa onLoginSuccess", async () => {
    mockLogin.mockResolvedValueOnce(true);

    render(<LoginScreen {...mockProps} />);

    fireEvent.changeText(screen.getByTestId("username-input"), "rafael");
    fireEvent.changeText(screen.getByTestId("password-input"), "123456");
    fireEvent.press(screen.getByTestId("login-button"));

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith("MainTabs");
    });
  });
});
