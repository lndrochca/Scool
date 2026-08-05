import type { AuthUser } from "../types";
import { readJSON, writeJSON } from "./storage";

/**
 * ------------------------------------------------------------------------
 * DEMO AUTH BACKEND — READ ME BEFORE SHIPPING
 * ------------------------------------------------------------------------
 * Scool doesn't have a server in this project, so this file simulates one
 * using localStorage so the rest of the app can be built against a real
 * async auth flow (loading states, errors, sessions) instead of a fake
 * always-succeeds stub.
 *
 * Every function below is `async` and has the exact shape you'd want from
 * a real API client. To go to production, replace the *insides* of
 * `signUp`, `signIn`, `signOut`, and `getSession` with calls to your real
 * backend (e.g. `fetch("/api/auth/login", ...)`) or an auth provider
 * (Supabase, Firebase Auth, Auth0, Clerk, etc). Nothing else in the app
 * needs to change — `AuthContext` only depends on these four function
 * signatures.
 *
 * IMPORTANT: passwords are never stored or compared like this in a real
 * product. There is no hashing worth the name here — it's just enough to
 * make the demo flow (wrong password -> error) behave believably.
 * ------------------------------------------------------------------------
 */

interface StoredAccount {
  id: string;
  name: string;
  email: string;
  createdAt: number;
  passwordDigest: string;
}

const USERS_KEY = "scool:authdb:users";
const SESSION_KEY = "scool:authdb:session";

function digest(password: string): string {
  // Not real cryptography — a stand-in so the demo can reject wrong
  // passwords. Replace entirely with server-side hashing (bcrypt/argon2).
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    hash = (hash << 5) - hash + password.charCodeAt(i);
    hash |= 0;
  }
  return `${password.length}:${hash}`;
}

function readUsers(): StoredAccount[] {
  return readJSON<StoredAccount[]>(USERS_KEY, []);
}

function writeUsers(users: StoredAccount[]) {
  writeJSON(USERS_KEY, users);
}

function toAuthUser(account: StoredAccount): AuthUser {
  return { id: account.id, name: account.name, email: account.email, createdAt: account.createdAt };
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export class AuthApiError extends Error {}

export async function signUp(name: string, email: string, password: string): Promise<AuthUser> {
  await delay(500);
  const normalizedEmail = email.trim().toLowerCase();
  const users = readUsers();
  if (users.some((u) => u.email === normalizedEmail)) {
    throw new AuthApiError("An account with this email already exists.");
  }
  const account: StoredAccount = {
    id: `user_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`,
    name: name.trim() || normalizedEmail.split("@")[0],
    email: normalizedEmail,
    createdAt: Date.now(),
    passwordDigest: digest(password),
  };
  writeUsers([...users, account]);
  writeJSON(SESSION_KEY, account.id);
  return toAuthUser(account);
}

export async function signIn(email: string, password: string): Promise<AuthUser> {
  await delay(500);
  const normalizedEmail = email.trim().toLowerCase();
  const users = readUsers();
  const account = users.find((u) => u.email === normalizedEmail);
  if (!account || account.passwordDigest !== digest(password)) {
    throw new AuthApiError("That email and password don't match.");
  }
  writeJSON(SESSION_KEY, account.id);
  return toAuthUser(account);
}

export async function signOut(): Promise<void> {
  await delay(150);
  writeJSON(SESSION_KEY, null);
}

export async function updateProfile(userId: string, patch: { name?: string }): Promise<AuthUser> {
  await delay(300);
  const users = readUsers();
  const idx = users.findIndex((u) => u.id === userId);
  if (idx === -1) throw new AuthApiError("Account not found.");
  const updated = { ...users[idx], ...patch };
  const next = [...users];
  next[idx] = updated;
  writeUsers(next);
  return toAuthUser(updated);
}

/** Synchronously restore the last session, if any — used on app load. */
export function getSession(): AuthUser | null {
  const sessionId = readJSON<string | null>(SESSION_KEY, null);
  if (!sessionId) return null;
  const account = readUsers().find((u) => u.id === sessionId);
  return account ? toAuthUser(account) : null;
}
