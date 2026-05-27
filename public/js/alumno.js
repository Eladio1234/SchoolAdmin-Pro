import { observeAuth, logoutUser } from './auth.js';
import {obtenerAlumnoPorEmail,obtenerMaterias,
  obtenerGrupos, obtenerDocentes, obtenerInscripcionesPorAlumno,
  obtenerCalificacionesPorAlumno, agregarInscripcionAlumno,
  cancelarInscripcion, agregarSolicitud, obtenerSolicitudesPorAlumno} from './firestore.js';
import { mostrarNotificacion } from './ui.js';

const POR_PAGINA = 8;

let alumnoActual        = null;
let todasLasMaterias    = [];
let todosLosGrupos      = [];
let todosLosDocentes    = [];
let todasLasInscripciones = [];
let todasLasCalificaciones = [];
let filtroMateriaNombre = '';
let filtroMateriaStatus = '';
let filtroKardexSem     = '';
let filtroKardexStatus  = '';
let filtroProfBuscar    = '';
let filtroDispBuscar    = '';
let paginaMisMaterias  = 1;
let paginaKardex       = 1;
let paginaProfesores   = 1;
let paginaGruposDisponibles = 1;
let paginaSolicitudes  = 1;

observeAuth(async usuario => {
  if (!usuario) { window.location.href = 'login.html'; return; }

  const alumno = await obtenerAlumnoPorEmail(usuario.email);
  if (!alumno) { window.location.href = 'login.html'; return; }

  alumnoActual = alumno;
  const emailEl  = document.getElementById('alumno-email');
  const nombreEl = document.getElementById('alumno-nombre');
  if (emailEl)  emailEl.textContent  = usuario.email;
  if (nombreEl) nombreEl.textContent = alumno.fullName;

  await inicializar();
});

async function inicializar() {
  try {
    const [materias, grupos, docentes, inscripciones, calificaciones] = await Promise.all([
      obtenerMaterias(),
      obtenerGrupos(),
      obtenerDocentes(),
      obtenerInscripcionesPorAlumno(alumnoActual.id),
      obtenerCalificacionesPorAlumno(alumnoActual.id)
    ]);
    todasLasMaterias      = materias;
    todosLosGrupos        = grupos;
    todosLosDocentes      = docentes;
    todasLasInscripciones = inscripciones;
    todasLasCalificaciones = calificaciones;

    poblarSelectMaterias();
    poblarFiltroSemestres();
    renderMisMaterias();
    renderGruposDisponibles();
    renderKardex();
    renderProfesores();
    renderSolicitudes();
  } catch (err) {
    mostrarNotificacion('Error al cargar datos: ' + err.message, 'error');
  }
}

document.querySelectorAll('.tab-btn[data-vista]').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('activo'));
    document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('activo'));
    btn.classList.add('activo');
    document.getElementById(btn.dataset.vista).classList.add('activo');
    if (btn.dataset.vista === 'vista-materias') mostrarSubvista('sv-mis-materias');
  });
});

function mostrarSubvista(id) {
  document.getElementById('sv-mis-materias').style.display = id === 'sv-mis-materias' ? '' : 'none';
  document.getElementById('sv-inscribir').style.display    = id === 'sv-inscribir'    ? '' : 'none';
}

document.getElementById('btn-ir-inscribir')?.addEventListener('click', () => {
  mostrarSubvista('sv-inscribir');
  renderGruposDisponibles();
});

document.getElementById('btn-volver-materias')?.addEventListener('click', () => {
  mostrarSubvista('sv-mis-materias');
});

document.getElementById('btn-logout')?.addEventListener('click', async () => {
  await logoutUser();
  window.location.href = 'login.html';
});

function sinDatos(selector, cols, msg = 'Sin datos') {
  const el = document.querySelector(selector);
  if (el) el.innerHTML = `<tr><td colspan="${cols}" class="sin-datos">${msg}</td></tr>`;
}

function paginar(items, pagina) {
  return items.slice((pagina - 1) * POR_PAGINA, pagina * POR_PAGINA);
}

