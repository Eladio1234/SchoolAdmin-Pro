import { db } from './firebase.js';
import {
  collection, addDoc, getDocs, doc, updateDoc, deleteDoc,
  query, orderBy, where, serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js"; // <-- ¡Aquí está la corrección a 10.8.1!

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