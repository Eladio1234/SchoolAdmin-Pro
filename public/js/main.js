import { observarAuth, cerrarSesion } from './auth.js';
import {
  agregarAlumno, obtenerAlumnos, actualizarAlumno, eliminarAlumno,
  agregarDocente, obtenerDocentes, actualizarDocente, eliminarDocente
} from './firestore.js';
import {
  validarEmail, validarTelefono, validarRequerido,
  validarStudentNumber, validarEmployeeNumber
} from './validators.js';
import {
  mostrarNotificacion, renderizarTablaAlumnos, renderizarTablaDocentes,
  llenarFormulario, limpiarFormulario
} from './ui.js';

let editandoAlumnoId = null;
let editandoDocenteId = null;

// AUTH GUARD
observarAuth(usuario => {
  if (!usuario) {
    window.location.href = 'login.html';
    return;
  }
  const emailEl = document.getElementById('usuario-email');
  if (emailEl) emailEl.textContent = usuario.email;
  cargarAlumnos();
  cargarDocentes();
});

// TABS
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('activo'));
    document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('activo'));
    btn.classList.add('activo');
    document.getElementById(btn.dataset.tab).classList.add('activo');
  });
});

// LOGOUT
document.getElementById('btn-logout')?.addEventListener('click', async () => {
  await cerrarSesion();
  window.location.href = 'login.html';
});

// ALUMNOS

async function cargarAlumnos() {
  try {
    const alumnos = await obtenerAlumnos();
    renderizarTablaAlumnos(alumnos, editarAlumno, confirmarEliminarAlumno);
  } catch (err) {
    mostrarNotificacion('Error al cargar alumnos: ' + err.message, 'error');
  }
}

document.getElementById('form-alumno')?.addEventListener('submit', async e => {
  e.preventDefault();
  const datos = leerForm('form-alumno', ['studentNumber', 'fullName', 'email', 'phone', 'career', 'semester', 'status']);
  if (!validarAlumno(datos)) return;
  datos.semester = Number(datos.semester);

  try {
    if (editandoAlumnoId) {
      await actualizarAlumno(editandoAlumnoId, datos);
      mostrarNotificacion('Alumno actualizado correctamente');
      resetFormAlumno();
    } else {
      await agregarAlumno(datos);
      mostrarNotificacion('Alumno agregado correctamente');
    }
    limpiarFormulario('form-alumno');
    await cargarAlumnos();
  } catch (err) {
    mostrarNotificacion('Error: ' + err.message, 'error');
  }
});

function editarAlumno(alumno) {
  editandoAlumnoId = alumno.id;
  llenarFormulario('form-alumno', alumno);
  document.getElementById('submit-alumno').textContent = 'Actualizar Alumno';
  document.getElementById('btn-cancelar-alumno').style.display = 'inline-block';
  document.getElementById('form-alumno').scrollIntoView({ behavior: 'smooth' });
}

async function confirmarEliminarAlumno(id) {
  if (!confirm('¿Seguro que deseas eliminar este alumno?')) return;
  try {
    await eliminarAlumno(id);
    mostrarNotificacion('Alumno eliminado');
    await cargarAlumnos();
  } catch (err) {
    mostrarNotificacion('Error al eliminar: ' + err.message, 'error');
  }
}

document.getElementById('btn-cancelar-alumno')?.addEventListener('click', () => {
  limpiarFormulario('form-alumno');
  resetFormAlumno();
});

function resetFormAlumno() {
  editandoAlumnoId = null;
  document.getElementById('submit-alumno').textContent = 'Agregar Alumno';
  document.getElementById('btn-cancelar-alumno').style.display = 'none';
}

