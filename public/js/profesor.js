import { observeAuth, logoutUser } from './auth.js';
import {
  obtenerDocentePorEmail,
  obtenerGruposPorDocente,
  obtenerInscripcionesPorGrupo,
  obtenerMaterias,
  obtenerAlumnos,
  obtenerCalificacionesPorGrupo,
  guardarCalificacion
} from './firestore.js';
import { mostrarNotificacion } from './ui.js';

const POR_PAGINA_GRUPOS = 10;
const POR_PAGINA_ALUMNOS = 10;

let docenteActual = null;
let todosLosGrupos = [];
let todasLasMaterias = [];
let todosLosAlumnos = [];
let grupoSeleccionado = null;
let paginaGrupos = 1;
let paginaAlumnos = 1;
let alumnosDelGrupo = [];
let calificacionesDelGrupo = [];
let filtroGrupoNombre = '';
let filtroGrupoMateria = '';
let filtroBuscar = '';
let filtroSemestre = '';

observeAuth(async usuario => {
  if (!usuario) {
    window.location.href = 'login.html';
    return;
  }
  const docente = await obtenerDocentePorEmail(usuario.email);
  if (!docente) {
    window.location.href = 'login.html';
    return;
  }
  docenteActual = docente;
  const emailEl = document.getElementById('docente-email');
  const nombreEl = document.getElementById('docente-nombre');
  if (emailEl) emailEl.textContent = usuario.email;
  if (nombreEl) nombreEl.textContent = docente.fullName;
  await inicializar();
});

async function inicializar() {
  try {
    const [grupos, materias, alumnos] = await Promise.all([
      obtenerGruposPorDocente(docenteActual.id),
      obtenerMaterias(),
      obtenerAlumnos()
    ]);
    todosLosGrupos = grupos.filter(g => g.active);
    todasLasMaterias = materias;
    todosLosAlumnos = alumnos;
    paginaGrupos = 1;
    poblarFiltroMaterias();
    renderGrupos();
  } catch (err) {
    mostrarNotificacion('Error al cargar datos: ' + err.message, 'error');
  }
}

function poblarFiltroMaterias() {
  const sel = document.getElementById('filtro-grupo-materia');
  if (!sel) return;
  const ids = [...new Set(todosLosGrupos.map(g => g.materiaId))];
  sel.innerHTML = '<option value="">Todas las materias</option>';
  ids.forEach(mId => {
    const materia = todasLasMaterias.find(m => m.id === mId);
    if (!materia) return;
    const opt = document.createElement('option');
    opt.value = mId;
    opt.textContent = `${materia.code} - ${materia.name}`;
    sel.appendChild(opt);
  });
}

function gruposFiltrados() {
  return todosLosGrupos.filter(g => {
    const nombreMatch = !filtroGrupoNombre || g.name.toLowerCase().includes(filtroGrupoNombre.toLowerCase());
    const materiaMatch = !filtroGrupoMateria || g.materiaId === filtroGrupoMateria;
    return nombreMatch && materiaMatch;
  });
}

function alumnosFiltrados() {
  return alumnosDelGrupo.filter(a => {
    const buscar = filtroBuscar.toLowerCase();
    const buscarMatch = !filtroBuscar ||
      a.studentNumber.toLowerCase().includes(buscar) ||
      a.fullName.toLowerCase().includes(buscar);
    const semestreMatch = !filtroSemestre || String(a.semester) === filtroSemestre;
    return buscarMatch && semestreMatch;
  });
}

