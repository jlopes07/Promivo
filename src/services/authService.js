import { auth, db } from '../firebase/config.js';
import { 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';

let currentUserProfile = null;

export function getCurrentUserProfile() {
  return currentUserProfile;
}

/**
 * Login user and strictly validate Firestore document & active state.
 */
export async function loginUser(email, password) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Fetch user document from Firestore 'users' collection
    const userDocRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userDocRef);

    if (!userDoc.exists()) {
      await signOut(auth);
      currentUserProfile = null;
      throw new Error('Acesso negado: Seu cadastro de usuário não foi localizado no sistema.');
    }

    const userData = userDoc.data();

    // Check active status
    if (userData.active === false) {
      await signOut(auth);
      currentUserProfile = null;
      throw new Error('Acesso bloqueado: Sua conta de usuário está desativada.');
    }

    // Update lastLogin timestamp
    await updateDoc(userDocRef, {
      lastLogin: serverTimestamp()
    }).catch(() => {});

    currentUserProfile = { uid: user.uid, ...userData };
    return { user, profile: currentUserProfile };
  } catch (error) {
    console.error('Erro de autenticação/autorização:', error);
    if (error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found') {
      throw new Error('E-mail ou senha incorretos.');
    }
    throw error;
  }
}

export async function logoutUser() {
  currentUserProfile = null;
  await signOut(auth);
}

/**
 * Auth state listener with Firestore validation guard.
 */
export function subscribeToAuth(callback) {
  return onAuthStateChanged(auth, async (user) => {
    if (user) {
      try {
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);

        if (!userDoc.exists()) {
          await signOut(auth);
          currentUserProfile = null;
          callback(null, null);
          return;
        }

        const userData = userDoc.data();

        if (userData.active === false) {
          await signOut(auth);
          currentUserProfile = null;
          callback(null, null);
          return;
        }

        currentUserProfile = { uid: user.uid, ...userData };
        callback(user, currentUserProfile);
      } catch (err) {
        console.error('Erro ao verificar permissões do usuário:', err);
        await signOut(auth);
        currentUserProfile = null;
        callback(null, null);
      }
    } else {
      currentUserProfile = null;
      callback(null, null);
    }
  });
}
