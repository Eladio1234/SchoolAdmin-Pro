import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyCb_fXmNpmcnLylQbH3zkUT96-28ZmCtOQ",
  authDomain: "schooladmin-pro.firebaseapp.com",
  projectId: "schooladmin-pro",
  storageBucket: "schooladmin-pro.firebasestorage.app",
  messagingSenderId: "90385917538",
  appId: "1:90385917538:web:bce30c984bd69d42bfd33b"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