function renderGrupos() {
  const tbody = document.querySelector('#tabla-grupos-prof tbody');
  if (!tbody) return;
  const filtrados = gruposFiltrados();
  const pagItems = paginar(filtrados, paginaGrupos, POR_PAGINA_GRUPOS);
  tbody.innerHTML = '';
  if (filtrados.length === 0) {
    tbody.innerHTML = '<tr><td colspan="4" class="sin-datos">No hay grupos con esos criterios</td></tr>';
  } else {
    pagItems.forEach(g => {
      const materia = todasLasMaterias.find(m => m.id === g.materiaId);
      const materiaNombre = materia ? `${materia.code} - ${materia.name}` : '-';
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${g.name}</td>
        <td>${materiaNombre}</td>
        <td><span class="badge badge-active">Activo</span></td>
        <td class="acciones"><button class="btn-editar">Ver Alumnos</button></td>
      `;
      tr.querySelector('.btn-editar').addEventListener('click', () => abrirGrupo(g));
      tbody.appendChild(tr);
    });
  }
  const pagContenedor = document.getElementById('pag-grupos');
  if (pagContenedor) {
    renderPaginacion(pagContenedor, filtrados.length, paginaGrupos, POR_PAGINA_GRUPOS, p => {
      paginaGrupos = p;
      renderGrupos();
    });
  }
}

async function abrirGrupo(grupo) {
  grupoSeleccionado = grupo;
  paginaAlumnos = 1;
  filtroBuscar = '';
  filtroSemestre = '';
  const buscarEl = document.getElementById('filtro-alumno-buscar');
  const semestreEl = document.getElementById('filtro-alumno-semestre');
  if (buscarEl) buscarEl.value = '';
  if (semestreEl) semestreEl.value = '';
  const materia = todasLasMaterias.find(m => m.id === grupo.materiaId);
  const tituloEl = document.getElementById('titulo-grupo');
  if (tituloEl) tituloEl.textContent = `${grupo.name} - ${materia ? materia.name : ''}`;
  document.getElementById('vista-grupos').classList.remove('activo');
  document.getElementById('vista-alumnos').classList.add('activo');
  try {
    const [inscripciones, calificaciones] = await Promise.all([
      obtenerInscripcionesPorGrupo(grupo.id),
      obtenerCalificacionesPorGrupo(grupo.id)
    ]);
    alumnosDelGrupo = inscripciones.map(i => {
      const alumno = todosLosAlumnos.find(a => a.id === i.alumnoId);
      return alumno ? { ...alumno } : null;
    }).filter(Boolean);
    calificacionesDelGrupo = calificaciones;
    renderAlumnos();
  } catch (err) {
    mostrarNotificacion('Error al cargar alumnos: ' + err.message, 'error');
  }
}

function renderAlumnos() {
  const tbody = document.querySelector('#tabla-alumnos-prof tbody');
  if (!tbody) return;
  const filtrados = alumnosFiltrados();
  const pagItems = paginar(filtrados, paginaAlumnos, POR_PAGINA_ALUMNOS);
  tbody.innerHTML = '';
  if (filtrados.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" class="sin-datos">No hay alumnos con esos criterios</td></tr>';
  } else {
    pagItems.forEach(a => {
      const calObj = calificacionesDelGrupo.find(c => c.alumnoId === a.id);
      const noCurso = calObj?.status === 'no_curso';
      const calActual = (!noCurso && calObj) ? calObj.calificacion : '';
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${a.studentNumber}</td>
        <td>${a.fullName}</td>
        <td>${a.semester ?? '-'}</td>
        <td>${noCurso
          ? '<span class="badge badge-dropped">No Curso</span>'
          : `<input type="number" class="input-cal" min="0" max="10" step="0.5" value="${calActual}" placeholder="0-10" />`
        }</td>
        <td class="acciones">
          ${!noCurso ? '<button class="btn-editar btn-guardar">Guardar</button>' : ''}
          <button class="btn-nocurso ${noCurso ? 'btn-secondary' : 'btn-eliminar'}">${noCurso ? 'Quitar N/C' : 'No Curso'}</button>
        </td>
      `;
      if (!noCurso) {
        tr.querySelector('.btn-guardar').addEventListener('click', () => {
          const input = tr.querySelector('.input-cal');
          guardarCal(a.id, Number(input.value));
        });
      }
      tr.querySelector('.btn-nocurso').addEventListener('click', () => {
        noCurso ? quitarNoCurso(a.id) : marcarNoCurso(a.id);
      });
      tbody.appendChild(tr);
    });
  }
  const pagContenedor = document.getElementById('pag-alumnos');
  if (pagContenedor) {
    renderPaginacion(pagContenedor, filtrados.length, paginaAlumnos, POR_PAGINA_ALUMNOS, p => {
      paginaAlumnos = p;
      renderAlumnos();
    });
  }
}

