import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  sendPasswordResetEmail,
  signOut as firebaseSignOut,
  updateProfile as firebaseUpdateProfile,
  type User,
} from "firebase/auth";
import { auth } from "./firebase";
import type { AuthUser } from "../types";

// firebase user to authuser
export function toAuthUser(user: User): AuthUser {
  return {
    id: user.uid,
    name: user.displayName ?? user.email?.split("@")[0] ?? "User",
    email: user.email ?? "",
    createdAt: user.metadata.creationTime
      ? new Date(user.metadata.creationTime).getTime()
      : Date.now(),
  };
}

export class AuthApiError extends Error {}

export async function signUp(
  name: string,
  email: string,
  password: string
): Promise<AuthUser> {
  try {
    const credential = await createUserWithEmailAndPassword(
      auth,
      email.trim(),
      password
    );
    // save display name
    await firebaseUpdateProfile(credential.user, {
      displayName: name.trim() || email.trim().split("@")[0],
    });
    return toAuthUser(credential.user);
  } catch (err: unknown) {
    throw new AuthApiError(friendlyError(err));
  }
}

export async function signIn(
  email: string,
  password: string
): Promise<AuthUser> {
  try {
    const credential = await signInWithEmailAndPassword(
      auth,
      email.trim(),
      password
    );
    return toAuthUser(credential.user);
  } catch (err: unknown) {
    throw new AuthApiError(friendlyError(err));
  }
}

const googleProvider = new GoogleAuthProvider();

export async function signInWithGoogle(): Promise<AuthUser> {
  try {
    const credential = await signInWithPopup(auth, googleProvider);
    return toAuthUser(credential.user);
  } catch (err: unknown) {
    throw new AuthApiError(friendlyError(err));
  }
}

export async function resetPassword(email: string): Promise<void> {
  try {
    await sendPasswordResetEmail(auth, email.trim());
  } catch (err: unknown) {
    throw new AuthApiError(friendlyError(err));
  }
}

export async function signOut(): Promise<void> {
  await firebaseSignOut(auth);
}

export async function updateProfile(
  _userId: string,
  patch: { name?: string }
): Promise<AuthUser> {
  const user = auth.currentUser;
  if (!user) throw new AuthApiError("Not signed in.");
  try {
    await firebaseUpdateProfile(user, {
      displayName: patch.name ?? user.displayName,
    });
    // reload for fresh displayName
    await user.reload();
    return toAuthUser(auth.currentUser!);
  } catch (err: unknown) {
    throw new AuthApiError(friendlyError(err));
  }
}

// sync current user
export function getSession(): AuthUser | null {
  const user = auth.currentUser;
  return user ? toAuthUser(user) : null;
}

// error code to message
function friendlyError(err: unknown): string {
  if (err && typeof err === "object" && "code" in err) {
    const code = (err as { code: string }).code;
    switch (code) {
      case "auth/email-already-in-use":
        return "An account with this email already exists.";
      case "auth/invalid-email":
        return "That doesn't look like a valid email address.";
      case "auth/weak-password":
        return "Password must be at least 6 characters.";
      case "auth/user-not-found":
      case "auth/wrong-password":
      case "auth/invalid-credential":
        return "That email and password don't match.";
      case "auth/too-many-requests":
        return "Too many attempts. Please wait a moment and try again.";
      case "auth/popup-closed-by-user":
      case "auth/cancelled-popup-request":
        return "Sign-in was cancelled.";
      case "auth/popup-blocked":
        return "Your browser blocked the sign-in popup. Please allow popups and try again.";
      case "auth/network-request-failed":
        return "Network error. Check your connection and try again.";
      default:
        return "Something went wrong. Please try again.";
    }
  }
  return "Something went wrong. Please try again.";
}
