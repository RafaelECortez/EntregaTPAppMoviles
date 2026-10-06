/**
 * Test de Componente
 * Valida que el componente visual renderice de forma correcta 
 * los datos de un elemento de medicación, traduzca de manera adecuada 
 * las unidades de tiempo y dispare correctamente la función de 
 * eliminación al interactuar con el botón.
 */
import React from "react";
import { render, fireEvent, screen } from "@testing-library/react-native";
import MedicationItem, { Medication } from "../MedicationItem";

// Datos de prueba por defecto
const mockMedication: Medication = {
  id: "123",
  name: "Ibuprofeno",
  timeValue: 8,
  timeUnit: "hours",
};

// Helper para no repetir el render en cada test
function renderMedicationItem(
  item: Medication = mockMedication,
  onDelete = jest.fn()
) {
  return render(<MedicationItem item={item} onDelete={onDelete} />);
}

describe("MedicationItem", () => {
  // Limpiamos los mocks entre cada test
  afterEach(() => {
    jest.clearAllMocks();
  });

  // Renderizado inicial 
  describe("renderizado inicial", () => {
    it("renderiza el nombre del medicamento correctamente", () => {
      renderMedicationItem();
      expect(screen.getByTestId("medication-name")).toBeTruthy();
      expect(screen.getByText("Ibuprofeno")).toBeTruthy();
    });

    it("renderiza el tiempo y unidad correctamente traducida (horas)", () => {
      renderMedicationItem();
      expect(
        screen.getByText("Recordatorio en: 8 hora(s)")
      ).toBeTruthy();
    });

    it("renderiza la unidad en minutos correctamente", () => {
      const itemMinutos: Medication = {
        ...mockMedication,
        timeValue: 30,
        timeUnit: "minutes",
      };
      renderMedicationItem(itemMinutos);
      expect(
        screen.getByText("Recordatorio en: 30 minuto(s)")
      ).toBeTruthy();
    });

    it("renderiza la unidad en segundos correctamente", () => {
      const itemSegundos: Medication = {
        ...mockMedication,
        timeValue: 45,
        timeUnit: "seconds",
      };
      renderMedicationItem(itemSegundos);
      expect(
        screen.getByText("Recordatorio en: 45 segundo(s)")
      ).toBeTruthy();
    });

    it("renderiza el botón de eliminar", () => {
      renderMedicationItem();
      expect(screen.getByTestId("delete-button")).toBeTruthy();
      expect(screen.getByText("Eliminar")).toBeTruthy();
    });
  });

  // Interacciones (Eventos) 
  describe("interacciones", () => {
    it("llama a onDelete con el id correcto al presionar el botón eliminar", () => {
      const onDeleteMock = jest.fn();
      renderMedicationItem(mockMedication, onDeleteMock);

      fireEvent.press(screen.getByTestId("delete-button"));

      expect(onDeleteMock).toHaveBeenCalledTimes(1);
      expect(onDeleteMock).toHaveBeenCalledWith("123");
    });
  });
});