function validarAlumno(datos) {
  const requeridos = ['studentNumber', 'fullName', 'email', 'phone', 'career', 'semester', 'status'];
  const etiquetas = { studentNumber: 'No. Estudiante', fullName: 'Nombre completo', email: 'Email', phone: 'Teléfono', career: 'Carrera', semester: 'Semestre', status: 'Estado' };
  for (const campo of requeridos) {
    if (!validarRequerido(datos[campo])) {
      mostrarNotificacion(`El campo "${etiquetas[campo]}" es obligatorio`, 'error');
      return false;
    }
  }
  if (!validarStudentNumber(datos.studentNumber)) {
    mostrarNotificacion('El No. Estudiante debe tener entre 4 y 12 caracteres alfanuméricos', 'error');
    return false;
  }
  if (!validarEmail(datos.email)) {
    mostrarNotificacion('El email no tiene un formato válido', 'error');
    return false;
  }
  if (!validarTelefono(datos.phone)) {
    mostrarNotificacion('El teléfono debe tener 10 dígitos', 'error');
    return false;
  }
  return true;
}

// DOCENTES

async function cargarDocentes() {
  try {
    const docentes = await obtenerDocentes();
    renderizarTablaDocentes(docentes, editarDocente, confirmarEliminarDocente);
  } catch (err) {
    mostrarNotificacion('Error al cargar docentes: ' + err.message, 'error');
  }
}

document.getElementById('form-docente')?.addEventListener('submit', async e => {
  e.preventDefault();
  const datos = leerForm('form-docente', ['employeeNumber', 'fullName', 'email', 'phone', 'specialty', 'active']);
  if (!validarDocente(datos)) return;
  datos.active = datos.active === 'true';

  try {
    if (editandoDocenteId) {
      await actualizarDocente(editandoDocenteId, datos);
      mostrarNotificacion('Docente actualizado correctamente');
      resetFormDocente();
    } else {
      await agregarDocente(datos);
      mostrarNotificacion('Docente agregado correctamente');
    }
    limpiarFormulario('form-docente');
    await cargarDocentes();
  } catch (err) {
    mostrarNotificacion('Error: ' + err.message, 'error');
  }
});

function editarDocente(docente) {
  editandoDocenteId = docente.id;
  llenarFormulario('form-docente', docente);
  document.getElementById('submit-docente').textContent = 'Actualizar Docente';
  document.getElementById('btn-cancelar-docente').style.display = 'inline-block';
  document.getElementById('form-docente').scrollIntoView({ behavior: 'smooth' });
}

async function confirmarEliminarDocente(id) {
  if (!confirm('¿Seguro que deseas eliminar este docente?')) return;
  try {
    await eliminarDocente(id);
    mostrarNotificacion('Docente eliminado');
    await cargarDocentes();
  } catch (err) {
    mostrarNotificacion('Error al eliminar: ' + err.message, 'error');
  }
}

document.getElementById('btn-cancelar-docente')?.addEventListener('click', () => {
  limpiarFormulario('form-docente');
  resetFormDocente();
});

function resetFormDocente() {
  editandoDocenteId = null;
  document.getElementById('submit-docente').textContent = 'Agregar Docente';
  document.getElementById('btn-cancelar-docente').style.display = 'none';
}

function validarDocente(datos) {
  const requeridos = ['employeeNumber', 'fullName', 'email', 'phone', 'specialty', 'active'];
  const etiquetas = { employeeNumber: 'No. Empleado', fullName: 'Nombre completo', email: 'Email', phone: 'Teléfono', specialty: 'Especialidad', active: 'Estado' };
  for (const campo of requeridos) {
    if (!validarRequerido(datos[campo])) {
      mostrarNotificacion(`El campo "${etiquetas[campo]}" es obligatorio`, 'error');
      return false;
    }
  }
  if (!validarEmployeeNumber(datos.employeeNumber)) {
    mostrarNotificacion('El No. Empleado debe tener entre 3 y 10 caracteres alfanuméricos', 'error');
    return false;
  }
  if (!validarEmail(datos.email)) {
    mostrarNotificacion('El email no tiene un formato válido', 'error');
    return false;
  }
  if (!validarTelefono(datos.phone)) {
    mostrarNotificacion('El teléfono debe tener 10 dígitos', 'error');
    return false;
  }
  return true;
}

// UTILIDAD
function leerForm(formId, campos) {
  const form = document.getElementById(formId);
  const datos = {};
  campos.forEach(campo => {
    const el = form.querySelector(`[name="${campo}"]`);
    if (el) datos[campo] = el.value.trim();
  });
  return datos;
}
