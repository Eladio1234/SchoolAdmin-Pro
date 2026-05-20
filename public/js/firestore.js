import { db } from './firebase.js';
import {
  collection, addDoc, getDocs, doc, updateDoc, deleteDoc,
  query, orderBy, serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const COL_ALUMNOS = 'alumnos';
const COL_DOCENTES = 'docentes';

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
