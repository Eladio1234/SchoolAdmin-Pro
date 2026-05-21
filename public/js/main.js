import { observeAuth, logoutUser } from './auth.js';
import {
  agregarAlumno, obtenerAlumnos, actualizarAlumno, eliminarAlumno,
  agregarDocente, obtenerDocentes, actualizarDocente, eliminarDocente,
  agregarMateria, obtenerMaterias, actualizarMateria, eliminarMateria,
  agregarGrupo, obtenerGrupos, actualizarGrupo, eliminarGrupo,
  agregarInscripcion, obtenerInscripciones, actualizarInscripcion, eliminarInscripcion,
  validarInscripcion
} from './firestore.js';
import {
  validarEmail, validarTelefono, validarRequerido,
  validarStudentNumber, validarEmployeeNumber
} from './validators.js';
import {
  mostrarNotificacion, renderizarTablaAlumnos, renderizarTablaDocentes,
  llenarFormulario, limpiarFormulario,
  renderizarTablaMaterias,
  renderizarTablaGrupos,
  renderizarTablaInscripciones
} from './ui.js';

let editandoAlumnoId = null;
let editandoDocenteId = null;
let editandoMateriaId = null;
let editandoGrupoId = null;
let editandoInscripcionId = null;
let gruposInscripcion = [];
let usuarioActual = null;

observeAuth(usuario => {
  if (!usuario) {
    window.location.href = 'login.html';
    return;
  }
  usuarioActual = usuario;
  const emailEl = document.getElementById('usuario-email');
  if (emailEl) emailEl.textContent = usuario.email;
  cargarAlumnos();
  cargarDocentes();
  cargarMaterias();
  cargarGrupos();
  cargarInscripciones();
});

document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('activo'));
    document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('activo'));
    btn.classList.add('activo');
    document.getElementById(btn.dataset.tab).classList.add('activo');
  });
});

document.getElementById('btn-logout')?.addEventListener('click', async () => {
  await logoutUser();
  window.location.href = 'login.html';
});

function leerForm(formId, campos) {
  const form = document.getElementById(formId);
  const datos = {};
  campos.forEach(campo => {
    const el = form.querySelector(`[name="${campo}"]`);
    if (el) datos[campo] = el.value.trim();
  });
  return datos;
}

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
  document.getElementById('btn-cancelar-alumno').classList.remove('oculto');
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
  document.getElementById('btn-cancelar-alumno').classList.add('oculto');
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
  document.getElementById('btn-cancelar-docente').classList.remove('oculto');
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
  document.getElementById('btn-cancelar-docente').classList.add('oculto');
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

async function cargarMaterias() {
  try {
    const materias = await obtenerMaterias();
    renderizarTablaMaterias(materias, editarMateria, confirmarEliminarMateria);
  } catch (err) {
    mostrarNotificacion('Error al cargar materias: ' + err.message, 'error');
  }
}

document.getElementById('form-materia')?.addEventListener('submit', async e => {
  e.preventDefault();
  const datos = leerForm('form-materia', ['code', 'name', 'credits', 'active']);
  if (!validarMateria(datos)) return;
  datos.credits = Number(datos.credits);
  datos.active = datos.active === 'true';

  try {
    if (editandoMateriaId) {
      await actualizarMateria(editandoMateriaId, datos);
      mostrarNotificacion('Materia actualizada correctamente');
      resetFormMateria();
    } else {
      await agregarMateria({ ...datos, createdBy: usuarioActual.uid });
      mostrarNotificacion('Materia agregada correctamente');
    }
    limpiarFormulario('form-materia');
    await cargarMaterias();
  } catch (err) {
    mostrarNotificacion('Error: ' + err.message, 'error');
  }
});

function editarMateria(materia) {
  editandoMateriaId = materia.id;
  llenarFormulario('form-materia', materia);
  document.getElementById('submit-materia').textContent = 'Actualizar Materia';
  document.getElementById('btn-cancelar-materia').classList.remove('oculto');
  document.getElementById('form-materia').scrollIntoView({ behavior: 'smooth' });
}

async function confirmarEliminarMateria(id) {
  if (!confirm('¿Seguro que deseas eliminar esta materia?')) return;
  try {
    await eliminarMateria(id);
    mostrarNotificacion('Materia eliminada');
    await cargarMaterias();
  } catch (err) {
    mostrarNotificacion('Error al eliminar: ' + err.message, 'error');
  }
}

document.getElementById('btn-cancelar-materia')?.addEventListener('click', () => {
  limpiarFormulario('form-materia');
  resetFormMateria();
});

function resetFormMateria() {
  editandoMateriaId = null;
  document.getElementById('submit-materia').textContent = 'Agregar Materia';
  document.getElementById('btn-cancelar-materia').classList.add('oculto');
}

