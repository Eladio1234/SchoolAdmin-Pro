import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyCbxbz9ipOGU_4AD_UZ6UoGmA6Vh6diT88",
    authDomain: "schooladmin-pro-88b8c.firebaseapp.com",
    projectId: "schooladmin-pro-88b8c",
    storageBucket: "schooladmin-pro-88b8c.firebasestorage.app",
    messagingSenderId: "423110961409",
    appId: "1:423110961409:web:65e6c68b2eed84e7379300"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export { firebaseConfig };