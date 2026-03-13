import { useEffect, useState } from 'react';
import { useAuthStore } from '@/src/stores/authStore';
import {
  signUp as authSignUp,
  signIn as authSignIn,
  signOut as authSignOut,
  resetPassword as authResetPassword,
  onAuthStateChanged,
  fetchUserProfile,
} from '@/src/services/firebase/auth';
import { Strings } from '@/src/constants/strings.fr';

function mapFirebaseError(code: string): string {
  switch (code) {
    case 'auth/email-already-in-use':
      return Strings.auth.errorEmailInUse;
    case 'auth/invalid-email':
      return Strings.auth.errorInvalidEmail;
    case 'auth/weak-password':
      return Strings.auth.errorWeakPassword;
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return Strings.auth.errorWrongPassword;
    case 'auth/user-not-found':
      return Strings.auth.errorUserNotFound;
    default:
      return Strings.auth.errorGeneric;
  }
}

export function useAuth() {
  const { user, isLoading, isAuthenticated, setUser, reset } =
    useAuthStore();
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const profile = await fetchUserProfile(firebaseUser.uid);
          setUser(profile);
        } catch {
          // New user not yet in Firestore — will be handled by signUp
          setUser(null);
        }
      } else {
        setUser(null);
      }
    });

    return unsubscribe;
  }, [setUser]);

  const signUp = async (email: string, password: string, displayName: string) => {
    setError(null);
    setActionLoading(true);
    try {
      const profile = await authSignUp(email, password, displayName);
      setUser(profile);
    } catch (err: any) {
      setError(mapFirebaseError(err.code));
    } finally {
      setActionLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    setError(null);
    setActionLoading(true);
    try {
      const profile = await authSignIn(email, password);
      setUser(profile);
    } catch (err: any) {
      setError(mapFirebaseError(err.code));
    } finally {
      setActionLoading(false);
    }
  };

  const signOut = async () => {
    setError(null);
    try {
      await authSignOut();
      reset();
    } catch {
      setError(Strings.auth.errorGeneric);
    }
  };

  const resetPassword = async (email: string) => {
    setError(null);
    setActionLoading(true);
    try {
      await authResetPassword(email);
    } catch (err: any) {
      setError(mapFirebaseError(err.code));
      throw err;
    } finally {
      setActionLoading(false);
    }
  };

  const clearError = () => setError(null);

  return {
    user,
    isLoading,
    isAuthenticated,
    actionLoading,
    error,
    signUp,
    signIn,
    signOut,
    resetPassword,
    clearError,
  };
}
