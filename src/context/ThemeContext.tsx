import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { ThemeMode } from "../types";
import { accountStorageKey, readJSON, writeJSON } from "../lib/storage";
import { useAuth } from "./AuthContext";

const DEFAULT_ACCENT = "#3B82F6";
const HEX_RE = /^#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})$/;

export function isValidHex(value: string): boolean {
  return HEX_RE.test(value.trim());
}

function normalizeHex(value: string): string {
  const v = value.trim();
  if (!HEX_RE.test(v)) return DEFAULT_ACCENT;
  if (v.length === 4) {
    // #abc → #aabbcc
    const [, r, g, b] = v;
    return `#${r}${r}${g}${g}${b}${b}`.toUpperCase();
  }
  return v.toUpperCase();
}

/** wcag luminance → readable text color */
function contrastColorFor(hex: string): string {
  const h = normalizeHex(hex).slice(1);
  const r = parseInt(h.slice(0, 2), 16) / 255;
  const g = parseInt(h.slice(2, 4), 16) / 255;
  const b = parseInt(h.slice(4, 6), 16) / 255;
  const lin = (c: number) => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
  const luminance = 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
  return luminance > 0.55 ? "#14151A" : "#FFFFFF";
}

interface ThemePrefs {
  mode: ThemeMode;
  accent: string;
}

const DEFAULT_PREFS: ThemePrefs = { mode: "system", accent: DEFAULT_ACCENT };

interface ThemeContextValue {
  mode: ThemeMode;
  accent: string;
  resolvedTheme: "light" | "dark";
  setMode: (mode: ThemeMode) => void;
  setAccent: (hex: string) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

function prefsKey(accountKey: string) {
  return accountStorageKey("prefs", accountKey);
}

function systemPrefersDark(): boolean {
  return typeof window !== "undefined" && window.matchMedia?.("(prefers-color-scheme: dark)").matches;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const { accountKey } = useAuth();
  const [prefs, setPrefs] = useState<ThemePrefs>(() => readJSON(prefsKey(accountKey), DEFAULT_PREFS));
  const [systemDark, setSystemDark] = useState(systemPrefersDark());

  // reload prefs on account change
  useEffect(() => {
    setPrefs(readJSON(prefsKey(accountKey), DEFAULT_PREFS));
  }, [accountKey]);

  useEffect(() => {
    writeJSON(prefsKey(accountKey), prefs);
  }, [accountKey, prefs]);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = (e: MediaQueryListEvent) => setSystemDark(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const resolvedTheme: "light" | "dark" = prefs.mode === "system" ? (systemDark ? "dark" : "light") : prefs.mode;

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute("data-theme", resolvedTheme);
    root.style.setProperty("--accent", normalizeHex(prefs.accent));
    root.style.setProperty("--accent-contrast", contrastColorFor(prefs.accent));
  }, [resolvedTheme, prefs.accent]);

  const value = useMemo<ThemeContextValue>(
    () => ({
      mode: prefs.mode,
      accent: normalizeHex(prefs.accent),
      resolvedTheme,
      setMode: (mode) => setPrefs((prev) => ({ ...prev, mode })),
      setAccent: (hex) => {
        if (!isValidHex(hex)) return;
        setPrefs((prev) => ({ ...prev, accent: normalizeHex(hex) }));
      },
    }),
    [prefs.mode, prefs.accent, resolvedTheme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
