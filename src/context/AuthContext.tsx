import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from "react";
import type { AuthUser } from "../types";
import * as authApi from "../lib/authApi";
import { AuthApiError } from "../lib/authApi";

/** What triggered the auth modal to open — lets us show the right copy. */
export type AuthPromptReason =
  | "manual"
  | "save"
  | "sync"
  | "settings";

interface AuthModalState {
  open: boolean;
  mode: "sign-in" | "sign-up";
  reason: AuthPromptReason;
}

interface AuthContextValue {
  user: AuthUser | null;
  isGuest: boolean;
  /** Stable key used to namespace locally-persisted data: "guest" or the user id. */
  accountKey: string;
  authLoading: boolean;
  authError: string | null;

  signIn: (email: string, password: string) => Promise<boolean>;
  signUp: (name: string, email: string, password: string) => Promise<boolean>;
  signOut: () => Promise<void>;
  updateName: (name: string) => Promise<void>;
  clearAuthError: () => void;

  /** Modal control */
  authModal: AuthModalState;
  openAuthModal: (mode?: "sign-in" | "sign-up", reason?: AuthPromptReason) => void;
  closeAuthModal: () => void;

  /**
   * Call whenever a guest performs an action that would normally be saved
   * to the cloud (adding a subject, note, grade, etc). Shows a friendly,
   * one-time-per-session nudge to sign in — never blocks the action.
   */
  notifyGuestSave: () => void;
  guestPrompt: { open: boolean };
  dismissGuestPrompt: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => authApi.getSession());
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authModal, setAuthModal] = useState<AuthModalState>({ open: false, mode: "sign-in", reason: "manual" });
  const [guestPromptOpen, setGuestPromptOpen] = useState(false);
  const hasShownGuestPrompt = useRef(false);

  const openAuthModal = useCallback((mode: "sign-in" | "sign-up" = "sign-in", reason: AuthPromptReason = "manual") => {
    setAuthError(null);
    setAuthModal({ open: true, mode, reason });
  }, []);

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
      setAuthError(err instanceof AuthApiError ? err.message : "Something went wrong. Please try again.");
      return false;
    } finally {
      setAuthLoading(false);
    }
  }, []);

  const signUp = useCallback(async (name: string, email: string, password: string) => {
    setAuthLoading(true);
    setAuthError(null);
    try {
      const account = await authApi.signUp(name, email, password);
      setUser(account);
      setAuthModal((prev) => ({ ...prev, open: false }));
      return true;
    } catch (err) {
      setAuthError(err instanceof AuthApiError ? err.message : "Something went wrong. Please try again.");
      return false;
    } finally {
      setAuthLoading(false);
    }
  }, []);

  const signOut = useCallback(async () => {
    await authApi.signOut();
    setUser(null);
    hasShownGuestPrompt.current = false;
  }, []);

  const updateName = useCallback(async (name: string) => {
    if (!user) return;
    const updated = await authApi.updateProfile(user.id, { name });
    setUser(updated);
  }, [user]);

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
      authLoading,
      authError,
      signIn,
      signUp,
      signOut,
      updateName,
      clearAuthError,
      authModal,
      openAuthModal,
      closeAuthModal,
      notifyGuestSave,
      guestPrompt: { open: guestPromptOpen },
      dismissGuestPrompt,
    }),
    [
      user,
      authLoading,
      authError,
      signIn,
      signUp,
      signOut,
      updateName,
      clearAuthError,
      authModal,
      openAuthModal,
      closeAuthModal,
      notifyGuestSave,
      guestPromptOpen,
      dismissGuestPrompt,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
