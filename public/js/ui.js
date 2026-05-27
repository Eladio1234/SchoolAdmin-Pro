import { auth, db } from './firebase.js';
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";
import { obtenerRolPorEmail } from './firestore.js'; 

const userEmailSpan = document.getElementById('useremail');
const logoutBtn = document.getElementById('logoutbtn');

// proteccion de las rutas 
onAuthStateChanged(auth, async (user) => {
    const rutaActual = window.location.pathname.split("/").pop() || ""; 
    const rutasPublicas = ['login.html', 'register.html', 'index.html', ''];

    if (user) {
        if (userEmailSpan) {
            userEmailSpan.innerText = user.email;
        }

        // si la ruta no es publica verificmaos los permisos
        if (!rutasPublicas.includes(rutaActual)) {
            const rol = await obtenerRolPorEmail(user.email);
            
            // Reglas de redirección por seguridad
            if (rutaActual === 'dashboard-admin.html' && rol !== 'admin') {
                redirigirSegunRol(rol);
            }
            if (rutaActual === 'dashboard-profesor.html' && rol !== 'profesor' && rol !== 'docente' && rol !== 'admin') {
                redirigirSegunRol(rol);
            }
            if (rutaActual === 'dashboard-alumno.html' && rol !== 'alumno' && rol !== 'admin') {
                redirigirSegunRol(rol);
            }
        }
    } else {
        if (!rutasPublicas.includes(rutaActual)) {
            window.location.href = 'login.html';
        }
    }
});

// cada quien a su rol 
function redirigirSegunRol(rol) {
    if (rol === 'admin') window.location.href = 'dashboard-admin.html';
    else if (rol === 'profesor' || rol === 'docente') window.location.href = 'dashboard-profesor.html';
    else if (rol === 'alumno') window.location.href = 'dashboard-alumno.html';
    else window.location.href = 'login.html';
}

//cerrar seccion
if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
        try {
            await signOut(auth);
        } catch (error) {
            console.error("Error al cerrar sesión:", error);
        }
    });
}

// funciones de interfaz de usuario , tabla 

export function mostrarNotificacion(mensaje, tipo = 'success') {
  const notif = document.getElementById('notificacion');
  if (!notif) return;
  
  notif.textContent = mensaje;
  notif.className = `notificacion ${tipo}`;
  notif.classList.remove('oculto');
  
  setTimeout(() => { 
    notif.classList.add('oculto'); 
  }, 3500);
}

export function llenarFormulario(formId, datos) {
  const form = document.getElementById(formId);
  if (!form) return;
  Object.keys(datos).forEach(key => {
    const el = form.querySelector(`[name="${key}"]`);
    if (!el) return;
    el.value = (typeof datos[key] === 'boolean') ? String(datos[key]) : (datos[key] ?? '');
  });
}

export function limpiarFormulario(formId) {
  document.getElementById(formId)?.reset();
}

const STATUS_LABELS = {
  active: 'Activo', inactive: 'Inactivo', graduated: 'Graduado', dropped: 'Baja'
};

export function renderizarTablaAlumnos(alumnos, onEditar, onEliminar) {
  const tbody = document.querySelector('#tabla-alumnos tbody');
  if (!tbody) return;
  tbody.innerHTML = '';
  if (alumnos.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" class="sin-datos">No hay alumnos registrados</td></tr>';
    return;
  }
  alumnos.forEach(a => {
    const tr = document.createElement('tr');
    const statusLabel = STATUS_LABELS[a.status] ?? a.status;
    tr.innerHTML = `
      <td>${a.studentNumber}</td>
      <td>${a.fullName}</td>
      <td>${a.email}</td>
      <td>${a.phone}</td>
      <td>${a.career} &ndash; Sem. ${a.semester}</td>
      <td><span class="badge badge-${a.status}">${statusLabel}</span></td>
      <td class="acciones">
        <button class="btn-editar" data-id="${a.id}">Editar</button>
        <button class="btn-eliminar" data-id="${a.id}">Eliminar</button>
      </td>
    `;
    tr.querySelector('.btn-editar').addEventListener('click', () => onEditar(a));
    tr.querySelector('.btn-eliminar').addEventListener('click', () => onEliminar(a.id));
    tbody.appendChild(tr);
  });
}

export function renderizarTablaDocentes(docentes, onEditar, onEliminar) {
  const tbody = document.querySelector('#tabla-docentes tbody');
  if (!tbody) return;
  tbody.innerHTML = '';
  if (docentes.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" class="sin-datos">No hay docentes registrados</td></tr>';
    return;
  }
  docentes.forEach(d => {
    const tr = document.createElement('tr');
    const activeLabel = d.active ? 'Activo' : 'Inactivo';
    const activeClass = d.active ? 'active' : 'inactive';
    tr.innerHTML = `
      <td>${d.employeeNumber}</td>
      <td>${d.fullName}</td>
      <td>${d.email}</td>
      <td>${d.phone}</td>
      <td>${d.specialty}</td>
      <td><span class="badge badge-${activeClass}">${activeLabel}</span></td>
      <td class="acciones">
        <button class="btn-editar" data-id="${d.id}">Editar</button>
        <button class="btn-eliminar" data-id="${d.id}">Eliminar</button>
      </td>
    `;
    tr.querySelector('.btn-editar').addEventListener('click', () => onEditar(d));
    tr.querySelector('.btn-eliminar').addEventListener('click', () => onEliminar(d.id));
    tbody.appendChild(tr);
  });
}