function validarMateria(datos) {
  const requeridos = ['code', 'name', 'credits', 'active'];
  const etiquetas = { code: 'Código', name: 'Nombre', credits: 'Créditos', active: 'Estado' };
  for (const campo of requeridos) {
    if (!validarRequerido(datos[campo])) {
      mostrarNotificacion(`El campo "${etiquetas[campo]}" es obligatorio`, 'error');
      return false;
    }
  }
  if (Number(datos.credits) < 1) {
    mostrarNotificacion('Los créditos deben ser un número positivo', 'error');
    return false;
  }
  return true;
}

async function cargarGrupos() {
  try {
    const [grupos, materias, docentes] = await Promise.all([
      obtenerGrupos(), obtenerMaterias(), obtenerDocentes()
    ]);
    poblarSelectMaterias(materias);
    poblarSelectDocentes(docentes);
    renderizarTablaGrupos(grupos, materias, docentes, editarGrupo, confirmarEliminarGrupo);
  } catch (err) {
    mostrarNotificacion('Error al cargar grupos: ' + err.message, 'error');
  }
}

function poblarSelectMaterias(materias) {
  const select = document.querySelector('#form-grupo [name="materiaId"]');
  if (!select) return;
  const valorActual = select.value;
  select.innerHTML = '<option value="">-- Seleccionar --</option>';
  materias.filter(m => m.active).forEach(m => {
    const opt = document.createElement('option');
    opt.value = m.id;
    opt.textContent = `${m.code} – ${m.name}`;
    select.appendChild(opt);
  });
  if (valorActual) select.value = valorActual;
}

function poblarSelectDocentes(docentes) {
  const select = document.querySelector('#form-grupo [name="docenteId"]');
  if (!select) return;
  const valorActual = select.value;
  select.innerHTML = '<option value="">-- Seleccionar --</option>';
  docentes.filter(d => d.active).forEach(d => {
    const opt = document.createElement('option');
    opt.value = d.id;
    opt.textContent = d.fullName;
    select.appendChild(opt);
  });
  if (valorActual) select.value = valorActual;
}

document.getElementById('form-grupo')?.addEventListener('submit', async e => {
  e.preventDefault();
  const datos = leerForm('form-grupo', ['name', 'materiaId', 'docenteId', 'active']);
  if (!validarGrupo(datos)) return;
  datos.active = datos.active === 'true';

  try {
    if (editandoGrupoId) {
      await actualizarGrupo(editandoGrupoId, datos);
      mostrarNotificacion('Grupo actualizado correctamente');
      resetFormGrupo();
    } else {
      await agregarGrupo({ ...datos, createdBy: usuarioActual.uid });
      mostrarNotificacion('Grupo agregado correctamente');
    }
    limpiarFormulario('form-grupo');
    await cargarGrupos();
  } catch (err) {
    mostrarNotificacion('Error: ' + err.message, 'error');
  }
});

function editarGrupo(grupo) {
  editandoGrupoId = grupo.id;
  llenarFormulario('form-grupo', grupo);
  document.getElementById('submit-grupo').textContent = 'Actualizar Grupo';
  document.getElementById('btn-cancelar-grupo').classList.remove('oculto');
  document.getElementById('form-grupo').scrollIntoView({ behavior: 'smooth' });
}

async function confirmarEliminarGrupo(id) {
  if (!confirm('¿Seguro que deseas eliminar este grupo?')) return;
  try {
    await eliminarGrupo(id);
    mostrarNotificacion('Grupo eliminado');
    await cargarGrupos();
  } catch (err) {
    mostrarNotificacion('Error al eliminar: ' + err.message, 'error');
  }
}

document.getElementById('btn-cancelar-grupo')?.addEventListener('click', () => {
  limpiarFormulario('form-grupo');
  resetFormGrupo();
});

function resetFormGrupo() {
  editandoGrupoId = null;
  document.getElementById('submit-grupo').textContent = 'Agregar Grupo';
  document.getElementById('btn-cancelar-grupo').classList.add('oculto');
}

function validarGrupo(datos) {
  const requeridos = ['name', 'materiaId', 'docenteId', 'active'];
  const etiquetas = { name: 'Nombre', materiaId: 'Materia', docenteId: 'Docente', active: 'Estado' };
  for (const campo of requeridos) {
    if (!validarRequerido(datos[campo])) {
      mostrarNotificacion(`El campo "${etiquetas[campo]}" es obligatorio`, 'error');
      return false;
    }
  }
  return true;
}

async function cargarInscripciones() {
  try {
    const [inscripciones, alumnos, grupos, materias] = await Promise.all([
      obtenerInscripciones(), obtenerAlumnos(), obtenerGrupos(), obtenerMaterias()
    ]);
    poblarSelectAlumnos(alumnos);
    poblarSelectGrupos(grupos, materias);
    renderizarTablaInscripciones(
      inscripciones, alumnos, grupos, materias,
      editarInscripcion, confirmarEliminarInscripcion
    );
  } catch (err) {
    mostrarNotificacion('Error al cargar inscripciones: ' + err.message, 'error');
  }
}

