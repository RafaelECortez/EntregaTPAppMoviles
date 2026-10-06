/**
 * Test de Funciones Puras
 * Probar la lógica de validación de texto de forma aislada, sin interactuar con componentes visuales ni interfaces de usuario.
 */
import { validateUsername, validatePassword } from "../validators";

describe("Validaciones de Registro (Funciones Puras)", () => {
  // Test 1: Validación de Usuario
  describe("validateUsername", () => {
    it("retorna null cuando el usuario es válido (solo letras y >= 3)", () => {
      expect(validateUsername("rafael")).toBeNull();
    });

    it("retorna error si el usuario tiene menos de 3 caracteres", () => {
      expect(validateUsername("ra")).toBe(
        "El usuario debe tener al menos 3 caracteres"
      );
    });

    it("retorna error si el usuario contiene números o símbolos", () => {
      expect(validateUsername("rafa123")).toBe(
        "El usuario debe contener solo letras"
      );
    });
  });

  // Test 2: Validación de Contraseña
  describe("validatePassword", () => {
    it("retorna null cuando la contraseña tiene 6 o más caracteres", () => {
      expect(validatePassword("123456")).toBeNull();
    });

    it("retorna error si la contraseña tiene menos de 6 caracteres", () => {
      expect(validatePassword("12345")).toBe(
        "La contraseña debe tener un mínimo de 6 caracteres"
      );
    });
  });
});