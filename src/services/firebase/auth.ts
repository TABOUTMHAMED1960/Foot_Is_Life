import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  onAuthStateChanged as firebaseOnAuthStateChanged,
  updateProfile,
  User as FirebaseUser,
} from 'firebase/auth';
import { doc, setDoc, getDoc, Timestamp } from 'firebase/firestore';
import { auth, db } from './config';
import { User, createDefaultStats } from '@/src/types/user';

export async function signUp(
  email: string,
  password: string,
  displayName: string
): Promise<User> {
  const credential = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(credential.user, { displayName });

  const user: User = {
    uid: credential.user.uid,
    email,
    displayName,
    createdAt: new Date(),
    updatedAt: new Date(),
    stats: createDefaultStats(),
  };

  await setDoc(doc(db, 'users', user.uid), {
    ...user,
    createdAt: Timestamp.fromDate(user.createdAt),
    updatedAt: Timestamp.fromDate(user.updatedAt),
  });

  return user;
}

export async function signIn(email: string, password: string): Promise<User> {
  const credential = await signInWithEmailAndPassword(auth, email, password);
  return fetchUserProfile(credential.user.uid);
}

export async function signOut(): Promise<void> {
  await firebaseSignOut(auth);
}

export async function resetPassword(email: string): Promise<void> {
  await sendPasswordResetEmail(auth, email);
}

export async function fetchUserProfile(uid: string): Promise<User> {
  const snapshot = await getDoc(doc(db, 'users', uid));

  if (!snapshot.exists()) {
    throw new Error('Profil utilisateur introuvable.');
  }

  const data = snapshot.data();
  return {
    uid: data.uid,
    email: data.email,
    displayName: data.displayName,
    createdAt: data.createdAt?.toDate?.() ?? new Date(),
    updatedAt: data.updatedAt?.toDate?.() ?? new Date(),
    stats: data.stats ?? createDefaultStats(),
  };
}

export function onAuthStateChanged(
  callback: (firebaseUser: FirebaseUser | null) => void
) {
  return firebaseOnAuthStateChanged(auth, callback);
}
