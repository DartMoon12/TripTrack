import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from 'firebase/auth'


// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCZVvzAHGiI9YdR5dYtLkVqd39cmoe3gsA",
  // Na produkci běží přihlašovací stránka Firebase přes naši doménu (proxy ve vercel.json).
  // Prohlížeče blokují úložiště cizích domén, takže s firebaseapp.com se po návratu
  // z Google přihlášení výsledek ztratil a uživatel nebyl přihlášený.
  authDomain:
    typeof window !== 'undefined' && window.location.hostname !== 'localhost'
      ? window.location.host
      : "triptrack-700a4.firebaseapp.com",
  projectId: "triptrack-700a4",
  storageBucket: "triptrack-700a4.appspot.com",
  messagingSenderId: "327702172517",
  appId: "1:327702172517:web:dd4ca39aa88dd5c645078c",
  measurementId: "G-283JT2LRG7"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Analytika se načítá až po načtení stránky (dynamický import), aby nezdržovala start.
// Na localhostu ji vynecháváme, ať se do statistik nepočítá vývoj.
if (typeof window !== 'undefined' && location.hostname !== 'localhost') {
  window.addEventListener('load', () => {
    import('firebase/analytics')
      .then(({ getAnalytics, isSupported }) => isSupported().then((ok) => ok && getAnalytics(app)))
      .catch(() => { /* blokátor reklam apod. – analytika není potřeba */ })
  }, { once: true })
}

export const db = getFirestore(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
