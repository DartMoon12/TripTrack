import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from 'firebase/auth'


import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCZVvzAHGiI9YdR5dYtLkVqd39cmoe3gsA",
  authDomain: "triptrack-700a4.firebaseapp.com",
  projectId: "triptrack-700a4",
  storageBucket: "triptrack-700a4.appspot.com",
  messagingSenderId: "327702172517",
  appId: "1:327702172517:web:dd4ca39aa88dd5c645078c",
  measurementId: "G-283JT2LRG7"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
let analytics
if (typeof window !== 'undefined' && location.hostname !== 'localhost') {
  try {
    analytics = getAnalytics(app)
  } catch (e) {
    // ignore analytics errors in non-https or dev
  }
}

export const db = getFirestore(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
