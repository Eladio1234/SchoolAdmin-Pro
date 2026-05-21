import { loginUser } from './auth.js';

const loginForm = document.getElementById('login-form');
const errorMsg = document.getElementById('error-msg');
const loginBtn = document.getElementById('login-btn');

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault(); 
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    loginBtn.innerText = 'Verificando...';
    loginBtn.disabled = true;
    errorMsg.style.display = 'none';

    try {
        const user = await loginUser(email, password);
        console.log("Login exitoso:", user.email);
        window.location.href = 'index.html'; 
        
    } catch (error) {
        errorMsg.style.display = 'block';
        if(error.code === 'auth/invalid-credential') {
            errorMsg.innerText = 'Correo o contraseña incorrectos.';
        } else {
            errorMsg.innerText = 'Ocurrió un error. Intenta de nuevo.';
        }
    } finally {
        loginBtn.innerText = 'Entrar al Sistema';
        loginBtn.disabled = false;
    }
});