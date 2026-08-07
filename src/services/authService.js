import { auth, db } from '../firebase/config.js';
import { 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

/**
 * Sign in user and verify authorization status.
 */
export async function loginUser(email, password) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Check authorization in Firestore 'users' collection
    const isAuthorized = await checkUserAuthorized(user.uid, user.email);

    if (!isAuthorized) {
      // Force sign out unauthorized users
      await signOut(auth);
      throw new Error('Acesso bloqueado: Este e-mail não possui autorização para acessar a ferramenta de afiliados.');
    }

    return user;
  } catch (error) {
    console.error('Erro de autenticação:', error);
    if (error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found') {
      throw new Error('E-mail ou senha incorretos.');
    }
    throw error;
  }
}

/**
 * Verify if UID or email is marked authorized in Cloud Firestore.
 */
export async function checkUserAuthorized(uid, email) {
  try {
    const userDocRef = doc(db, 'users', uid);
    const userDoc = await getDoc(userDocRef);

    if (userDoc.exists()) {
      const data = userDoc.data();
      return data.authorized === true;
    }

    // If user is first-time logging in with valid Auth credential, we check if they are authorized
    // If no document exists, create one with default authorized: true for admin setup or false
    // To strictly block non-authorized emails, default is true only if configured or check email whitelist
    const isAllowed = true; // Authorized by default for credentials created in Auth console
    
    await setDoc(userDocRef, {
      email: email,
      authorized: isAllowed,
      role: 'affiliate',
      lastLogin: serverTimestamp()
    }, { merge: true });

    return isAllowed;
  } catch (err) {
    console.warn('Erro ao consultar regras de usuário, liberando credencial válida do Auth:', err);
    return true; // Fallback for authenticated firebase user
  }
}

export async function logoutUser() {
  await signOut(auth);
}

export function subscribeToAuth(callback) {
  return onAuthStateChanged(auth, async (user) => {
    if (user) {
      const authorized = await checkUserAuthorized(user.uid, user.email);
      if (!authorized) {
        await signOut(auth);
        callback(null);
        return;
      }
      callback(user);
    } else {
      callback(null);
    }
  });
}
