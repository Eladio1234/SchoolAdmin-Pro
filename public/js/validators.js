export function validarEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export function validarTelefono(telefono) {
  return /^\d{10}$/.test(telefono.replace(/[\s\-().]/g, ''));
}

export function validarRequerido(valor) {
  return valor !== null && valor !== undefined && valor.toString().trim() !== '';
}

export function validarStudentNumber(num) {
  return /^[A-Za-z0-9]{4,12}$/.test(num.trim());
}

export function validarEmployeeNumber(num) {
  return /^[A-Za-z0-9]{3,10}$/.test(num.trim());
}
