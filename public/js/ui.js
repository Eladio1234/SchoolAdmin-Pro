import { auth } from './firebase.js';
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";

const userEmailSpan = document.getElementById('user-email');
const logoutBtn = document.getElementById('logout-btn');

// estado de la sesión
onAuthStateChanged(auth, (user) => {
    if (user) {
        userEmailSpan.innerText = user.email;
    } else {
        window.location.href = 'login.html';
    }
});

// cerrar sesión
logoutBtn.addEventListener('click', async () => {
    try {
        await signOut(auth);
    } catch (error) {
        console.error("Error al cerrar sesión:", error);
    }
});