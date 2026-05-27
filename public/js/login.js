import { loginUser } from './auth.js';
import { obtenerRolPorEmail } from './firestore.js';
import { mostrarNotificacion } from './ui.js';

const loginForm = document.getElementById('form-login'); // ID corregido
const loginBtn = document.getElementById('loginbtn');

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault(); 
    
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    
    loginBtn.innerText = 'Verificando...';
    loginBtn.disabled = true;

    try {
        const user = await loginUser(email, password);
        const rol = await obtenerRolPorEmail(user.email);

        // cada quien a su rol 
        if (rol === 'profesor' || rol === 'docente') {
            window.location.href = 'dashboard-profesor.html';
        } else if (rol === 'alumno') {
            window.location.href = 'dashboard-alumno.html';
        } else if (rol === 'admin') {
            window.location.href = 'dashboard-admin.html';
        } else {
            throw new Error('rol-no-encontrado');
        }
        
    } catch (error) {
        // manejo de errores 
        if(error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password') {
            mostrarNotificacion('Correo o contraseña incorrectos', 'error');
        } else if (error.message === 'rol-no-encontrado') {
            mostrarNotificacion('Usuario sin rol asignado. Contacta al administrador.', 'error');
        } else {
            mostrarNotificacion('Ocurrió un error. Inténtalo de nuevo.', 'error');
        }
        
        
        loginBtn.innerText = 'Entrar';
        loginBtn.disabled = false;
    }
});