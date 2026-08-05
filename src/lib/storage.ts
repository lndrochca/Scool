/**
 * Small localStorage helper used to namespace per-device / per-account data.
 *
 * Every piece of persisted state in the app (app data, appearance prefs)
 * is stored under a key scoped to the current "account key" — either
 * `guest` or a signed-in user's id — so switching accounts never mixes
 * data between users, and guest data stays local to this browser only.
 */

const PREFIX = "scool";

export function accountStorageKey(namespace: string, accountKey: string) {
  return `${PREFIX}:${namespace}:${accountKey}`;
}

export function readJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function writeJSON<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage can fail (private browsing, quota, etc). Failing silently is
    // preferable to crashing the app — the user's session still works,
    // it just won't persist across reloads.
  }
}

export function removeKey(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch {
    // ignore
  }
}

export function hasKey(key: string): boolean {
  try {
    return localStorage.getItem(key) !== null;
  } catch {
    return false;
  }
}