function renderPaginacion(contenedorId, total, paginaActual, onCambio) {
  const contenedor = document.getElementById(contenedorId);
  if (!contenedor) return;
  const totalPags = Math.ceil(total / POR_PAGINA);
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

function getMateria(id)  { return todasLasMaterias.find(m => m.id === id) || {}; }
function getGrupo(id)    { return todosLosGrupos.find(g => g.id === id) || {}; }
function getDocente(id)  { return todosLosDocentes.find(d => d.id === id) || {}; }

const STATUS_INS = {
  activa:     { label: 'Activa',     clase: 'active'    },
  pendiente:  { label: 'Pendiente',  clase: 'inactive'  },
  cancelada:  { label: 'Cancelada',  clase: 'dropped'   },
  completada: { label: 'Completada', clase: 'graduated' }
};

function misMateriasFiltradas() {
  return todasLasInscripciones.filter(ins => {
    const grupo   = getGrupo(ins.grupoId);
    const materia = getMateria(grupo.materiaId);
    const nombreMatch = !filtroMateriaNombre ||
      (materia.name || '').toLowerCase().includes(filtroMateriaNombre.toLowerCase());
    const statusMatch = !filtroMateriaStatus || ins.status === filtroMateriaStatus;
    return nombreMatch && statusMatch;
  });
}

function renderMisMaterias() {
  const filtradas = misMateriasFiltradas();
  const items = paginar(filtradas, paginaMisMaterias);
  const tbody = document.querySelector('#tabla-mis-materias tbody');
  if (!tbody) return;

  if (filtradas.length === 0) {
    sinDatos('#tabla-mis-materias tbody', 7, 'No tienes materias inscritas');
    renderPaginacion('pag-mis-materias', 0, 1, () => {});
    return;
  }

  tbody.innerHTML = items.map(ins => {
    const grupo   = getGrupo(ins.grupoId);
    const materia = getMateria(grupo.materiaId);
    const docente = getDocente(grupo.docenteId);
    const st      = STATUS_INS[ins.status] || { label: ins.status, clase: 'inactive' };
    const puedesBaja = ins.status === 'activa' || ins.status === 'pendiente';
    return `
      <tr>
        <td>${materia.name || '—'}</td>
        <td>${materia.code || '—'}</td>
        <td>${materia.credits || '—'}</td>
        <td>${grupo.name || '—'}</td>
        <td>${docente.fullName || '—'}</td>
        <td><span class="badge badge-${st.clase}">${st.label}</span></td>
        <td class="acciones">
          ${puedesBaja
            ? `<button class="btn-eliminar" data-ins-id="${ins.id}">Dar de baja</button>`
            : '—'
          }
        </td>
      </tr>`;
  }).join('');

  tbody.querySelectorAll('.btn-eliminar').forEach(btn => {
    btn.addEventListener('click', () => darDeBaja(btn.dataset.insId));
  });

  renderPaginacion('pag-mis-materias', filtradas.length, paginaMisMaterias, p => {
    paginaMisMaterias = p; renderMisMaterias();
  });
}

async function darDeBaja(inscripcionId) {
  if (!confirm('¿Estas seguro de que deseas dar de baja esta materia?')) return;
  try {
    await cancelarInscripcion(inscripcionId);
    mostrarNotificacion('Materia dada de baja correctamente.');
    todasLasInscripciones = await obtenerInscripcionesPorAlumno(alumnoActual.id);
    renderMisMaterias();
    renderGruposDisponibles();
    poblarFiltroSemestres();
    renderKardex();
  } catch (err) {
    mostrarNotificacion('Error: ' + err.message, 'error');
  }
}

function gruposDisponibles() {
  const gruposInscritos = new Set(
    todasLasInscripciones
      .filter(i => i.status === 'activa' || i.status === 'pendiente')
      .map(i => i.grupoId)
  );
  const materiasInscritas = new Set(
    todasLasInscripciones
      .filter(i => i.status === 'activa' || i.status === 'pendiente')
      .map(i => getGrupo(i.grupoId).materiaId)
  );
  return todosLosGrupos.filter(g =>
    g.active && !gruposInscritos.has(g.id) && !materiasInscritas.has(g.materiaId)
  );
}

function renderGruposDisponibles() {
  const disponibles = gruposDisponibles();
  const tbody = document.querySelector('#tabla-grupos-disponibles tbody');
  if (!tbody) return;

  const checkTodos = document.getElementById('check-todos');
  const btnInscribir = document.getElementById('btn-inscribir-seleccion');
  if (checkTodos) checkTodos.checked = false;
  if (btnInscribir) { btnInscribir.disabled = true; }
  actualizarConteo();

  if (disponibles.length === 0) {
    sinDatos('#tabla-grupos-disponibles tbody', 6, 'No hay grupos disponibles para inscripcion');
    return;
  }

  tbody.innerHTML = disponibles.map(g => {
    const materia = getMateria(g.materiaId);
    const docente = getDocente(g.docenteId);
    return `
      <tr>
        <td style="text-align:center;">
          <input type="checkbox" class="check-grupo" data-grupo-id="${g.id}" style="width:1rem;height:1rem;cursor:pointer;" />
        </td>
        <td>${materia.name || '—'}</td>
        <td>${materia.code || '—'}</td>
        <td>${materia.credits || '—'}</td>
        <td>${g.name}</td>
        <td>${docente.fullName || '—'}</td>
      </tr>`;
  }).join('');

  tbody.querySelectorAll('.check-grupo').forEach(cb => {
    cb.addEventListener('change', () => {
      actualizarConteo();
      // Si se desmarca uno, quitar el "seleccionar todo"
      const todos = [...tbody.querySelectorAll('.check-grupo')];
      if (checkTodos) checkTodos.checked = todos.every(c => c.checked);
    });
  });
}

function actualizarConteo() {
  const seleccionados = document.querySelectorAll('.check-grupo:checked');
  const conteo = document.getElementById('conteo-seleccion');
  const btn    = document.getElementById('btn-inscribir-seleccion');
  if (conteo) conteo.textContent = `${seleccionados.length} seleccionada(s)`;
  if (btn)    btn.disabled = seleccionados.length === 0;
}

document.getElementById('check-todos')?.addEventListener('change', e => {
  document.querySelectorAll('.check-grupo').forEach(cb => { cb.checked = e.target.checked; });
  actualizarConteo();
});

document.getElementById('btn-inscribir-seleccion')?.addEventListener('click', async () => {
  const seleccionados = [...document.querySelectorAll('.check-grupo:checked')];
  if (seleccionados.length === 0) return;
  if (!confirm(`¿Confirmas inscribirte en ${seleccionados.length} materia(s)?`)) return;

  const btn = document.getElementById('btn-inscribir-seleccion');
  btn.disabled = true;
  btn.textContent = 'Inscribiendo...';

  const hoy = new Date().toISOString().split('T')[0];
  let exitosos = 0;
  let errores  = 0;

  for (const cb of seleccionados) {
    const grupoId = cb.dataset.grupoId;
    const grupo   = getGrupo(grupoId);
    try {
      await agregarInscripcionAlumno({
        alumnoId:       alumnoActual.id,
        grupoId,
        materiaId:      grupo.materiaId,
        semestre:       alumnoActual.semester || 1,
        enrollmentDate: hoy,
        status:         'activa'
      });
      exitosos++;
    } catch {
      errores++;
    }
  }

  if (exitosos > 0) mostrarNotificacion(`${exitosos} materia(s) inscritas correctamente.`);
  if (errores  > 0) mostrarNotificacion(`${errores} materia(s) no pudieron inscribirse.`, 'error');

  todasLasInscripciones = await obtenerInscripcionesPorAlumno(alumnoActual.id);
  mostrarSubvista('sv-mis-materias');
  paginaMisMaterias = 1;
  poblarFiltroSemestres();
  renderMisMaterias();
  renderKardex();

  btn.textContent = 'Inscribirme en seleccionadas';
});

function poblarFiltroSemestres() {
  const semestres = [...new Set(
    todasLasInscripciones.map(i => i.semestre).filter(Boolean)
  )].sort((a, b) => a - b);

  const sel = document.getElementById('filtro-kardex-semestre');
  if (!sel) return;
  const valorActual = sel.value;
  sel.innerHTML = '<option value="">Todos los semestres</option>' +
    semestres.map(s => `<option value="${s}">Semestre ${s}</option>`).join('');
  if (valorActual) sel.value = valorActual;
}

function kardexFiltrado() {
  return todasLasInscripciones.filter(ins => {
    const semMatch    = !filtroKardexSem    || String(ins.semestre) === filtroKardexSem;
    const statusMatch = !filtroKardexStatus || ins.status === filtroKardexStatus;
    return semMatch && statusMatch;
  });
}

function renderKardex() {
  const filtradas = kardexFiltrado();
  const items = paginar(filtradas, paginaKardex);
  const tbody = document.querySelector('#tabla-kardex tbody');
  if (!tbody) return;

  if (filtradas.length === 0) {
    sinDatos('#tabla-kardex tbody', 8, 'Sin registros para este filtro');
    document.getElementById('kardex-resumen').textContent = '';
    renderPaginacion('pag-kardex', 0, 1, () => {});
    return;
  }

  tbody.innerHTML = items.map(ins => {
    const grupo   = getGrupo(ins.grupoId);
    const materia = getMateria(grupo.materiaId);
    const docente = getDocente(grupo.docenteId);
    const st      = STATUS_INS[ins.status] || { label: ins.status, clase: 'inactive' };

    const calObj  = todasLasCalificaciones.find(c => c.alumnoId === alumnoActual.id && c.grupoId === ins.grupoId);
    const esNoCurso = calObj?.status === 'no_curso';
    let calDisplay, calColor;
    if (esNoCurso) {
      calDisplay = '<span class="badge badge-dropped">No Curso</span>';
      calColor   = '';
    } else if (calObj?.calificacion != null && calObj.calificacion > 0) {
      const aprobado = calObj.calificacion >= 6;
      calColor   = aprobado ? 'color:var(--success);' : 'color:var(--error);';
      calDisplay = `<span style="${calColor}">${calObj.calificacion}</span>`;
    } else {
      calDisplay = '—';
    }

    return `
      <tr>
        <td>${materia.name || '—'}</td>
        <td>${materia.code || '—'}</td>
        <td>${materia.credits || '—'}</td>
        <td>${grupo.name || '—'}</td>
        <td>${docente.fullName || '—'}</td>
        <td>${ins.semestre || '—'}</td>
        <td>${calDisplay}</td>
        <td><span class="badge badge-${st.clase}">${st.label}</span></td>
      </tr>`;
  }).join('');

  const conCal = todasLasCalificaciones.filter(c =>
    c.alumnoId === alumnoActual.id && c.status !== 'no_curso' && c.calificacion > 0
  );
  const promedio = conCal.length
    ? (conCal.reduce((s, c) => s + Number(c.calificacion), 0) / conCal.length).toFixed(2)
    : null;
  const resEl = document.getElementById('kardex-resumen');
  if (resEl) resEl.textContent =
    `${filtradas.length} materia(s)` + (promedio ? ` · Promedio: ${promedio}` : '');

  renderPaginacion('pag-kardex', filtradas.length, paginaKardex, p => {
    paginaKardex = p; renderKardex();
  });
}

function profesoresFiltrados() {
  return todosLosDocentes.filter(d => {
    if (!filtroProfBuscar) return true;
    const buscar = filtroProfBuscar.toLowerCase();
    return (d.fullName || '').toLowerCase().includes(buscar) ||
           (d.specialty || '').toLowerCase().includes(buscar);
  });
}

function renderProfesores() {
  const filtrados = profesoresFiltrados();
  const items = paginar(filtrados, paginaProfesores);
  const tbody = document.querySelector('#tabla-profesores tbody');
  if (!tbody) return;

  if (filtrados.length === 0) {
    sinDatos('#tabla-profesores tbody', 4, 'No hay profesores registrados');
    renderPaginacion('pag-profesores', 0, 1, () => {});
    return;
  }

  tbody.innerHTML = items.map(d => {
    const misGrupos  = todosLosGrupos.filter(g => g.docenteId === d.id);
    const matNombres = [...new Set(misGrupos.map(g => g.materiaId))].map(id => {
      const m = getMateria(id);
      return m.name ? `${m.code} – ${m.name}` : null;
    }).filter(Boolean);
    const nomGrupos  = misGrupos.map(g => g.name);
    return `
      <tr>
        <td>
          <strong>${d.fullName}</strong><br>
          <small style="color:var(--gray-600)">${d.email}</small>
        </td>
        <td>${d.specialty || '—'}</td>
        <td>${matNombres.length ? matNombres.join('<br>') : '—'}</td>
        <td>${nomGrupos.length ? nomGrupos.join(', ') : '—'}</td>
      </tr>`;
  }).join('');

  renderPaginacion('pag-profesores', filtrados.length, paginaProfesores, p => {
    paginaProfesores = p; renderProfesores();
  });
}

function poblarSelectMaterias() {
  const sel = document.getElementById('sol-materia');
  if (!sel) return;
  sel.innerHTML = '<option value="">-- Seleccionar materia --</option>' +
    todasLasMaterias.filter(m => m.active).map(m =>
      `<option value="${m.id}">${m.code} – ${m.name}</option>`
    ).join('');
}

async function renderSolicitudes() {
  try {
    const solicitudes = await obtenerSolicitudesPorAlumno(alumnoActual.id);
    const items = paginar(solicitudes, paginaSolicitudes);
    const tbody = document.querySelector('#tabla-solicitudes tbody');
    if (!tbody) return;

    if (solicitudes.length === 0) {
      sinDatos('#tabla-solicitudes tbody', 4, 'No tienes solicitudes registradas');
      renderPaginacion('pag-solicitudes', 0, 1, () => {});
      return;
    }

    const STATUS_S = {
      pendiente: { label: 'Pendiente', clase: 'inactive' },
      aprobada:  { label: 'Aprobada',  clase: 'active'   },
      rechazada: { label: 'Rechazada', clase: 'dropped'  }
    };

    tbody.innerHTML = items.map(s => {
      const materia = getMateria(s.materiaId);
      const matNom  = materia.name ? `${materia.code} – ${materia.name}` : '—';
      const st      = STATUS_S[s.status] || { label: s.status, clase: 'inactive' };
      const fecha   = s.createdAt?.toDate ? s.createdAt.toDate().toLocaleDateString('es-MX') : '—';
      return `
        <tr>
          <td>${matNom}</td>
          <td>${s.motivo || '—'}</td>
          <td>${fecha}</td>
          <td><span class="badge badge-${st.clase}">${st.label}</span></td>
        </tr>`;
    }).join('');

    renderPaginacion('pag-solicitudes', solicitudes.length, paginaSolicitudes, p => {
      paginaSolicitudes = p; renderSolicitudes();
    });
  } catch (err) {
    mostrarNotificacion('Error al cargar solicitudes: ' + err.message, 'error');
  }
}

document.getElementById('form-solicitud')?.addEventListener('submit', async e => {
  e.preventDefault();
  const materiaId = document.getElementById('sol-materia').value;
  const motivo    = document.getElementById('sol-motivo').value.trim();
  if (!materiaId) { mostrarNotificacion('Selecciona una materia.', 'error'); return; }
  if (!motivo)    { mostrarNotificacion('Escribe el motivo de la solicitud.', 'error'); return; }
  try {
    await agregarSolicitud({ alumnoId: alumnoActual.id, materiaId, motivo, status: 'pendiente' });
    mostrarNotificacion('Solicitud enviada. El administrador la revisara pronto.');
    document.getElementById('form-solicitud').reset();
    paginaSolicitudes = 1;
    renderSolicitudes();
  } catch (err) {
    mostrarNotificacion('Error al enviar solicitud: ' + err.message, 'error');
  }
});

document.getElementById('filtro-materia-nombre')?.addEventListener('input', e => {
  filtroMateriaNombre = e.target.value; paginaMisMaterias = 1; renderMisMaterias();
});
document.getElementById('filtro-materia-status')?.addEventListener('change', e => {
  filtroMateriaStatus = e.target.value; paginaMisMaterias = 1; renderMisMaterias();
});
document.getElementById('filtro-kardex-semestre')?.addEventListener('change', e => {
  filtroKardexSem = e.target.value; paginaKardex = 1; renderKardex();
});
document.getElementById('filtro-kardex-status')?.addEventListener('change', e => {
  filtroKardexStatus = e.target.value; paginaKardex = 1; renderKardex();
});
document.getElementById('filtro-prof-buscar')?.addEventListener('input', e => {
  filtroProfBuscar = e.target.value; paginaProfesores = 1; renderProfesores();
});
