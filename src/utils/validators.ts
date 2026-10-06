/**
 * Valida el nombre de usuario del registro.
 * Requisitos: Mínimo 3 caracteres y solo letras.
 */
export function validateUsername(username: string): string | null {
  const lettersOnly = /^[A-Za-z]+$/;
  if (!username.trim()) {
    return "El usuario es requerido";
  }
  if (username.length < 3) {
    return "El usuario debe tener al menos 3 caracteres";
  }
  if (!lettersOnly.test(username)) {
    return "El usuario debe contener solo letras";
  }
  return null;
}

/**
 * Valida la contraseña del registro.
 * Requisitos: Mínimo 6 caracteres.
 */
export function validatePassword(password: string): string | null {
  if (!password) {
    return "La contraseña es requerida";
  }
  if (password.length < 6) {
    return "La contraseña debe tener un mínimo de 6 caracteres";
  }
  return null;
}