export function renderizarTablaMaterias(materias, onEditar, onEliminar) {
  const tbody = document.querySelector('#tabla-materias tbody');
  if (!tbody) return;
  tbody.innerHTML = '';
  if (materias.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" class="sin-datos">No hay materias registradas</td></tr>';
    return;
  }
  materias.forEach(m => {
    const tr = document.createElement('tr');
    const activeLabel = m.active ? 'Activo' : 'Inactivo';
    const activeClass = m.active ? 'active' : 'inactive';
    tr.innerHTML = `
      <td>${m.code}</td>
      <td>${m.name}</td>
      <td>${m.credits}</td>
      <td><span class="badge badge-${activeClass}">${activeLabel}</span></td>
      <td class="acciones">
        <button class="btn-editar" data-id="${m.id}">Editar</button>
        <button class="btn-eliminar" data-id="${m.id}">Eliminar</button>
      </td>
    `;
    tr.querySelector('.btn-editar').addEventListener('click', () => onEditar(m));
    tr.querySelector('.btn-eliminar').addEventListener('click', () => onEliminar(m.id));
    tbody.appendChild(tr);
  });
}

export function renderizarTablaGrupos(grupos, materias, docentes, onEditar, onEliminar) {
  const tbody = document.querySelector('#tabla-grupos tbody');
  if (!tbody) return;
  tbody.innerHTML = '';
  if (grupos.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" class="sin-datos">No hay grupos registrados</td></tr>';
    return;
  }
  grupos.forEach(g => {
    const tr = document.createElement('tr');
    const materia = materias.find(m => m.id === g.materiaId);
    const materiaNombre = materia ? `${materia.code} – ${materia.name}` : '—';
    const docente = docentes.find(d => d.id === g.docenteId);
    const docenteNombre = docente ? docente.fullName : '—';
    const activeLabel = g.active ? 'Activo' : 'Inactivo';
    const activeClass = g.active ? 'active' : 'inactive';
    tr.innerHTML = `
      <td>${g.name}</td>
      <td>${materiaNombre}</td>
      <td>${docenteNombre}</td>
      <td><span class="badge badge-${activeClass}">${activeLabel}</span></td>
      <td class="acciones">
        <button class="btn-editar" data-id="${g.id}">Editar</button>
        <button class="btn-eliminar" data-id="${g.id}">Eliminar</button>
      </td>
    `;
    tr.querySelector('.btn-editar').addEventListener('click', () => onEditar(g));
    tr.querySelector('.btn-eliminar').addEventListener('click', () => onEliminar(g.id));
    tbody.appendChild(tr);
  });
}

const STATUS_INSCRIPCION = {
  activa:     { label: 'Activa',     clase: 'active'    },
  pendiente:  { label: 'Pendiente',  clase: 'inactive'  },
  cancelada:  { label: 'Cancelada',  clase: 'dropped'   },
  completada: { label: 'Completada', clase: 'graduated' }
};

export function renderizarTablaInscripciones(inscripciones, alumnos, grupos, materias, onEditar, onEliminar) {
  const tbody = document.querySelector('#tabla-inscripciones tbody');
  if (!tbody) return;
  tbody.innerHTML = '';
  if (inscripciones.length === 0) {
    tbody.innerHTML = '<tr><td colspan="4" class="sin-datos">No hay inscripciones registradas</td></tr>';
    return;
  }
  inscripciones.forEach(i => {
    const tr = document.createElement('tr');
    const alumno  = alumnos.find(a => a.id === i.alumnoId);
    const alumnoNombre  = alumno  ? alumno.fullName : '—';
    const statusInfo = STATUS_INSCRIPCION[i.status] ?? { label: i.status, clase: 'inactive' };
    tr.innerHTML = `
      <td>${alumnoNombre}</td>
      <td>${i.enrollmentDate ?? '—'}</td>
      <td><span class="badge badge-${statusInfo.clase}">${statusInfo.label}</span></td>
      <td class="acciones">
        <button class="btn-editar" data-id="${i.id}">Editar</button>
        <button class="btn-eliminar" data-id="${i.id}">Eliminar</button>
      </td>
    `;
    tr.querySelector('.btn-editar').addEventListener('click', () => onEditar(i));
    tr.querySelector('.btn-eliminar').addEventListener('click', () => onEliminar(i.id));
    tbody.appendChild(tr);
  });
}





// alificaciones 
export function renderizarTablaCalificaciones(calificaciones, alumnos, grupos, materias, onEditar, onEliminar) {
  const tbody = document.querySelector('#tabla-calificaciones tbody');
  if (!tbody) return;
  tbody.innerHTML = '';
  if (calificaciones.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" class="sin-datos">No hay calificaciones registradas</td></tr>';
    return;
  }
  calificaciones.forEach(c => {
    const tr = document.createElement('tr');
    const alumno = alumnos.find(a => a.id === c.alumnoId);
    const grupo = grupos.find(g => g.id === c.grupoId);
    const materia = materias.find(m => m.id === c.materiaId);
    
    let claseBadge = c.status === 'aprobado' ? 'active' : (c.status === 'reprobado' ? 'dropped' : 'inactive');
    
    tr.innerHTML = `
      <td>${grupo ? grupo.name : '—'}</td>
      <td>${alumno ? alumno.fullName : '—'}</td>
      <td>${materia ? materia.name : '—'}</td>
      <td><strong>${c.calificacion}</strong></td>
      <td><span class="badge badge-${claseBadge}">${c.status.toUpperCase()}</span></td>
      <td class="acciones">
        <button class="btn-editar" data-id="${c.id}">Editar</button>
        <button class="btn-eliminar" data-id="${c.id}">Eliminar</button>
      </td>
    `;
    tr.querySelector('.btn-editar').addEventListener('click', () => onEditar(c));
    tr.querySelector('.btn-eliminar').addEventListener('click', () => onEliminar(c.id));
    tbody.appendChild(tr);
  });
}