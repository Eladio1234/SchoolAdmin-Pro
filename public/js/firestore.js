import { db } from './firebase.js';
import {
  collection, addDoc, getDocs, doc, updateDoc, deleteDoc,
  query, orderBy, where, serverTimestamp,
  limit, startAfter, endBefore, limitToLast // <-- Añade estos 4 métodos de paginación
} from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";
const COL_ALUMNOS = 'alumnos';
const COL_DOCENTES = 'docentes';
const COL_MATERIAS = 'materias';

// ALUMNOS
export async function agregarAlumno(datos) {
  return await addDoc(collection(db, COL_ALUMNOS), {
    ...datos,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
}

export async function obtenerAlumnos() {
  const q = query(collection(db, COL_ALUMNOS), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function actualizarAlumno(id, datos) {
  await updateDoc(doc(db, COL_ALUMNOS, id), { ...datos, updatedAt: serverTimestamp() });
}

export async function eliminarAlumno(id) {
  await deleteDoc(doc(db, COL_ALUMNOS, id));
}

// DOCENTES
export async function agregarDocente(datos) {
  return await addDoc(collection(db, COL_DOCENTES), {
    ...datos,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
}

export async function obtenerDocentes() {
  const q = query(collection(db, COL_DOCENTES), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function actualizarDocente(id, datos) {
  await updateDoc(doc(db, COL_DOCENTES, id), { ...datos, updatedAt: serverTimestamp() });
}

export async function eliminarDocente(id) {
  await deleteDoc(doc(db, COL_DOCENTES, id));
}

// MATERIAS
export async function agregarMateria(datos) {
  return await addDoc(collection(db, COL_MATERIAS), {
    ...datos,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
}

export async function obtenerMaterias() {
  const q = query(collection(db, COL_MATERIAS), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function actualizarMateria(id, datos) {
  await updateDoc(doc(db, COL_MATERIAS, id), { ...datos, updatedAt: serverTimestamp() });
}

export async function eliminarMateria(id) {
  await deleteDoc(doc(db, COL_MATERIAS, id));
}

// GRUPOS
const COL_GRUPOS = 'grupos';

export async function agregarGrupo(datos) {
  return await addDoc(collection(db, COL_GRUPOS), {
    ...datos,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
}

export async function obtenerGrupos() {
  const q = query(collection(db, COL_GRUPOS), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function actualizarGrupo(id, datos) {
  await updateDoc(doc(db, COL_GRUPOS, id), { ...datos, updatedAt: serverTimestamp() });
}

export async function eliminarGrupo(id) {
  await deleteDoc(doc(db, COL_GRUPOS, id));
}

// INSCRIPCIONES
const COL_INSCRIPCIONES = 'inscripciones';

export async function agregarInscripcion(datos) {
  return await addDoc(collection(db, COL_INSCRIPCIONES), {
    ...datos,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
}

export async function obtenerInscripciones() {
  const q = query(collection(db, COL_INSCRIPCIONES), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function actualizarInscripcion(id, datos) {
  await updateDoc(doc(db, COL_INSCRIPCIONES, id), { ...datos, updatedAt: serverTimestamp() });
}

export async function eliminarInscripcion(id) {
  await deleteDoc(doc(db, COL_INSCRIPCIONES, id));
}

const COL_USUARIOS = 'usuarios';

export async function agregarRolUsuario(email, role) {
  return await addDoc(collection(db, COL_USUARIOS), {
    email,
    role,
    createdAt: serverTimestamp()
  });
}

export async function obtenerRolPorEmail(email) {
  const q = query(collection(db, COL_USUARIOS), where('email', '==', email));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  return snap.docs[0].data().role;
}

export async function existeNumeroEstudiante(studentNumber, excluirId = null) {
  const q = query(collection(db, COL_ALUMNOS), where('studentNumber', '==', studentNumber));
  const snap = await getDocs(q);
  return snap.docs.some(d => d.id !== excluirId);
}

export async function existeNumeroEmpleado(employeeNumber, excluirId = null) {
  const q = query(collection(db, COL_DOCENTES), where('employeeNumber', '==', employeeNumber));
  const snap = await getDocs(q);
  return snap.docs.some(d => d.id !== excluirId);
}

export async function obtenerAlumnoPorEmail(email) {
  const q = query(collection(db, COL_ALUMNOS), where('email', '==', email));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  return { id: snap.docs[0].id, ...snap.docs[0].data() };
}

export async function obtenerDocentePorEmail(email) {
  const q = query(collection(db, COL_DOCENTES), where('email', '==', email));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  return { id: snap.docs[0].id, ...snap.docs[0].data() };
}

export async function obtenerGruposPorDocente(docenteId) {
  const q = query(collection(db, COL_GRUPOS), where('docenteId', '==', docenteId));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function obtenerInscripcionesPorGrupo(grupoId) {
  const q = query(collection(db, COL_INSCRIPCIONES), where('grupoId', '==', grupoId));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

const COL_CALIFICACIONES = 'calificaciones';

export async function obtenerCalificacionesPorGrupo(grupoId) {
  const q = query(collection(db, COL_CALIFICACIONES), where('grupoId', '==', grupoId));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function guardarCalificacion(alumnoId, grupoId, materiaId, docenteId, calificacion, status = 'activo') {
  const q = query(
    collection(db, COL_CALIFICACIONES),
    where('alumnoId', '==', alumnoId),
    where('grupoId', '==', grupoId)
  );
  const snap = await getDocs(q);
  if (!snap.empty) {
    await updateDoc(doc(db, COL_CALIFICACIONES, snap.docs[0].id), {
      calificacion, status, updatedAt: serverTimestamp()
    });
    return snap.docs[0].id;
  }
  const ref = await addDoc(collection(db, COL_CALIFICACIONES), {
    alumnoId, grupoId, materiaId, docenteId,
    calificacion, status,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
  return ref.id;
}

export async function validarInscripcion(alumnoId, grupoId, materiaId) {
  const q1 = query(
    collection(db, COL_INSCRIPCIONES),
    where('alumnoId', '==', alumnoId),
    where('grupoId', '==', grupoId)
  );
  const snap1 = await getDocs(q1);
  if (!snap1.empty) {
    return { valida: false, mensaje: 'El alumno ya está inscrito en este grupo' };
  }

  const q2 = query(
    collection(db, COL_INSCRIPCIONES),
    where('alumnoId', '==', alumnoId),
    where('materiaId', '==', materiaId)
  );
  const snap2 = await getDocs(q2);
  if (!snap2.empty) {
    return { valida: false, mensaje: 'El alumno ya está inscrito en esta materia en otro grupo' };
  }

  return { valida: true };
}


// funciones para mantener, el orden de los alumnos cuando haya muchos (paginacon)

export async function obtenerAlumnosPaginaSiguiente(tamanoPagina, ultimoDocVisible = null) {
  let q;
  
  if (ultimoDocVisible) {
    q = query(
      collection(db, COL_ALUMNOS),
      orderBy('createdAt', 'desc'),
      startAfter(ultimoDocVisible),
      limit(tamanoPagina)
    );
  } else {
    q = query(
      collection(db, COL_ALUMNOS),
      orderBy('createdAt', 'desc'),
      limit(tamanoPagina)
    );
  }

  const snap = await getDocs(q);
  
  return {
    documentos: snap.docs.map(d => ({ id: d.id, ...d.data() })),
    primerDoc: snap.docs[0] || null,
    ultimoDoc: snap.docs[snap.docs.length - 1] || null,
    totalEnPagina: snap.docs.length
  };
}

export async function obtenerAlumnosPaginaAnterior(tamanoPagina, primerDocVisible) {
  if (!primerDocVisible) return null;

  const q = query(
    collection(db, COL_ALUMNOS),
    orderBy('createdAt', 'desc'),
    endBefore(primerDocVisible),
    limitToLast(tamanoPagina)
  );

  const snap = await getDocs(q);

  return {
    documentos: snap.docs.map(d => ({ id: d.id, ...d.data() })),
    primerDoc: snap.docs[0] || null,
    ultimoDoc: snap.docs[snap.docs.length - 1] || null,
    totalEnPagina: snap.docs.length
  };
}