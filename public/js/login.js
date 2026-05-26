import { loginUser } from './auth.js';
import { obtenerDocentePorEmail, obtenerAlumnoPorEmail } from './firestore.js';

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
        const docente = await obtenerDocentePorEmail(user.email);
        if (docente) {
          window.location.href = 'dashboard-profesor.html';
          return;
        }
        const alumno = await obtenerAlumnoPorEmail(user.email);
        if (alumno) {
          window.location.href = 'dashboard-alumno.html';
          return;
        }
        window.location.href = 'dashboard-admin.html';
        
    } catch (error) {
        errorMsg.style.display = 'block';
        if(error.code === 'auth/invalid-credential') {
            errorMsg.innerText = 'Correo o contraseña incorrectos.';
        } else {
            errorMsg.innerText = 'Ocurrió un error, Intentalo de nuevo.';
        }
    } finally {
        loginBtn.innerText = 'Entrar al Sistema';
        loginBtn.disabled = false;
    }
});