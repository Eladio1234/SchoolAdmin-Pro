import { loginUser } from './auth.js';
import { obtenerRolPorEmail } from './firestore.js'; // Cambiamos las importaciones

const loginForm = document.getElementById('loginform');
const errorMsg = document.getElementById('errormsg');
const loginBtn = document.getElementById('loginbtn');

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault(); 
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    loginBtn.innerText = 'Verificando...';
    loginBtn.disabled = true;
    errorMsg.style.display = 'none';

    try {
        const user = await loginUser(email, password);
        
        // Consultamos el rol global del usuario
        const rol = await obtenerRolPorEmail(user.email);

        if (rol === 'profesor' || rol === 'docente') {
            window.location.href = 'dashboard-profesor.html';
        } else if (rol === 'alumno') {
            window.location.href = 'dashboard-alumno.html';
        } else if (rol === 'admin') {
            window.location.href = 'dashboard-admin.html';
        } else {
            // Si por alguna razón está autenticado pero no tiene rol en Firestore
            throw new Error('rol-no-encontrado');
        }
        
    } catch (error) {
        errorMsg.style.display = 'block';
        if(error.code === 'auth/invalid-credential') {
            errorMsg.innerText = 'Correo o contraseña incorrectos.';
        } else if (error.message === 'rol-no-encontrado') {
            errorMsg.innerText = 'Usuario sin rol asignado. Contacta al administrador.';
        } else {
            errorMsg.innerText = 'Ocurrió un error. Inténtalo de nuevo.';
        }
    } finally {
        loginBtn.innerText = 'Entrar al Sistema';
        loginBtn.disabled = false;
    }
});