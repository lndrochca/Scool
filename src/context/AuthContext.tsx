import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../lib/firebase";
import type { AuthUser } from "../types";
import * as authApi from "../lib/authApi";
import { AuthApiError } from "../lib/authApi";
import { readJSON, writeJSON } from "../lib/storage";

// why the modal opened
export type AuthPromptReason = "manual" | "save" | "sync" | "settings";

// persisted flag: has this browser explicitly chosen "Continue as Guest"
const GUEST_ENTERED_KEY = "scool:guest_entered";

interface AuthModalState {
  open: boolean;
  mode: "sign-in" | "sign-up";
  reason: AuthPromptReason;
}

interface AuthContextValue {
  user: AuthUser | null;
  isGuest: boolean;
  // "guest" or user id
  accountKey: string;
  authLoading: boolean;
  authError: string | null;

  signIn: (email: string, password: string) => Promise<boolean>;
  signUp: (name: string, email: string, password: string) => Promise<boolean>;
  signInWithGoogle: () => Promise<boolean>;
  resetPassword: (email: string) => Promise<boolean>;
  signOut: () => Promise<void>;
  updateName: (name: string) => Promise<void>;
  clearAuthError: () => void;

  // gate: has the user reached the app (signed in OR explicitly chosen guest mode)?
  hasEnteredApp: boolean;
  continueAsGuest: () => void;

  // modal control
  authModal: AuthModalState;
  openAuthModal: (
    mode?: "sign-in" | "sign-up",
    reason?: AuthPromptReason
  ) => void;
  closeAuthModal: () => void;

  // one-time guest nudge
  notifyGuestSave: () => void;
  guestPrompt: { open: boolean };
  dismissGuestPrompt: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  // initial sync from firebase
  const [user, setUser] = useState<AuthUser | null>(() => authApi.getSession());
  // waiting for first listener fire
  const [sessionLoading, setSessionLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authModal, setAuthModal] = useState<AuthModalState>({
    open: false,
    mode: "sign-in",
    reason: "manual",
  });
  const [guestPromptOpen, setGuestPromptOpen] = useState(false);
  const hasShownGuestPrompt = useRef(false);
  const [guestEntered, setGuestEntered] = useState<boolean>(() =>
    readJSON<boolean>(GUEST_ENTERED_KEY, false)
  );

  // sync with firebase auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser ? authApi.toAuthUser(firebaseUser) : null);
      setSessionLoading(false);
    });
    return unsubscribe;
  }, []);

  const openAuthModal = useCallback(
    (
      mode: "sign-in" | "sign-up" = "sign-in",
      reason: AuthPromptReason = "manual"
    ) => {
      setAuthError(null);
      setAuthModal({ open: true, mode, reason });
    },
    []
  );

  const closeAuthModal = useCallback(() => {
    setAuthModal((prev) => ({ ...prev, open: false }));
    setAuthError(null);
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    setAuthLoading(true);
    setAuthError(null);
    try {
      const account = await authApi.signIn(email, password);
      setUser(account);
      setAuthModal((prev) => ({ ...prev, open: false }));
      return true;
    } catch (err) {
      setAuthError(
        err instanceof AuthApiError
          ? err.message
          : "Something went wrong. Please try again."
      );
      return false;
    } finally {
      setAuthLoading(false);
    }
  }, []);

  const signUp = useCallback(
    async (name: string, email: string, password: string) => {
      setAuthLoading(true);
      setAuthError(null);
      try {
        const account = await authApi.signUp(name, email, password);
        setUser(account);
        setAuthModal((prev) => ({ ...prev, open: false }));
        return true;
      } catch (err) {
        setAuthError(
          err instanceof AuthApiError
            ? err.message
            : "Something went wrong. Please try again."
        );
        return false;
      } finally {
        setAuthLoading(false);
      }
    },
    []
  );

  const signInWithGoogle = useCallback(async () => {
    setAuthLoading(true);
    setAuthError(null);
    try {
      const account = await authApi.signInWithGoogle();
      setUser(account);
      setAuthModal((prev) => ({ ...prev, open: false }));
      return true;
    } catch (err) {
      // user closing the popup shouldn't read as a hard error
      if (err instanceof AuthApiError && err.message === "Sign-in was cancelled.") {
        return false;
      }
      setAuthError(
        err instanceof AuthApiError
          ? err.message
          : "Something went wrong. Please try again."
      );
      return false;
    } finally {
      setAuthLoading(false);
    }
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    setAuthLoading(true);
    setAuthError(null);
    try {
      await authApi.resetPassword(email);
      return true;
    } catch (err) {
      setAuthError(
        err instanceof AuthApiError
          ? err.message
          : "Something went wrong. Please try again."
      );
      return false;
    } finally {
      setAuthLoading(false);
    }
  }, []);

  const continueAsGuest = useCallback(() => {
    writeJSON(GUEST_ENTERED_KEY, true);
    setGuestEntered(true);
  }, []);

  const signOut = useCallback(async () => {
    await authApi.signOut();
    setUser(null);
    hasShownGuestPrompt.current = false;
    // return to the auth gate after logging out
    writeJSON(GUEST_ENTERED_KEY, false);
    setGuestEntered(false);
  }, []);

  const updateName = useCallback(
    async (name: string) => {
      if (!user) return;
      const updated = await authApi.updateProfile(user.id, { name });
      setUser(updated);
    },
    [user]
  );

  const clearAuthError = useCallback(() => setAuthError(null), []);

  const notifyGuestSave = useCallback(() => {
    if (user) return;
    if (hasShownGuestPrompt.current) return;
    hasShownGuestPrompt.current = true;
    setGuestPromptOpen(true);
  }, [user]);

  const dismissGuestPrompt = useCallback(() => setGuestPromptOpen(false), []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isGuest: !user,
      accountKey: user ? user.id : "guest",
      // session check + in-flight combined
      authLoading: sessionLoading || authLoading,
      authError,
      signIn,
      signUp,
      signInWithGoogle,
      resetPassword,
      signOut,
      updateName,
      clearAuthError,
      hasEnteredApp: !!user || guestEntered,
      continueAsGuest,
      authModal,
      openAuthModal,
      closeAuthModal,
      notifyGuestSave,
      guestPrompt: { open: guestPromptOpen },
      dismissGuestPrompt,
    }),
    [
      user,
      sessionLoading,
      authLoading,
      authError,
      signIn,
      signUp,
      signInWithGoogle,
      resetPassword,
      signOut,
      updateName,
      clearAuthError,
      guestEntered,
      continueAsGuest,
      authModal,
      openAuthModal,
      closeAuthModal,
      notifyGuestSave,
      guestPromptOpen,
      dismissGuestPrompt,
    ]
  );

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
