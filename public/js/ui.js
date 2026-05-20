export function mostrarNotificacion(mensaje, tipo = 'success') {
  const notif = document.getElementById('notificacion');
  if (!notif) return;
  notif.textContent = mensaje;
  notif.className = `notificacion ${tipo}`;
  notif.style.display = 'block';
  setTimeout(() => { notif.style.display = 'none'; }, 3500);
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

export function llenarFormulario(formId, datos) {
  const form = document.getElementById(formId);
  if (!form) return;
  Object.keys(datos).forEach(key => {
    const el = form.querySelector(`[name="${key}"]`);
    if (!el) return;
    // los booleanos de Firestore deben convertirse a string para el <select>
    el.value = (typeof datos[key] === 'boolean') ? String(datos[key]) : (datos[key] ?? '');
  });
}

export function limpiarFormulario(formId) {
  document.getElementById(formId)?.reset();
}
