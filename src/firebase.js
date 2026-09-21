import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBD5vOmwZ_ZzYNkhpVGDSnBljEYmL3lMvM",
  authDomain: "student-assistant-platform.firebaseapp.com",
  projectId: "student-assistant-platform",
  storageBucket: "student-assistant-platform.firebasestorage.app",
  messagingSenderId: "303035525851",
  appId: "1:303035525851:web:4679707cc4edefc111bafe",
  measurementId: "G-CY9DJJL882"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication & Firestore
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);

// Google Sign-In helper
export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return { success: true, user: result.user };
  } catch (error) {
    console.error("Firebase Google Sign-In error:", error);
    return { success: false, error: error.message, code: error.code };
  }
};

// Email/Password Sign-In helper
export const signInWithEmail = async (email, password) => {
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    return { success: true, user: result.user };
  } catch (error) {
    console.error("Firebase Email Sign-In error:", error);
    return { success: false, error: error.message, code: error.code };
  }
};

// Email/Password Sign-Up helper
export const signUpWithEmail = async (email, password) => {
  try {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    return { success: true, user: result.user };
  } catch (error) {
    console.error("Firebase Sign-Up error:", error);
    return { success: false, error: error.message, code: error.code };
  }
};

// Sign Out helper
export const logOut = async () => {
  try {
    await signOut(auth);
    return { success: true };
  } catch (error) {
    console.error("Firebase Sign-Out error:", error);
    return { success: false, error: error.message };
  }
};

export { onAuthStateChanged };
export default app;
