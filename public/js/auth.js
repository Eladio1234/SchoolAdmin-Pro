import { auth } from './firebase.js';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";

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

// Observador de estado de sesión
export function observeAuth(callback) {
  return onAuthStateChanged(auth, callback);
}