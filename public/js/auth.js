import { auth } from './firebase.js';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

export async function registrar(email, password) {
  return await createUserWithEmailAndPassword(auth, email, password);
}

export async function iniciarSesion(email, password) {
  return await signInWithEmailAndPassword(auth, email, password);
}

export async function cerrarSesion() {
  return await signOut(auth);
}

export function observarAuth(callback) {
  return onAuthStateChanged(auth, callback);
}