async function guardarCal(alumnoId, calificacion) {
  if (isNaN(calificacion) || calificacion < 0 || calificacion > 10) {
    mostrarNotificacion('La calificacion debe estar entre 0 y 10', 'error');
    return;
  }
  if (calificacion % 0.5 !== 0) {
    mostrarNotificacion('La calificacion solo acepta decimales de .0 o .5 (ej. 7, 7.5, 8)', 'error');
    return;
  }
  try {
    await guardarCalificacion(alumnoId, grupoSeleccionado.id, grupoSeleccionado.materiaId, docenteActual.id, calificacion, 'activo');
    const idx = calificacionesDelGrupo.findIndex(c => c.alumnoId === alumnoId);
    if (idx >= 0) {
      calificacionesDelGrupo[idx].calificacion = calificacion;
      calificacionesDelGrupo[idx].status = 'activo';
    } else {
      calificacionesDelGrupo.push({ alumnoId, calificacion, status: 'activo' });
    }
    mostrarNotificacion('Calificacion guardada correctamente');
    renderAlumnos();
  } catch (err) {
    mostrarNotificacion('Error al guardar: ' + err.message, 'error');
  }
}

async function marcarNoCurso(alumnoId) {
  try {
    await guardarCalificacion(alumnoId, grupoSeleccionado.id, grupoSeleccionado.materiaId, docenteActual.id, 0, 'no_curso');
    const idx = calificacionesDelGrupo.findIndex(c => c.alumnoId === alumnoId);
    if (idx >= 0) {
      calificacionesDelGrupo[idx].calificacion = 0;
      calificacionesDelGrupo[idx].status = 'no_curso';
    } else {
      calificacionesDelGrupo.push({ alumnoId, calificacion: 0, status: 'no_curso' });
    }
    mostrarNotificacion('Marcado como No Curso');
    renderAlumnos();
  } catch (err) {
    mostrarNotificacion('Error: ' + err.message, 'error');
  }
}

async function quitarNoCurso(alumnoId) {
  try {
    await guardarCalificacion(alumnoId, grupoSeleccionado.id, grupoSeleccionado.materiaId, docenteActual.id, 0, 'activo');
    const idx = calificacionesDelGrupo.findIndex(c => c.alumnoId === alumnoId);
    if (idx >= 0) {
      calificacionesDelGrupo[idx].calificacion = 0;
      calificacionesDelGrupo[idx].status = 'activo';
    }
    mostrarNotificacion('Estado No Curso removido');
    renderAlumnos();
  } catch (err) {
    mostrarNotificacion('Error: ' + err.message, 'error');
  }
}

document.getElementById('filtro-grupo-nombre')?.addEventListener('input', e => {
  filtroGrupoNombre = e.target.value;
  paginaGrupos = 1;
  renderGrupos();
});

document.getElementById('filtro-grupo-materia')?.addEventListener('change', e => {
  filtroGrupoMateria = e.target.value;
  paginaGrupos = 1;
  renderGrupos();
});

document.getElementById('filtro-alumno-buscar')?.addEventListener('input', e => {
  filtroBuscar = e.target.value;
  paginaAlumnos = 1;
  renderAlumnos();
});

document.getElementById('filtro-alumno-semestre')?.addEventListener('input', e => {
  filtroSemestre = e.target.value;
  paginaAlumnos = 1;
  renderAlumnos();
});

document.getElementById('btn-volver')?.addEventListener('click', () => {
  document.getElementById('vista-alumnos').classList.remove('activo');
  document.getElementById('vista-grupos').classList.add('activo');
  grupoSeleccionado = null;
  filtroBuscar = '';
  filtroSemestre = '';
});

document.getElementById('btn-logout')?.addEventListener('click', async () => {
  await logoutUser();
  window.location.href = 'login.html';
});

function paginar(items, pagina, porPagina) {
  const inicio = (pagina - 1) * porPagina;
  return items.slice(inicio, inicio + porPagina);
}

function renderPaginacion(contenedor, total, paginaActual, porPagina, onCambio) {
  const totalPags = Math.ceil(total / porPagina);
  contenedor.innerHTML = '';
  if (totalPags <= 1) return;
  const prev = document.createElement('button');
  prev.className = 'btn-pag';
  prev.textContent = 'Anterior';
  prev.disabled = paginaActual <= 1;
  prev.addEventListener('click', () => onCambio(paginaActual - 1));
  contenedor.appendChild(prev);
  const info = document.createElement('span');
  info.className = 'pag-info';
  info.textContent = `Pagina ${paginaActual} de ${totalPags}`;
  contenedor.appendChild(info);
  const next = document.createElement('button');
  next.className = 'btn-pag';
  next.textContent = 'Siguiente';
  next.disabled = paginaActual >= totalPags;
  next.addEventListener('click', () => onCambio(paginaActual + 1));
  contenedor.appendChild(next);
}
