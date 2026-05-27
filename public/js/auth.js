import { auth, firebaseConfig } from './firebase.js';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  getAuth
} from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";
import { initializeApp, deleteApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";

// Iniciar sesión
export const loginUser = async (email, password) => {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        return userCredential.user;
    } catch (error) {
        console.error("Error al iniciar sesión:💁🏻", error.code);
        throw error; 
    }
};

// Registrar usuario
export async function registerUser(email, password) {
  return await createUserWithEmailAndPassword(auth, email, password);
}

// Cerrar sesión
export async function logoutUser() {
  return await signOut(auth);
}

export function observeAuth(callback) {
  return onAuthStateChanged(auth, callback);
}

export async function crearUsuarioAuth(email, password) {
  const tempApp = initializeApp(firebaseConfig, `temp-${Date.now()}`);
  const tempAuth = getAuth(tempApp);
  try {
    await createUserWithEmailAndPassword(tempAuth, email, password);
  } finally {
    await deleteApp(tempApp);
  }
}