function poblarSelectAlumnos(alumnos) {
  const select = document.querySelector('#form-inscripcion [name="alumnoId"]');
  if (!select) return;
  const valorActual = select.value;
  select.innerHTML = '<option value="">-- Seleccionar --</option>';
  alumnos.filter(a => a.status === 'active').forEach(a => {
    const opt = document.createElement('option');
    opt.value = a.id;
    opt.textContent = `${a.studentNumber} – ${a.fullName}`;
    select.appendChild(opt);
  });
  if (valorActual) select.value = valorActual;
}

function poblarSelectGrupos(grupos, materias) {
  gruposInscripcion = grupos;
  const select = document.querySelector('#form-inscripcion [name="grupoId"]');
  if (!select) return;
  
  const valorActual = select.value;
  select.innerHTML = '<option value="">-- Seleccionar --</option>';
  
  grupos.filter(g => g.active).forEach(g => {
    const materia = materias.find(m => m.id === g.materiaId);
    const materiaNombre = materia ? materia.name : 'Sin materia';
    const opt = document.createElement('option');
    opt.value = g.id;
    opt.textContent = `${g.name} - ${materiaNombre}`; 
    select.appendChild(opt);
  });
  
  if (valorActual) select.value = valorActual;
}

document.getElementById('form-inscripcion')?.addEventListener('submit', async e => {
  e.preventDefault();
  const datos = leerForm('form-inscripcion', ['alumnoId', 'grupoId', 'status', 'enrollmentDate']);

  const materiaId = gruposInscripcion.find(g => g.id === datos.grupoId)?.materiaId || '';

  if (!validarFormInscripcion(datos, materiaId)) return;

  try {
    if (editandoInscripcionId) {
      await actualizarInscripcion(editandoInscripcionId, {
        alumnoId: datos.alumnoId,
        grupoId: datos.grupoId,
        materiaId,
        status: datos.status,
        enrollmentDate: datos.enrollmentDate
      });
      mostrarNotificacion('Inscripción actualizada correctamente');
      resetFormInscripcion();
    } else {
      const resultado = await validarInscripcion(datos.alumnoId, datos.grupoId, materiaId);
      if (!resultado.valida) {
        mostrarNotificacion(resultado.mensaje, 'error');
        return;
      }
      await agregarInscripcion({
        alumnoId: datos.alumnoId,
        grupoId: datos.grupoId,
        materiaId,
        status: datos.status,
        enrollmentDate: datos.enrollmentDate,
        createdBy: usuarioActual.uid
      });
      mostrarNotificacion('Alumno inscrito correctamente');
    }
    limpiarFormulario('form-inscripcion');
    resetFormInscripcion();
    await cargarInscripciones();
  } catch (err) {
    mostrarNotificacion('Error: ' + err.message, 'error');
  }
});

function editarInscripcion(inscripcion) {
  editandoInscripcionId = inscripcion.id;
  llenarFormulario('form-inscripcion', inscripcion);
  document.getElementById('submit-inscripcion').textContent = 'Actualizar Inscripción';
  document.getElementById('btn-cancelar-inscripcion').classList.remove('oculto');
  document.getElementById('form-inscripcion').scrollIntoView({ behavior: 'smooth' });
}

async function confirmarEliminarInscripcion(id) {
  if (!confirm('¿Seguro que deseas eliminar esta inscripción?')) return;
  try {
    await eliminarInscripcion(id);
    mostrarNotificacion('Inscripción eliminada');
    await cargarInscripciones();
  } catch (err) {
    mostrarNotificacion('Error al eliminar: ' + err.message, 'error');
  }
}

document.getElementById('btn-cancelar-inscripcion')?.addEventListener('click', () => {
  limpiarFormulario('form-inscripcion');
  resetFormInscripcion();
});

function resetFormInscripcion() {
  editandoInscripcionId = null;
  document.getElementById('submit-inscripcion').textContent = 'Inscribir Alumno';
  document.getElementById('btn-cancelar-inscripcion').classList.add('oculto');
  
  const fechaInput = document.querySelector('#form-inscripcion [name="enrollmentDate"]');
  if (fechaInput) fechaInput.value = new Date().toISOString().split('T')[0];
}

function validarFormInscripcion(datos, materiaId) {
  const requeridos = ['alumnoId', 'grupoId', 'status', 'enrollmentDate'];
  const etiquetas = {
    alumnoId: 'Alumno', grupoId: 'Grupo',
    status: 'Estado', enrollmentDate: 'Fecha de inscripción'
  };
  for (const campo of requeridos) {
    if (!validarRequerido(datos[campo])) {
      mostrarNotificacion(`El campo "${etiquetas[campo]}" es obligatorio`, 'error');
      return false;
    }
  }
  if (!validarRequerido(materiaId)) {
    mostrarNotificacion('El grupo seleccionado no tiene materia asignada', 'error');
    return false;
  }
  return true;
}